import type { Metadata } from "next";
import Link from "next/link";
import AiFeatureBadge from "@/components/AiFeatureBadge";
import { getBillingCopy } from "@/content/billing-copy";
import { getServicesPricingCopy } from "@/content/services-pricing-copy";
import { localeAppPath } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const copy = getServicesPricingCopy();
const billing = getBillingCopy().pricing;

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/services-and-pricing",
});

function IncludedList({ items }: { items: string[] }) {
  return (
    <ul className="mt-6 grid gap-3 text-sm leading-6 text-foreground/85">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-bold text-primary" aria-hidden="true">✓</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ServicesAndPricingPage() {
  const plans = [billing.plans.designer, billing.plans.studio];

  return (
    <main>
      <section className="border-b border-line bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.15),transparent_36%),linear-gradient(135deg,#21152d,#39204d)] px-4 py-16 text-white sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#5de1d1]">{copy.hero.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">{copy.hero.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/78">{copy.hero.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={localeAppPath("/get-started")} className="inline-flex items-center justify-center rounded-xl bg-[#7c3aed] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#8b4cf0]">
              {copy.primaryCta}
            </Link>
            <Link href={localeAppPath("/pricing")} className="inline-flex items-center justify-center rounded-xl border border-white/45 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/20">
              {copy.pricingCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-accent/25 bg-accent-soft/45 p-7 shadow-[0_18px_48px_rgba(54,31,73,0.08)]">
            <div className="text-sm font-bold uppercase tracking-[0.14em] text-accent">{copy.client.label}</div>
            <h2 className="mt-4 text-3xl font-bold">{copy.client.title}</h2>
            <p className="mt-3 min-h-14 leading-7 text-muted">{copy.client.body}</p>
            <div className="mt-7 text-2xl font-bold text-accent">{copy.client.price}</div>
            <IncludedList items={copy.client.features} />
          </article>

          {plans.map((plan, index) => (
            <article key={plan.title} className={[
              "relative overflow-hidden rounded-2xl border bg-card p-7 shadow-[0_18px_48px_rgba(54,31,73,0.08)]",
              index === 0 ? "border-primary/30" : "border-line",
            ].join(" ")}>
              {index === 0 ? <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-primary/10" aria-hidden="true" /> : null}
              <div className="relative text-sm font-bold uppercase tracking-[0.14em] text-primary">{billing.eyebrow}</div>
              <h2 className="relative mt-4 text-3xl font-bold">{plan.title}</h2>
              <p className="relative mt-3 min-h-14 leading-7 text-muted">{plan.description}</p>
              <div className="relative mt-7 grid gap-3 rounded-xl border border-line bg-background p-4 sm:grid-cols-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{billing.monthlyLabel}</div>
                  <div className="mt-1 text-lg font-bold text-primary">{plan.monthly}</div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.12em] text-muted">{billing.yearlyLabel}</div>
                  <div className="mt-1 text-lg font-bold text-primary">{plan.yearly}</div>
                  <div className="mt-1 text-xs text-muted">{plan.yearlyNote}</div>
                </div>
              </div>
              <IncludedList items={plan.features} />
            </article>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/55 p-6 sm:p-7">
          <h2 className="text-xl font-bold">{copy.professionalTrial.title}</h2>
          <p className="mt-3 max-w-4xl leading-7 text-muted">{copy.professionalTrial.body}</p>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">{billing.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold">{copy.servicesTitle}</h2>
            <p className="mt-4 max-w-xl leading-7 text-muted">{copy.servicesBody}</p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary-soft p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20" aria-hidden="true">+</span>
              <div>
                <h3 className="text-xl font-bold">{copy.studioCoverage.title}</h3>
                <p className="mt-3 leading-7 text-muted">{copy.studioCoverage.body}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-14 max-w-3xl" aria-labelledby="portfolio-assistant-faq">
          <AiFeatureBadge>{copy.faq.badge}</AiFeatureBadge>
          <h2 id="portfolio-assistant-faq" className="mt-4 text-3xl font-bold">{copy.faq.title}</h2>
          <article className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft/55 p-6 sm:p-7">
            <h3 className="text-xl font-bold">{copy.faq.question}</h3>
            <p className="mt-3 leading-7 text-muted">{copy.faq.answer}</p>
          </article>
        </section>

        <div className="mt-8 rounded-2xl border border-line bg-card p-6 text-sm leading-7 text-muted sm:p-7">
          {copy.priceNote}
        </div>
      </section>
    </main>
  );
}
