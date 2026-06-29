import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ProjectGallery from "@/components/ProjectGallery";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import {
  applyDemoProfilePresentation,
  getDemoProfilePresentation,
  getDemoProjectPresentation,
} from "@/lib/public-demo-profiles";

export const revalidate = 0;

type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
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

const fallbackHeroImages = [
  "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=80",
];

const fallbackProjectImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
];

const activeFilterClass =
  "rounded-full bg-primary px-3 py-1 text-sm font-semibold text-white";
const inactiveFilterClass =
  "rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted transition hover:border-primary hover:text-primary";

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

function profileTitle(profile: Profile) {
  return profile.full_name || "Unnamed professional";
}

function profileType(profile: Profile) {
  return profile.profession_type || profile.user_type || "Professional";
}

function profileLocation(profile: Profile) {
  return profile.location || "Remote / location on request";
}

function initials(name: string) {
  const parts = name
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) return "AC";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function hashIndex(value: string, length: number) {
  const total = value.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return total % length;
}

function heroImage(profileId: string, projects: Project[]) {
  const projectImage = projects.find((project) => project.image_url)?.image_url;
  return projectImage || fallbackHeroImages[hashIndex(profileId, fallbackHeroImages.length)];
}

function projectGallery(project: Project, index: number) {
  const urls = project.image_urls?.filter(Boolean) ?? [];
  if (urls.length) return urls.slice(0, 12);
  if (project.image_url) return [project.image_url];
  return [fallbackProjectImages[index % fallbackProjectImages.length]];
}

function publicImageUrl(supabase: SupabaseServerClient, imagePath: string | null) {
  if (!imagePath) return null;
  const { data } = supabase.storage.from(projectImagesBucket).getPublicUrl(imagePath);
  return data.publicUrl;
}

function experienceLabel(value: number | null) {
  if (!value) return "Not provided";
  return value === 1 ? "1 year experience" : `${value}+ years experience`;
}

function rateLabel(rate: number | null) {
  return rate ? `${rate} PLN/hour` : "Rate on request";
}

function portfolioHref(profileId: string, category?: string) {
  return category
    ? `/designers/${profileId}?category=${encodeURIComponent(category)}#portfolio`
    : `/designers/${profileId}#portfolio`;
}

