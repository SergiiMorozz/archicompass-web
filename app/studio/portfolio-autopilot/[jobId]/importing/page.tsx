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
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-3xl font-bold text-foreground">{copy.title}</h1>
      <AutopilotFlowSteps active="importing" />
      <section className="mt-5">
        <div className="relative mx-auto aspect-[2.25] w-full max-w-[1024px] overflow-hidden">
          <Image
            src="/images/portfolio-assistant-import-flow.png"
            alt={copy.illustrationAlt}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), 1024px"
            className="object-cover"
          />
        </div>
      </section>
      <ImportProgress jobId={jobId} />
    </main>
  );
}
