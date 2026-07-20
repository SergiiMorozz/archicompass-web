import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import FavoriteButton from "@/components/FavoriteButton";
import JsonLd from "@/components/JsonLd";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import { localizeArticle, type ArticleLocalizationFields } from "@/lib/article-content";
import { localizedCount } from "@/lib/localized-count";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPublicContentClient } from "@/lib/public-content-client";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { professionalOptionLabel } from "@/lib/professional-options";

export const revalidate = 0;

const siteCopy = getSiteCopy();
const inspirationCopy = siteCopy.inspiration;

export const metadata: Metadata = pageMetadata({
  title: inspirationCopy.metadata.title,
  description: inspirationCopy.metadata.description,
  path: "/inspiration",
});

type Article = ArticleLocalizationFields & {
  id: string;
  slug: string;
  category: string;
  featured: boolean;
  published_at: string | null;
};

type NewDesigner = {
  id: string;
  avatar_url: string | null;
  profile_logo_path: string | null;
  profile_banner_path: string | null;
  full_name: string | null;
  location: string | null;
  profession_type: string | null;
  google_rating: number | null;
  google_review_count: number | null;
};

type RecentProject = {
  id: string;
  title: string | null;
  category: string | null;
  image_url: string | null;
  image_urls: string[] | null;
};

