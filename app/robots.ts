import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
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
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
