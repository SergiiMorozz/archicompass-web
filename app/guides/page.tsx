import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import JsonLd from "@/components/JsonLd";
import { getGuidesCopy } from "@/content/guides-copy";
import { localizeArticle, type ArticleLocalizationFields } from "@/lib/article-content";
import { articlePath, type LocalizedPublicArticle, type PublicArticle, publicArticleSelect } from "@/lib/public-articles";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { siteLocale } from "@/lib/site-locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

const copy = getGuidesCopy(siteLocale);

export const metadata: Metadata = pageMetadata({
  title: copy.metadata.title,
  description: copy.metadata.description,
  path: "/guides",
});

type Guide = PublicArticle & ArticleLocalizationFields;

function localizedGuide(article: Guide) {
  return localizeArticle(article, siteLocale) as LocalizedPublicArticle;
}

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat(siteLocale === "pl" ? "pl-PL" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(value));
}

export default async function GuidesPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inspiration_articles")
    .select(publicArticleSelect)
    .eq("content_section", "guide")
    .eq("status", "published")
    .eq("noindex", false)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });
  const guides = ((data ?? []) as Guide[]).map(localizedGuide);
  const { data: userData } = await supabase.auth.getUser();
  const { data: favoriteData } = userData.user
    ? await supabase.from("favorites").select("entity_key").eq("user_id", userData.user.id).eq("entity_type", "article")
    : { data: [] };
  const savedKeys = new Set((favoriteData ?? []).map((favorite) => favorite.entity_key));

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([{ name: siteLocale === "pl" ? "Strona główna" : "Home", path: "/" }, { name: copy.breadcrumb, path: "/guides" }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: copy.metadata.title,
            url: absoluteUrl("/guides"),
            mainEntity: { "@type": "ItemList", numberOfItems: guides.length, itemListElement: guides.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title, url: absoluteUrl(articlePath("guide", guide, siteLocale)) })) },
          },
        ]}
      />
      <section className="border-b border-line bg-primary-soft px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase text-primary">{copy.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">{copy.headline}</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-muted">{copy.body}</p>
          <Link href="/project-compass" className="mt-8 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{siteLocale === "pl" ? "Otwórz AI Project Compass" : "Open AI Project Compass"}</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 className="text-3xl font-bold">{copy.breadcrumb}</h2><p className="mt-2 text-muted">{copy.count(guides.length)}</p></div>
          <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">{copy.searchCta}</Link>
        </div>
        {error ? <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{siteLocale === "pl" ? "Nie udało się wczytać poradników." : "Guides could not be loaded."}</div> : null}
        {guides.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {guides.map((guide) => {
              const href = articlePath("guide", guide, siteLocale);
              return (
                <article key={guide.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                  <Link href={href} className="block h-60 overflow-hidden bg-primary-soft" aria-label={guide.title}>
                    {guide.image_url ? <Image src={guide.image_url} alt={guide.cover_alt} width={1000} height={700} unoptimized className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]" /> : null}
                  </Link>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3"><span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{guide.category}</span><FavoriteButton compact entityType="article" entityKey={guide.id} initialSaved={savedKeys.has(guide.id)} /></div>
                    <Link href={href} className="mt-4 block text-xl font-bold hover:text-primary">{guide.title}</Link>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{guide.excerpt}</p>
                    <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted"><span>{formatDate(guide.published_at)}</span><Link href={href} className="font-semibold text-primary">{copy.readCta}</Link></div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : !error ? (
          <div className="mt-8 rounded-lg border border-dashed border-line bg-card p-8"><h3 className="text-2xl font-bold">{copy.emptyTitle}</h3><p className="mt-2 max-w-2xl text-muted">{copy.emptyBody}</p></div>
        ) : null}
      </section>
    </main>
  );
}
