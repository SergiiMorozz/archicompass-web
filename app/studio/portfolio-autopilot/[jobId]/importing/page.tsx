import type { Metadata } from "next";
import Image from "next/image";
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
      <section className="mt-6 overflow-hidden rounded-2xl border border-line bg-[#faf9f7] px-4 py-5 sm:px-8 sm:py-7">
        <Image
          src="/images/portfolio-assistant-import-flow.png"
          alt={copy.illustrationAlt}
          width={1672}
          height={941}
          sizes="(max-width: 640px) 100vw, 896px"
          className="mx-auto h-auto w-full max-w-[836px]"
        />
      </section>
      <ImportProgress jobId={jobId} />
    </main>
  );
}
