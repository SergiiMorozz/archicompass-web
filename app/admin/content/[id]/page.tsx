import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import ArticleRichTextEditor from "@/components/ArticleRichTextEditor";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { articleBlocksPlainText, articleImagePaths, parseArticleBlocks } from "@/lib/article-content";
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
  title_pl: string | null;
  title_en: string | null;
  excerpt_pl: string | null;
  excerpt_en: string | null;
  author_name_pl: string | null;
  author_name_en: string | null;
  cover_alt_pl: string | null;
  cover_alt_en: string | null;
  meta_title_pl: string | null;
  meta_title_en: string | null;
  meta_description_pl: string | null;
  meta_description_en: string | null;
  focus_keyword_pl: string | null;
  focus_keyword_en: string | null;
  content_blocks: unknown;
  noindex: boolean;
  status: "draft" | "published";
  featured: boolean;
  published_at: string | null;
};

const articleImagesBucket = "project-images";
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 10 * 1024 * 1024;
const fieldClass = "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  return textValue(formData, key) || null;
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

function isSafeExternalUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function revalidateArticlePaths(slug: string) {
  ["/inspiration", `/inspiration/${slug}`, "/en/inspiration", `/en/inspiration/${slug}`, "/admin", "/admin/content"].forEach((path) => revalidatePath(path));
}

async function updateArticle(formData: FormData) {
  "use server";

  const id = textValue(formData, "id");
  if (!isUuid(id)) redirect("/admin/content");
  const { supabase, user } = await requireAdmin("content");
  const titlePl = textValue(formData, "title_pl");
  const titleEn = textValue(formData, "title_en");
  const title = titlePl || titleEn;
  const slug = slugValue(textValue(formData, "slug") || title);
  const status = textValue(formData, "status");
  const imageUrlInput = textValue(formData, "image_url");
  const blocks = parseArticleBlocks(textValue(formData, "content_blocks"));
  const legacyBody = textValue(formData, "legacy_body");
  const generatedBody = articleBlocksPlainText(blocks, "pl") || legacyBody;

  if (title.length < 3) editorError(id, "Podaj tytuł co najmniej w jednej wersji językowej.");
  if (!slug) editorError(id, "Podaj poprawny adres URL.");
  if (status !== "draft" && status !== "published") editorError(id, "Wybierz status szkicu albo publikacji.");
    if (!isSafeExternalUrl(imageUrlInput)) editorError(id, "Adres okładki musi zaczynać się od http://, https:// albo /.");

  const { data: current } = await supabase
    .from("inspiration_articles")
    .select("published_at, image_url, slug, content_blocks")
    .eq("id", id)
    .maybeSingle();
  if (!current) notFound();

  const imageFile = formData.get("image_file");
  let imageUrl = imageUrlInput || null;
  let uploadedCoverPath: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!allowedImageTypes.includes(imageFile.type)) editorError(id, "Prześlij okładkę JPEG, PNG albo WebP.");
    if (imageFile.size > maxImageSize) editorError(id, "Okładka musi mieć mniej niż 10 MB.");
    uploadedCoverPath = `${user.id}/inspiration/${id}/cover/${crypto.randomUUID()}.${extensionFor(imageFile)}`;
    const { error: uploadError } = await supabase.storage.from(articleImagesBucket).upload(uploadedCoverPath, imageFile, {
      contentType: imageFile.type,
      upsert: false,
    });
    if (uploadError) editorError(id, `Nie udało się przesłać okładki: ${uploadError.message}`);
    imageUrl = supabase.storage.from(articleImagesBucket).getPublicUrl(uploadedCoverPath).data.publicUrl;
  }

  const update = {
    slug,
    title,
    title_pl: nullableText(formData, "title_pl"),
    title_en: nullableText(formData, "title_en"),
    excerpt: textValue(formData, "excerpt_pl") || textValue(formData, "excerpt_en"),
    excerpt_pl: nullableText(formData, "excerpt_pl"),
    excerpt_en: nullableText(formData, "excerpt_en"),
    body: generatedBody,
    content_blocks: blocks,
    category: textValue(formData, "category") || "Design",
    image_url: imageUrl,
    cover_alt_pl: nullableText(formData, "cover_alt_pl"),
    cover_alt_en: nullableText(formData, "cover_alt_en"),
    author_name: nullableText(formData, "author_name_pl") || nullableText(formData, "author_name_en"),
    author_name_pl: nullableText(formData, "author_name_pl"),
    author_name_en: nullableText(formData, "author_name_en"),
    meta_title_pl: nullableText(formData, "meta_title_pl"),
    meta_title_en: nullableText(formData, "meta_title_en"),
    meta_description_pl: nullableText(formData, "meta_description_pl"),
    meta_description_en: nullableText(formData, "meta_description_en"),
    focus_keyword_pl: nullableText(formData, "focus_keyword_pl"),
    focus_keyword_en: nullableText(formData, "focus_keyword_en"),
    noindex: formData.get("noindex") === "on",
    status,
    featured: formData.get("featured") === "on",
    published_at: status === "published" ? current.published_at || new Date().toISOString() : null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("inspiration_articles")
    .update(update)
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  if (error || !data) {
    if (uploadedCoverPath) await supabase.storage.from(articleImagesBucket).remove([uploadedCoverPath]);
    editorError(id, error?.message || "Nie udało się zaktualizować artykułu.");
  }

  const previousCoverPath = ownedArticleImagePath(current.image_url, user.id);
  const previousInlinePaths = articleImagePaths(parseArticleBlocks(current.content_blocks), user.id);
  const nextInlinePaths = articleImagePaths(blocks, user.id);
  const obsoletePaths = [
    ...(previousCoverPath && imageUrl !== current.image_url ? [previousCoverPath] : []),
    ...previousInlinePaths.filter((path) => !nextInlinePaths.includes(path)),
  ];
  if (obsoletePaths.length) await supabase.storage.from(articleImagesBucket).remove(obsoletePaths);

  revalidateArticlePaths(data.slug);
  redirect(`/admin/content/${id}?updated=1`);
}

