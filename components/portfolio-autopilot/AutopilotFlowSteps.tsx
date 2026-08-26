import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";

type FlowStage = "source" | "importing" | "review";

const stages: FlowStage[] = ["source", "importing", "review"];

export default function AutopilotFlowSteps({ active }: { active: FlowStage }) {
  const copy = getPortfolioAutopilotCopy().flow;
  const activeIndex = stages.indexOf(active);

  return (
    <ol aria-label={copy.ariaLabel} className="mt-7 grid gap-2 rounded-2xl border border-line bg-card p-3 sm:grid-cols-3">
      {stages.map((stage, index) => {
        const completed = index < activeIndex;
        const current = index === activeIndex;
        return (
          <li
            key={stage}
            aria-current={current ? "step" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
              current ? "bg-primary-soft text-primary" : completed ? "text-foreground" : "text-muted"
            }`}
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                current ? "bg-primary text-white" : completed ? "bg-foreground text-white" : "border border-line bg-background"
              }`}
            >
              {completed ? "✓" : index + 1}
            </span>
            <span>{copy[stage]}</span>
          </li>
        );
      })}
    </ol>
  );
}
