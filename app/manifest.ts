import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArchiCompass – znajdź projektanta wnętrz",
    short_name: "ArchiCompass",
    description:
      "Znajdź projektanta wnętrz i zamień zdjęcia inspiracji w precyzyjny brief projektowy.",
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
