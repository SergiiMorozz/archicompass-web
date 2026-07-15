import type { NextConfig } from "next";

const englishZoneUrl = (
  process.env.ENGLISH_ZONE_URL || "https://archicompass-web-en.vercel.app"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "120mb",
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/en", destination: `${englishZoneUrl}/` },
        { source: "/en/:path*", destination: `${englishZoneUrl}/:path*` },
      ],
    };
  },
};

export default nextConfig;
