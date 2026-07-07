import type { Metadata } from "next";
import ProjectCompassView from "@/components/ProjectCompassView";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "AI do rozpoznawania stylu wnętrza i tworzenia briefu",
  description:
    "Dodaj zdjęcia inspiracji, rozpoznaj styl, paletę kolorów i materiały dzięki AI, a następnie utwórz szczegółowy brief i znajdź dopasowanego projektanta wnętrz.",
  path: "/project-compass",
});

export default function Page() {
  return <ProjectCompassView />;
}
