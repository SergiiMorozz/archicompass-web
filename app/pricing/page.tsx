import type { Metadata } from "next";
import Link from "next/link";
import { getBillingCopy } from "@/content/billing-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getBillingCopy().pricing;

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/pricing",
});

export default function PricingPage() {
  const plans = [copy.plans.designer, copy.plans.studio];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-sm font-bold uppercase tracking-[0.16em] text-accent">{copy.eyebrow}</div>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">{copy.title}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted">{copy.intro}</p>
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-accent/25 bg-accent-soft px-5 py-5 text-left shadow-sm sm:px-6">
            <div className="text-lg font-bold text-accent">{copy.founderTitle}</div>
            <p className="mt-2 leading-7 text-foreground/80">{copy.founderBody}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <article key={plan.title} className={[
              "relative overflow-hidden rounded-2xl border bg-card p-7 shadow-[0_18px_48px_rgba(54,31,73,0.09)] sm:p-8",
              index === 0 ? "border-primary/30" : "border-line",
            ].join(" ")}>
              {index === 0 ? <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-primary/10" aria-hidden="true" /> : null}
              <div className="relative">
                <h2 className="text-3xl font-bold">{plan.title}</h2>
                <p className="mt-3 max-w-md leading-7 text-muted">{plan.description}</p>
                <div className="mt-7 grid gap-3 rounded-xl border border-line bg-background p-4 sm:grid-cols-2">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{copy.monthlyLabel}</div>
                    <div className="mt-1 text-xl font-bold text-primary">{plan.monthly}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{copy.yearlyLabel}</div>
                    <div className="mt-1 text-xl font-bold text-primary">{plan.yearly}</div>
                    <div className="mt-1 text-xs text-muted">{plan.yearlyNote}</div>
                  </div>
                </div>
                <ul className="mt-7 grid gap-3 text-sm leading-6 text-foreground/85">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary">✓</span>{feature}</li>
                  ))}
                </ul>
                <Link href="/get-started" className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary/90">
                  {copy.getStarted}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-line bg-primary-soft/55 p-6 text-sm leading-7 text-muted sm:p-7">
          <div className="font-bold text-foreground">{copy.vatNote}</div>
          <p className="mt-3">{copy.clientNote}</p>
        </div>

        <section className="mt-14">
          <h2 className="text-3xl font-bold">{copy.faqTitle}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {copy.faq.map((item) => (
              <article key={item.question} className="rounded-2xl border border-line bg-card p-6">
                <h3 className="text-lg font-bold">{item.question}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
