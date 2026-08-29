import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSiteCopy } from "@/content/site-copy";
import { getBillingCopy } from "@/content/billing-copy";
import EarlyAccessNotice from "@/components/EarlyAccessNotice";
import { portfolioAssistantReturnPath } from "@/lib/portfolio-autopilot-return";
import { localeAssetPath } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const authCopy = getSiteCopy().auth;
const billingCopy = getBillingCopy();
const signupImage = localeAssetPath("/images/home/hero-warm-minimalist-20260811.png");

export const metadata: Metadata = pageMetadata({
  title: authCopy.metadata.getStartedTitle,
  description: authCopy.metadata.getStartedDescription,
  path: "/get-started",
});

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const next = portfolioAssistantReturnPath((await searchParams)?.next);
  const designerOnboarding = new URLSearchParams({ intent: "designer" });
  if (next) designerOnboarding.set("next", next);
  const designerSignupHref = `/login?mode=signup&next=${encodeURIComponent(`/onboarding?${designerOnboarding.toString()}`)}`;

  return (
    <main className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_top_right,rgba(226,214,255,0.58),transparent_37%),linear-gradient(180deg,#fbfaff_0%,#f7f4fb_100%)] px-4 py-10 sm:px-6 sm:py-14">
      <section className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-line bg-card shadow-[0_24px_64px_rgba(58,33,83,0.12)] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="p-6 sm:p-9 lg:p-11">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-primary">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-white" aria-hidden="true">✦</span>
            ArchiCompass
          </div>
          <h1 className="mt-5 max-w-xl text-4xl font-bold leading-tight sm:text-5xl">{authCopy.getStarted.title}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
            {authCopy.getStarted.intro}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link href="/login?mode=signup&next=/onboarding?intent=client" className="group rounded-2xl border border-line bg-background p-5 transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_30px_rgba(86,35,168,0.10)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-lg text-primary shadow-sm" aria-hidden="true">◌</span>
              <div className="mt-5 text-lg font-semibold">{authCopy.getStarted.clientTitle}</div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {authCopy.getStarted.clientDescription}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">{authCopy.getStarted.clientCta}<span aria-hidden="true">→</span></div>
            </Link>
            <Link href={designerSignupHref} className="group rounded-2xl border border-primary/45 bg-primary-soft/70 p-5 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_14px_34px_rgba(86,35,168,0.14)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-lg text-white shadow-[0_8px_20px_rgba(86,35,168,0.28)]" aria-hidden="true">✦</span>
              <div className="mt-5 text-lg font-semibold text-primary">{authCopy.getStarted.designerTitle}</div>
              <p className="mt-2 text-sm leading-6 text-muted">
                {authCopy.getStarted.designerDescription}
              </p>
              <EarlyAccessNotice compact className="mt-4 text-left" />
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">{authCopy.getStarted.designerCta}<span aria-hidden="true">→</span></div>
            </Link>
          </div>
          <p className="mt-7 text-sm text-muted"><Link href="/pricing" className="font-semibold text-primary hover:underline">{billingCopy.pricing.metadata.title}</Link></p>
        </div>

        <aside className="relative min-h-[320px] overflow-hidden border-t border-line bg-primary-soft lg:min-h-full lg:border-l lg:border-t-0" aria-hidden="true">
          <Image src={signupImage} alt="" fill priority sizes="(max-width: 1023px) 100vw, 42vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#21122d]/76 via-[#21122d]/10 to-transparent" />
          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-2xl border border-white/70 bg-white/90 px-3 py-2.5 shadow-[0_12px_28px_rgba(37,22,55,0.16)] sm:left-7 sm:top-7">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-sm text-white" aria-hidden="true">✦</span>
            <span className="text-sm font-bold text-foreground">AI Project Compass</span>
          </div>
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/45 bg-white/92 p-4 shadow-[0_16px_36px_rgba(37,22,55,0.20)] sm:inset-x-7 sm:bottom-7 sm:p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-primary">ArchiCompass</div>
            <div className="mt-1 text-lg font-bold leading-tight text-foreground">{authCopy.getStarted.designerTitle}</div>
            <div className="mt-2 text-sm leading-5 text-muted">{authCopy.getStarted.designerDescription}</div>
          </div>
        </aside>
      </section>
    </main>
  );
}
