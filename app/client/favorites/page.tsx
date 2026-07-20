import Link from "next/link";
import { redirect } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import { applyPolishArticleCopy } from "@/content/pl/copy";
import { getSiteCopy } from "@/content/site-copy";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import {
  applyDemoProfilePresentation,
  getDemoProjectPresentation,
} from "@/lib/public-demo-profiles";
import { localizeProfileContent } from "@/lib/localized-profile-content";
import { profileLocationLabel, profileTypeLabel } from "@/lib/profile-system-labels";
import { localizeArticle, type ArticleLocalizationFields } from "@/lib/article-content";
import { siteLocale } from "@/lib/site-locale";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Favorite = {
  entity_key: string;
  entity_type: "designer" | "studio" | "project" | "article" | "inspiration";
};

type Profile = {
  id: string;
  full_name: string | null;
  profession_type: string | null;
  user_type: string | null;
  location: string | null;
  specialties: string[] | null;
  bio: string | null;
  bio_pl: string | null;
  bio_en: string | null;
};

type Project = {
  id: string;
  profile_id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
};

type Studio = {
  id: string;
  name: string;
  bio: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  location: string | null;
  specialties: string[] | null;
};

type Article = ArticleLocalizationFields & {
  id: string;
  slug: string;
  category: string;
};

const fallbackProjectImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80";

