import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FavoriteButton from "@/components/FavoriteButton";
import ProjectGallery from "@/components/ProjectGallery";
import JsonLd from "@/components/JsonLd";
import { getAccountRole } from "@/lib/studios";
import {
  applyDemoProfilePresentation,
  getDemoProfilePresentation,
  getDemoProjectPresentation,
} from "@/lib/public-demo-profiles";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { professionalOptionLabel } from "@/lib/professional-options";

export const revalidate = 0;

type Profile = {
  id: string;
  full_name: string | null;
  profession_type: string | null;
  user_type: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
};

type Project = {
  id: string;
  profile_id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  project_url: string | null;
  image_url: string | null;
  image_path: string | null;
  image_urls: string[] | null;
  image_paths: string[] | null;
  created_at: string;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const projectImagesBucket = "project-images";

const fallbackProjectImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
];

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return pageMetadata({ title: "Nie znaleziono projektu", description: "Ten projekt wnętrza nie jest dostępny.", path: `/projects/${id}`, noIndex: true });
  }
  const supabase = createPublicSupabaseClient();
  const { data: project } = await supabase
    .from("projects")
    .select("title, description, category, image_url, image_urls, profile_id")
    .eq("id", id)
    .maybeSingle();
  if (!project) {
    return pageMetadata({ title: "Nie znaleziono projektu", description: "Ten projekt wnętrza nie jest dostępny.", path: `/projects/${id}`, noIndex: true });
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, location")
    .eq("id", project.profile_id)
    .maybeSingle();
  const title = project.title || "Projekt wnętrza";
  const byline = profile?.full_name ? ` · ${profile.full_name}` : "";
  const location = profile?.location ? ` · ${profile.location}` : "";
  return pageMetadata({
    title: `${title}${byline}${location}`,
    description: project.description || `Zobacz projekt, galerię i profil autora w ArchiCompass. Kategoria: ${project.category ? professionalOptionLabel(project.category) : "projektowanie wnętrz"}.`,
    path: `/projects/${id}`,
    image: project.image_url || project.image_urls?.[0] || null,
    type: "article",
  });
}

function publicImageUrl(supabase: SupabaseServerClient, imagePath: string | null) {
  if (!imagePath) return null;
  const { data } = supabase.storage.from(projectImagesBucket).getPublicUrl(imagePath);
  return data.publicUrl;
}

function hydrateProjectImages(supabase: SupabaseServerClient, project: Project) {
  const imageUrls =
    project.image_urls?.length
      ? project.image_urls
      : project.image_paths?.length
        ? project.image_paths
            .map((path) => publicImageUrl(supabase, path))
            .filter((url): url is string => Boolean(url))
        : project.image_url
          ? [project.image_url]
          : project.image_path
            ? [publicImageUrl(supabase, project.image_path)].filter(
                (url): url is string => Boolean(url)
              )
            : [];

  return {
    ...project,
    image_urls: imageUrls,
    image_url:
      project.image_url ||
      publicImageUrl(supabase, project.image_path) ||
      imageUrls[0] ||
      null,
  };
}

function projectGallery(project: Project) {
  const urls = project.image_urls?.filter(Boolean) ?? [];
  if (urls.length) return urls.slice(0, 30);
  if (project.image_url) return [project.image_url];
  return [fallbackProjectImages[0]];
}

function profileTitle(profile: Profile | null) {
  return profile?.full_name || "Projektant ArchiCompass";
}

function profileType(profile: Profile | null) {
  return profile?.profession_type === "Studio" ? "Pracownia projektowa" : "Projektant wnętrz";
}

