import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { siteLocale } from "@/lib/site-locale";

type AppliedField = { fieldKey: string; source: "ai_inferred" | "website_extracted"; value: unknown };

type LiveProfile = {
  full_name: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  languages: string[] | null;
  work_modes: string[] | null;
  profile_headline_pl: string | null;
  profile_headline_en: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  custom_specialties_pl: string[] | null;
  custom_specialties_en: string[] | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  instagram_url: string | null;
  facebook_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
};

/** Only fills fields the designer hasn't already set themselves - publishing a profile draft must never clobber real profile data. */
function buildPatch(live: LiveProfile, draft: Record<string, unknown>) {
  const patch: Record<string, unknown> = {};
  const applied: AppliedField[] = [];
  const skipped: string[] = [];

  const isEnglish = siteLocale === "en";
  const headlineKey = isEnglish ? "profile_headline_en" : "profile_headline_pl";
  const bioKey = isEnglish ? "bio_en" : "bio_pl";
  const specialtiesKey = isEnglish ? "custom_specialties_en" : "custom_specialties_pl";

  if (draft.headline) {
    if (!live[headlineKey]) {
      patch[headlineKey] = draft.headline;
      patch.profile_headline = draft.headline;
      applied.push({ fieldKey: "headline", source: "ai_inferred", value: draft.headline });
    } else {
      skipped.push("headline");
    }
  }

  if (draft.about) {
    if (!live[bioKey]) {
      patch[bioKey] = draft.about;
      patch.bio = draft.about;
      applied.push({ fieldKey: "about", source: "ai_inferred", value: draft.about });
    } else {
      skipped.push("about");
    }
  }

  if (Array.isArray(draft.specialties) && draft.specialties.length) {
    if (!live[specialtiesKey]?.length && !live.specialties?.length) {
      patch[specialtiesKey] = draft.specialties;
      patch.specialties = draft.specialties;
      applied.push({ fieldKey: "specialties", source: "ai_inferred", value: draft.specialties });
    } else {
      skipped.push("specialties");
    }
  }

  if (Array.isArray(draft.suggested_service_capabilities) && draft.suggested_service_capabilities.length) {
    if (!live.service_capabilities?.length) {
      patch.service_capabilities = draft.suggested_service_capabilities;
      const explicit = Array.isArray(draft.explicit_service_capabilities) ? draft.explicit_service_capabilities : [];
      // At least some of what's being applied has direct text evidence on the
      // site - a stronger claim than a photo-based guess, so label the whole
      // field that way when any of it is backed by explicit site text.
      const source = explicit.length > 0 ? "website_extracted" : "ai_inferred";
      applied.push({ fieldKey: "service_capabilities", source, value: draft.suggested_service_capabilities });
    } else {
      skipped.push("service_capabilities");
    }
  }

  for (const [draftKey, liveKey] of [
    ["instagram_url", "instagram_url"],
    ["facebook_url", "facebook_url"],
    ["behance_url", "behance_url"],
    ["linkedin_url", "linkedin_url"],
  ] as const) {
    if (draft[draftKey]) {
      if (!live[liveKey]) {
        patch[liveKey] = draft[draftKey];
        applied.push({ fieldKey: draftKey, source: "website_extracted", value: draft[draftKey] });
      } else {
        skipped.push(draftKey);
      }
    }
  }

  if (typeof draft.full_name === "string" && draft.full_name) {
    if (!live.full_name) {
      patch.full_name = draft.full_name;
      applied.push({ fieldKey: "full_name", source: "website_extracted", value: draft.full_name });
    } else {
      skipped.push("full_name");
    }
  }

  for (const [draftKey, liveKey, fieldKey] of [
    ["location", "location", "location"],
    ["phone", "phone", "phone"],
    ["email", "email", "email"],
  ] as const) {
    if (typeof draft[draftKey] === "string" && draft[draftKey]) {
      if (!live[liveKey]) {
        patch[liveKey] = draft[draftKey];
        applied.push({ fieldKey, source: "website_extracted", value: draft[draftKey] });
      } else {
        skipped.push(draftKey);
      }
    }
  }

  if (Array.isArray(draft.languages) && draft.languages.length) {
    if (!live.languages?.length) {
      patch.languages = draft.languages;
      applied.push({ fieldKey: "languages", source: "website_extracted", value: draft.languages });
    } else {
      skipped.push("languages");
    }
  }

  if (Array.isArray(draft.work_modes) && draft.work_modes.length) {
    if (!live.work_modes?.length) {
      patch.work_modes = draft.work_modes;
      applied.push({ fieldKey: "work_modes", source: "website_extracted", value: draft.work_modes });
    } else {
      skipped.push("work_modes");
    }
  }

  return { patch, applied, skipped };
}

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const { data: draft } = await supabase.from("portfolio_profile_drafts").select("*").eq("job_id", jobId).maybeSingle();
  if (!draft) return NextResponse.json({ error: "No profile draft for this import." }, { status: 404 });

  const { data: live, error: liveError } = await supabase
    .from("profiles")
    .select(
      "full_name, location, phone, email, languages, work_modes, profile_headline_pl, profile_headline_en, bio_pl, bio_en, custom_specialties_pl, custom_specialties_en, specialties, service_capabilities, instagram_url, facebook_url, behance_url, linkedin_url"
    )
    .eq("id", user.id)
    .maybeSingle();
  if (liveError || !live) return NextResponse.json({ error: "Could not load your profile." }, { status: 500 });

  const { patch, applied, skipped } = buildPatch(live as LiveProfile, draft as Record<string, unknown>);

  if (Object.keys(patch).length) {
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (updateError) return NextResponse.json({ error: "Could not update your profile." }, { status: 500 });
  }

  if (applied.length) {
    await supabase.from("profile_field_provenance").upsert(
      applied.map((field) => ({
        user_id: user.id,
        field_key: field.fieldKey,
        source: field.source,
        suggested_value: field.value,
        confirmed_by_designer: false,
        set_by_job_id: jobId,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "user_id,field_key" }
    );
  }

  await supabase.from("portfolio_profile_drafts").update({ status: "published" }).eq("job_id", jobId);

  return NextResponse.json({ applied: applied.map((field) => field.fieldKey), skipped });
}
