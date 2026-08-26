import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import ImportProgress from "@/components/portfolio-autopilot/ImportProgress";
import AutopilotFlowSteps from "@/components/portfolio-autopilot/AutopilotFlowSteps";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function PortfolioAutopilotImportingPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const copy = getPortfolioAutopilotCopy().importing;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect(localePublicPath(siteLocale, "/login"));

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
      <AutopilotFlowSteps active="importing" />
      <ImportProgress jobId={jobId} />
    </main>
  );
}
