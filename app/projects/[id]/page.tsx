import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FavoriteButton from "@/components/FavoriteButton";
import ProjectGallery from "@/components/ProjectGallery";
import {
  applyDemoProfilePresentation,
  getDemoProfilePresentation,
  getDemoProjectPresentation,
} from "@/lib/public-demo-profiles";

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
  if (urls.length) return urls.slice(0, 12);
  if (project.image_url) return [project.image_url];
  return [fallbackProjectImages[0]];
}

function profileTitle(profile: Profile | null) {
  return profile?.full_name || "ArchiCompass professional";
}

function profileType(profile: Profile | null) {
  return profile?.profession_type || profile?.user_type || "Professional";
}

function websiteHref(value: string | null | undefined) {
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function EmptyProjectState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-line bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-3 text-muted">{message}</p>
          <Link
            className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            href="/designers"
          >
            Browse designers
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || !isUuid(id)) {
    return (
      <EmptyProjectState
        title="Invalid project link"
        message="This project link has an invalid format."
      />
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();

  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .select(
      "id, profile_id, title, category, description, project_url, image_url, image_path, image_urls, image_paths, created_at"
    )
    .eq("id", id)
    .single();

  if (projectError || !projectData) {
    return (
      <EmptyProjectState
        title="Project not found"
        message={projectError?.message ?? "No public project data was found for this link."}
      />
    );
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
  const title = project.title || "Untitled project";
  const designerName = profileTitle(profile);
  const designerWebsite = websiteHref(profile?.website);
  const gallery = projectGallery(project);

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/designers/${project.profile_id}#portfolio`}
              className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
            >
              Back to designer portfolio
            </Link>
            {isOwner ? (
              <Link
                href="/account/projects"
                className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
              >
                Manage this project
              </Link>
            ) : null}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">
                {project.category || "Portfolio project"}
              </div>
              {demo ? (
                <div className="mt-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                  Example portfolio project
                </div>
              ) : null}
              <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {project.description ||
                  "A public ArchiCompass project page with gallery, designer details, and sharing-ready project context."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">Project snapshot</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-line bg-card p-3">
                  <div className="text-muted">Photos</div>
                  <div className="mt-1 text-xl font-bold">{gallery.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-card p-3">
                  <div className="text-muted">Category</div>
                  <div className="mt-1 truncate font-bold">
                    {project.category || "Portfolio"}
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
              category={project.category || "Portfolio"}
              description={project.description}
              images={gallery}
              title={title}
            />
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-primary">Project story</div>
            <h2 className="mt-1 text-3xl font-bold">Details</h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
              {project.description ||
                "This project is ready for more context: brief, goals, materials, room type, scope, and what changed for the client."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {project.project_url ? (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  Open external project page
                </a>
              ) : null}
              <Link
                href={`/designers/${project.profile_id}#portfolio`}
                className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                View designer portfolio
              </Link>
            </div>
          </section>
        </div>

        <aside
          id="designer"
          className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24"
        >
          <div className="text-sm font-semibold text-primary">Designer</div>
          <h2 className="mt-2 text-2xl font-bold">{designerName}</h2>
          <p className="mt-1 text-muted">{profileType(profile)}</p>

          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <span className="text-muted">Location</span>
              <span className="truncate text-right font-semibold">
                {profile?.location || "Remote / location on request"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
              <span className="text-muted">Project</span>
              <span className="truncate text-right font-semibold">
                {project.category || "Portfolio"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted">Share</span>
              <span className="font-semibold">Use this page URL</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <Link
              href={`/designers/${project.profile_id}`}
              className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Open designer profile
            </Link>
            {isOwner ? (
              <Link
                href="/account/projects"
                className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Edit in account
              </Link>
            ) : (
              <>
                <FavoriteButton
                  entityType="project"
                  entityKey={project.id}
                  initialSaved={Boolean(favoriteData)}
                />
                <Link
                  href={`/account/briefs?designer=${project.profile_id}`}
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Send brief to designer
                </Link>
              </>
            )}
            {designerWebsite ? (
              <a
                href={designerWebsite}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                Open website
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