async function deleteArticle(formData: FormData) {
  "use server";
  const id = textValue(formData, "id");
  if (!isUuid(id)) redirect("/admin/content");
  const { supabase, user } = await requireAdmin("content");
  const { data: article } = await supabase
    .from("inspiration_articles")
    .select("title, slug, image_url, content_blocks")
    .eq("id", id)
    .maybeSingle();
  if (!article) notFound();
  if (textValue(formData, "confirmation") !== article.title) editorError(id, "Wpisz pełny tytuł artykułu, aby potwierdzić usunięcie.");

  const { error } = await supabase.from("inspiration_articles").delete().eq("id", id);
  if (error) editorError(id, `Nie udało się usunąć artykułu: ${error.message}`);

  const paths = [ownedArticleImagePath(article.image_url, user.id), ...articleImagePaths(parseArticleBlocks(article.content_blocks), user.id)].filter(Boolean) as string[];
  if (paths.length) await supabase.storage.from(articleImagesBucket).remove(paths);
  revalidateArticlePaths(article.slug);
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
  const { supabase } = await requireAdmin("content");
  const { data } = await supabase
    .from("inspiration_articles")
    .select("id, slug, title, excerpt, body, category, image_url, author_name, title_pl, title_en, excerpt_pl, excerpt_en, author_name_pl, author_name_en, cover_alt_pl, cover_alt_en, meta_title_pl, meta_title_en, meta_description_pl, meta_description_en, focus_keyword_pl, focus_keyword_en, content_blocks, noindex, status, featured, published_at")
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();
  const article = data as Article;
  const legacyPolish = applyPolishArticleCopy(article);
  const articleName = article.title_pl || legacyPolish.title || article.title || article.title_en || "Artykuł";

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/admin/content" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted">Wróć do treści</Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><div className="text-sm font-semibold text-primary">Edytor SEO i treści</div><h1 className="mt-2 text-4xl font-bold">{articleName}</h1></div>
            {article.status === "published" ? <Link href={`/inspiration/${article.slug}`} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white">Zobacz opublikowany artykuł</Link> : null}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {sp.created || sp.updated ? <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{sp.created ? "Szkic został utworzony." : "Artykuł został zaktualizowany."}</div> : null}
        {sp.error ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{sp.error}</div> : null}

        <form action={updateArticle} className="grid gap-6">
          <input type="hidden" name="id" value={article.id} />
          <input type="hidden" name="legacy_body" value={article.body} />
          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="flex items-end justify-between gap-4"><div><div className="text-sm font-semibold text-primary">Podstawy publikacji</div><h2 className="mt-1 text-2xl font-bold">Wersje językowe</h2></div><span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">Brak EN = poprawny fallback PL</span></div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <label className="text-sm font-semibold">Tytuł — PL<input name="title_pl" minLength={3} defaultValue={article.title_pl || legacyPolish.title} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Title — EN<input name="title_en" minLength={3} defaultValue={article.title_en || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold lg:col-span-2">Adres URL<input name="slug" required defaultValue={article.slug} className={fieldClass} /><span className="mt-2 block text-xs font-normal text-muted">Jeden czytelny adres wspólny dla obu wersji językowych.</span></label>
              <label className="text-sm font-semibold">Lead — PL<textarea name="excerpt_pl" maxLength={700} rows={4} defaultValue={article.excerpt_pl || legacyPolish.excerpt} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Lead — EN<textarea name="excerpt_en" maxLength={700} rows={4} defaultValue={article.excerpt_en || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Kategoria<input name="category" required defaultValue={article.category} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Status<select name="status" defaultValue={article.status} className={fieldClass}><option value="draft">Szkic</option><option value="published">Opublikowany</option></select></label>
            </div>
          </section>

          <ArticleRichTextEditor articleId={article.id} initialBlocks={article.content_blocks} />

          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-primary">Okładka i autor</div><h2 className="mt-1 text-2xl font-bold">Materiały wizualne</h2>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {article.image_url ? <div className="lg:col-span-2"><div className="mb-2 text-sm font-semibold">Aktualna okładka</div><div className="aspect-[16/7] w-full rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${article.image_url})` }} role="img" aria-label={`Podgląd okładki artykułu ${articleName}`} /></div> : null}
              <label className="text-sm font-semibold lg:col-span-2">Prześlij nową okładkę<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" className={`${fieldClass} file:mr-4 file:rounded-lg file:border-0 file:bg-primary-soft file:px-4 file:py-2 file:font-semibold file:text-primary`} /><span className="mt-2 block text-xs font-normal text-muted">JPEG, PNG albo WebP do 10 MB. Nowy plik zastąpi aktualną okładkę.</span></label>
              <label className="text-sm font-semibold lg:col-span-2">Albo użyj zewnętrznego adresu okładki<input name="image_url" type="url" defaultValue={article.image_url ?? ""} placeholder="https://" className={fieldClass} /></label>
              <label className="text-sm font-semibold">Alt tekst okładki — PL<input name="cover_alt_pl" maxLength={240} defaultValue={article.cover_alt_pl || ""} placeholder="Opisz, co widać na zdjęciu" className={fieldClass} /></label>
              <label className="text-sm font-semibold">Cover alt text — EN<input name="cover_alt_en" maxLength={240} defaultValue={article.cover_alt_en || ""} placeholder="Describe what the image shows" className={fieldClass} /></label>
              <label className="text-sm font-semibold">Autor — PL<input name="author_name_pl" maxLength={160} defaultValue={article.author_name_pl || legacyPolish.author_name || article.author_name || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Author — EN<input name="author_name_en" maxLength={160} defaultValue={article.author_name_en || ""} className={fieldClass} /></label>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-primary">SEO</div><h2 className="mt-1 text-2xl font-bold">Wyniki wyszukiwania i udostępnianie</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Tytuł SEO najlepiej utrzymać w okolicach 50–60 znaków, opis meta w okolicach 140–160. Słowo kluczowe pomaga redakcyjnie, ale nie jest wyświetlane użytkownikom.</p>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <label className="text-sm font-semibold">Meta title — PL<input name="meta_title_pl" maxLength={180} defaultValue={article.meta_title_pl || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Meta title — EN<input name="meta_title_en" maxLength={180} defaultValue={article.meta_title_en || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Meta description — PL<textarea name="meta_description_pl" maxLength={360} rows={4} defaultValue={article.meta_description_pl || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Meta description — EN<textarea name="meta_description_en" maxLength={360} rows={4} defaultValue={article.meta_description_en || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Główna fraza — PL<input name="focus_keyword_pl" maxLength={160} defaultValue={article.focus_keyword_pl || ""} className={fieldClass} /></label>
              <label className="text-sm font-semibold">Focus keyword — EN<input name="focus_keyword_en" maxLength={160} defaultValue={article.focus_keyword_en || ""} className={fieldClass} /></label>
              <label className="flex items-center gap-3 text-sm font-semibold lg:col-span-2"><input name="noindex" type="checkbox" defaultChecked={article.noindex} className="h-5 w-5 accent-primary" />Nie dodawaj tego artykułu do indeksu Google ani sitemap</label>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-4"><div className="text-sm text-muted">{article.published_at ? `Pierwsza publikacja ${new Date(article.published_at).toLocaleDateString("pl-PL")}` : "Jeszcze nieopublikowany"}</div><div className="flex flex-wrap gap-4"><label className="flex items-center gap-3 text-sm font-semibold"><input name="featured" type="checkbox" defaultChecked={article.featured} className="h-5 w-5 accent-primary" />Wyróżnij w Inspiration Hub</label><button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">Zapisz artykuł</button></div></div>
        </form>

        <section className="mt-10 rounded-lg border border-red-200 bg-red-50 p-6"><div className="text-sm font-semibold text-red-700">Strefa ostrożności</div><h2 className="mt-1 text-2xl font-bold">Usuń artykuł</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">To trwale usunie artykuł z Inspiration Hub wraz z obrazami przesłanymi w edytorze. Wpisz dokładny tytuł <strong>{article.title}</strong>, aby potwierdzić.</p><form action={deleteArticle} className="mt-5 flex flex-col gap-3 sm:flex-row"><input type="hidden" name="id" value={article.id} /><input name="confirmation" aria-label="Potwierdzenie tytułu artykułu" className="min-h-12 flex-1 rounded-xl border border-red-200 bg-white px-4 outline-none focus:border-red-500" /><button className="rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white">Usuń trwale</button></form></section>
      </section>
    </main>
  );
}
