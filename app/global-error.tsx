"use client";

import { siteLocale } from "@/lib/site-locale";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const isEnglish = siteLocale === "en";

  return (
    <html lang={isEnglish ? "en" : "pl"}>
      <body className="bg-[#fbfaff] text-[#251a37]">
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-16 sm:px-6">
          <section className="w-full rounded-lg border border-[#e4dff0] bg-white p-8 shadow-sm sm:p-10">
            <div className="text-sm font-semibold text-[#6d2bd9]">ArchiCompass</div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight" data-error-digest={error.digest ?? undefined}>
              {isEnglish ? "Something went wrong" : "Wystąpił nieoczekiwany błąd"}
            </h1>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-xl bg-[#6d2bd9] px-5 py-3 text-sm font-semibold text-white"
            >
              {isEnglish ? "Try again" : "Spróbuj ponownie"}
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
