import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { getFullLegalText } from "@/lib/legal-full-text";
import { siteLocale } from "@/lib/site-locale";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.aiTransparency.metadata.title,
  description: copy.documents.aiTransparency.metadata.description,
  path: "/ai-transparency",
});

export default function AiTransparencyPage() {
  return <LegalDocumentPage document={copy.documents.aiTransparency} fullText={getFullLegalText("aiTransparency", siteLocale)} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/terms", label: copy.links.terms },
    { href: "/privacy", label: copy.links.privacy },
    { href: "/cookies", label: copy.links.cookies },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
