import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicArticlePage from "@/components/PublicArticlePage";
import { getGuidesCopy } from "@/content/guides-copy";
import { localizeArticle } from "@/lib/article-content";
import { articlePath, type LocalizedPublicArticle, type PublicArticle, publicArticleSelect } from "@/lib/public-articles";
import { absoluteUrl, englishUrl, pageMetadata, polishUrl } from "@/lib/seo";
import { siteLocale } from "@/lib/site-locale";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const revalidate = 0;

const copy = getGuidesCopy(siteLocale);

function localizedGuide(article: PublicArticle) {
  return localizeArticle(article, siteLocale) as LocalizedPublicArticle;
}

async function findGuide(slug: string) {
  const supabase = createPublicSupabaseClient();
  const slugColumn = siteLocale === "pl" ? "slug_pl" : "slug_en";
  const { data } = await supabase
    .from("inspiration_articles")
    .select(publicArticleSelect)
    .eq("content_section", "guide")
    .eq(slugColumn, slug)
    .eq("status", "published")
    .maybeSingle();
  return data ? localizedGuide(data as PublicArticle) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await findGuide(slug);
  const fallbackPath = `/guides/${slug}`;
  if (!guide) return pageMetadata({ title: copy.emptyTitle, description: copy.emptyBody, path: fallbackPath, noIndex: true });
  const currentPath = articlePath("guide", guide, siteLocale);
  const polishPath = articlePath("guide", guide, "pl");
  const englishPath = articlePath("guide", guide, "en");
  return pageMetadata({
    title: guide.meta_title,
    description: guide.meta_description,
    path: currentPath,
    image: guide.image_url,
    type: "article",
    noIndex: guide.noindex,
    alternates: {
      canonical: absoluteUrl(currentPath),
      languages: { pl: polishUrl(polishPath), en: englishUrl(englishPath), "x-default": polishUrl(polishPath) },
    },
  });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await findGuide(slug);
  if (!guide) notFound();
  return (
    <PublicArticlePage
      article={guide}
      articlePath={articlePath("guide", guide, siteLocale)}
      indexPath="/guides"
      sectionLabel={copy.breadcrumb}
      backToIndex={copy.backToIndex}
      categoryLabel={() => copy.label}
      editorialTeam={copy.editorialTeam}
      cta={{ eyebrow: copy.articleCtaEyebrow, title: copy.articleCtaTitle, projectCompass: copy.articleCtaProjectCompass, directory: copy.articleCtaDirectory }}
    />
  );
}
