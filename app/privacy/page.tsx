import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { getFullLegalText } from "@/lib/legal-full-text";
import { siteLocale } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.privacy.metadata.title,
  description: copy.documents.privacy.metadata.description,
  path: "/privacy",
});

export default function PrivacyPage() {
  return <LegalDocumentPage document={copy.documents.privacy} fullText={getFullLegalText("privacy", siteLocale)} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/ai-transparency", label: copy.links.aiTransparency },
    { href: "/terms", label: copy.links.terms },
    { href: "/cookies", label: copy.links.cookies },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
