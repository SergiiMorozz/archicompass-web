import Link from "next/link";
import type { LegalDocument } from "@/content/legal-copy";
import { localeAppPath } from "@/lib/site-locale";

type RelatedLink = { href: string; label: string };

export default function LegalDocumentPage({
  document,
  relatedTitle,
  relatedLinks,
  contactLabel,
  companyLine,
  fullText,
}: {
  document: LegalDocument;
  relatedTitle: string;
  relatedLinks: RelatedLink[];
  contactLabel: string;
  companyLine: string;
  fullText?: string;
}) {
  const fullTextLines = fullText?.split("\n").map((line) => line.trim()).filter(Boolean) ?? [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-14">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">{document.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{document.title}</h1>
      <p className="mt-3 text-sm text-muted">{document.effectiveDate}</p>
      {!fullText ? <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{document.intro}</p> : null}

      {fullText ? (
        <div className="mt-8 grid gap-2.5 text-[0.9375rem] leading-6 text-muted sm:text-base sm:leading-7">
          {fullTextLines.map((line, index) => {
            if (line === "⸻") return null;

            const isParagraphHeading = /^§\s+\d+\./.test(line)
              || (/^\d+\.\s+/.test(line) && line.length <= 100 && !/[.;:,]$/.test(line));

            if (isParagraphHeading) {
              return <h2 key={`${index}-${line}`} className="mt-5 text-xl font-bold text-foreground sm:text-2xl">{line}</h2>;
            }

            if (/^[a-z]\)|^\*\s|^\d+\./.test(line)) {
              return <p key={`${index}-${line}`} className="ml-5">{line}</p>;
            }

            return <p key={`${index}-${line}`}>{line}</p>;
          })}
        </div>
      ) : (
        <div className="mt-8 grid gap-7">
          {document.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <div className="mt-3 grid gap-2.5 text-base leading-7 text-muted">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets?.length ? (
                <ul className="ml-5 grid list-disc gap-2">
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
            </div>
          </section>
          ))}
        </div>
      )}

      <section className="mt-9 rounded-2xl border border-line bg-card p-6 sm:p-7">
        <h2 className="text-xl font-bold">{relatedTitle}</h2>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-primary">
          {relatedLinks.map((link) => (
            <Link key={link.href} href={localeAppPath(link.href)} className="hover:underline">{link.label}</Link>
          ))}
          <a href="mailto:contact@archicompass.pl" className="hover:underline">{contactLabel}</a>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">{companyLine}</p>
      </section>
    </main>
  );
}
