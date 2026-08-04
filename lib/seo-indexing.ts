import type { Metadata } from "next";

// The bilingual launch library has passed review and is now public. Keep this
// explicit so any future indexing hold requires a deliberate source change.
export const seoIndexingEnabled = true;

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