function websiteHref(value: string | null) {
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function contactLabel(profile: Profile) {
  if (profile.email) return profile.email;
  if (profile.phone) return profile.phone;
  if (profile.website) return profile.website;
  return "Shared after a brief is sent";
}

function briefRequestHref(profileId: string) {
  return `/account/briefs?designer=${encodeURIComponent(profileId)}`;
}

function serviceCards(profile: Profile) {
  const type = profileType(profile);
  const specialties = profile.specialties?.filter(Boolean) ?? [];
  const primaryStyle = specialties[0] || "Tailored interiors";
  const secondaryStyle = specialties[1] || "Project planning";

  return [
    {
      title: `${type} Consultation`,
      copy: "Clarify the brief, budget, scope, and the best path before starting a full project.",
      price: rateLabel(profile.hourly_rate),
    },
    {
      title: `${primaryStyle} Concept`,
      copy: "Turn references and needs into a coherent visual direction, moodboard, and room strategy.",
      price: profile.hourly_rate ? `from ${profile.hourly_rate} PLN/hour` : "Quote-based",
    },
    {
      title: `${secondaryStyle} Support`,
      copy: "Get practical help with layout decisions, materials, priorities, and next-step planning.",
      price: "Custom quote",
    },
  ];
}

function EmptyProfileState({
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
            Back to Designers
          </Link>
        </div>
      </section>
    </main>
  );
}

export default async function DesignerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ category?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};

  if (!id || !isUuid(id)) {
    return (
      <EmptyProfileState
        title="Invalid profile"
        message="This designer profile link has an invalid format."
      />
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const isOwner = userData.user?.id === id;

  const { data: profileData, error: pErr } = await supabase
    .from("profiles")
    .select(
      "id, full_name, bio, location, profession_type, user_type, specialties, website, phone, email, hourly_rate, years_experience"
    )
    .eq("id", id)
    .single();

  if (pErr || !profileData) {
    return (
      <EmptyProfileState
        title="Profile not found"
        message={pErr?.message ?? "No public profile data was found for this designer."}
      />
    );
  }

  const profile = applyDemoProfilePresentation(profileData as Profile);
  const demo = getDemoProfilePresentation(profile.id);

  const { data: projectsData, error: prErr } = await supabase
    .from("projects")
    .select("id, profile_id, title, category, description, project_url, image_url, image_path, image_urls, image_paths, created_at")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(24);

  const projects = ((projectsData ?? []) as Project[]).map((project) => {
    const publicProject = {
      ...project,
      image_urls:
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
                : [],
      image_url:
        project.image_url ||
        publicImageUrl(supabase, project.image_path) ||
        project.image_urls?.[0] ||
        null,
    };
    const demoCopy = getDemoProjectPresentation(profile.id, project.id);
    return demoCopy
      ? { ...publicProject, ...demoCopy, project_url: null }
      : publicProject;
  });
  const title = profileTitle(profile);
  const type = profileType(profile);
  const location = profileLocation(profile);
  const specialties = profile.specialties?.filter(Boolean).slice(0, 10) ?? [];
  const webHref = websiteHref(profile.website);
  const profileHero = heroImage(profile.id, projects);
  const categoryFilters = Array.from(
    new Set(projects.map((project) => project.category).filter(Boolean))
  ) as string[];
  const requestedCategory =
    typeof sp.category === "string" && sp.category.trim() ? sp.category.trim() : null;
  const selectedCategory =
    requestedCategory && categoryFilters.includes(requestedCategory)
      ? requestedCategory
      : null;
  const visibleProjects = selectedCategory
    ? projects.filter((project) => project.category === selectedCategory)
    : projects;
  const portfolioCountText = selectedCategory
    ? `${visibleProjects.length} of ${projects.length} projects`
    : `${projects.length} project${projects.length === 1 ? "" : "s"}`;

  return (
    <main className="bg-background pb-28 lg:pb-0">
      <ProfileViewTracker disabled={isOwner} profileId={profile.id} />
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Link
          href="/designers"
          className="inline-flex rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
        >
          Back to Designers
        </Link>

        <div
          className="mt-5 min-h-[360px] overflow-hidden rounded-2xl bg-cover bg-center shadow-sm"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(31,23,42,0.76), rgba(31,23,42,0.24)), url(${profileHero})`,
          }}
        >
          <div className="flex min-h-[360px] items-end px-5 py-7 sm:px-8 lg:px-10">
            <div className="max-w-3xl text-white">
              <div className="inline-flex rounded-full bg-white/16 px-4 py-2 text-sm font-semibold backdrop-blur">
                {demo ? "Example ArchiCompass profile" : "ArchiCompass beta profile"}
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                {profile.bio ||
                  "A public professional profile for clients looking for interior design and architecture support."}
              </p>
            </div>
          </div>
        </div>

        <section className="-mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-2xl border-4 border-white bg-primary text-2xl font-bold text-white shadow">
                  {initials(title)}
                  <span className="absolute -right-3 -top-3 rounded-full border-2 border-white bg-[#fff3df] px-2 py-1 text-xs font-bold text-[#b56b08]">
                    New
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-3xl font-bold">{title}</h2>
                  <p className="mt-1 text-muted">{type}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
                      {demo ? "Demo profile" : "Early professional"}
                    </span>
                    {projects.length ? (
                      <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                        Portfolio added
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {isOwner ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  <Link
                    href="/account/profile"
                    className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
                  >
                    Edit profile
                  </Link>
                  <Link
                    href="/account/projects"
                    className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    Manage projects
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <a
                    href="#portfolio"
                    className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                  >
                    View Portfolio
                  </a>
                  <Link
                    href={briefRequestHref(profile.id)}
                    className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                  >
                    Send Brief
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Location
                </div>
                <div className="mt-1 font-semibold">{location}</div>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Experience
                </div>
                <div className="mt-1 font-semibold">
                  {experienceLabel(profile.years_experience)}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Portfolio
                </div>
                <div className="mt-1 font-semibold">
                  {projects.length} project{projects.length === 1 ? "" : "s"}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Rate
                </div>
                <div className="mt-1 font-semibold">{rateLabel(profile.hourly_rate)}</div>
              </div>
            </div>

            {specialties.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <aside
            id="contact"
            className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24"
          >
            <div className="text-sm font-semibold text-primary">Ready to start?</div>
            <h2 className="mt-2 text-2xl font-bold">Contact {title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Share your goals, timeline, and budget. The professional can then decide if
              the project is a good fit.
            </p>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <span className="text-muted">Response</span>
                <span className="font-semibold">Not yet measured</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <span className="text-muted">Contact</span>
                <span className="truncate text-right font-semibold">{contactLabel(profile)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">Languages</span>
                <span className="font-semibold">EN / PL</span>
              </div>
            </div>

            {isOwner ? (
              <div className="mt-6 grid gap-3">
                <Link
                  href="/account/profile"
                  className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  Edit public details
                </Link>
                <Link
                  href="/account/projects"
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  Add portfolio project
                </Link>
              </div>
            ) : (
              <Link
                href={briefRequestHref(profile.id)}
                className="mt-6 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <span className="w-full">Send Project Brief</span>
              </Link>
            )}

            {webHref ? (
              <a
                href={webHref}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <span className="w-full">Open Website</span>
              </a>
            ) : null}
          </aside>
        </section>
      </section>

      {isOwner ? (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            <div className="font-semibold">Owner mode</div>
            <p className="mt-1">
              You are viewing your own public profile. Use the profile and project tools
              to keep this marketplace page up to date.
            </p>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-7">
          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">About</div>
                <h2 className="mt-1 text-3xl font-bold">Design approach</h2>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                {type}
              </span>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
              {profile.bio ||
                "This professional has not added a full bio yet. The profile is ready for portfolio, service details, and client reviews as the marketplace grows."}
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Services Offered</div>
              <h2 className="mt-1 text-3xl font-bold">Ways to work together</h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {serviceCards(profile).map((service) => (
                <article
                  key={service.title}
                  className="rounded-2xl border border-line bg-background p-5"
                >
                  <h3 className="text-lg font-bold">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted">{service.copy}</p>
                  <div className="mt-5 text-sm font-semibold text-primary">
                    {service.price}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="portfolio" className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Portfolio</div>
                <h2 className="mt-1 text-3xl font-bold">Selected projects</h2>
              </div>
              <div className="text-sm font-semibold text-muted">{portfolioCountText}</div>
            </div>

            {categoryFilters.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={portfolioHref(id)}
                  aria-current={selectedCategory ? undefined : "true"}
                  className={selectedCategory ? inactiveFilterClass : activeFilterClass}
                >
                  All
                </Link>
                {categoryFilters.map((category) => (
                  <Link
                    key={category}
                    href={portfolioHref(id, category)}
                    aria-current={selectedCategory === category ? "true" : undefined}
                    className={
                      selectedCategory === category
                        ? activeFilterClass
                        : inactiveFilterClass
                    }
                  >
                    {category}
                  </Link>
                ))}
              </div>
            ) : null}

            {prErr ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <div className="font-semibold">Error loading projects</div>
                <div className="mt-1 text-sm">{prErr.message}</div>
              </div>
            ) : !projects.length ? (
              <div className="mt-5 overflow-hidden rounded-2xl border border-dashed border-line bg-background">
                <div
                  className="min-h-[220px] bg-cover bg-center"
                  style={{
                    backgroundImage: `linear-gradient(90deg, rgba(31,23,42,0.68), rgba(31,23,42,0.18)), url(${fallbackProjectImages[0]})`,
                  }}
                >
                  <div className="flex min-h-[220px] max-w-xl flex-col justify-end p-6 text-white">
                    <h3 className="text-2xl font-bold">Portfolio coming soon</h3>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      Uploaded projects will appear here as image cards with categories,
                      descriptions, and project details.
                    </p>
                    {isOwner ? (
                      <Link
                        href="/account/projects"
                        className="mt-4 w-fit rounded-xl bg-white px-4 py-3 text-sm font-semibold text-foreground"
                      >
                        Add first project
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : !visibleProjects.length ? (
              <div className="mt-5 rounded-2xl border border-dashed border-line bg-background p-6">
                <h3 className="text-xl font-bold">No projects in this category yet</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Try all projects or choose another category.
                </p>
                <Link
                  href={portfolioHref(id)}
                  className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  Show all projects
                </Link>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {visibleProjects.map((project, index) => (
                  <article
                    key={project.id}
                    className="group overflow-hidden rounded-2xl border border-line bg-background"
                  >
                    <ProjectGallery
                      category={project.category || "Portfolio"}
                      description={project.description}
                      images={projectGallery(project, index)}
                      title={project.title || "Untitled project"}
                    />
                    <div className="p-5">
                      {project.description ? (
                        <p className="text-sm leading-6 text-muted">{project.description}</p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                          View project
                        </Link>
                        {project.project_url ? (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                          >
                            Open external page
                          </a>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Reviews</div>
                <h2 className="mt-1 text-3xl font-bold">Client feedback</h2>
              </div>
              <span className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-muted">
                No public reviews yet
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="rounded-2xl border border-line bg-background p-5 text-center">
                <div className="text-5xl font-bold text-primary">Beta</div>
                <div className="mt-2 text-sm text-muted">No ratings collected</div>
              </div>
              <div className="rounded-2xl border border-dashed border-line bg-background p-5">
                <h3 className="text-lg font-bold">Reviews will appear here</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Once ArchiCompass starts collecting verified client feedback, this
                  section can show ratings, review cards, and project-specific comments.
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-primary text-white shadow-sm">
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-sm font-semibold text-white/72">
                  Need help deciding?
                </div>
                <h2 className="mt-2 text-3xl font-bold">Compare this designer with your brief</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  ArchiCompass helps clients turn taste, budget, and project type into
                  a clear brief before contacting professionals.
                </p>
              </div>
              <Link
                href="/project-compass"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-foreground"
              >
                Build project brief
              </Link>
            </div>
          </section>
        </div>

        <aside className="hidden h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24 lg:block">
          <div className="text-sm font-semibold text-primary">Profile snapshot</div>
          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-sm text-muted">Best for</div>
              <div className="mt-1 font-semibold">
                {specialties[0] || "Interior design projects"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted">Location</div>
              <div className="mt-1 font-semibold">{location}</div>
            </div>
            <div>
              <div className="text-sm text-muted">Experience</div>
              <div className="mt-1 font-semibold">
                {experienceLabel(profile.years_experience)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted">Portfolio</div>
              <div className="mt-1 font-semibold">
                {projects.length} public project{projects.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-lg font-bold">Recommended network</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Service provider recommendations will appear here once partner profiles are
              connected to designer work.
            </p>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{title}</div>
            <div className="truncate text-xs text-muted">Response time not yet measured</div>
          </div>
          {isOwner ? (
            <Link
              href="/account/projects"
              className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              Manage
            </Link>
          ) : (
            <Link
              href={briefRequestHref(profile.id)}
              className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              Send brief
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
