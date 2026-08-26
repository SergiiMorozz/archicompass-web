import type { Metadata } from "next";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import PortfolioAutopilotStartForm from "@/components/portfolio-autopilot/StartForm";
import AutopilotFlowSteps from "@/components/portfolio-autopilot/AutopilotFlowSteps";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default function PortfolioAutopilotStartPage() {
  const copy = getPortfolioAutopilotCopy().start;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">{copy.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground">{copy.title}</h1>
      <p className="mt-3 text-base text-muted">{copy.intro}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{copy.timeNote}</p>
      <AutopilotFlowSteps active="source" />
      <PortfolioAutopilotStartForm />
    </main>
  );
}
