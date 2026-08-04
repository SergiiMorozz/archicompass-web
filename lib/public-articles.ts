import type { ArticleLocalizationFields } from "@/lib/article-content";
import type { SiteLocale } from "@/lib/site-locale";

export type ContentSection = "inspiration" | "guide";

export type PublicArticle = ArticleLocalizationFields & {
  id: string;
  slug: string;
  slug_pl: string | null;
  slug_en: string | null;
  content_section: ContentSection;
  category: string;
  image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  updated_at: string;
  noindex: boolean;
};

export type LocalizedPublicArticle = PublicArticle & {
  cover_alt: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
};

export const publicArticleSelect = "id, slug, slug_pl, slug_en, content_section, title, excerpt, body, category, image_url, author_name, title_pl, title_en, excerpt_pl, excerpt_en, author_name_pl, author_name_en, cover_alt_pl, cover_alt_en, meta_title_pl, meta_title_en, meta_description_pl, meta_description_en, focus_keyword_pl, focus_keyword_en, content_blocks, noindex, published_at, updated_at";

export function articleSlug(article: Pick<PublicArticle, "slug" | "slug_pl" | "slug_en">, locale: SiteLocale) {
  return (locale === "pl" ? article.slug_pl : article.slug_en) || article.slug;
}

export function articlePath(section: ContentSection, article: Pick<PublicArticle, "slug" | "slug_pl" | "slug_en">, locale: SiteLocale) {
  const root = section === "guide" ? "/guides" : "/inspiration";
  return `${root}/${articleSlug(article, locale)}`;
}
