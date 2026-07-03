import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Join ArchiCompass as a Client or Designer",
  description:
    "Create an ArchiCompass account to plan an interior project, save designers, or publish a professional profile and portfolio for new clients.",
  path: "/get-started",
});

export default function Page() {
  return (
    <main className="px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-4xl font-bold">Get Started</h1>
        <p className="mx-auto mt-3 max-w-xl text-center leading-7 text-muted">
          Choose your path and continue with secure email sign-in. No password needed.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/login?next=/onboarding?intent=client" className="rounded-2xl border border-line bg-background p-6 hover:border-primary">
            <div className="text-lg font-semibold">I am planning a project</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Save designers and projects, prepare a brief, and keep conversations together.
            </p>
            <div className="mt-5 text-sm font-semibold text-primary">Continue as client</div>
          </Link>
          <Link href="/login?next=/onboarding?intent=designer" className="rounded-2xl border border-primary bg-primary-soft p-6">
            <div className="text-lg font-semibold text-primary">I am a professional</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Manage your profile, portfolio, client briefs, conversations, and
              performance from Designer Studio.
            </p>
            <div className="mt-5 text-sm font-semibold text-primary">Continue as professional</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
