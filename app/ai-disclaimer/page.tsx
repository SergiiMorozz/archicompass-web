import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getLegalCopy } from "@/content/legal-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getLegalCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.documents.aiDisclaimer.metadata.title,
  description: copy.documents.aiDisclaimer.metadata.description,
  path: "/ai-disclaimer",
});

export default function AiDisclaimerPage() {
  return <LegalDocumentPage document={copy.documents.aiDisclaimer} relatedTitle={copy.relatedTitle} relatedLinks={[
    { href: "/ai-transparency", label: copy.links.aiTransparency },
    { href: "/responsible-ai", label: copy.links.responsibleAi },
    { href: "/terms", label: copy.links.terms },
  ]} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
