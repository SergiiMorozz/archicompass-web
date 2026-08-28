import Link from "next/link";
import ArticleRichContent from "@/components/ArticleRichContent";
import FavoriteButton from "@/components/FavoriteButton";
import JsonLd from "@/components/JsonLd";
import { articleFaqItems, articleReadingMinutes, hasRenderableArticleBlocks, parseArticleBlocks } from "@/lib/article-content";
import type { LocalizedPublicArticle } from "@/lib/public-articles";
import { absoluteUrl, breadcrumbJsonLd } from "@/lib/seo";
import { getSiteCopy } from "@/content/site-copy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicArticlePageProps = {
  article: LocalizedPublicArticle;
  articlePath: string;
  indexPath: string;
  sectionLabel: string;
  backToIndex: string;
  categoryLabel: (value: string) => string;
  editorialTeam: string;
  cta: {
    eyebrow: string;
    title: string;
    projectCompass: string;
    directory: string;
  };
};

export default async function PublicArticlePage({
  article,
  articlePath,
  indexPath,
  sectionLabel,
  backToIndex,
  categoryLabel,
  editorialTeam,
  cta,
}: PublicArticlePageProps) {
  const siteCopy = getSiteCopy();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const { data: favorite } = userData.user
    ? await supabase.from("favorites").select("entity_key").eq("user_id", userData.user.id).eq("entity_type", "article").eq("entity_key", article.id).maybeSingle()
    : { data: null };
  const blocks = parseArticleBlocks(article.content_blocks);
  const paragraphs = article.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const faqs = articleFaqItems(blocks, siteCopy.locale);
  const readingMinutes = articleReadingMinutes(blocks, article.body);
  const readingLabel = siteCopy.locale === "pl" ? `${readingMinutes} min czytania` : `${readingMinutes} min read`;
  const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat(siteCopy.locale === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value))
    : "";

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: siteCopy.inspiration.breadcrumbs.home, path: "/" },
            { name: sectionLabel, path: indexPath },
            { name: article.title, path: articlePath },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "@id": absoluteUrl(`${articlePath}#article`),
            headline: article.title,
            description: article.meta_description,
            image: article.image_url || undefined,
            datePublished: article.published_at || undefined,
            dateModified: article.updated_at,
            inLanguage: siteCopy.locale,
            articleSection: categoryLabel(article.category),
            keywords: article.focus_keyword || undefined,
            mainEntityOfPage: absoluteUrl(articlePath),
            author: { "@type": "Organization", name: article.author_name || editorialTeam },
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
          <Link href={indexPath} className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted">{backToIndex}</Link>
          <div className="mt-8 flex flex-wrap items-center gap-3"><span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{categoryLabel(article.category)}</span><span className="text-sm text-muted">{formatDate(article.published_at)}</span><span className="text-sm text-muted">{readingLabel}</span></div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-9 text-muted">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><span className="text-sm font-semibold">{article.author_name || editorialTeam}</span><FavoriteButton entityType="article" entityKey={article.id} initialSaved={Boolean(favorite)} /></div>
        </div>
      </section>

      {article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt={article.cover_alt} width="1600" height="800" fetchPriority="high" className="mx-auto mt-8 aspect-[16/8] w-full max-w-6xl object-cover" />
      ) : null}

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-[65ch] text-lg leading-9">
          {hasRenderableArticleBlocks(blocks, siteCopy.locale) ? <ArticleRichContent blocks={blocks} locale={siteCopy.locale} /> : <div className="grid gap-6 text-foreground">{paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}</div>}
          <section className="mt-12 rounded-lg border border-line bg-primary-soft p-6"><div className="text-sm font-semibold text-primary">{cta.eyebrow}</div><h2 className="mt-1 text-2xl font-bold">{cta.title}</h2><div className="mt-5 flex flex-wrap gap-3"><Link href="/AI-project-compass" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{cta.projectCompass}</Link><Link href="/designers" className="rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold">{cta.directory}</Link></div></section>
        </div>
      </article>
    </main>
  );
}
