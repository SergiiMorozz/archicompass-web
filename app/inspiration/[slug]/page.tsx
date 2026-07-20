import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ArticleRichContent from "@/components/ArticleRichContent";
import FavoriteButton from "@/components/FavoriteButton";
import JsonLd from "@/components/JsonLd";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import { articleFaqItems, articleReadingMinutes, hasRenderableArticleBlocks, localizeArticle, type ArticleLocalizationFields } from "@/lib/article-content";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";

export const revalidate = 0;

const siteCopy = getSiteCopy();
const inspirationCopy = siteCopy.inspiration;

type Article = ArticleLocalizationFields & {
  id: string;
  slug: string;
  category: string;
  published_at: string | null;
  updated_at: string;
  noindex: boolean;
};

function categoryLabel(value: string) {
  return inspirationCopy.categoryLabels[value as keyof typeof inspirationCopy.categoryLabels] || value;
}

function localizedArticle(article: Article) {
  const legacy = siteCopy.locale === "pl" ? applyPolishArticleCopy(article) : article;
  return localizeArticle(legacy, siteCopy.locale);
}

const articleSelect = "id, slug, title, excerpt, body, category, image_url, author_name, title_pl, title_en, excerpt_pl, excerpt_en, author_name_pl, author_name_en, cover_alt_pl, cover_alt_en, meta_title_pl, meta_title_en, meta_description_pl, meta_description_en, focus_keyword_pl, focus_keyword_en, content_blocks, noindex, published_at, updated_at";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data } = await supabase
    .from("inspiration_articles")
    .select(articleSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return pageMetadata({ title: inspirationCopy.article.notFoundTitle, description: inspirationCopy.article.notFoundDescription, path: `/inspiration/${slug}`, noIndex: true });
  const article = localizedArticle(data as Article);
  return pageMetadata({
    title: article.meta_title,
    description: article.meta_description,
    path: `/inspiration/${slug}`,
    image: article.image_url,
    type: "article",
    noIndex: article.noindex,
  });
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat(siteCopy.locale === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function InspirationArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inspiration_articles")
    .select(articleSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) notFound();
  const article = localizedArticle(data as Article);
  const { data: userData } = await supabase.auth.getUser();
  const { data: favorite } = userData.user
    ? await supabase.from("favorites").select("entity_key").eq("user_id", userData.user.id).eq("entity_type", "article").eq("entity_key", article.id).maybeSingle()
    : { data: null };
  const paragraphs = article.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const faqs = articleFaqItems(article.content_blocks, siteCopy.locale);
  const readingMinutes = articleReadingMinutes(article.content_blocks, article.body);
  const readingLabel = siteCopy.locale === "pl" ? `${readingMinutes} min czytania` : `${readingMinutes} min read`;

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: inspirationCopy.breadcrumbs.home, path: "/" },
            { name: inspirationCopy.breadcrumbs.hub, path: "/inspiration" },
            { name: article.title, path: `/inspiration/${article.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": absoluteUrl(`/inspiration/${article.slug}#article`),
            headline: article.title,
            description: article.meta_description,
            image: article.image_url || undefined,
            datePublished: article.published_at || undefined,
            dateModified: article.updated_at,
            inLanguage: siteCopy.locale,
            articleSection: categoryLabel(article.category),
            keywords: article.focus_keyword || undefined,
            mainEntityOfPage: absoluteUrl(`/inspiration/${article.slug}`),
            author: { "@type": "Organization", name: article.author_name || inspirationCopy.labels.editorialTeam },
            publisher: { "@id": absoluteUrl("/#organization") },
          },
          ...(faqs.length ? [{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.question, acceptedAnswer: { "@type": "Answer", text: faq.answer } })),
          }] : []),
        ]}
      />
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/inspiration" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted">{inspirationCopy.article.backToHub}</Link>
          <div className="mt-8 flex flex-wrap items-center gap-3"><span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{categoryLabel(article.category)}</span><span className="text-sm text-muted">{formatDate(article.published_at)}</span><span className="text-sm text-muted">{readingLabel}</span></div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-9 text-muted">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><span className="text-sm font-semibold">{article.author_name || inspirationCopy.labels.editorialTeam}</span><FavoriteButton entityType="article" entityKey={article.id} initialSaved={Boolean(favorite)} /></div>
        </div>
      </section>

      {article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt={article.cover_alt} width="1600" height="800" fetchPriority="high" className="mx-auto mt-8 aspect-[16/8] w-full max-w-6xl object-cover" />
      ) : null}

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {hasRenderableArticleBlocks(article.content_blocks, siteCopy.locale) ? <ArticleRichContent blocks={article.content_blocks} locale={siteCopy.locale} /> : <div className="grid gap-6 text-lg leading-9 text-foreground">{paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}</div>}
        <section className="mt-12 rounded-lg border border-line bg-primary-soft p-6"><div className="text-sm font-semibold text-primary">{inspirationCopy.article.ctaEyebrow}</div><h2 className="mt-1 text-2xl font-bold">{inspirationCopy.article.ctaTitle}</h2><div className="mt-5 flex flex-wrap gap-3"><Link href="/project-compass" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{inspirationCopy.article.ctaProjectCompass}</Link><Link href="/designers" className="rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold">{inspirationCopy.article.ctaDirectory}</Link></div></section>
      </article>
    </main>
  );
}
