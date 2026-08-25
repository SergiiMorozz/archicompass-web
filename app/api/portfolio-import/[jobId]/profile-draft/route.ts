import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { publicTextError } from "@/lib/content-moderation";
import { serviceCapabilities } from "@/lib/service-capabilities";
import { workModes } from "@/lib/profile-pricing";
import { profileLanguages } from "@/lib/professional-profile-details";

type ProfileDraftPatchBody = {
  headline?: unknown;
  about?: unknown;
  specialties?: unknown;
  suggestedServiceCapabilities?: unknown;
  instagramUrl?: unknown;
  facebookUrl?: unknown;
  behanceUrl?: unknown;
  linkedinUrl?: unknown;
  fullName?: unknown;
  location?: unknown;
  phone?: unknown;
  email?: unknown;
  languages?: unknown;
  workModes?: unknown;
};

function urlOrNull(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed.slice(0, 500) : null;
}

function textOrNull(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const { data: draft } = await supabase.from("portfolio_profile_drafts").select("*").eq("job_id", jobId).maybeSingle();
  return NextResponse.json({ draft: draft ?? null });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const { data: existing } = await supabase.from("portfolio_profile_drafts").select("id").eq("job_id", jobId).maybeSingle();
  if (!existing) return NextResponse.json({ error: "No profile draft for this import." }, { status: 404 });

  const body = (await request.json()) as ProfileDraftPatchBody;
  const patch: Record<string, unknown> = {};

  if (typeof body.headline === "string") patch.headline = body.headline.trim().slice(0, 140) || null;
  if (typeof body.about === "string") patch.about = body.about.trim().slice(0, 1200) || null;
  if (Array.isArray(body.specialties)) {
    patch.specialties = body.specialties
      .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
      .map((v) => v.trim().slice(0, 60))
      .slice(0, 6);
  }
  if (Array.isArray(body.suggestedServiceCapabilities)) {
    const allowed = new Set<string>(serviceCapabilities);
    patch.suggested_service_capabilities = body.suggestedServiceCapabilities.filter(
      (v): v is string => typeof v === "string" && allowed.has(v)
    );
  }
  if (body.instagramUrl !== undefined) patch.instagram_url = urlOrNull(body.instagramUrl);
  if (body.facebookUrl !== undefined) patch.facebook_url = urlOrNull(body.facebookUrl);
  if (body.behanceUrl !== undefined) patch.behance_url = urlOrNull(body.behanceUrl);
  if (body.linkedinUrl !== undefined) patch.linkedin_url = urlOrNull(body.linkedinUrl);
  if (body.fullName !== undefined) patch.full_name = textOrNull(body.fullName, 160);
  if (body.location !== undefined) patch.location = textOrNull(body.location, 100);
  if (body.phone !== undefined) patch.phone = textOrNull(body.phone, 40);
  if (body.email !== undefined) patch.email = textOrNull(body.email, 200);
  if (Array.isArray(body.languages)) {
    const allowedLanguages = new Set<string>(profileLanguages);
    patch.languages = body.languages.filter((v): v is string => typeof v === "string" && allowedLanguages.has(v));
  }
  if (Array.isArray(body.workModes)) {
    const allowedModes = new Set<string>(workModes);
    patch.work_modes = body.workModes.filter((v): v is string => typeof v === "string" && allowedModes.has(v));
  }

  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const moderationError = publicTextError([
    typeof patch.headline === "string" ? patch.headline : null,
    typeof patch.about === "string" ? patch.about : null,
    typeof patch.full_name === "string" ? patch.full_name : null,
    ...(Array.isArray(patch.specialties) ? (patch.specialties as string[]) : []),
  ]);
  if (moderationError) return NextResponse.json({ error: moderationError }, { status: 400 });

  const { error } = await supabase.from("portfolio_profile_drafts").update(patch).eq("job_id", jobId);
  if (error) return NextResponse.json({ error: "Could not update the profile draft." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