export default async function ClientFavoritesPage() {
  const copy = getWorkspaceCopy().clientFavorites;
  const siteCopy = getSiteCopy();
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: favoriteData, error } = await supabase
    .from("favorites")
    .select("entity_type, entity_key")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const favorites = (favoriteData ?? []) as Favorite[];
  const designerIds = favorites.filter((item) => item.entity_type === "designer").map((item) => item.entity_key);
  const studioIds = favorites.filter((item) => item.entity_type === "studio").map((item) => item.entity_key);
  const projectIds = favorites.filter((item) => item.entity_type === "project").map((item) => item.entity_key);
  const articleIds = favorites.filter((item) => item.entity_type === "article").map((item) => item.entity_key);

  const [{ data: profileData }, { data: studioData }, { data: projectData }, { data: articleData }] = await Promise.all([
    designerIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, profession_type, user_type, location, specialties, bio, bio_pl, bio_en")
          .in("id", designerIds)
      : Promise.resolve({ data: [] }),
    studioIds.length
      ? supabase
          .from("studios")
          .select("id, name, bio, bio_pl, bio_en, location, specialties")
          .in("id", studioIds)
      : Promise.resolve({ data: [] }),
    projectIds.length
      ? supabase
          .from("projects")
          .select("id, profile_id, title, category, description, image_url, image_path")
          .in("id", projectIds)
      : Promise.resolve({ data: [] }),
    articleIds.length
      ? supabase
          .from("inspiration_articles")
          .select("id, slug, title, excerpt, body, category, image_url, author_name, title_pl, title_en, excerpt_pl, excerpt_en, author_name_pl, author_name_en, cover_alt_pl, cover_alt_en, meta_title_pl, meta_title_en, meta_description_pl, meta_description_en, focus_keyword_pl, focus_keyword_en, content_blocks")
          .in("id", articleIds)
      : Promise.resolve({ data: [] }),
  ]);
  const designers = ((profileData ?? []) as Profile[])
    .map(applyDemoProfilePresentation)
    .map((profile) => localizeProfileContent(profile));
  const studios = ((studioData ?? []) as Studio[]).map((studio) => localizeProfileContent(studio));
  const projects = ((projectData ?? []) as Project[]).map((project) => {
    const presentation = getDemoProjectPresentation(project.profile_id, project.id);
    return presentation ? { ...project, ...presentation } : project;
  });
  const articles = ((articleData ?? []) as Article[]).map((article) => {
    const legacy = siteLocale === "pl" ? applyPolishArticleCopy(article) : article;
    return localizeArticle(legacy, siteLocale);
  });
  const ownerIds = Array.from(new Set(projects.map((project) => project.profile_id)));
  const { data: ownerData } = ownerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", ownerIds)
    : { data: [] };
  const ownersById = new Map(
    (ownerData ?? []).map((owner) => {
      const presentedOwner = applyDemoProfilePresentation(owner);
      return [presentedOwner.id, presentedOwner.full_name];
    })
  );

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            {copy.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{copy.loadError}: {error.message}</div> : null}

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-primary">{copy.designersEyebrow}</div>
              <h2 className="mt-1 text-3xl font-bold">{copy.designersTitle}</h2>
            </div>
            <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">{copy.findMore}</Link>
          </div>
          {designers.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {designers.map((designer) => (
                <article key={designer.id} className="rounded-lg border border-line bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/designers/${designer.id}`} className="text-xl font-bold hover:text-primary">{designer.full_name || copy.defaultProfessional}</Link>
                      <div className="mt-1 text-sm text-muted">{designer.profession_type ? profileTypeLabel(designer.profession_type) : copy.defaultProfessional}{designer.location ? ` · ${profileLocationLabel(designer.location)}` : ""}</div>
                    </div>
                    <FavoriteButton compact entityType="designer" entityKey={designer.id} initialSaved refreshOnChange />
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{designer.bio || copy.designerBioFallback}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(designer.specialties ?? []).slice(0, 3).map((specialty) => <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{specialty}</span>)}
                  </div>
                  <Link href={`/designers/${designer.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">{copy.openProfile}</Link>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">{copy.designersEmpty}</div>}
        </section>

        <section>
          <div>
            <div className="text-sm font-semibold text-primary">{copy.studiosEyebrow}</div>
            <h2 className="mt-1 text-3xl font-bold">{copy.studiosTitle}</h2>
          </div>
          {studios.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {studios.map((studio) => (
                <article key={studio.id} className="rounded-lg border border-line bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/studios/${studio.id}`} className="text-xl font-bold hover:text-primary">{studio.name}</Link>
                      <div className="mt-1 text-sm text-muted">{copy.studio}{studio.location ? ` · ${profileLocationLabel(studio.location)}` : ""}</div>
                    </div>
                    <FavoriteButton compact entityType="studio" entityKey={studio.id} initialSaved refreshOnChange />
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{studio.bio || copy.studioBioFallback}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(studio.specialties ?? []).slice(0, 3).map((specialty) => <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{specialty}</span>)}
                  </div>
                  <Link href={`/studios/${studio.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">{copy.openStudio}</Link>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">{copy.studiosEmpty}</div>}
        </section>

        <section>
          <div>
            <div className="text-sm font-semibold text-primary">{copy.projectsEyebrow}</div>
            <h2 className="mt-1 text-3xl font-bold">{copy.projectsTitle}</h2>
          </div>
          {projects.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const image = project.image_url || (project.image_path ? supabase.storage.from("project-images").getPublicUrl(project.image_path).data.publicUrl : null) || fallbackProjectImage;
                return (
                  <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                    <Link href={`/projects/${project.id}`} className="block aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} aria-label={`${copy.openProject}: ${project.title || copy.untitledProject}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/projects/${project.id}`} className="text-xl font-bold hover:text-primary">{project.title || copy.untitledProject}</Link>
                          <div className="mt-1 text-sm text-muted">{project.category || copy.portfolio} · {ownersById.get(project.profile_id) || copy.defaultProfessional}</div>
                        </div>
                        <FavoriteButton compact entityType="project" entityKey={project.id} initialSaved refreshOnChange />
                      </div>
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{project.description || copy.projectDescriptionFallback}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">{copy.projectsEmpty}</div>}
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-primary">{copy.inspirationEyebrow}</div>
              <h2 className="mt-1 text-3xl font-bold">{copy.inspirationTitle}</h2>
            </div>
            <Link href="/inspiration" className="text-sm font-semibold text-primary hover:underline">{copy.discoverInspiration}</Link>
          </div>
          {articles.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                  <Link href={`/inspiration/${article.slug}`} className="block aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: article.image_url ? `url(${article.image_url})` : undefined }} aria-label={`${copy.openProject}: ${article.title}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-primary">{siteCopy.inspiration.categoryLabels[article.category as keyof typeof siteCopy.inspiration.categoryLabels] || article.category}</span>
                        <Link href={`/inspiration/${article.slug}`} className="mt-1 block text-xl font-bold hover:text-primary">{article.title}</Link>
                      </div>
                      <FavoriteButton compact entityType="article" entityKey={article.id} initialSaved refreshOnChange />
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">{copy.articlesEmpty}</div>}
        </section>
      </section>
    </main>
  );
}
