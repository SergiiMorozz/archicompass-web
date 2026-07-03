import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArchiCompass – Find Interior Designers",
    short_name: "ArchiCompass",
    description:
      "Find interior designers and turn inspiration photos into a clear project brief.",
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
