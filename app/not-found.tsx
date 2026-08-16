import type { Metadata } from "next";
import Link from "next/link";
import { localeAppPath, siteLocale } from "@/lib/site-locale";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  const english = siteLocale === "en";

  return (
    <main className="grid min-h-[70vh] place-items-center bg-background px-4 py-16 sm:px-6">
      <section className="max-w-xl rounded-3xl border border-line bg-card p-8 text-center shadow-sm sm:p-12">
        <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-sm font-bold text-primary">
          404
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {english ? "This page is not available" : "Ta strona nie jest dostępna"}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {english
            ? "The address may be outdated, or the page may have been moved."
            : "Adres może być nieaktualny albo strona została przeniesiona."}
        </p>
        <Link
          href={localeAppPath("/")}
          className="mt-7 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          {english ? "Go to home page" : "Wróć na stronę główną"}
        </Link>
      </section>
    </main>
  );
}
