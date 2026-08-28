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
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{autopilotCopy.name}</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{copy.title}</h1>
      <p className="mt-3 text-base text-muted">{copy.intro}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{copy.timeNote}</p>
      <AutopilotFlowSteps active="source" />
      <section className="mt-4">
        <div className="relative mx-auto aspect-[2.25] w-full max-w-[896px] overflow-hidden">
          <Image
            src="/images/portfolio-assistant-import-flow.png"
            alt={copy.illustrationAlt}
            fill
            sizes="(max-width: 640px) calc(100vw - 2rem), 896px"
            className="object-cover"
          />
        </div>
      </section>
      <PortfolioAutopilotStartForm />
    </main>
  );
}
