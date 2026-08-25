import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { stagingAssetPreviewUrls } from "@/lib/portfolio-ingestion/asset-previews";
import { loadProfileDraftViewData } from "@/lib/portfolio-ingestion/profile-draft-view";
import { profileReadinessScore } from "@/lib/profile-readiness";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";
import ReviewBoard, { type ReviewAsset, type ReviewProject } from "@/components/portfolio-autopilot/ReviewBoard";
import ProfileDraftBoard from "@/components/portfolio-autopilot/ProfileDraftBoard";
import type { DesignerIntelligenceProfile } from "@/lib/portfolio-ingestion/aggregate-profile";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return Boolean(value);
}

export default async function PortfolioAutopilotReviewPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const copy = getPortfolioAutopilotCopy().review;
  const nextStepsCopy = getPortfolioAutopilotCopy().nextSteps;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect(localePublicPath(siteLocale, "/login"));

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) notFound();
  if (job.status !== "READY_FOR_REVIEW" && job.status !== "PUBLISHED") {
    redirect(localePublicPath(siteLocale, `/studio/portfolio-autopilot/${jobId}/importing`));
  }

  const [{ data: projects }, { data: assets }, { data: profile }, draftView, { data: liveProfile }] = await Promise.all([
    supabase
      .from("portfolio_projects")
      .select(
        "id, suggested_title, original_title, ai_title, object_type, area_m2, location, project_stage, original_description, custom_summary, confidence, room_types, status, is_featured, cover_asset_id, project_ai_analysis(result)"
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: true }),
    supabase
      .from("portfolio_assets")
      .select("id, storage_path, selected, cluster_project_id, alt_text")
      .eq("job_id", jobId)
      .not("storage_path", "is", null),
    supabase.from("designer_intelligence_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    loadProfileDraftViewData(supabase, jobId, user.id),
    supabase
      .from("profiles")
      .select("full_name, location, profession_type, email, bio, profile_headline, specialties, service_capabilities, pricing_model, price_from, price_to, work_modes, availability_status, years_experience")
      .eq("id", user.id)
      .maybeSingle(),
  ]);

  const previewUrls = await stagingAssetPreviewUrls(
    supabase,
    (assets ?? []).map((asset) => asset.storage_path).filter((path): path is string => Boolean(path))
  );

  const reviewAssets: ReviewAsset[] = (assets ?? []).map((asset) => ({
    id: asset.id,
    url: asset.storage_path ? previewUrls.get(asset.storage_path) ?? null : null,
    selected: asset.selected,
    clusterProjectId: asset.cluster_project_id,
    altText: asset.alt_text,
  }));

  const reviewProjects: ReviewProject[] = (projects ?? []).map((project) => {
    const analysis = Array.isArray(project.project_ai_analysis) ? project.project_ai_analysis[0] : project.project_ai_analysis;
    return {
      id: project.id,
      suggestedTitle: project.suggested_title,
      originalTitle: project.original_title,
      aiTitle: project.ai_title,
      objectType: project.object_type,
      areaM2: project.area_m2,
      location: project.location,
      projectStage: project.project_stage,
      originalDescription: project.original_description,
      customSummary: project.custom_summary,
      confidence: project.confidence,
      roomTypes: project.room_types ?? [],
      status: project.status,
      isFeatured: project.is_featured,
      coverAssetId: project.cover_asset_id,
      analysis: (analysis?.result ?? null) as ReviewProject["analysis"],
    };
  });

  // Compact readiness summary: would-be-ready fields (already live or in the
  // still-unpublished draft), split into found-automatically vs AI-suggested
  // vs genuinely missing. Commercial fields never count as "found" here -
  // they're always manual.
  const draft = draftView.draft;
  const manualOnlyKeys = new Set(["pricing_model", "price_range", "availability_status", "years_experience"]);
  const fieldHasValue: Record<string, boolean> = {
    full_name: hasValue(liveProfile?.full_name) || hasValue(draft?.full_name),
    location: hasValue(liveProfile?.location) || hasValue(draft?.location),
    profession_type: hasValue(liveProfile?.profession_type),
    email: hasValue(liveProfile?.email) || hasValue(draft?.email),
    bio: hasValue(liveProfile?.bio) || hasValue(draft?.about),
    profile_headline: hasValue(liveProfile?.profile_headline) || hasValue(draft?.headline),
    specialties: hasValue(liveProfile?.specialties) || hasValue(draft?.specialties),
    service_capabilities: hasValue(liveProfile?.service_capabilities) || hasValue(draft?.suggested_service_capabilities),
    pricing_model: hasValue(liveProfile?.pricing_model),
    price_range: hasValue(liveProfile?.price_from) || hasValue(liveProfile?.price_to),
    work_modes: hasValue(liveProfile?.work_modes) || hasValue(draft?.work_modes),
    availability_status: hasValue(liveProfile?.availability_status),
    years_experience: hasValue(liveProfile?.years_experience),
  };
  const foundKeys = new Set(["full_name", "location", "email", "work_modes"]);
  let foundCount = 0;
  let aiCount = 0;
  let manualCount = 0;
  const manualFields: string[] = [];
  for (const [key, present] of Object.entries(fieldHasValue)) {
    if (!present) {
      manualCount += 1;
      manualFields.push(key);
    } else if (manualOnlyKeys.has(key)) {
      foundCount += 1;
    } else if (foundKeys.has(key)) {
      foundCount += 1;
    } else {
      aiCount += 1;
    }
  }
  const readinessScore = profileReadinessScore(
    {
      full_name: liveProfile?.full_name ?? draft?.full_name,
      location: liveProfile?.location ?? draft?.location,
      profession_type: liveProfile?.profession_type,
      email: liveProfile?.email ?? draft?.email,
      bio: liveProfile?.bio ?? draft?.about,
      profile_headline: liveProfile?.profile_headline ?? draft?.headline,
      specialties: liveProfile?.specialties?.length ? liveProfile.specialties : draft?.specialties,
      service_capabilities: liveProfile?.service_capabilities?.length ? liveProfile.service_capabilities : draft?.suggested_service_capabilities,
      pricing_model: liveProfile?.pricing_model,
      price_from: liveProfile?.price_from,
      price_to: liveProfile?.price_to,
      work_modes: liveProfile?.work_modes?.length ? liveProfile.work_modes : draft?.work_modes,
      availability_status: liveProfile?.availability_status,
      years_experience: liveProfile?.years_experience,
    },
    true
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
      <p className="mt-2 text-base text-muted">{copy.subtitle}</p>

      <div className="mt-6 rounded-2xl border border-line bg-card p-5">
        <p className="text-lg font-bold text-foreground">{nextStepsCopy.title(readinessScore)}</p>
        <p className="mt-1 text-sm text-muted">{nextStepsCopy.summary(foundCount, aiCount, manualCount)}</p>
      </div>

      {draft ? (
        <ProfileDraftBoard
          jobId={jobId}
          draft={draft}
          alreadyPublished={draftView.draftStatus === "published"}
          alreadySet={draftView.alreadySet}
        />
      ) : null}

      {manualCount > 0 ? (
        <section className="mt-8 rounded-2xl border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{nextStepsCopy.toCompleteTitle}</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {manualFields.map((key) => (
              <li key={key} className="text-sm text-foreground">
                {nextStepsCopy.fieldLabels[key as keyof typeof nextStepsCopy.fieldLabels]}
              </li>
            ))}
          </ul>
          <a
            href={localePublicPath(siteLocale, "/account/profile")}
            className="mt-4 inline-block rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:border-primary"
          >
            {nextStepsCopy.completeCta}
          </a>
        </section>
      ) : null}

      <ReviewBoard
        jobId={jobId}
        userId={user.id}
        alreadyPublished={job.status === "PUBLISHED"}
        assets={reviewAssets}
        projects={reviewProjects}
        profile={(profile ?? null) as DesignerIntelligenceProfile | null}
      />
    </main>
  );
}
