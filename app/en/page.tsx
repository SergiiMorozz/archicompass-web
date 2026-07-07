import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Find the right interior designer",
  description:
    "Turn inspiration photos into a clear project brief and compare interior designers and studios on ArchiCompass.",
  path: "/en",
  locale: "en_US",
  alternates: {
    canonical: absoluteUrl("/en"),
    languages: { pl: absoluteUrl("/"), en: absoluteUrl("/en"), "x-default": absoluteUrl("/") },
  },
});

export default function EnglishPage() {
  return (
    <main lang="en" className="bg-background">
      <section className="border-b border-line bg-card px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-sm font-bold uppercase text-primary">ArchiCompass in English</div>
          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-7xl">
            Find the right interior designer for your project.
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-xl leading-9 text-muted">
            Explore portfolios, build a detailed brief from your inspiration photos with AI,
            and start focused conversations with designers and studios in Poland.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/designers" className="rounded-xl bg-primary px-6 py-3 font-bold text-white">
              Find designers
            </Link>
            <Link href="/project-compass" className="rounded-xl border border-primary bg-primary-soft px-6 py-3 font-bold text-primary">
              Open Project Compass
            </Link>
            <Link href="/" hrefLang="pl" className="rounded-xl border border-line bg-background px-6 py-3 font-bold">
              Wersja polska
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:px-6 md:grid-cols-3">
        {[
          ["1", "Define your project", "Add the property, scope, budget, timing, rooms, and reference images."],
          ["2", "Understand your style", "AI identifies recurring colours, materials, and visual directions in your photos."],
          ["3", "Compare the right fit", "Review relevant portfolios and send one reusable brief to selected professionals."],
        ].map(([number, title, copy]) => (
          <article key={number} className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-bold text-primary">{number}</div>
            <h2 className="mt-2 text-2xl font-bold">{title}</h2>
            <p className="mt-3 leading-7 text-muted">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
