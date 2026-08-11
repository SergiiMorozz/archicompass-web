import type { MetadataRoute } from "next";
import { getSiteCopy } from "@/content/site-copy";
import { localeAssetPath, localeMetadata, localePublicPath, siteLocale } from "@/lib/site-locale";

export default function manifest(): MetadataRoute.Manifest {
  const copy = getSiteCopy();

  return {
    name: `ArchiCompass – ${copy.seo.defaultTitle}`,
    short_name: "ArchiCompass",
    description: copy.seo.defaultDescription,
    lang: localeMetadata[siteLocale].html,
    start_url: localePublicPath(siteLocale, "/"),
    display: "standalone",
    background_color: "#fbf9fd",
    theme_color: "#6d28d9",
    icons: [
      {
        src: localeAssetPath("/brand/archicompass-mark.png"),
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
