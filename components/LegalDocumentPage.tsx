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
}: {
  document: LegalDocument;
  relatedTitle: string;
  relatedLinks: RelatedLink[];
  contactLabel: string;
  companyLine: string;
}) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">{document.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{document.title}</h1>
      <p className="mt-3 text-sm text-muted">{document.effectiveDate}</p>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{document.intro}</p>

      <div className="mt-10 grid gap-9">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-2xl font-bold">{section.title}</h2>
            <div className="mt-3 grid gap-3 text-base leading-8 text-muted">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-line bg-card p-6 sm:p-7">
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
