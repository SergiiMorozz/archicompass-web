import type { Metadata } from "next";
import ProjectCompassView from "@/components/ProjectCompassView";
import { getProjectCompassJourneyCopy } from "@/content/project-compass-journey-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getProjectCompassJourneyCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/ai-project-compass",
  noIndex: true,
});

export default function AiProjectCompassPage() {
  return <ProjectCompassView variant="journey" entryPath="/ai-project-compass" />;
}
