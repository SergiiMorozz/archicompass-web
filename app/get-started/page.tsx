import Link from "next/link";

export default function Page() {
  return (
    <main className="px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-3xl border border-line bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-4xl font-bold">Get Started</h1>
        <p className="mx-auto mt-3 max-w-xl text-center leading-7 text-muted">
          Choose how you want to use ArchiCompass. For now, both paths use secure
          email sign-in while we build full onboarding.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link href="/designers" className="rounded-2xl border border-line bg-background p-6 hover:border-primary">
            <div className="text-lg font-semibold">Client</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Browse designers, save favorites, and prepare your project brief.
            </p>
          </Link>
          <Link href="/login" className="rounded-2xl border border-primary bg-primary-soft p-6">
            <div className="text-lg font-semibold text-primary">Professional</div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Claim your profile and prepare a portfolio page for future leads.
            </p>
          </Link>
        </div>

        <Link
          href="/login"
          className="mt-6 block rounded-xl bg-primary px-5 py-4 text-center text-sm font-semibold text-white"
        >
          Continue with Email
        </Link>
      </section>
    </main>
  );
}
