import type { Metadata } from "next";
import Link from "next/link";
import { getSiteCopy } from "@/content/site-copy";
import { pageMetadata } from "@/lib/seo";

const authCopy = getSiteCopy().auth;

export const metadata: Metadata = pageMetadata({
  title: authCopy.metadata.getStartedTitle,
  description: authCopy.metadata.getStartedDescription,
  path: "/get-started",
});

export default function Page() {
  return (
    <main className="px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-4xl font-bold">{authCopy.getStarted.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-center leading-7 text-muted">
          {authCopy.getStarted.intro}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/login?mode=signup&next=/onboarding?intent=client" className="rounded-2xl border border-line bg-background p-6 hover:border-primary">
            <div className="text-lg font-semibold">{authCopy.getStarted.clientTitle}</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              {authCopy.getStarted.clientDescription}
            </p>
            <div className="mt-5 text-sm font-semibold text-primary">{authCopy.getStarted.clientCta}</div>
          </Link>
          <Link href="/login?mode=signup&next=/onboarding?intent=designer" className="rounded-2xl border border-primary bg-primary-soft p-6">
            <div className="text-lg font-semibold text-primary">{authCopy.getStarted.designerTitle}</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              {authCopy.getStarted.designerDescription}
            </p>
            <div className="mt-5 text-sm font-semibold text-primary">{authCopy.getStarted.designerCta}</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