function first(value: string | string[] | undefined) {
  if (!value) return "";
  return Array.isArray(value) ? value[0] : value;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function categoryHref(category: string) {
  return category === "All" ? "/inspiration" : `/inspiration?category=${encodeURIComponent(category)}`;
}

function categoryLabel(value: string) {
  return inspirationCopy.categoryLabels[value as keyof typeof inspirationCopy.categoryLabels] || value;
}

function localizedArticle(article: Article) {
  const legacy = siteCopy.locale === "pl" ? applyPolishArticleCopy(article) : article;
  return localizeArticle(legacy, siteCopy.locale);
}

function projectCategoryLabel(value: string) {
  return siteCopy.home.projectCategories[value]
    || (siteCopy.locale === "pl" ? professionalOptionLabel(value) : value);
}

export default async function InspirationPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedCategory = first(sp.category).trim() || "All";
  const q = first(sp.q).trim();
  const supabase = await createSupabaseServerClient();
  const publicSupabase = createPublicContentClient();
  const { data, error } = await supabase
    .from("inspiration_articles")
    .select("id, slug, title, excerpt, body, category, image_url, author_name, title_pl, title_en, excerpt_pl, excerpt_en, author_name_pl, author_name_en, cover_alt_pl, cover_alt_en, meta_title_pl, meta_title_en, meta_description_pl, meta_description_en, focus_keyword_pl, focus_keyword_en, content_blocks, featured, published_at")
    .eq("status", "published")
    .eq("noindex", false)
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });
  const allArticles = ((data ?? []) as Article[]).map(localizedArticle);
  const [{ data: newDesignerData }, { data: recentProjectData }] = await Promise.all([
    publicSupabase
      .from("profiles")
      .select("id, avatar_url, profile_logo_path, profile_banner_path, full_name, location, profession_type, google_rating, google_review_count")
      .eq("user_type", "professional")
      .order("created_at", { ascending: false })
      .limit(4),
    publicSupabase
      .from("projects")
      .select("id, title, category, image_url, image_urls")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);
  const newDesigners = (newDesignerData ?? []) as NewDesigner[];
  const recentProjects = (recentProjectData ?? []) as RecentProject[];
  const profileMediaUrl = (path: string | null) =>
    path ? publicSupabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl : null;
  const designerIdentityImage = (designer: NewDesigner) =>
    profileMediaUrl(designer.profile_logo_path)
    || designer.avatar_url
    || profileMediaUrl(designer.profile_banner_path)
    || "/brand/archicompass-mark.png";
  const normalizedQuery = normalize(q);
  const articles = allArticles.filter((article) => {
    const categoryMatch = selectedCategory === "All" || article.category === selectedCategory;
    const queryMatch = !normalizedQuery || normalize(`${article.title} ${article.excerpt} ${article.category}`).includes(normalizedQuery);
    return categoryMatch && queryMatch;
  });
  const categories = ["All", ...Array.from(new Set(allArticles.map((article) => article.category))).sort()];
  const { data: userData } = await supabase.auth.getUser();
  const { data: favoriteData } = userData.user
    ? await supabase
        .from("favorites")
        .select("entity_type, entity_key")
        .eq("user_id", userData.user.id)
        .in("entity_type", ["article", "designer", "project"])
    : { data: [] };
  const savedKeys = new Set((favoriteData ?? []).map((favorite) => `${favorite.entity_type}:${favorite.entity_key}`));

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: inspirationCopy.breadcrumbs.home, path: "/" },
            { name: inspirationCopy.breadcrumbs.hub, path: "/inspiration" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "ArchiCompass Inspiration Hub",
            url: absoluteUrl("/inspiration"),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: allArticles.length,
              itemListElement: allArticles.map((article, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: article.title,
                url: absoluteUrl(`/inspiration/${article.slug}`),
              })),
            },
          },
        ]}
      />
      <section className="px-4 py-16 text-center sm:px-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Inspiration <span className="text-primary">Hub</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
          {inspirationCopy.hero.subtitle}
        </p>
        <form action="/inspiration" className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm sm:flex-row">
          {selectedCategory !== "All" ? <input type="hidden" name="category" value={selectedCategory} /> : null}
          <input name="q" defaultValue={q} placeholder={inspirationCopy.hero.searchPlaceholder} className="min-h-12 flex-1 rounded-xl bg-background px-4 outline-none" />
          <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">{inspirationCopy.hero.searchButton}</button>
        </form>
      </section>

      <section className="border-y border-line bg-card px-4 py-7 sm:px-6">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:justify-center">
          {categories.map((category) => (
            <Link
              key={category}
              href={categoryHref(category)}
              className={[
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold",
                category === selectedCategory
                  ? "bg-primary text-white"
                  : "border border-line bg-background text-muted",
              ].join(" ")}
            >
              {categoryLabel(category)}
            </Link>
          ))}
        </div>
      </section>

      {newDesigners.length || recentProjects.length ? (
        <section className="border-b border-line bg-primary-soft px-4 py-14 sm:px-6">
          <div className="mx-auto max-w-7xl">
            {newDesigners.length ? (
              <div>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-primary">{inspirationCopy.newDesigners.eyebrow}</div>
                    <h2 className="mt-1 text-3xl font-bold">{inspirationCopy.newDesigners.title}</h2>
                  </div>
                  <Link href="/designers?sort=newest" className="text-sm font-semibold text-primary">{inspirationCopy.newDesigners.seeAll}</Link>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {newDesigners.map((designer) => (
                    <article key={designer.id} className="rounded-lg border border-line bg-card p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-line bg-primary-soft">
                          <Image
                            src={designerIdentityImage(designer)}
                            alt={designer.full_name || inspirationCopy.labels.designerFallback}
                            width={96}
                            height={96}
                            unoptimized
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <FavoriteButton compact entityType="designer" entityKey={designer.id} initialSaved={savedKeys.has(`designer:${designer.id}`)} />
                      </div>
                      <Link href={`/designers/${designer.id}`} className="mt-4 block text-lg font-bold hover:text-primary">{designer.full_name || inspirationCopy.labels.designerFallback}</Link>
                      <p className="mt-1 text-sm text-muted">{designer.profession_type === "Studio" ? inspirationCopy.labels.studio : inspirationCopy.labels.designer}{designer.location ? ` · ${designer.location}` : ""}</p>
                      {designer.google_rating ? <p className="mt-3 text-sm font-semibold text-primary">Google {designer.google_rating.toFixed(1)} · {localizedCount(siteCopy.locale, designer.google_review_count ?? 0, inspirationCopy.labels.reviewCount)}</p> : null}
                    </article>
                  ))}
                </div>
              </div>
            ) : null}

            {recentProjects.length ? (
              <div className={newDesigners.length ? "mt-12" : ""}>
                <div>
                  <div className="text-sm font-semibold text-primary">{inspirationCopy.latestProjects.eyebrow}</div>
                  <h2 className="mt-1 text-3xl font-bold">{inspirationCopy.latestProjects.title}</h2>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentProjects.map((project) => {
                    const image = project.image_urls?.[0] || project.image_url;
                    return (
                      <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                        <Link href={`/projects/${project.id}`} className="block h-52 bg-card">
                          {image ? <Image src={image} alt={project.title || inspirationCopy.labels.untitledProject} width={900} height={600} unoptimized className="h-full w-full object-cover" /> : null}
                        </Link>
                        <div className="flex items-start justify-between gap-3 p-5">
                          <div>
                            <div className="text-xs font-semibold uppercase text-primary">{project.category ? projectCategoryLabel(project.category) : inspirationCopy.labels.portfolio}</div>
                            <Link href={`/projects/${project.id}`} className="mt-1 block text-lg font-bold hover:text-primary">{project.title || inspirationCopy.labels.untitledProject}</Link>
                          </div>
                          <FavoriteButton compact entityType="project" entityKey={project.id} initialSaved={savedKeys.has(`project:${project.id}`)} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{selectedCategory === "All" ? inspirationCopy.featured.title : categoryLabel(selectedCategory)}</h2>
            <p className="mt-2 text-muted">
              {localizedCount(siteCopy.locale, articles.length, inspirationCopy.labels.articleCount)}{q ? ` ${inspirationCopy.labels.querySuffix} „${q}”` : ""}
            </p>
          </div>
          <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">
            {inspirationCopy.featured.findDesignerCta}
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            {inspirationCopy.labels.unavailable}
          </div>
        ) : articles.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                <Link
                  href={`/inspiration/${article.slug}`}
                  className="block h-60 overflow-hidden bg-primary-soft"
                  aria-label={`${inspirationCopy.labels.openArticle}: ${article.title}`}
                >
                  {article.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.image_url}
                      alt={article.cover_alt}
                      width="1000"
                      height="700"
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </Link>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      {categoryLabel(article.category)}
                    </span>
                    <FavoriteButton compact entityType="article" entityKey={article.id} initialSaved={savedKeys.has(`article:${article.id}`)} />
                  </div>
                  <Link href={`/inspiration/${article.slug}`} className="mt-4 block text-xl font-bold hover:text-primary">
                    {article.title}
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted">
                    <span>{article.author_name || inspirationCopy.labels.editorialTeam}</span>
                    <Link href={`/inspiration/${article.slug}`} className="font-semibold text-primary">{inspirationCopy.featured.readCta}</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-line bg-card p-8">
            <h3 className="text-2xl font-bold">{inspirationCopy.featured.noResultsTitle}</h3>
            <p className="mt-2 text-muted">{inspirationCopy.featured.noResultsBody}</p>
            <Link href="/inspiration" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">{inspirationCopy.featured.noResultsCta}</Link>
          </div>
        )}
      </section>
    </main>
  );
}