function websiteHref(value: string | null | undefined) {
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || !isUuid(id)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const viewerRole = userData.user
    ? await getAccountRole(supabase, userData.user.id)
    : "client";
  const canSendBrief = !userData.user || viewerRole === "client";

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, profile_id, title, category, description, project_url, image_url, image_path, image_urls, image_paths, created_at"
    )
    .eq("id", id)
    .single();

  if (projectError || !projectData) {
    notFound();
  }

  let project = hydrateProjectImages(supabase, projectData as Project);
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, profession_type, user_type, location, email, phone, website")
    .eq("id", project.profile_id)
    .single();

  const profile = profileData
    ? applyDemoProfilePresentation(profileData as Profile)
    : null;
  const demo = getDemoProfilePresentation(project.profile_id);
  const demoProject = getDemoProjectPresentation(project.profile_id, project.id);
  if (demoProject) {
    project = { ...project, ...demoProject, project_url: null };
  }
  const isOwner = userData.user?.id === project.profile_id;
  const { data: favoriteData } = userData.user
    ? await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("entity_type", "project")
        .eq("entity_key", project.id)
        .maybeSingle()
    : { data: null };
  const title = project.title || "Projekt bez tytułu";
  const designerName = profileTitle(profile);
  const designerWebsite = websiteHref(profile?.website);
  const gallery = projectGallery(project);

  return (
    <main className="bg-background">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Strona główna", path: "/" },
            { name: "Katalog Projektantów", path: "/designers" },
            { name: designerName, path: `/designers/${project.profile_id}` },
            { name: title, path: `/projects/${project.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "@id": absoluteUrl(`/projects/${project.id}#project`),
            name: title,
            url: absoluteUrl(`/projects/${project.id}`),
            description: project.description || undefined,
            image: gallery,
            genre: project.category ? professionalOptionLabel(project.category) : "Projektowanie wnętrz",
            dateCreated: project.created_at,
            creator: {
              "@type": "Person",
              name: designerName,
              url: absoluteUrl(`/designers/${project.profile_id}`),
            },
          },
        ]}
      />
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/designers/${project.profile_id}#portfolio`}
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
            >
              Wróć do portfolio projektanta
            </Link>
            {isOwner ? (
              <Link
                href="/account/projects"
                className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
              >
                Zarządzaj tym projektem
              </Link>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">
                {project.category ? professionalOptionLabel(project.category) : "Projekt portfolio"}
              </div>
              {demo ? (
                <div className="mt-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  Przykładowy projekt portfolio
                </div>
              ) : null}
              <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {project.description ||
                  "Publiczna strona projektu w ArchiCompass z galerią, informacjami o autorze i kontekstem realizacji."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">Informacje o projekcie</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-line bg-card p-3">
                  <div className="text-muted">Zdjęcia</div>
                  <div className="mt-1 text-xl font-bold">{gallery.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <div className="text-muted">Kategoria</div>
                  <div className="mt-1 truncate font-bold">
                    {project.category ? professionalOptionLabel(project.category) : "Portfolio"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-7">
          <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
            <ProjectGallery
              category={project.category ? professionalOptionLabel(project.category) : "Portfolio"}
              description={project.description}
              images={gallery}
              title={title}
            />
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-primary">Historia projektu</div>
            <h2 className="mt-1 text-3xl font-bold">Szczegóły</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
              {project.description ||
                "Ten projekt może zostać uzupełniony o brief, cele, materiały, rodzaj pomieszczeń, zakres i opis efektu dla klienta."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {project.project_url ? (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Otwórz zewnętrzną stronę projektu
                </a>
              ) : null}
              <Link
                href={`/designers/${project.profile_id}#portfolio`}
                className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Zobacz portfolio projektanta
              </Link>
            </div>
          </section>
        </div>

        <aside
          id="designer"
          className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24"
        >
          <div className="text-sm font-semibold text-primary">Projektant</div>
          <h2 className="mt-2 text-2xl font-bold">{designerName}</h2>
          <p className="mt-1 text-muted">{profileType(profile)}</p>

          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <span className="text-muted">Lokalizacja</span>
              <span className="truncate text-right font-semibold">
                {profile?.location || "Zdalnie / lokalizacja do ustalenia"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <span className="text-muted">Projekt</span>
              <span className="truncate text-right font-semibold">
                {project.category ? professionalOptionLabel(project.category) : "Portfolio"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted">Udostępnianie</span>
              <span className="font-semibold">Skopiuj adres tej strony</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href={`/designers/${project.profile_id}`}
              className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Otwórz profil projektanta
            </Link>
            {isOwner ? (
              <Link
                href="/account/projects"
                className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Edytuj w swoim koncie
              </Link>
            ) : (
              <>
                <FavoriteButton
                  entityType="project"
                  entityKey={project.id}
                  initialSaved={Boolean(favoriteData)}
                />
                {canSendBrief ? (
                  <Link
                    href={`/account/briefs?designer=${project.profile_id}`}
                    className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Wyślij brief projektantowi
                  </Link>
                ) : (
                  <div className="rounded-lg border border-line bg-background p-4 text-sm leading-6 text-muted">
                    Konta projektantów otrzymują briefy i nie mogą wysyłać zapytań klientów.
                  </div>
                )}
              </>
            )}
            {designerWebsite ? (
              <a
                href={designerWebsite}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Otwórz stronę internetową
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
