import type { Metadata } from "next";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { getContentGuidelinesCopy } from "@/content/content-guidelines-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getContentGuidelinesCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/content-guidelines",
});

export default function ContentGuidelinesPage() {
  return <LegalDocumentPage document={copy} relatedTitle={copy.relatedTitle} relatedLinks={copy.relatedLinks} contactLabel={copy.contactLabel} companyLine={copy.companyLine} />;
}
