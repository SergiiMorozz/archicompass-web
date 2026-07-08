import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/seo";
import { locationPath, seoLocations } from "@/lib/seo-locations";

export const revalidate = 3600;

function englishPath(path: string) {
  return path === "/" ? "/en" : `/en${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    ["/", "daily", 1],
    ["/designers", "daily", 0.95],
    ["/project-compass", "weekly", 0.9],
    ["/inspiration", "daily", 0.85],
    ["/privacy", "yearly", 0.2],
    ["/terms", "yearly", 0.2],
    ["/cookies", "yearly", 0.2],
  ].map(([path, changeFrequency, priority]) => ({
    url: absoluteUrl(path as string),
    lastModified: now,
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: priority as number,
  }));

  const englishStaticEntries: MetadataRoute.Sitemap = staticEntries.map((entry) => {
    const path = new URL(entry.url).pathname;
    return {
      ...entry,
      url: absoluteUrl(englishPath(path)),
    };
  });

  try {
    const supabase = createPublicSupabaseClient();
    const [articles] = await Promise.all([
      supabase
        .from("inspiration_articles")
        .select("slug, updated_at")
        .eq("status", "published"),
    ]);

    const articleEntries: MetadataRoute.Sitemap = (articles.data ?? []).map((article) => ({
      url: absoluteUrl(`/inspiration/${article.slug}`),
      lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    const englishArticleEntries: MetadataRoute.Sitemap = articleEntries.map((entry) => ({
      ...entry,
      url: absoluteUrl(englishPath(new URL(entry.url).pathname)),
    }));

    const locationEntries: MetadataRoute.Sitemap = seoLocations
      .filter((location) => location.countryCode === "PL")
      .map((location) => ({
        url: absoluteUrl(locationPath(location)),
        changeFrequency: "weekly",
        priority: location.countryCode === "PL" ? 0.85 : 0.75,
      }));

    const englishLocationEntries: MetadataRoute.Sitemap = locationEntries.map((entry) => ({
      ...entry,
      url: absoluteUrl(englishPath(new URL(entry.url).pathname)),
    }));

    return [
      ...staticEntries,
      ...englishStaticEntries,
      ...articleEntries,
      ...englishArticleEntries,
      ...locationEntries,
      ...englishLocationEntries,
    ];
  } catch {
    return [...staticEntries, ...englishStaticEntries];
  }
}
