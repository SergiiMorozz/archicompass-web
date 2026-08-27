import type { Metadata } from "next";
import Image from "next/image";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import PortfolioAutopilotStartForm from "@/components/portfolio-autopilot/StartForm";
import AutopilotFlowSteps from "@/components/portfolio-autopilot/AutopilotFlowSteps";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PortfolioAutopilotStartPage() {
  const autopilotCopy = getPortfolioAutopilotCopy();
  const copy = autopilotCopy.start;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{autopilotCopy.name}</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{copy.title}</h1>
      <p className="mt-3 text-base text-muted">{copy.intro}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{copy.timeNote}</p>
      <AutopilotFlowSteps active="source" />
      <section className="mt-5 overflow-hidden rounded-2xl border border-line bg-[#faf9f7] px-4 py-3 sm:px-6 sm:py-4">
        <Image
          src="/images/portfolio-assistant-import-flow.png"
          alt={copy.illustrationAlt}
          width={1672}
          height={941}
          sizes="(max-width: 640px) 88vw, 560px"
          className="mx-auto h-auto w-[88%] max-w-[560px]"
        />
      </section>
      <PortfolioAutopilotStartForm />
    </main>
  );
}
