import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { seoIndexingEnabled } from "@/lib/seo-indexing";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  const robots: MetadataRoute.Robots = {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account/",
        "/admin/",
        "/api/",
        "/auth/",
        "/client/",
        "/forgot-password",
        "/login",
        "/onboarding",
        "/reset-password",
        "/studio/",
        "/en/account/",
        "/en/admin/",
        "/en/api/",
        "/en/auth/",
        "/en/client/",
        "/en/forgot-password",
        "/en/login",
        "/en/onboarding",
        "/en/reset-password",
        "/en/studio/",
      ],
    },
    host: base,
  };

  // A sitemap is a direct invitation to index URLs. During the editorial
  // pre-launch, pages can still be viewed, but crawlers are not sent a list.
  if (seoIndexingEnabled) robots.sitemap = `${base}/sitemap.xml`;
  return robots;
}
