import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/FavoriteButton";
import GoogleRating from "@/components/GoogleRating";
import JsonLd from "@/components/JsonLd";
import ProjectGallery from "@/components/ProjectGallery";
import SocialLinks, { socialSameAs } from "@/components/SocialLinks";
import { getAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { availabilityLabel, pricingLabel, workModeLabel } from "@/lib/profile-pricing";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { localizeProfileContent, localizedProfileText } from "@/lib/localized-profile-content";
import { professionalOptionLabel } from "@/lib/professional-options";
import { serviceCapabilityLabel } from "@/lib/service-capabilities";
import { profileExperienceLabel, profileLocationLabel, profileTypeLabel } from "@/lib/profile-system-labels";
import { getStudioProfileCopy } from "@/content/studio-profile-copy";

export const revalidate = 0;

type Studio = {
  id: string;
  owner_id: string;
  name: string;
  profile_headline: string | null;
  profile_headline_pl: string | null;
  profile_headline_en: string | null;
  profile_logo_path: string | null;
  profile_banner_path: string | null;
  bio: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  location: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  website: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
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
  cooperation_terms_pl: string | null;
  cooperation_terms_en: string | null;
  years_experience: number | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
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
  bio_pl: string | null;
  bio_en: string | null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const copy = getStudioProfileCopy();
  if (!isUuid(id)) {
    return pageMetadata({ title: copy.metadata.missingTitle, description: copy.metadata.missingDescription, path: `/studios/${id}`, noIndex: true });
  }
  const supabase = createPublicSupabaseClient();
  const { data: studio } = await supabase
    .from("studios")
    .select("name, bio, bio_pl, bio_en, location")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle();
  if (!studio) {
    return pageMetadata({ title: copy.metadata.missingTitle, description: copy.metadata.missingDescription, path: `/studios/${id}`, noIndex: true });
  }
  return pageMetadata({
    title: copy.metadata.title(studio.name, studio.location),
    description: localizedProfileText(studio, "bio") || copy.metadata.description(studio.name),
    path: `/studios/${id}`,
    type: "profile",
  });
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
    .select("id, owner_id, name, profile_headline, profile_headline_pl, profile_headline_en, profile_logo_path, profile_banner_path, bio, bio_pl, bio_en, location, specialties, service_capabilities, website, instagram_url, facebook_url, behance_url, linkedin_url, phone, email, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, cooperation_terms, cooperation_terms_pl, cooperation_terms_en, years_experience, google_business_url, google_rating, google_review_count, published")
    .eq("id", id)
    .maybeSingle();
  if (!studioData) notFound();
  const studio = localizeProfileContent(studioData as Studio);

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
          .select("id, full_name, bio, bio_pl, bio_en, location, profession_type, specialties, years_experience")
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
  const profiles = ((profileData ?? []) as Profile[]).map((profile) => localizeProfileContent(profile));
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
  const favoriteKeys = [studio.id, ...projects.map((project) => project.id)];
  const { data: favoriteData } = user
    ? await supabase
        .from("favorites")
        .select("entity_type, entity_key")
        .eq("user_id", user.id)
        .in("entity_key", favoriteKeys)
    : { data: [] };
  const savedFavorites = new Set(
    (favoriteData ?? []).map((favorite) => `${favorite.entity_type}:${favorite.entity_key}`)
  );
  const website = websiteHref(studio.website);
  const hasVerifiedGoogleRating =
    typeof studio.google_rating === "number" && typeof studio.google_review_count === "number";
  const profileMediaUrl = (path: string | null) => path
    ? supabase.storage.from("profile-media").getPublicUrl(path).data.publicUrl
    : null;
  const logo = profileMediaUrl(studio.profile_logo_path);
  const hero = profileMediaUrl(studio.profile_banner_path) || projects[0]?.image_url || fallbackImage;
  const totalExperience = profiles.reduce(
    (maximum, profile) => Math.max(maximum, profile.years_experience ?? 0),
    studio.years_experience ?? 0
  );
  const copy = getStudioProfileCopy();

  return (
    <main className="bg-background pb-24 lg:pb-0">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: copy.metadata.home, path: "/" },
            { name: copy.metadata.directory, path: "/designers" },
            { name: studio.name, path: `/studios/${studio.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": ["Organization", "ProfessionalService"],
            "@id": absoluteUrl(`/studios/${studio.id}#studio`),
            name: studio.name,
            url: absoluteUrl(`/studios/${studio.id}`),
            image: hero,
            description: studio.bio || undefined,
            areaServed: studio.location
              ? { "@type": "Place", name: studio.location }
              : undefined,
            knowsAbout: studio.specialties || [],
            sameAs: [
              website,
              studio.google_business_url,
              ...socialSameAs({
                instagramUrl: studio.instagram_url,
                facebookUrl: studio.facebook_url,
                behanceUrl: studio.behance_url,
                linkedinUrl: studio.linkedin_url,
              }),
            ].filter(Boolean),
            employee: visibleMembers.map((member) => {
              const memberProfile = profilesById.get(member.user_id);
              return {
                "@type": "Person",
                name: memberProfile?.full_name || copy.labels.interiorDesigner,
                url: absoluteUrl(`/designers/${member.user_id}`),
              };
            }),
          },
        ]}
      />
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Link href="/designers" className="inline-flex rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
          {copy.labels.back}
        </Link>

        <div
          className="mt-5 min-h-[380px] overflow-hidden rounded-lg bg-cover bg-center shadow-sm"
          style={{ backgroundImage: `linear-gradient(90deg, rgba(31,23,42,0.82), rgba(31,23,42,0.28)), url(${hero})` }}
        >
          <div className="flex min-h-[380px] items-end p-6 text-white sm:p-10">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">{copy.labels.studioType}</span>
              <h1 className="mt-5 text-4xl font-bold sm:text-6xl">{studio.name}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                {studio.profile_headline || `${copy.labels.studioType}${studio.location ? ` · ${profileLocationLabel(studio.location)}` : ""}`}
              </p>
            </div>
          </div>
        </div>

        <section className="-mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                {logo ? (
                  <Image src={logo} alt={`${studio.name} logo`} width={72} height={72} unoptimized className="h-18 w-18 rounded-xl border border-line object-cover" />
                ) : null}
                <div>
                <div className="text-sm font-semibold text-primary">{copy.labels.profile}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.labels.teamHeading(visibleMembers.length)}</h2>
                <p className="mt-3 text-muted">{studio.location ? profileLocationLabel(studio.location) : copy.labels.remoteLocation}</p>
                </div>
              </div>
              {isMember ? (
                <Link href="/studio/team" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">{copy.labels.manageStudio}</Link>
              ) : (
                <FavoriteButton entityType="studio" entityKey={studio.id} initialSaved={savedFavorites.has(`studio:${studio.id}`)} />
              )}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-background p-4"><div className="text-sm text-muted">{copy.labels.team}</div><div className="mt-1 text-xl font-bold">{visibleMembers.length}</div></div>
              <div className="rounded-lg border border-line bg-background p-4"><div className="text-sm text-muted">{copy.labels.projects}</div><div className="mt-1 text-xl font-bold">{projects.length}</div></div>
              <div className="rounded-lg border border-line bg-background p-4"><div className="text-sm text-muted">{copy.labels.experience}</div><div className="mt-1 text-xl font-bold">{totalExperience ? profileExperienceLabel(totalExperience) : copy.labels.onRequest}</div></div>
            </div>
            {studio.specialties?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {studio.specialties.map((specialty) => <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">{professionalOptionLabel(specialty)}</span>)}
              </div>
            ) : null}
            {studio.service_capabilities?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {studio.service_capabilities.map((capability) => <span key={capability} className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted">{serviceCapabilityLabel(capability)}</span>)}
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
            <div className="text-sm font-semibold text-primary">{copy.labels.sharedInbox}</div>
            <h2 className="mt-2 text-2xl font-bold">{copy.labels.contactHeading(studio.name)}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {copy.labels.contactBody}
            </p>
            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">{copy.labels.price}</span><span className="text-right font-semibold">{pricingLabel(studio)}</span></div>
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">{copy.labels.availability}</span><span className="text-right font-semibold">{studio.availability_status ? availabilityLabel(studio.availability_status) : copy.labels.onRequest}</span></div>
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">{copy.labels.workMode}</span><span className="text-right font-semibold">{studio.work_modes?.map((mode) => workModeLabel(mode)).join(" · ") || copy.labels.onRequest}</span></div>
              <div className="flex justify-between gap-4 border-b border-line pb-3"><span className="text-muted">{copy.labels.minimumBudget}</span><span className="text-right font-semibold">{studio.minimum_project_budget ? `${studio.minimum_project_budget} PLN` : copy.labels.onRequest}</span></div>
              <div className="flex justify-between gap-4"><span className="text-muted">{copy.labels.contact}</span><span className="truncate font-semibold">{studio.email || studio.phone || copy.labels.throughBrief}</span></div>
            </div>
            {hasVerifiedGoogleRating ? (
              <div className="mt-5">
                <GoogleRating rating={studio.google_rating} count={studio.google_review_count} url={studio.google_business_url} />
              </div>
            ) : null}
            {studio.cooperation_terms ? <div className="mt-5 rounded-lg border border-line bg-background p-4"><div className="text-sm font-semibold text-primary">{copy.labels.terms}</div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{studio.cooperation_terms}</p></div> : null}
            {isMember ? (
              <Link href="/studio/inbox" className="mt-6 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"><span className="w-full">{copy.labels.openInbox}</span></Link>
            ) : viewerRole === "client" ? (
              <Link href={briefRequestHref(studio.id, selectedBriefId)} className="mt-6 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"><span className="w-full">{copy.labels.sendBrief}</span></Link>
            ) : (
              <div className="mt-6 rounded-lg border border-line bg-background p-4 text-sm leading-6 text-muted">{copy.labels.designerNotice}</div>
            )}
            {website ? <a href={website} target="_blank" rel="noreferrer" className="mt-3 flex rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold"><span className="w-full">{copy.labels.openWebsite}</span></a> : null}
            <div className="mt-4">
              <SocialLinks
                behanceUrl={studio.behance_url}
                facebookUrl={studio.facebook_url}
                instagramUrl={studio.instagram_url}
                linkedinUrl={studio.linkedin_url}
              />
            </div>
          </aside>
        </section>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6">
        {studio.bio ? (
          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-primary">{copy.labels.about}</div>
            <h2 className="mt-1 text-3xl font-bold">{copy.labels.designApproach}</h2>
            <p className="mt-5 max-w-4xl whitespace-pre-line text-base leading-8 text-muted">{studio.bio}</p>
          </section>
        ) : null}
        <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
          <div className="text-sm font-semibold text-primary">{copy.labels.studioTeam}</div>
          <h2 className="mt-1 text-3xl font-bold">{copy.labels.connectedDesigners}</h2>
          {visibleMembers.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleMembers.map((member) => {
                const profile = profilesById.get(member.user_id)!;
                return (
                  <article key={member.user_id} className="rounded-lg border border-line bg-background p-5">
                    <div className="text-xs font-semibold uppercase text-primary">{member.role}</div>
                    <h3 className="mt-2 text-xl font-bold">{profile.full_name || copy.labels.interiorDesigner}</h3>
                    <p className="mt-1 text-sm text-muted">{profileTypeLabel(profile.profession_type) || copy.labels.designer}{profile.location ? ` · ${profileLocationLabel(profile.location)}` : ""}</p>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">{profile.bio || copy.labels.memberBioFallback}</p>
                    <Link href={`/designers/${profile.id}${selectedBriefId ? `?brief=${encodeURIComponent(selectedBriefId)}` : ""}`} className="mt-5 inline-flex rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary">{copy.labels.openDesigner}</Link>
                  </article>
                );
              })}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-background p-6 text-muted">{copy.labels.teamEmpty}</div>}
        </section>

        <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
          <div className="flex items-end justify-between gap-4">
            <div><div className="text-sm font-semibold text-primary">{copy.labels.sharedPortfolio}</div><h2 className="mt-1 text-3xl font-bold">{copy.labels.teamProjects}</h2></div>
            <div className="text-sm font-semibold text-muted">{copy.labels.projectCount(projects.length)}</div>
          </div>
          {projects.length ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const designer = profilesById.get(project.profile_id);
                return (
                  <article key={project.id} className="overflow-hidden rounded-lg border border-line bg-background">
                    <ProjectGallery category={project.category ? professionalOptionLabel(project.category) : copy.labels.projects} description={project.description} images={project.image_urls ?? [fallbackImage]} title={project.title || copy.labels.untitledProject} />
                    <div className="p-5">
                      <div className="text-sm text-muted">{copy.labels.author(designer?.full_name || copy.labels.memberProjectAuthor)}</div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link href={`/projects/${project.id}`} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">{copy.labels.viewProject}</Link>
                        <FavoriteButton entityType="project" entityKey={project.id} initialSaved={savedFavorites.has(`project:${project.id}`)} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <div className="mt-5 rounded-lg border border-dashed border-line bg-background p-6 text-muted">{copy.labels.projectsEmpty}</div>}
        </section>
      </section>
    </main>
  );
}
