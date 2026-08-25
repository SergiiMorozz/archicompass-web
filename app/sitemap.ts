import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/seo";
import { seoIndexingEnabled } from "@/lib/seo-indexing";
import { locationPath, matchesSeoLocation, seoLocations } from "@/lib/seo-locations";

// Publish fresh guide URLs as soon as the CMS release is opened.
export const revalidate = 0;

function englishPath(path: string) {
  return path === "/" ? "/en" : `/en${path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The SEO launch is intentionally held until the planned bilingual guide
  // library has been reviewed and published as a coherent first release.
  if (!seoIndexingEnabled) return [];

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    ["/", "daily", 1],
    ["/designers", "daily", 0.95],
    ["/AI-project-compass", "weekly", 0.9],
    ["/pricing", "monthly", 0.65],
    ["/services-and-pricing", "monthly", 0.6],
    ["/inspiration", "daily", 0.85],
    ["/guides", "weekly", 0.85],
    ["/privacy", "yearly", 0.2],
    ["/terms", "yearly", 0.2],
    ["/cookies", "yearly", 0.2],
    ["/ai-transparency", "monthly", 0.4],
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
    const [articles, profiles, projects, studios] = await Promise.all([
      supabase
        .from("inspiration_articles")
        .select("slug, slug_pl, slug_en, content_section, updated_at")
        .eq("status", "published")
        .eq("noindex", false),
      supabase
        .from("profiles")
        .select("id, public_slug, location, is_demo")
        .eq("user_type", "professional"),
      supabase
        .from("projects")
        .select("id, profile_id"),
      supabase
        .from("studios")
        .select("id, location, is_demo")
        .eq("published", true),
    ]);

    const inspirationArticles = (articles.data ?? []).filter((article) => article.content_section === "inspiration");
    const guides = (articles.data ?? []).filter((article) => article.content_section === "guide");
    const articleEntries: MetadataRoute.Sitemap = inspirationArticles.map((article) => ({
      url: absoluteUrl(`/inspiration/${article.slug}`),
      lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.75,
    }));
    const englishArticleEntries: MetadataRoute.Sitemap = inspirationArticles.map((article) => ({
      url: absoluteUrl(englishPath(`/inspiration/${article.slug}`)),
      lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.75,
    }));
    const guideEntries: MetadataRoute.Sitemap = guides.map((article) => ({
      url: absoluteUrl(`/guides/${article.slug_pl || article.slug}`),
      lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));
    const englishGuideEntries: MetadataRoute.Sitemap = guides.map((article) => ({
      url: absoluteUrl(englishPath(`/guides/${article.slug_en || article.slug}`)),
      lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    const publicProfiles = (profiles.data ?? []).filter((profile) => !profile.is_demo);
    const publicProfileIds = new Set(publicProfiles.map((profile) => profile.id));
    const publicStudios = (studios.data ?? []).filter((studio) => !studio.is_demo);
    const profileEntries: MetadataRoute.Sitemap = publicProfiles.map((profile) => ({
      url: absoluteUrl(`/designers/${profile.public_slug || profile.id}`),
      changeFrequency: "weekly",
      priority: 0.85,
    }));
    const englishProfileEntries: MetadataRoute.Sitemap = profileEntries.map((entry) => ({
      ...entry,
      url: absoluteUrl(englishPath(new URL(entry.url).pathname)),
    }));
    const projectEntries: MetadataRoute.Sitemap = (projects.data ?? [])
      .filter((project) => publicProfileIds.has(project.profile_id))
      .map((project) => ({
        url: absoluteUrl(`/projects/${project.id}`),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      }));
    const englishProjectEntries: MetadataRoute.Sitemap = projectEntries.map((entry) => ({
      ...entry,
      url: absoluteUrl(englishPath(new URL(entry.url).pathname)),
    }));
    const studioEntries: MetadataRoute.Sitemap = publicStudios.map((studio) => ({
      url: absoluteUrl(`/studios/${studio.id}`),
      changeFrequency: "weekly",
      priority: 0.85,
    }));
    const englishStudioEntries: MetadataRoute.Sitemap = studioEntries.map((entry) => ({
      ...entry,
      url: absoluteUrl(englishPath(new URL(entry.url).pathname)),
    }));

    const locationEntries: MetadataRoute.Sitemap = seoLocations
      .filter((location) =>
        location.countryCode === "PL" &&
        [...publicProfiles, ...publicStudios].some((professional) =>
          matchesSeoLocation(professional.location, location)
        )
      )
      .map((location) => ({
        url: absoluteUrl(locationPath(location, "pl")),
        changeFrequency: "weekly",
        priority: 0.85,
      }));

    const englishLocationEntries: MetadataRoute.Sitemap = seoLocations
      .filter((location) =>
        location.countryCode === "PL" &&
        [...publicProfiles, ...publicStudios].some((professional) =>
          matchesSeoLocation(professional.location, location)
        )
      )
      .map((location) => ({
        url: absoluteUrl(englishPath(locationPath(location, "en"))),
        changeFrequency: "weekly",
        priority: 0.85,
      }));

    return [
      ...staticEntries,
      ...englishStaticEntries,
      ...articleEntries,
      ...englishArticleEntries,
      ...guideEntries,
      ...englishGuideEntries,
      ...profileEntries,
      ...englishProfileEntries,
      ...projectEntries,
      ...englishProjectEntries,
      ...studioEntries,
      ...englishStudioEntries,
      ...locationEntries,
      ...englishLocationEntries,
    ];
  } catch {
    return [...staticEntries, ...englishStaticEntries];
  }
}
