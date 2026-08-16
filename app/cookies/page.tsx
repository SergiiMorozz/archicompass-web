import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { getFullLegalText } from "@/lib/legal-full-text";
import { siteLocale } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.cookies.metadata.title,
  description: copy.documents.cookies.metadata.description,
  path: "/cookies",
});

export default function CookiePolicyPage() {
  return <LegalDocumentPage document={copy.documents.cookies} fullText={getFullLegalText("cookies", siteLocale)} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/privacy", label: copy.links.privacy },
    { href: "/terms", label: copy.links.terms },
    { href: "/privacy-and-ai", label: copy.links.privacyAndAi },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
