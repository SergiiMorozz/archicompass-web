import type { MetadataRoute } from "next";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl } from "@/lib/seo";
import { locationPath, matchesSeoLocation, seoLocations } from "@/lib/seo-locations";

export const revalidate = 3600;

type PublicLocation = { location: string | null };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    ["/", "daily", 1],
    ["/designers", "daily", 0.95],
    ["/project-compass", "weekly", 0.9],
    ["/inspiration", "daily", 0.85],
    ["/get-started", "monthly", 0.7],
    ["/privacy", "yearly", 0.2],
    ["/terms", "yearly", 0.2],
    ["/cookies", "yearly", 0.2],
  ].map(([path, changeFrequency, priority]) => ({
    url: absoluteUrl(path as string),
    lastModified: now,
    changeFrequency: changeFrequency as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: priority as number,
  }));

  try {
    const supabase = createPublicSupabaseClient();
    const [profiles, studios, projects, articles] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, location")
        .eq("user_type", "professional"),
      supabase
        .from("studios")
        .select("id, location, updated_at")
        .eq("published", true),
      supabase.from("projects").select("id, created_at"),
      supabase
        .from("inspiration_articles")
        .select("slug, updated_at")
        .eq("status", "published"),
    ]);

    const profileEntries: MetadataRoute.Sitemap = (profiles.data ?? []).map((profile) => ({
      url: absoluteUrl(`/designers/${profile.id}`),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    const studioEntries: MetadataRoute.Sitemap = (studios.data ?? []).map((studio) => ({
      url: absoluteUrl(`/studios/${studio.id}`),
      lastModified: studio.updated_at ? new Date(studio.updated_at) : undefined,
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    const projectEntries: MetadataRoute.Sitemap = (projects.data ?? []).map((project) => ({
      url: absoluteUrl(`/projects/${project.id}`),
      lastModified: project.created_at ? new Date(project.created_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
    const articleEntries: MetadataRoute.Sitemap = (articles.data ?? []).map((article) => ({
      url: absoluteUrl(`/inspiration/${article.slug}`),
      lastModified: article.updated_at ? new Date(article.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.75,
    }));

    const publicLocations = [
      ...((profiles.data ?? []) as PublicLocation[]),
      ...((studios.data ?? []) as PublicLocation[]),
    ];
    const locationEntries: MetadataRoute.Sitemap = seoLocations
      .filter((location) =>
        publicLocations.some((item) => matchesSeoLocation(item.location, location))
      )
      .map((location) => ({
        url: absoluteUrl(locationPath(location)),
        changeFrequency: "weekly",
        priority: location.countryCode === "PL" ? 0.85 : 0.75,
      }));

    return [
      ...staticEntries,
      ...profileEntries,
      ...studioEntries,
      ...projectEntries,
      ...articleEntries,
      ...locationEntries,
    ];
  } catch {
    return staticEntries;
  }
}
