import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PublicArticlePage from "@/components/PublicArticlePage";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import { localizeArticle } from "@/lib/article-content";
import { inspirationCategoryKey } from "@/lib/inspiration-categories";
import { articlePath, type LocalizedPublicArticle, type PublicArticle, publicArticleSelect } from "@/lib/public-articles";
import { absoluteUrl, englishUrl, pageMetadata, polishUrl } from "@/lib/seo";
import { siteLocale } from "@/lib/site-locale";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const revalidate = 0;

const siteCopy = getSiteCopy();
const inspirationCopy = siteCopy.inspiration;

function categoryLabel(value: string) {
  const key = inspirationCategoryKey(value);
  return inspirationCopy.categoryLabels[key as keyof typeof inspirationCopy.categoryLabels] || value;
}

function localizedArticle(article: PublicArticle) {
  const legacy = siteLocale === "pl" ? applyPolishArticleCopy(article) : article;
  return localizeArticle(legacy, siteLocale) as LocalizedPublicArticle;
}

async function findArticle(slug: string) {
  const supabase = createPublicSupabaseClient();
  const slugColumn = siteLocale === "pl" ? "slug_pl" : "slug_en";
  const { data } = await supabase
    .from("inspiration_articles")
    .select(publicArticleSelect)
    .eq("content_section", "inspiration")
    .eq(slugColumn, slug)
    .eq("status", "published")
    .maybeSingle();
  if (data) return localizedArticle(data as PublicArticle);

  const { data: legacyData } = await supabase
    .from("inspiration_articles")
    .select(publicArticleSelect)
    .eq("content_section", "inspiration")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return legacyData ? localizedArticle(legacyData as PublicArticle) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await findArticle(slug);
  const fallbackPath = `/inspiration/${slug}`;
  if (!article) return pageMetadata({ title: inspirationCopy.article.notFoundTitle, description: inspirationCopy.article.notFoundDescription, path: fallbackPath, noIndex: true });
  const currentPath = articlePath("inspiration", article, siteLocale);
  const polishPath = articlePath("inspiration", article, "pl");
  const englishPath = articlePath("inspiration", article, "en");
  return pageMetadata({
    title: article.meta_title,
    description: article.meta_description,
    path: currentPath,
    image: article.image_url,
    type: "article",
    noIndex: article.noindex,
    alternates: {
      canonical: absoluteUrl(currentPath),
      languages: { pl: polishUrl(polishPath), en: englishUrl(englishPath), "x-default": polishUrl(polishPath) },
    },
  });
}

export default async function InspirationArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await findArticle(slug);
  if (!article) notFound();
  return (
    <PublicArticlePage
      article={article}
      articlePath={articlePath("inspiration", article, siteLocale)}
      indexPath="/inspiration"
      sectionLabel={inspirationCopy.breadcrumbs.hub}
      backToIndex={inspirationCopy.article.backToHub}
      categoryLabel={categoryLabel}
      editorialTeam={inspirationCopy.labels.editorialTeam}
      cta={{
        eyebrow: inspirationCopy.article.ctaEyebrow,
        title: inspirationCopy.article.ctaTitle,
        projectCompass: inspirationCopy.article.ctaProjectCompass,
        directory: inspirationCopy.article.ctaDirectory,
      }}
    />
  );
}
