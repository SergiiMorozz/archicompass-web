import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import JsonLd from "@/components/JsonLd";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 0;

const siteCopy = getSiteCopy();
const inspirationCopy = siteCopy.inspiration;

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image_url: string | null;
  author_name: string | null;
  published_at: string | null;
  updated_at: string;
};

function categoryLabel(value: string) {
  return inspirationCopy.categoryLabels[value as keyof typeof inspirationCopy.categoryLabels] || value;
}

function localizedArticle<T extends { slug: string }>(article: T) {
  return siteCopy.locale === "pl" ? applyPolishArticleCopy(article) : article;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = createPublicSupabaseClient();
  const { data: article } = await supabase
    .from("inspiration_articles")
    .select("title, excerpt, image_url")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!article) {
    return pageMetadata({
      title: inspirationCopy.article.notFoundTitle,
      description: inspirationCopy.article.notFoundDescription,
      path: `/inspiration/${slug}`,
      noIndex: true,
    });
  }
  const copy = localizedArticle({ slug, ...article });
  return pageMetadata({
    title: copy.title,
    description: copy.excerpt,
    path: `/inspiration/${slug}`,
    image: copy.image_url,
    type: "article",
  });
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat(siteCopy.locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default async function InspirationArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inspiration_articles")
    .select("id, slug, title, excerpt, body, category, image_url, author_name, published_at, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) notFound();
  const article = localizedArticle(data as Article);
  const { data: userData } = await supabase.auth.getUser();
  const { data: favorite } = userData.user
    ? await supabase
        .from("favorites")
        .select("entity_key")
        .eq("user_id", userData.user.id)
        .eq("entity_type", "article")
        .eq("entity_key", article.id)
        .maybeSingle()
    : { data: null };
  const paragraphs = article.body.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);

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
            description: article.excerpt,
            image: article.image_url || undefined,
            datePublished: article.published_at || undefined,
            dateModified: article.updated_at,
            inLanguage: siteCopy.locale,
            mainEntityOfPage: absoluteUrl(`/inspiration/${article.slug}`),
            author: {
              "@type": "Organization",
              name: article.author_name || inspirationCopy.labels.editorialTeam,
            },
            publisher: { "@id": absoluteUrl("/#organization") },
          },
        ]}
      />
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <Link href="/inspiration" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted">
            {inspirationCopy.article.backToHub}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{categoryLabel(article.category)}</span>
            <span className="text-sm text-muted">{formatDate(article.published_at)}</span>
          </div>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">{article.title}</h1>
          <p className="mt-5 max-w-3xl text-xl leading-9 text-muted">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <span className="text-sm font-semibold">{article.author_name || inspirationCopy.labels.editorialTeam}</span>
            <FavoriteButton entityType="article" entityKey={article.id} initialSaved={Boolean(favorite)} />
          </div>
        </div>
      </section>

      {article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.image_url}
          alt={article.title}
          width="1600"
          height="800"
          fetchPriority="high"
          className="mx-auto mt-8 aspect-[16/8] w-full max-w-6xl object-cover"
        />
      ) : null}

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 text-lg leading-9 text-foreground">
          {paragraphs.map((paragraph, index) => <p key={`${article.id}-${index}`}>{paragraph}</p>)}
        </div>
        <section className="mt-12 rounded-lg border border-line bg-primary-soft p-6">
          <div className="text-sm font-semibold text-primary">{inspirationCopy.article.ctaEyebrow}</div>
          <h2 className="mt-1 text-2xl font-bold">{inspirationCopy.article.ctaTitle}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/project-compass" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{inspirationCopy.article.ctaProjectCompass}</Link>
            <Link href="/designers" className="rounded-xl border border-line bg-card px-5 py-3 text-sm font-semibold">{inspirationCopy.article.ctaDirectory}</Link>
          </div>
        </section>
      </article>
    </main>
  );
}
