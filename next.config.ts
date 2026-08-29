import type { NextConfig } from "next";

const englishZoneUrl = (
  process.env.ENGLISH_ZONE_URL || "https://archicompass-web-en.vercel.app"
).replace(/\/$/, "");
const isEnglishZone = process.env.NEXT_PUBLIC_SITE_LOCALE === "en";
const seoIndexingEnabled = process.env.NEXT_PUBLIC_SEO_INDEXING_ENABLED === "true";

const nextConfig: NextConfig = {
  // Lets local verification use an isolated build output while a developer server is running.
  // Production keeps Next.js' standard .next directory.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Both deployments build the same application. The English deployment only
  // adds the public /en prefix and reads the English copy at build time.
  basePath: isEnglishZone ? "/en" : undefined,
  experimental: {
    serverActions: {
      // Covers the largest legitimate Server Action payload (profile logo +
      // banner, ~10MB) with headroom for a small batch of portfolio photos.
      // Next.js buffers the request body up to this limit before any
      // in-action auth check runs, so it stays well under the old 120mb to
      // bound unauthenticated-request memory/CPU cost. Larger portfolio
      // uploads go through /api/projects in multiple batches.
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none';" },
          ...(seoIndexingEnabled ? [] : [{ key: "X-Robots-Tag", value: "noindex, follow" }]),
        ],
      },
    ];
  },
  async redirects() {
    const legacyProjectCompassRedirects = [
      {
        source: "/project-compass",
        destination: "/ai-project-compass",
        permanent: true,
      },
      {
        source: "/project-compass-2",
        destination: "/ai-project-compass",
        permanent: true,
      },
    ];
    const legacyAiDocumentRedirects = [
      {
        source: "/responsible-ai",
        destination: "/ai-transparency",
        permanent: true,
      },
      {
        source: "/privacy-and-ai",
        destination: "/ai-transparency",
        permanent: true,
      },
      {
        source: "/ai-disclaimer",
        destination: "/ai-transparency",
        permanent: true,
      },
    ];
    // The Studio URL used to expose the implementation name "autopilot".
    // Keep every existing bookmark and notification link working, but make
    // Portfolio Assistant the single canonical address. `permanent: true`
    // instructs Next.js to issue HTTP 308 and preserves any query string.
    const legacyPortfolioAssistantRedirects = [
      {
        source: "/studio/portfolio-autopilot",
        destination: "/studio/portfolio-assistant",
        permanent: true,
      },
      {
        source: "/studio/portfolio-autopilot/:path*",
        destination: "/studio/portfolio-assistant/:path*",
        permanent: true,
      },
    ];

    if (!isEnglishZone) {
      return [
        ...legacyProjectCompassRedirects,
        ...legacyAiDocumentRedirects,
        ...legacyPortfolioAssistantRedirects,
        {
          source: "/en/en",
          destination: "/en",
          permanent: true,
        },
        {
          source: "/en/en/:path*",
          destination: "/en/:path*",
          permanent: true,
        },
      ];
    }

    return [
      ...legacyProjectCompassRedirects,
      ...legacyAiDocumentRedirects,
      ...legacyPortfolioAssistantRedirects,
      {
        source: "/",
        destination: "/en",
        permanent: false,
        basePath: false,
      },
    ];
  },
  async rewrites() {
    if (isEnglishZone) return { beforeFiles: [] };

    return {
      beforeFiles: [
        { source: "/en", destination: `${englishZoneUrl}/en` },
        { source: "/en/:path*", destination: `${englishZoneUrl}/en/:path*` },
      ],
    };
  },
};

export default nextConfig;
