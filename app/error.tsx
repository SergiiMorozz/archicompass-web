"use client";

import { useEffect } from "react";
import { siteLocale } from "@/lib/site-locale";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const isEnglish = siteLocale === "en";

  useEffect(() => {
    // The digest is safe to correlate with Vercel runtime logs without exposing user data.
    console.error(JSON.stringify({ event: "page_render_failed", digest: error.digest ?? "unknown" }));
  }, [error.digest]);

  return (
    <main className="mx-auto flex min-h-[55vh] max-w-3xl items-center px-4 py-16 sm:px-6">
      <section className="w-full rounded-lg border border-line bg-card p-8 shadow-sm sm:p-10">
        <div className="text-sm font-semibold text-primary">ArchiCompass</div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          {isEnglish ? "This page could not be opened" : "Nie udało się otworzyć tej strony"}
        </h1>
        <p className="mt-3 max-w-xl leading-7 text-muted">
          {isEnglish
            ? "Please try again. If the issue continues, return to the home page and contact us with the time it occurred."
            : "Spróbuj ponownie. Jeśli problem się powtórzy, wróć na stronę główną i skontaktuj się z nami, podając godzinę wystąpienia błędu."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110"
        >
          {isEnglish ? "Try again" : "Spróbuj ponownie"}
        </button>
      </section>
    </main>
  );
}
