import type { Metadata } from "next";
import ProjectCompassView from "@/components/ProjectCompassView";
import { getProjectCompassCopy } from "@/content/project-compass-copy";
import { pageMetadata } from "@/lib/seo";

const copy = getProjectCompassCopy();

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/project-compass",
});

export default function Page() {
  return <ProjectCompassView />;
}
