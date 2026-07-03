import type { Metadata } from "next";
import ProjectCompassView from "@/components/ProjectCompassView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "AI Interior Style Finder and Project Brief",
  description:
    "Upload interior inspiration photos, identify your style, palette, and material direction with AI, then create a detailed brief for matching interior designers.",
  path: "/project-compass",
});

export default function Page() {
  return <ProjectCompassView />;
}
