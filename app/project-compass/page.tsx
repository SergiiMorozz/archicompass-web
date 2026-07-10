import type { Metadata } from "next";
import ProjectCompassView from "@/components/ProjectCompassView";
import { projectCompassCopy } from "@/content/pl/copy";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: projectCompassCopy.metadata.title,
  description: projectCompassCopy.metadata.description,
  path: "/project-compass",
});

export default function Page() {
  return <ProjectCompassView />;
}
