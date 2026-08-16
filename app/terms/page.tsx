import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { getFullPolishLegalText } from "@/lib/legal-full-text";
import { siteLocale } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.terms.metadata.title,
  description: copy.documents.terms.metadata.description,
  path: "/terms",
});

export default function TermsPage() {
  return <LegalDocumentPage document={copy.documents.terms} fullText={siteLocale === "pl" ? getFullPolishLegalText("terms") : undefined} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/privacy", label: copy.links.privacy },
    { href: "/ai-disclaimer", label: copy.links.aiDisclaimer },
    { href: "/cookies", label: copy.links.cookies },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
