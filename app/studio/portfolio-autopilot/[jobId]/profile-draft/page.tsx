import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { loadProfileDraftViewData } from "@/lib/portfolio-ingestion/profile-draft-view";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import ProfileDraftBoard from "@/components/portfolio-autopilot/ProfileDraftBoard";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

// Legacy direct-edit route, kept for anyone with the link - the primary
// Autopilot path now shows this same content inline at the top of the main
// review page instead of requiring navigation here.
export default async function PortfolioAutopilotProfileDraftPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const copy = getPortfolioAutopilotCopy().profileDraft;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect(localePublicPath(siteLocale, "/login"));

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) notFound();
  if (job.status !== "READY_FOR_REVIEW" && job.status !== "PUBLISHED") {
    redirect(localePublicPath(siteLocale, `/studio/portfolio-autopilot/${jobId}/importing`));
  }

  const { draft, draftStatus, alreadySet, liveProfile } = await loadProfileDraftViewData(supabase, jobId, user.id);

  if (!draft) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
        <p className="mt-4 text-muted">{copy.empty}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
      <p className="mt-2 text-base text-muted">{copy.subtitle}</p>
      <ProfileDraftBoard jobId={jobId} draft={draft} alreadyPublished={draftStatus === "published"} alreadySet={alreadySet} liveProfile={liveProfile} />
    </main>
  );
}
