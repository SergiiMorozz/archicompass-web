import type { Metadata } from "next";
import ProjectCompassView from "@/components/ProjectCompassView";
import { getProjectCompassJourneyCopy } from "@/content/project-compass-journey-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getProjectCompassJourneyCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/project-compass-2",
  noIndex: true,
});

export default function ProjectCompassJourneyPage() {
  return <ProjectCompassView variant="journey" entryPath="/project-compass-2" />;
}
