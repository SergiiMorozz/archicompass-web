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

const articleImagesBucket = "project-images";
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 10 * 1024 * 1024;

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

function extensionFor(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

function ownedArticleImagePath(imageUrl: string | null, userId: string) {
  if (!imageUrl) return null;
  const marker = `/storage/v1/object/public/${articleImagesBucket}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  const path = decodeURIComponent(imageUrl.slice(markerIndex + marker.length));
  return path.startsWith(`${userId}/inspiration/`) ? path : null;
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
    .select("published_at, image_url, slug")
    .eq("id", id)
    .maybeSingle();
  if (!current) notFound();

  const imageFile = formData.get("image_file");
  let imageUrl = textValue(formData, "image_url") || null;
  let uploadedPath: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!allowedImageTypes.includes(imageFile.type)) {
      editorError(id, "Upload a JPEG, PNG, or WebP cover image.");
    }
    if (imageFile.size > maxImageSize) {
      editorError(id, "The cover image must be smaller than 10 MB.");
    }

    uploadedPath = `${user.id}/inspiration/${id}/${crypto.randomUUID()}.${extensionFor(imageFile)}`;
    const { error: uploadError } = await supabase.storage
      .from(articleImagesBucket)
      .upload(uploadedPath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) editorError(id, `Cover upload failed: ${uploadError.message}`);
    imageUrl = supabase.storage.from(articleImagesBucket).getPublicUrl(uploadedPath).data.publicUrl;
  }

  const { data, error } = await supabase
    .from("inspiration_articles")
    .update({
      slug,
      title,
      excerpt: textValue(formData, "excerpt"),
      body: textValue(formData, "body"),
      category: textValue(formData, "category") || "Design",
      image_url: imageUrl,
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

  if (error || !data) {
    if (uploadedPath) await supabase.storage.from(articleImagesBucket).remove([uploadedPath]);
    editorError(id, error?.message || "Article could not be updated.");
  }

  const previousImagePath = ownedArticleImagePath(current.image_url, user.id);
  if (previousImagePath && imageUrl !== current.image_url) {
    await supabase.storage.from(articleImagesBucket).remove([previousImagePath]);
  }
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  revalidatePath("/inspiration");
  revalidatePath(`/inspiration/${data.slug}`);
  redirect(`/admin/content/${id}?updated=1`);
}

async function deleteArticle(formData: FormData) {
  "use server";

  const id = textValue(formData, "id");
  if (!isUuid(id)) redirect("/admin/content");
  const { supabase, user } = await requireAdmin();
  const { data: article } = await supabase
    .from("inspiration_articles")
    .select("title, slug, image_url")
    .eq("id", id)
    .maybeSingle();
  if (!article) notFound();

  if (textValue(formData, "confirmation") !== article.title) {
    editorError(id, "Type the full article title to confirm deletion.");
  }

  const { error } = await supabase.from("inspiration_articles").delete().eq("id", id);
  if (error) editorError(id, `Article could not be deleted: ${error.message}`);

  const imagePath = ownedArticleImagePath(article.image_url, user.id);
  if (imagePath) await supabase.storage.from(articleImagesBucket).remove([imagePath]);
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  revalidatePath("/inspiration");
  revalidatePath(`/inspiration/${article.slug}`);
  redirect("/admin/content?deleted=1");
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
              {article.image_url ? (
                <div className="sm:col-span-2">
                  <div className="mb-2 text-sm font-semibold">Current cover</div>
                  <div
                    className="aspect-[16/7] w-full rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${article.image_url})` }}
                    role="img"
                    aria-label={`Cover preview for ${article.title}`}
                  />
                </div>
              ) : null}
              <label className="text-sm font-semibold sm:col-span-2">
                Upload a new cover
                <input
                  name="image_file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary`}
                />
                <span className="mt-2 block text-xs font-normal text-muted">
                  JPEG, PNG, or WebP up to 10 MB. A new upload replaces the current cover.
                </span>
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Or use an external cover URL
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

        <section className="mt-10 rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="text-sm font-semibold text-red-700">Danger zone</div>
          <h2 className="mt-1 text-2xl font-bold">Delete article</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">
            This permanently removes the article from Inspiration Hub. Type the exact title
            <strong> {article.title}</strong> to confirm.
          </p>
          <form action={deleteArticle} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="id" value={article.id} />
            <input
              name="confirmation"
              aria-label="Article title confirmation"
              className="min-h-12 flex-1 rounded-xl border border-red-200 bg-white px-4 outline-none focus:border-red-500"
            />
            <button className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white">
              Delete permanently
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
