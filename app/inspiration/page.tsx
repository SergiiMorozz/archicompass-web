import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  author_name: string | null;
  featured: boolean;
  published_at: string | null;
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

export default async function InspirationPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedCategory = first(sp.category).trim() || "All";
  const q = first(sp.q).trim();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("inspiration_articles")
    .select("id, slug, title, excerpt, category, image_url, author_name, featured, published_at")
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("published_at", { ascending: false });
  const allArticles = (data ?? []) as Article[];
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
        .select("entity_key")
        .eq("user_id", userData.user.id)
        .eq("entity_type", "article")
    : { data: [] };
  const savedArticleIds = new Set((favoriteData ?? []).map((favorite) => favorite.entity_key));

  return (
    <main>
      <section className="px-4 py-16 text-center sm:px-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Inspiration <span className="text-primary">Hub</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted">
          Explore practical design guidance, materials, spaces, and ideas curated by ArchiCompass.
        </p>
        <form action="/inspiration" className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 rounded-2xl border border-line bg-card p-3 shadow-sm sm:flex-row">
          {selectedCategory !== "All" ? <input type="hidden" name="category" value={selectedCategory} /> : null}
          <input name="q" defaultValue={q} placeholder="Search articles and ideas..." className="min-h-12 flex-1 rounded-xl bg-background px-4 outline-none" />
          <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">Search</button>
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
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{selectedCategory === "All" ? "Featured ideas" : selectedCategory}</h2>
            <p className="mt-2 text-muted">
              {articles.length} {articles.length === 1 ? "article" : "articles"}{q ? ` matching “${q}”` : ""}
            </p>
          </div>
          <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">
            Find a Designer
          </Link>
        </div>

        {error ? (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            Inspiration content is temporarily unavailable.
          </div>
        ) : articles.length ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                <Link
                  href={`/inspiration/${article.slug}`}
                  className="block h-60 bg-cover bg-center"
                  style={{ backgroundImage: article.image_url ? `url(${article.image_url})` : undefined }}
                  aria-label={`Open ${article.title}`}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                      {article.category}
                    </span>
                    <FavoriteButton compact entityType="article" entityKey={article.id} initialSaved={savedArticleIds.has(article.id)} />
                  </div>
                  <Link href={`/inspiration/${article.slug}`} className="mt-4 block text-xl font-bold hover:text-primary">
                    {article.title}
                  </Link>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 text-xs text-muted">
                    <span>{article.author_name || "ArchiCompass Editorial"}</span>
                    <Link href={`/inspiration/${article.slug}`} className="font-semibold text-primary">Read article</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-line bg-card p-8">
            <h3 className="text-2xl font-bold">No articles found</h3>
            <p className="mt-2 text-muted">Try another search or return to all inspiration.</p>
            <Link href="/inspiration" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">View all articles</Link>
          </div>
        )}
      </section>
    </main>
  );
}
