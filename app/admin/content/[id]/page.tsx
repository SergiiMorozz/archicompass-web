import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  image_url: string | null;
  author_name: string | null;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
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

function editorError(id: string, message: string): never {
  redirect(`/admin/content/${id}?error=${encodeURIComponent(message)}`);
}

async function updateArticle(formData: FormData) {
  "use server";

  const id = textValue(formData, "id");
  if (!isUuid(id)) redirect("/admin/content");
  const { supabase, user } = await requireAdmin();
  const title = textValue(formData, "title");
  const slug = slugValue(textValue(formData, "slug"));
  const status = textValue(formData, "status");
  if (title.length < 3) editorError(id, "Enter an article title.");
  if (!slug) editorError(id, "Enter a valid URL slug.");
  if (status !== "draft" && status !== "published") editorError(id, "Choose draft or published status.");

  const { data: current } = await supabase
    .from("inspiration_articles")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();
  if (!current) notFound();

  const { data, error } = await supabase
    .from("inspiration_articles")
    .update({
      slug,
      title,
      excerpt: textValue(formData, "excerpt"),
      body: textValue(formData, "body"),
      category: textValue(formData, "category") || "Design",
      image_url: textValue(formData, "image_url") || null,
      author_name: textValue(formData, "author_name") || null,
      status,
      featured: formData.get("featured") === "on",
      published_at: status === "published" ? current.published_at || new Date().toISOString() : null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("slug")
    .maybeSingle();

  if (error || !data) editorError(id, error?.message || "Article could not be updated.");
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  revalidatePath("/inspiration");
  revalidatePath(`/inspiration/${data.slug}`);
  redirect(`/admin/content/${id}?updated=1`);
}

export default async function AdminArticleEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ created?: string; error?: string; updated?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  if (!isUuid(id)) notFound();
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("inspiration_articles")
    .select("id, slug, title, excerpt, body, category, image_url, author_name, status, featured, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const article = data as Article;

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Link href="/admin/content" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted">
            Back to content
          </Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-primary">Article editor</div>
              <h1 className="mt-2 text-4xl font-bold">{article.title}</h1>
            </div>
            {article.status === "published" ? (
              <Link href={`/inspiration/${article.slug}`} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white">
                View published article
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {sp.created || sp.updated ? (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            {sp.created ? "Draft created." : "Article updated."}
          </div>
        ) : null}
        {sp.error ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}

        <form action={updateArticle} className="grid gap-6">
          <input type="hidden" name="id" value={article.id} />
          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">
                Title
                <input name="title" required minLength={3} defaultValue={article.title} className={fieldClass} />
              </label>
              <label className="text-sm font-semibold">
                URL slug
                <input name="slug" required defaultValue={article.slug} className={fieldClass} />
              </label>
              <label className="text-sm font-semibold">
                Category
                <input name="category" required defaultValue={article.category} className={fieldClass} />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Excerpt
                <textarea name="excerpt" maxLength={700} rows={3} defaultValue={article.excerpt} className={fieldClass} />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Article body
                <textarea name="body" maxLength={50000} rows={18} defaultValue={article.body} className={fieldClass} />
                <span className="mt-2 block text-xs font-normal text-muted">Separate paragraphs with an empty line.</span>
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">
                Cover image URL
                <input name="image_url" type="url" defaultValue={article.image_url ?? ""} placeholder="https://" className={fieldClass} />
              </label>
              <label className="text-sm font-semibold">
                Author
                <input name="author_name" defaultValue={article.author_name ?? ""} className={fieldClass} />
              </label>
              <label className="text-sm font-semibold">
                Status
                <select name="status" defaultValue={article.status} className={fieldClass}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
              <label className="flex items-center gap-3 text-sm font-semibold sm:col-span-2">
                <input name="featured" type="checkbox" defaultChecked={article.featured} className="h-5 w-5 accent-primary" />
                Feature this article in Inspiration Hub
              </label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted">
              {article.published_at ? `First published ${new Date(article.published_at).toLocaleDateString("en")}` : "Not published yet"}
            </div>
            <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">
              Save article
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
