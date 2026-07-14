import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArchiCompass – znajdź projektanta wnętrz",
    short_name: "ArchiCompass",
    description:
      "Katalog Projektantów wnętrz i AI Project Compass do tworzenia precyzyjnych briefów projektowych.",
    lang: "pl",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf9fd",
    theme_color: "#6d28d9",
    icons: [
      {
        src: "/brand/archicompass-mark.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
