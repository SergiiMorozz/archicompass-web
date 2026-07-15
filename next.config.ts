import type { NextConfig } from "next";

const englishZoneUrl = (
  process.env.ENGLISH_ZONE_URL || "https://archicompass-web-en.vercel.app"
).replace(/\/$/, "");
const isEnglishZone = process.env.NEXT_PUBLIC_SITE_LOCALE === "en";

const nextConfig: NextConfig = {
  // Both deployments build the same application. The English deployment only
  // adds the public /en prefix and reads the English copy at build time.
  basePath: isEnglishZone ? "/en" : undefined,
  experimental: {
    serverActions: {
      bodySizeLimit: "120mb",
    },
  },
  async redirects() {
    if (!isEnglishZone) {
      return [
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
