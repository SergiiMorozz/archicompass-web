import Link from "next/link";
import { redirect } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import {
  applyDemoProfilePresentation,
  getDemoProjectPresentation,
} from "@/lib/public-demo-profiles";
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
  location: string | null;
  specialties: string[] | null;
};

type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
};

const fallbackProjectImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80";

export default async function ClientFavoritesPage() {
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
          .select("id, full_name, profession_type, user_type, location, specialties, bio")
          .in("id", designerIds)
      : Promise.resolve({ data: [] }),
    studioIds.length
      ? supabase
          .from("studios")
          .select("id, name, bio, location, specialties")
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
          .select("id, slug, title, excerpt, category, image_url")
          .in("id", articleIds)
      : Promise.resolve({ data: [] }),
  ]);
  const designers = ((profileData ?? []) as Profile[]).map(applyDemoProfilePresentation);
  const studios = (studioData ?? []) as Studio[];
  const projects = ((projectData ?? []) as Project[]).map((project) => {
    const presentation = getDemoProjectPresentation(project.profile_id, project.id);
    return presentation ? { ...project, ...presentation } : project;
  });
  const articles = (articleData ?? []) as Article[];
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
          <div className="text-sm font-semibold text-primary">Twoja krótka lista</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Ulubione</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Compare designers, projects, and inspiration without losing what feels right for your space.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6">
        {error ? <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">Favorites could not be loaded: {error.message}</div> : null}

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-primary">Osoby warte uwagi</div>
              <h2 className="mt-1 text-3xl font-bold">Zapisani projektanci</h2>
            </div>
            <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">Znajdź więcej</Link>
          </div>
          {designers.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {designers.map((designer) => (
                <article key={designer.id} className="rounded-lg border border-line bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/designers/${designer.id}`} className="text-xl font-bold hover:text-primary">{designer.full_name || "Projektant wnętrz"}</Link>
                      <div className="mt-1 text-sm text-muted">{designer.profession_type === "Studio" ? "Pracownia projektowa" : "Projektant wnętrz"}{designer.location ? ` · ${designer.location}` : ""}</div>
                    </div>
                    <FavoriteButton compact entityType="designer" entityKey={designer.id} initialSaved refreshOnChange />
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{designer.bio || "Otwórz profil, aby poznać podejście i realizacje tego projektanta."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(designer.specialties ?? []).slice(0, 3).map((specialty) => <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{specialty}</span>)}
                  </div>
                  <Link href={`/designers/${designer.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Otwórz profil</Link>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">Zapisuj projektantów z katalogu, aby utworzyć tutaj krótką listę.</div>}
        </section>

        <section>
          <div>
            <div className="text-sm font-semibold text-primary">Zespoły warte uwagi</div>
            <h2 className="mt-1 text-3xl font-bold">Zapisane pracownie</h2>
          </div>
          {studios.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {studios.map((studio) => (
                <article key={studio.id} className="rounded-lg border border-line bg-card p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link href={`/studios/${studio.id}`} className="text-xl font-bold hover:text-primary">{studio.name}</Link>
                      <div className="mt-1 text-sm text-muted">Design studio{studio.location ? ` · ${studio.location}` : ""}</div>
                    </div>
                    <FavoriteButton compact entityType="studio" entityKey={studio.id} initialSaved refreshOnChange />
                  </div>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{studio.bio || "Otwórz profil pracowni, aby zobaczyć jej zespół i wspólne portfolio."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(studio.specialties ?? []).slice(0, 3).map((specialty) => <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">{specialty}</span>)}
                  </div>
                  <Link href={`/studios/${studio.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Otwórz pracownię</Link>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">Zapisuj profile pracowni podczas porównywania zespołów.</div>}
        </section>

        <section>
          <div>
            <div className="text-sm font-semibold text-primary">Wnętrza i pomysły</div>
            <h2 className="mt-1 text-3xl font-bold">Zapisane projekty</h2>
          </div>
          {projects.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const image = project.image_url || (project.image_path ? supabase.storage.from("project-images").getPublicUrl(project.image_path).data.publicUrl : null) || fallbackProjectImage;
                return (
                  <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                    <Link href={`/projects/${project.id}`} className="block aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} aria-label={`Otwórz ${project.title || "projekt"}`} />
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/projects/${project.id}`} className="text-xl font-bold hover:text-primary">{project.title || "Projekt bez tytułu"}</Link>
                          <div className="mt-1 text-sm text-muted">{project.category || "Portfolio"} · {ownersById.get(project.profile_id) || "Projektant wnętrz"}</div>
                        </div>
                        <FavoriteButton compact entityType="project" entityKey={project.id} initialSaved refreshOnChange />
                      </div>
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted">{project.description || "Otwórz projekt, aby zobaczyć galerię i profil autora."}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">Zapisuj realizacje portfolio podczas porównywania kierunków wizualnych.</div>}
        </section>

        <section>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-primary">Pomysły, do których warto wrócić</div>
              <h2 className="mt-1 text-3xl font-bold">Zapisane inspiracje</h2>
            </div>
            <Link href="/inspiration" className="text-sm font-semibold text-primary hover:underline">Odkrywaj Inspiration Hub</Link>
          </div>
          {articles.length ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {articles.map((article) => (
                <article key={article.id} className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
                  <Link href={`/inspiration/${article.slug}`} className="block aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: article.image_url ? `url(${article.image_url})` : undefined }} aria-label={`Otwórz ${article.title}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-primary">{article.category}</span>
                        <Link href={`/inspiration/${article.slug}`} className="mt-1 block text-xl font-bold hover:text-primary">{article.title}</Link>
                      </div>
                      <FavoriteButton compact entityType="article" entityKey={article.id} initialSaved refreshOnChange />
                    </div>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{article.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-6 text-muted">Zapisuj artykuły z Inspiration Hub, aby zachować tutaj przydatne pomysły.</div>}
        </section>
      </section>
    </main>
  );
}
