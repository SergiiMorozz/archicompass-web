import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.privacyAndAi.metadata.title,
  description: copy.documents.privacyAndAi.metadata.description,
  path: "/privacy-and-ai",
});

export default function PrivacyAndAiPage() {
  return <LegalDocumentPage document={copy.documents.privacyAndAi} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/privacy", label: copy.links.privacy },
    { href: "/ai-transparency", label: copy.links.aiTransparency },
    { href: "/responsible-ai", label: copy.links.responsibleAi },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
