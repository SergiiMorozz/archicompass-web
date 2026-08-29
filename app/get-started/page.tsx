import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSiteCopy } from "@/content/site-copy";
import { getBillingCopy } from "@/content/billing-copy";
import EarlyAccessNotice from "@/components/EarlyAccessNotice";
import { portfolioAssistantReturnPath } from "@/lib/portfolio-autopilot-return";
import { localeAssetPath } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const siteCopy = getSiteCopy();
const authCopy = siteCopy.auth;
const billingCopy = getBillingCopy();
const clientAccountImage = localeAssetPath("/images/guides/define-interior-style.webp");
const designerAccountImage = localeAssetPath("/images/guides/interior-project-planning.webp");

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
    <main className="min-h-[calc(100vh-9rem)] bg-[radial-gradient(circle_at_top_right,rgba(226,214,255,0.58),transparent_37%),linear-gradient(180deg,#fbfaff_0%,#f7f4fb_100%)] px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-line bg-card p-6 shadow-[0_24px_64px_rgba(58,33,83,0.12)] sm:p-8 lg:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1.5 text-xs font-bold uppercase tracking-[0.13em] text-primary">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-[11px] text-white" aria-hidden="true">✦</span>
            ArchiCompass
          </div>
          <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">{authCopy.getStarted.title}</h1>
          <p className="mt-3 text-base leading-7 text-muted sm:text-lg">{authCopy.getStarted.intro}</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <Link href="/login?mode=signup&next=/onboarding?intent=client" className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-background transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_30px_rgba(86,35,168,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <div className="relative h-32 w-full shrink-0 overflow-hidden">
              <Image src={clientAccountImage} alt="" fill priority sizes="(max-width: 767px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#21122d]/46 to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/92 px-2.5 py-1.5 text-xs font-bold text-foreground shadow-sm"><span className="grid h-5 w-5 place-items-center rounded-lg bg-primary-soft text-primary" aria-hidden="true">◌</span>AI Project Compass</span>
            </div>
            <div className="flex min-h-[194px] flex-1 flex-col p-5">
              <h2 className="text-xl font-bold leading-tight">{authCopy.getStarted.clientTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{authCopy.getStarted.clientDescription}</p>
              <span className="mt-auto pt-5 text-sm font-bold text-primary">{authCopy.getStarted.clientCta}<span className="ml-2" aria-hidden="true">→</span></span>
            </div>
          </Link>

          <Link href={designerSignupHref} className="group flex flex-col overflow-hidden rounded-2xl border border-primary/45 bg-primary-soft/55 transition hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_14px_34px_rgba(86,35,168,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <div className="relative h-32 w-full shrink-0 overflow-hidden">
              <Image src={designerAccountImage} alt="" fill priority sizes="(max-width: 767px) 100vw, 50vw" className="object-cover transition duration-500 group-hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#21122d]/52 to-transparent" />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-xl border border-white/70 bg-white/92 px-2.5 py-1.5 text-xs font-bold text-foreground shadow-sm"><span className="grid h-5 w-5 place-items-center rounded-lg bg-primary text-white" aria-hidden="true">✦</span>{siteCopy.header.designerStudio}</span>
            </div>
            <div className="flex min-h-[194px] flex-1 flex-col p-5">
              <h2 className="text-xl font-bold leading-tight text-primary">{authCopy.getStarted.designerTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{authCopy.getStarted.designerDescription}</p>
              <span className="mt-auto pt-5 text-sm font-bold text-primary">{authCopy.getStarted.designerCta}<span className="ml-2" aria-hidden="true">→</span></span>
            </div>
          </Link>
        </div>

        <EarlyAccessNotice compact className="mt-4" />
        <p className="mt-5 text-sm text-muted"><Link href="/pricing" className="font-semibold text-primary hover:underline">{billingCopy.pricing.metadata.title}</Link></p>
      </section>
    </main>
  );
}
