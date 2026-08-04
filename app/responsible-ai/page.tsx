import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.responsibleAi.metadata.title,
  description: copy.documents.responsibleAi.metadata.description,
  path: "/responsible-ai",
});

export default function ResponsibleAiPage() {
  return <LegalDocumentPage document={copy.documents.responsibleAi} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/ai-transparency", label: copy.links.aiTransparency },
    { href: "/privacy-and-ai", label: copy.links.privacyAndAi },
    { href: "/ai-disclaimer", label: copy.links.aiDisclaimer },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
