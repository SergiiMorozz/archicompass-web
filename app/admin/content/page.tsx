import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

type Article = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
  updated_at: string;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function slugValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
}

function contentError(message: string): never {
  redirect(`/admin/content?error=${encodeURIComponent(message)}`);
}

async function createArticle(formData: FormData) {
  "use server";

  const { supabase, user } = await requireAdmin();
  const title = textValue(formData, "title");
  const category = textValue(formData, "category") || "Design";
  const slug = slugValue(textValue(formData, "slug") || title);

  if (title.length < 3) contentError("Podaj tytuł artykułu.");
  if (!slug) contentError("Artykuł potrzebuje poprawnego adresu URL.");

  const { data, error } = await supabase
    .from("inspiration_articles")
    .insert({
      slug,
      title,
      category,
      excerpt: "",
      body: "",
      status: "draft",
      featured: false,
      created_by: user.id,
      updated_by: user.id,
    })
    .select("id")
    .single();

  if (error || !data) contentError(error?.message || "Nie udało się utworzyć artykułu.");
  revalidatePath("/admin/content");
  redirect(`/admin/content/${data.id}?created=1`);
}

function formatDate(value: string | null) {
  if (!value) return "Nieopublikowany";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams?: Promise<{ deleted?: string; error?: string; status?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedStatus = sp.status === "draft" || sp.status === "published" ? sp.status : "all";
  const { supabase } = await requireAdmin();
  const query = supabase
    .from("inspiration_articles")
    .select("id, slug, title, category, status, featured, published_at, updated_at")
    .order("updated_at", { ascending: false });
  const { data, error } = await query;
  const allArticles = (data ?? []) as Article[];
  const articles = selectedStatus === "all"
    ? allArticles
    : allArticles.filter((article) => article.status === selectedStatus);
  const publishedCount = allArticles.filter((article) => article.status === "published").length;
  const draftCount = allArticles.filter((article) => article.status === "draft").length;

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">Treści platformy</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Inspiration Hub</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Twórz, sprawdzaj i publikuj artykuły bez zmian w kodzie publicznej aplikacji.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          {sp.deleted ? (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Artykuł został usunięty.
            </div>
          ) : null}
          {sp.error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {sp.error}
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Nie udało się wczytać treści. Najpierw zastosuj migrację Inspiration Content.
            </div>
          ) : null}

          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              ["all", `Wszystkie ${allArticles.length}`],
              ["published", `Opublikowane ${publishedCount}`],
              ["draft", `Szkice ${draftCount}`],
            ].map(([status, label]) => (
              <Link
                key={status}
                href={status === "all" ? "/admin/content" : `/admin/content?status=${status}`}
                className={[
                  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
                  selectedStatus === status
                    ? "bg-primary text-white"
                    : "border border-line bg-card text-muted",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-lg border border-line bg-card shadow-sm">
            {articles.length ? (
              articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/content/${article.id}`}
                  className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-0 hover:bg-primary-soft/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{article.title}</span>
                      {article.featured ? (
                        <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">Wyróżniony</span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-sm text-muted">
                      {article.category} · /{article.slug} · {formatDate(article.published_at)}
                    </div>
                  </div>
                  <span className={[
                    "w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize",
                    article.status === "published"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-[#fff3df] text-[#8a5a00]",
                  ].join(" ")}>
                    {article.status === "published" ? "Opublikowany" : "Szkic"}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-6 text-sm text-muted">Brak artykułów w tym widoku.</div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Nowy szkic</div>
          <h2 className="mt-1 text-2xl font-bold">Utwórz artykuł</h2>
          <form action={createArticle} className="mt-5 grid gap-4">
            <label className="text-sm font-semibold">
              Tytuł
              <input name="title" required minLength={3} className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <label className="text-sm font-semibold">
              Kategoria
              <input name="category" defaultValue="Design" className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <label className="text-sm font-semibold">
              Adres URL <span className="font-normal text-muted">opcjonalnie</span>
              <input name="slug" placeholder="generowany-z-tytulu" className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Utwórz szkic
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
