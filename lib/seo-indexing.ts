import type { Metadata } from "next";

// SEO stays closed by default until the public catalogue contains verified,
// non-demo content and the launch audit is complete. Enable it deliberately in
// the deployment environment and redeploy when the platform is ready.
export const seoIndexingEnabled = process.env.NEXT_PUBLIC_SEO_INDEXING_ENABLED === "true";

export function robotsMetadata(explicitNoIndex = false): Metadata["robots"] {
  if (explicitNoIndex) {
    return {
      index: false,
      follow: true,
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
