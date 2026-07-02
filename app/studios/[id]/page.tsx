import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import ProjectGallery from "@/components/ProjectGallery";
import { countLabel } from "@/lib/count-label";
import { getAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { pricingLabel } from "@/lib/profile-pricing";

export const revalidate = 0;

type Studio = {
  id: string;
  owner_id: string;
  name: string;
  bio: string | null;
  location: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  cooperation_terms: string | null;
  years_experience: number | null;
  published: boolean;
};

type Member = {
  user_id: string;
  role: "owner" | "admin" | "designer";
};

type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  specialties: string[] | null;
  years_experience: number | null;
};

type Project = {
  id: string;
  profile_id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  image_urls: string[] | null;
  image_paths: string[] | null;
  created_at: string;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=80";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function websiteHref(value: string | null) {
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function briefRequestHref(studioId: string, briefId: string) {
  const params = new URLSearchParams({ studio: studioId });
  if (briefId) params.set("brief", briefId);
  return `/account/briefs?${params.toString()}`;
}

export default async function PublicStudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ brief?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const selectedBriefId = typeof sp.brief === "string" && isUuid(sp.brief) ? sp.brief : "";
  if (!isUuid(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: studioData } = await supabase
    .from("studios")
    .select("id, owner_id, name, bio, location, specialties, service_capabilities, website, phone, email, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, cooperation_terms, years_experience, published")
    .eq("id", id)
    .maybeSingle();
  if (!studioData) notFound();
  const studio = studioData as Studio;

  const { data: memberData } = await supabase
    .from("studio_members")
    .select("user_id, role")
    .eq("studio_id", studio.id)
    .eq("status", "active");
  const members = (memberData ?? []) as Member[];
  const memberIds = members.map((member) => member.user_id);

  const [{ data: profileData }, { data: projectData }] = await Promise.all([
    memberIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, bio, location, profession_type, specialties, years_experience")
          .in("id", memberIds)
      : Promise.resolve({ data: [] }),
    memberIds.length
      ? supabase
          .from("projects")
          .select("id, profile_id, title, category, description, image_url, image_path, image_urls, image_paths, created_at")
          .in("profile_id", memberIds)
          .order("created_at", { ascending: false })
          .limit(36)
      : Promise.resolve({ data: [] }),
  ]);
  const profiles = (profileData ?? []) as Profile[];
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const visibleMembers = members.filter((member) => profilesById.has(member.user_id));

  const projects = ((projectData ?? []) as Project[]).map((project) => {
    const pathUrls = (project.image_paths ?? []).map(
      (path) => supabase.storage.from("project-images").getPublicUrl(path).data.publicUrl
    );
    const singlePathUrl = project.image_path
      ? supabase.storage.from("project-images").getPublicUrl(project.image_path).data.publicUrl
      : null;
    const images = project.image_urls?.length
      ? project.image_urls
      : pathUrls.length
        ? pathUrls
        : project.image_url
          ? [project.image_url]
          : singlePathUrl
            ? [singlePathUrl]
            : [fallbackImage];
    return { ...project, image_urls: images, image_url: images[0] ?? fallbackImage };
  });

  const memberIdSet = new Set(memberIds);
  const isMember = Boolean(user && memberIdSet.has(user.id));
  const viewerRole = user ? await getAccountRole(supabase, user.id) : "client";
  const { data: favoriteData } = user
    ? await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("entity_type", "studio")
        .eq("entity_key", studio.id)
        .maybeSingle()
    : { data: null };
  const website = websiteHref(studio.website);
  const hero = projects[0]?.image_url || fallbackImage;
  const totalExperience = profiles.reduce(
    (maximum, profile) => Math.max(maximum, profile.years_experience ?? 0),
    studio.years_experience ?? 0
  );

  return (
    <main className="bg-background pb-24 lg:pb-0">
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Link href="/designers" className="inline-flex rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
          Back to Find Designer
        </Link>

        <div
          className="mt-5 min-h-[380px] overflow-hidden rounded-lg bg-cover bg-center shadow-sm"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(31,23,42,0.82), rgba(31,23,42,0.28)), url(${hero})` }}
        >
          <div className="flex min-h-[380px] items-end p-6 text-white sm:p-10">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">Design studio</span>
              <h1 className="mt-5 text-4xl font-bold sm:text-6xl">{studio.name}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                {studio.bio || "A collaborative ArchiCompass studio profile bringing together designers, shared projects, and one client conversation space."}
              </p>
            </div>
          </div>
        </div>

        <section className="-mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Verified structure</div>
                <h2 className="mt-1 text-3xl font-bold">One studio, {countLabel(visibleMembers.length, "designer")}</h2>
                <p className="mt-3 text-muted">{studio.location || "Remote / location on request"}</p>
              </div>
              {isMember ? (
                <Link href="/studio/team" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">Manage studio</Link>
              ) : (
                <FavoriteButton entityType="studio" entityKey={studio.id} initialSaved={Boolean(favoriteData)} />
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-background p-4"><div className="text-sm text-muted">Team</div><div className="mt-1 text-xl font-bold">{visibleMembers.length}</div></div>
              <div className="rounded-lg border border-line bg-background p-4"><div className="text-sm text-muted">Projects</div><div className="mt-1 text-xl font-bold">{projects.length}</div></div>
              <div className="rounded-lg border border-line bg-background p-4"><div className="text-sm text-muted">Experience</div><div className="mt-1 text-xl font-bold">{totalExperience ? `${totalExperience}+ years` : "On request"}</div></div>
            </div>
            {studio.specialties?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {studio.specialties.map((specialty) => <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{specialty}</span>)}
              </div>
            ) : null}
            {studio.service_capabilities?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {studio.service_capabilities.map((capability) => <span key={capability} className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted">{capability}</span>)}
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
            <div className="text-sm font-semibold text-primary">Shared studio inbox</div>
            <h2 className="mt-2 text-2xl font-bold">Contact {studio.name}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Your brief reaches the studio team. Every active member can review the
              context and continue the same conversation.
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">Pricing</span><span className="text-right font-semibold">{pricingLabel(studio)}</span></div>
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">Availability</span><span className="text-right font-semibold">{studio.availability_status || "On request"}</span></div>
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">Work format</span><span className="text-right font-semibold">{studio.work_modes?.join(" · ") || "On request"}</span></div>
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">Minimum project</span><span className="text-right font-semibold">{studio.minimum_project_budget ? `${studio.minimum_project_budget} PLN` : "Not specified"}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted">Contact</span><span className="truncate font-semibold">{studio.email || studio.phone || "Via brief"}</span></div>
            </div>
            {studio.cooperation_terms ? <div className="mt-5 rounded-lg border border-line bg-background p-4"><div className="text-sm font-semibold text-primary">Cooperation terms</div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{studio.cooperation_terms}</p></div> : null}
            {isMember ? (
              <Link href="/studio/inbox" className="mt-6 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"><span className="w-full">Open team inbox</span></Link>
            ) : viewerRole === "client" ? (
              <Link href={briefRequestHref(studio.id, selectedBriefId)} className="mt-6 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"><span className="w-full">Send brief to studio</span></Link>
            ) : (
              <div className="mt-6 rounded-lg border border-line bg-background p-4 text-sm leading-6 text-muted">Designer accounts receive briefs and cannot send client requests.</div>
            )}
            {website ? <a href={website} target="_blank" rel="noreferrer" className="mt-3 flex rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold"><span className="w-full">Open website</span></a> : null}
          </aside>
        </section>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6">
        <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
          <div className="text-sm font-semibold text-primary">Studio team</div>
          <h2 className="mt-1 text-3xl font-bold">Connected designers</h2>
          {visibleMembers.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleMembers.map((member) => {
                const profile = profilesById.get(member.user_id)!;
                return (
                  <article key={member.user_id} className="rounded-lg border border-line bg-background p-5">
                    <div className="text-xs font-semibold uppercase text-primary">{member.role}</div>
                    <h3 className="mt-2 text-xl font-bold">{profile.full_name || "Design professional"}</h3>
                    <p className="mt-1 text-sm text-muted">{profile.profession_type || "Designer"}{profile.location ? ` · ${profile.location}` : ""}</p>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{profile.bio || "Open the individual profile to review this designer's work and approach."}</p>
                    <Link href={`/designers/${profile.id}${selectedBriefId ? `?brief=${encodeURIComponent(selectedBriefId)}` : ""}`} className="mt-5 inline-flex rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary">Open personal profile</Link>
                  </article>
                );
              })}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-background p-6 text-muted">The studio team is preparing its public designer profiles.</div>}
        </section>

        <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div><div className="text-sm font-semibold text-primary">Combined portfolio</div><h2 className="mt-1 text-3xl font-bold">Projects from the studio team</h2></div>
            <div className="text-sm font-semibold text-muted">{countLabel(projects.length, "project")}</div>
          </div>
          {projects.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const designer = profilesById.get(project.profile_id);
                return (
                  <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-background">
                    <ProjectGallery category={project.category || "Portfolio"} description={project.description} images={project.image_urls ?? [fallbackImage]} title={project.title || "Untitled project"} />
                    <div className="p-5">
                      <div className="text-sm text-muted">By {designer?.full_name || "Studio designer"}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/projects/${project.id}`} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">View project</Link>
                        <FavoriteButton entityType="project" entityKey={project.id} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-background p-6 text-muted">Projects from active team members will appear here automatically.</div>}
        </section>
      </section>
    </main>
  );
}
