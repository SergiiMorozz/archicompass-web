import Link from "next/link";
import { getWorkspaceCopy } from "@/content/workspace-copy";

type DesignerProfileSection = "details" | "portfolio" | "assistant";

export default function DesignerProfileNav({ active }: { active: DesignerProfileSection }) {
  const copy = getWorkspaceCopy().studioNav;
  const sections: Array<{ href: string; label: string; key: DesignerProfileSection }> = [
    { href: "/account/profile", label: copy.profileDetails, key: "details" },
    { href: "/account/projects", label: copy.profilePortfolio, key: "portfolio" },
    { href: "/studio/portfolio-autopilot", label: copy.profileAssistant, key: "assistant" },
  ];

  return (
    <section className="mt-7 rounded-2xl border border-line bg-background p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="px-2 text-sm font-bold text-foreground">{copy.profile}</div>
        <nav aria-label={copy.profileAriaLabel} className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-end">
          {sections.map((section) => {
            const current = active === section.key;
            return (
              <Link
                key={section.href}
                href={section.href}
                aria-current={current ? "page" : undefined}
                className={[
                  "min-w-0 rounded-xl px-3 py-2 text-center text-sm font-semibold transition",
                  current
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-primary-soft hover:text-primary",
                ].join(" ")}
              >
                {section.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
