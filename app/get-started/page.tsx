import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Dołącz do ArchiCompass jako klient lub projektant",
  description:
    "Utwórz konto ArchiCompass, aby zaplanować wnętrze, zapisywać projektantów albo opublikować profesjonalny profil i portfolio.",
  path: "/get-started",
});

export default function Page() {
  return (
    <main className="px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-4xl font-bold">Dołącz do ArchiCompass</h1>
        <p className="mx-auto mt-3 max-w-xl text-center leading-7 text-muted">
          Choose your path and create an account with your email and password.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/login?mode=signup&next=/onboarding?intent=client" className="rounded-2xl border border-line bg-background p-6 hover:border-primary">
            <div className="text-lg font-semibold">Planuję projekt wnętrza</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Save designers and projects, prepare a brief, and keep conversations together.
            </p>
            <div className="mt-5 text-sm font-semibold text-primary">Kontynuuj jako klient</div>
          </Link>
          <Link href="/login?mode=signup&next=/onboarding?intent=designer" className="rounded-2xl border border-primary bg-primary-soft p-6">
            <div className="text-lg font-semibold text-primary">Jestem projektantem</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Manage your profile, portfolio, client briefs, conversations, and
              performance from Designer Studio.
            </p>
            <div className="mt-5 text-sm font-semibold text-primary">Kontynuuj jako profesjonalista</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
