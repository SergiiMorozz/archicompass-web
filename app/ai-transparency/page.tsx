import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.aiTransparency.metadata.title,
  description: copy.documents.aiTransparency.metadata.description,
  path: "/ai-transparency",
});

export default function AiTransparencyPage() {
  return <LegalDocumentPage document={copy.documents.aiTransparency} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/responsible-ai", label: copy.links.responsibleAi },
    { href: "/privacy-and-ai", label: copy.links.privacyAndAi },
    { href: "/ai-disclaimer", label: copy.links.aiDisclaimer },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
