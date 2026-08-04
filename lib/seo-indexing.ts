import type { Metadata } from "next";

// Search visibility is an explicit launch decision. The public product remains
// available while this is false, but no page is eligible for search indexing.
export const seoIndexingEnabled = process.env.NEXT_PUBLIC_SEO_INDEXING_ENABLED === "true";

export function robotsMetadata(explicitNoIndex = false): Metadata["robots"] {
  if (explicitNoIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
    };
  }

  if (!seoIndexingEnabled) {
    return {
      index: false,
      follow: true,
      nocache: true,
      googleBot: {
        index: false,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}
