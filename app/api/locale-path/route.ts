import { NextRequest, NextResponse } from "next/server";
import { articlePath, type ContentSection, type PublicArticle } from "@/lib/public-articles";
import { alternateLocalePath, type SiteLocale } from "@/lib/site-locale";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

function routePath(value: string | null) {
  const path = value?.trim() || "/";
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 500) return "/";
  return path.replace(/^\/en(?=\/|$)/, "") || "/";
}

export async function GET(request: NextRequest) {
  const targetLocale: SiteLocale = request.nextUrl.searchParams.get("locale") === "en" ? "en" : "pl";
  const path = routePath(request.nextUrl.searchParams.get("path"));
  const match = path.match(/^\/(guides|inspiration)\/([a-z0-9-]+)$/i);

  if (!match) return NextResponse.json({ path: alternateLocalePath(targetLocale, path) });

  const section: ContentSection = match[1] === "guides" ? "guide" : "inspiration";
  const slug = match[2].toLowerCase();
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from("inspiration_articles")
    .select("slug, slug_pl, slug_en, content_section")
    .eq("content_section", section)
    .eq("status", "published")
    .eq("noindex", false)
    .or(`slug.eq.${slug},slug_pl.eq.${slug},slug_en.eq.${slug}`)
    .limit(1);
  const article = (data ?? [])[0] as Pick<PublicArticle, "slug" | "slug_pl" | "slug_en"> | undefined;

  return NextResponse.json({ path: article ? articlePath(section, article, targetLocale) : alternateLocalePath(targetLocale, path) });
}
