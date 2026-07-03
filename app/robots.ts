import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/designers/", "/studios/", "/projects/", "/inspiration/"],
      disallow: [
        "/account/",
        "/admin/",
        "/api/",
        "/auth/",
        "/client/",
        "/login",
        "/onboarding",
        "/studio/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
