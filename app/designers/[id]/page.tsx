import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import FavoriteButton from "@/components/FavoriteButton";
import ProjectGallery from "@/components/ProjectGallery";
import ProfileViewTracker from "@/components/ProfileViewTracker";
import GoogleRating from "@/components/GoogleRating";
import JsonLd from "@/components/JsonLd";
import SocialLinks, { socialSameAs } from "@/components/SocialLinks";
import { getAccountRole } from "@/lib/studios";
import { availabilityLabel, pricingLabel, workModeLabel } from "@/lib/profile-pricing";
import { professionalOptionLabel } from "@/lib/professional-options";
import { serviceCapabilityLabel } from "@/lib/service-capabilities";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import {
  applyDemoProfilePresentation,
  getDemoProfilePresentation,
  getDemoProjectPresentation,
} from "@/lib/public-demo-profiles";
import { localizeProfileContent, localizedProfileText } from "@/lib/localized-profile-content";
import {
  profileExperienceLabel,
  profileLanguageLabel,
  profileLocationLabel,
  profileProjectCountLabel,
  profileTypeLabel,
} from "@/lib/profile-system-labels";
import { getPublicProfileCopy } from "@/content/public-profile-copy";
import { getDesignerProfileCopy } from "@/content/designer-profile-copy";

export const revalidate = 0;

type Profile = {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  profile_headline: string | null;
  profile_headline_pl: string | null;
  profile_headline_en: string | null;
  profile_logo_path: string | null;
  profile_banner_path: string | null;
  bio: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  languages: string[] | null;
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
  is_demo: boolean;
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

type StudioMembership = { studio_id: string };
type StudioLink = {
  id: string;
  name: string;
  location: string | null;
  specialties: string[] | null;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

const projectImagesBucket = "project-images";
const profileMediaBucket = "profile-media";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const copy = getDesignerProfileCopy();
  if (!isUuid(id)) {
    return pageMetadata({ title: copy.metadata.notFoundTitle, description: copy.metadata.notFoundDescription, path: `/designers/${id}`, noIndex: true });
  }
  const supabase = createPublicSupabaseClient();
  const [{ data: profile }, { data: projects }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, profile_headline, profile_headline_pl, profile_headline_en, profile_banner_path, bio, bio_pl, bio_en, location, profession_type, is_demo")
      .eq("id", id)
      .eq("user_type", "professional")
      .maybeSingle(),
    supabase
      .from("projects")
      .select("image_url, image_urls")
      .eq("profile_id", id)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);
  if (!profile) {
    return pageMetadata({ title: copy.metadata.notFoundTitle, description: copy.metadata.notFoundDescription, path: `/designers/${id}`, noIndex: true });
  }
  const demo = getDemoProfilePresentation(id);
  const name = demo?.profile.full_name || profile.full_name || copy.metadata.defaultName;
  const rawProfession = demo?.profile.profession_type || profile.profession_type;
  const profession = rawProfession ? profileTypeLabel(rawProfession) : copy.metadata.defaultProfession;
  const locationValue = demo?.profile.location || profile.location;
  const location = locationValue ? ` – ${locationValue}` : "";
  const banner = profile.profile_banner_path
    ? supabase.storage.from(profileMediaBucket).getPublicUrl(profile.profile_banner_path).data.publicUrl
    : null;
  const image = banner || projects?.[0]?.image_url || projects?.[0]?.image_urls?.[0] || null;
  return pageMetadata({
    title: `${name} – ${profession}${location}`,
    description: demo?.profile.bio || localizedProfileText(profile, "bio") || copy.metadata.defaultDescription(name),
    path: `/designers/${id}`,
    image,
    type: "profile",
    noIndex: profile.is_demo,
  });
}

function profileTitle(profile: Profile, copy = getDesignerProfileCopy()) {
  return profile.full_name || copy.defaults.untitledProfile;
}

function profileType(profile: Profile) {
  return profileTypeLabel(profile.profession_type || profile.user_type || "professional");
}

function profileLocation(profile: Profile) {
  return profileLocationLabel(profile.location);
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

function heroImage(profileId: string, projects: Project[], bannerUrl: string | null) {
  if (bannerUrl) return bannerUrl;
  const projectImage = projects.find((project) => project.image_url)?.image_url;
  return projectImage || fallbackHeroImages[hashIndex(profileId, fallbackHeroImages.length)];
}

function projectGallery(project: Project, index: number) {
  const urls = project.image_urls?.filter(Boolean) ?? [];
  if (urls.length) return urls.slice(0, 30);
  if (project.image_url) return [project.image_url];
  return [fallbackProjectImages[index % fallbackProjectImages.length]];
}

function publicImageUrl(supabase: SupabaseServerClient, imagePath: string | null) {
  if (!imagePath) return null;
  const { data } = supabase.storage.from(projectImagesBucket).getPublicUrl(imagePath);
  return data.publicUrl;
}

function profileMediaUrl(supabase: SupabaseServerClient, imagePath: string | null) {
  if (!imagePath) return null;
  return supabase.storage.from(profileMediaBucket).getPublicUrl(imagePath).data.publicUrl;
}

function portfolioHref(profileId: string, briefId: string, category?: string) {
  const params = new URLSearchParams();
  if (briefId) params.set("brief", briefId);
  if (category) params.set("category", category);
  const query = params.toString();
  return `/designers/${profileId}${query ? `?${query}` : ""}#portfolio`;
}

function websiteHref(value: string | null) {
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function contactLabel(profile: Profile, copy = getDesignerProfileCopy()) {
  if (profile.email) return profile.email;
  if (profile.phone) return profile.phone;
  if (profile.website) return profile.website;
  return copy.defaults.contactAfterBrief;
}

function briefRequestHref(profileId: string, briefId: string) {
  const params = new URLSearchParams({ designer: profileId });
  if (briefId) params.set("brief", briefId);
  return `/account/briefs?${params.toString()}`;
}

function serviceCards(profile: Profile, copy = getDesignerProfileCopy()) {
  const type = profileType(profile);
  const specialties = profile.specialties?.filter(Boolean) ?? [];
  const primaryStyle = professionalOptionLabel(specialties[0] || copy.defaults.primarySpecialty);
  const secondaryStyle = professionalOptionLabel(specialties[1] || copy.defaults.secondarySpecialty);

  return [
    {
      title: copy.services.consultation(type),
      copy: copy.services.consultationBody,
      price: pricingLabel(profile),
    },
    {
      title: copy.services.concept(primaryStyle),
      copy: copy.services.conceptBody,
      price: pricingLabel(profile),
    },
    {
      title: copy.services.support(secondaryStyle),
      copy: copy.services.supportBody,
      price: copy.services.customQuote,
    },
  ];
}

export default async function DesignerProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ brief?: string; category?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const selectedBriefId = typeof sp.brief === "string" && isUuid(sp.brief) ? sp.brief : "";

  if (!id || !isUuid(id)) {
    notFound();
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const isOwner = userData.user?.id === id;
  const viewerRole = userData.user
    ? await getAccountRole(supabase, userData.user.id)
    : "client";
  const canSendBrief = !userData.user || viewerRole === "client";

  const { data: profileData, error: pErr } = await supabase
    .from("profiles")
    .select(
      "id, avatar_url, full_name, profile_headline, profile_headline_pl, profile_headline_en, profile_logo_path, profile_banner_path, bio, bio_pl, bio_en, location, profession_type, user_type, specialties, languages, service_capabilities, website, instagram_url, facebook_url, behance_url, linkedin_url, phone, email, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, cooperation_terms, cooperation_terms_pl, cooperation_terms_en, years_experience, google_business_url, google_rating, google_review_count, is_demo"
    )
    .eq("id", id)
    .single();

  if (pErr || !profileData) {
    notFound();
  }

  if (!profileData.is_demo) {
    const { data: isDesignerAccount } = await supabase.rpc("is_designer_account", {
      target_user_id: id,
    });
    if (!isDesignerAccount) notFound();
  }

  const profile = localizeProfileContent(applyDemoProfilePresentation(profileData as Profile));

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
  const { data: studioMembershipData } = await supabase
    .from("studio_members")
    .select("studio_id")
    .eq("user_id", profile.id)
    .eq("status", "active");
  const studioIds = ((studioMembershipData ?? []) as StudioMembership[]).map(
    (membership) => membership.studio_id
  );
  const { data: studioData } = studioIds.length
    ? await supabase
        .from("studios")
        .select("id, name, location, specialties")
        .in("id", studioIds)
        .eq("published", true)
    : { data: [] };
  const studios = (studioData ?? []) as StudioLink[];
  const favoriteKeys = [profile.id, ...projects.map((project) => project.id)];
  const { data: favoriteData } = userData.user && favoriteKeys.length
    ? await supabase
        .from("favorites")
        .select("entity_type, entity_key")
        .eq("user_id", userData.user.id)
        .in("entity_key", favoriteKeys)
    : { data: [] };
  const savedFavorites = new Set(
    (favoriteData ?? []).map((item) => `${item.entity_type}:${item.entity_key}`)
  );
  const copy = getDesignerProfileCopy();
  const title = profileTitle(profile, copy);
  const profileCopy = getPublicProfileCopy();
  const type = profileType(profile);
  const location = profileLocation(profile);
  const specialties = profile.specialties?.filter(Boolean).slice(0, 10) ?? [];
  const serviceCapabilities = profile.service_capabilities?.filter(Boolean) ?? [];
  const webHref = websiteHref(profile.website);
  const hasVerifiedGoogleRating =
    typeof profile.google_rating === "number" && typeof profile.google_review_count === "number";
  const logoUrl = profileMediaUrl(supabase, profile.profile_logo_path);
  const bannerUrl = profileMediaUrl(supabase, profile.profile_banner_path);
  const profileHero = heroImage(profile.id, projects, bannerUrl);
  const heroHeadline =
    profile.profile_headline || `${type}${profile.location ? ` · ${profileLocation(profile)}` : ""}`;
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
    ? copy.portfolio.selectedCount(visibleProjects.length, projects.length)
    : profileProjectCountLabel(projects.length);

  return (
    <main className="bg-background pb-28 lg:pb-0">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: copy.metadata.home, path: "/" },
            { name: copy.metadata.directory, path: "/designers" },
            { name: title, path: `/designers/${profile.id}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Person",
            "@id": absoluteUrl(`/designers/${profile.id}#professional`),
            name: title,
            url: absoluteUrl(`/designers/${profile.id}`),
            image: profileHero,
            description: profile.bio || undefined,
            jobTitle: type,
            workLocation: profile.location
              ? { "@type": "Place", name: profile.location }
              : undefined,
            knowsAbout: specialties,
            sameAs: [
              webHref,
              profile.google_business_url,
              ...socialSameAs({
                instagramUrl: profile.instagram_url,
                facebookUrl: profile.facebook_url,
                behanceUrl: profile.behance_url,
                linkedinUrl: profile.linkedin_url,
              }),
            ].filter(Boolean),
            memberOf: studios.map((studio) => ({
              "@type": "Organization",
              name: studio.name,
              url: absoluteUrl(`/studios/${studio.id}`),
            })),
          },
        ]}
      />
      <ProfileViewTracker disabled={isOwner || profile.is_demo} profileId={profile.id} />
      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Link
          href="/designers"
          className="inline-flex rounded-full border border-line bg-card px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
        >
          {copy.navigation.backToDirectory}
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
                {profile.is_demo ? copy.badges.demoProfileLong : copy.badges.professionalProfileLong}
              </div>
              <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">
                {heroHeadline}
              </p>
            </div>
          </div>
        </div>

        <section className="mt-4 grid gap-6 lg:-mt-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-visible rounded-2xl border-4 border-white bg-primary text-2xl font-bold text-white shadow">
                  {logoUrl || profile.avatar_url ? (
                    <Image src={logoUrl || profile.avatar_url!} alt={`${title} logo`} width={72} height={72} unoptimized className="h-full w-full rounded-xl object-cover" />
                  ) : initials(title)}
                  <span className="absolute -right-3 -top-3 rounded-full border-2 border-white bg-[#fff3df] px-2 py-1 text-xs font-bold text-[#b56b08]">
                    {profile.is_demo ? copy.badges.demo : copy.badges.new}
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-3xl font-bold">{title}</h2>
                  <p className="mt-1 text-muted">{type}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
                      {profile.is_demo ? copy.badges.demoProfile : copy.badges.professionalProfile}
                    </span>
                    {projects.length ? (
                      <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                        {copy.badges.portfolioAdded}
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
                    {copy.actions.editProfile}
                  </Link>
                  <Link
                    href="/account/projects"
                    className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                  >
                    {copy.actions.manageProjects}
                  </Link>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  <FavoriteButton
                    entityType="designer"
                    entityKey={profile.id}
                    initialSaved={savedFavorites.has(`designer:${profile.id}`)}
                  />
                  <a
                    href="#portfolio"
                    className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                  >
                    {copy.actions.viewPortfolio}
                  </a>
                  {canSendBrief && !profile.is_demo ? (
                    <Link
                      href={briefRequestHref(profile.id, selectedBriefId)}
                      className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                    >
                      {copy.actions.sendBrief}
                    </Link>
                  ) : profile.is_demo ? (
                    <span className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold text-muted">
                      {copy.badges.demoProfile}
                    </span>
                  ) : (
                    <span className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold text-muted">
                      {copy.actions.designerAccount}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {profileCopy.labels.location}
                </div>
                <div className="mt-1 font-semibold">{location}</div>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {profileCopy.labels.experience}
                </div>
                <div className="mt-1 font-semibold">
                  {profileExperienceLabel(profile.years_experience)}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {profileCopy.labels.portfolio}
                </div>
                <div className="mt-1 font-semibold">
                  {profileProjectCountLabel(projects.length)}
                </div>
              </div>
              <div className="rounded-2xl border border-line bg-background p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {profileCopy.labels.price}
                </div>
                <div className="mt-1 font-semibold">{pricingLabel(profile)}</div>
              </div>
            </div>

            {specialties.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted"
                  >
                    {professionalOptionLabel(specialty)}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <aside
            id="contact"
            className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24"
          >
            <div className="text-sm font-semibold text-primary">{copy.contact.eyebrow}</div>
            <h2 className="mt-2 text-2xl font-bold">{copy.contact.heading(title)}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {copy.contact.body}
            </p>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <span className="text-muted">{profileCopy.labels.platformResponses}</span>
                <span className="text-right font-semibold">{copy.contact.platformResponseValue}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <span className="text-muted">{profileCopy.labels.contact}</span>
                <span className="truncate text-right font-semibold">{profile.is_demo ? profileCopy.values.demoContactUnavailable : contactLabel(profile, copy)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <span className="text-muted">{profileCopy.labels.availability}</span>
                <span className="text-right font-semibold">{profile.availability_status ? availabilityLabel(profile.availability_status) : profileCopy.values.toBeAgreed}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                <span className="text-muted">{profileCopy.labels.workMode}</span>
                <span className="text-right font-semibold">{profile.work_modes?.map((mode) => workModeLabel(mode)).join(" · ") || profileCopy.values.toBeAgreed}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">{profileCopy.labels.minimumProjectBudget}</span>
                <span className="text-right font-semibold">{profile.minimum_project_budget ? `${profile.minimum_project_budget} PLN` : profileCopy.values.notSpecified}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted">{profileCopy.labels.languages}</span>
                <span className="font-semibold">
                  {profile.languages?.map((language) => profileLanguageLabel(language)).join(" / ") || copy.defaults.polishEnglish}
                </span>
              </div>
            </div>

            {isOwner ? (
              <div className="mt-6 grid gap-3">
                <Link
                  href="/account/profile"
                  className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  {copy.actions.editPublicDetails}
                </Link>
                <Link
                  href="/account/projects"
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  {copy.actions.addPortfolioProject}
                </Link>
              </div>
            ) : canSendBrief && !profile.is_demo ? (
              <Link
                href={briefRequestHref(profile.id, selectedBriefId)}
                className="mt-6 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <span className="w-full">{copy.actions.sendBrief}</span>
              </Link>
            ) : profile.is_demo ? (
              <div className="mt-6 rounded-lg border border-primary/20 bg-primary-soft p-4 text-sm leading-6 text-muted">
                {copy.contact.demoNotice}
              </div>
            ) : (
              <div className="mt-6 rounded-lg border border-line bg-background p-4 text-sm leading-6 text-muted">
                {copy.contact.designerNotice}
              </div>
            )}

            {webHref ? (
              <a
                href={webHref}
                target="_blank"
                rel="noreferrer"
                className="mt-3 flex rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
              >
                <span className="w-full">{copy.actions.openWebsite}</span>
              </a>
            ) : null}
            <div className="mt-4">
              <SocialLinks
                behanceUrl={profile.behance_url}
                facebookUrl={profile.facebook_url}
                instagramUrl={profile.instagram_url}
                linkedinUrl={profile.linkedin_url}
              />
            </div>
          </aside>
        </section>
      </section>

      {isOwner ? (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            <div className="font-semibold">{copy.owner.title}</div>
            <p className="mt-1">
              {copy.owner.body}
            </p>
          </div>
        </section>
      ) : null}

      {studios.length ? (
        <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="text-sm font-semibold text-primary">{copy.studios.eyebrow}</div>
            <h2 className="mt-1 text-2xl font-bold">
              {copy.studios.heading(title, studios.length)}
            </h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {studios.map((studio) => (
                <Link
                  key={studio.id}
                  href={`/studios/${studio.id}`}
                  className="rounded-lg border border-line bg-background p-4 transition hover:border-primary"
                >
                  <div className="font-bold">{studio.name}</div>
                  <div className="mt-1 text-sm text-muted">
                    {profileLocationLabel(studio.location) || copy.defaults.remoteStudio}
                  </div>
                  {studio.specialties?.length ? (
                    <div className="mt-3 text-sm font-semibold text-primary">
                      {studio.specialties.slice(0, 3).map((specialty) => professionalOptionLabel(specialty)).join(" · ")}
                    </div>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-7">
          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">{copy.about.eyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.about.heading}</h2>
              </div>
              <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                {type}
              </span>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted">
              {profile.bio || copy.defaults.noBio}
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">{copy.services.eyebrow}</div>
              <h2 className="mt-1 text-3xl font-bold">{copy.services.heading}</h2>
            </div>

            {serviceCapabilities.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {serviceCapabilities.map((capability) => (
                  <span key={capability} className="rounded-full bg-primary-soft px-3 py-1.5 text-sm font-semibold text-primary">
                    {serviceCapabilityLabel(capability)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-muted">
                {copy.services.unavailable}
              </p>
            )}

            {profile.cooperation_terms ? (
              <div className="mt-5 rounded-2xl border border-line bg-background p-5">
                <div className="text-sm font-semibold text-primary">{copy.services.terms}</div>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted">{profile.cooperation_terms}</p>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {serviceCards(profile, copy).map((service) => (
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
                <div className="text-sm font-semibold text-primary">{copy.portfolio.eyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.portfolio.heading}</h2>
              </div>
              <div className="text-sm font-semibold text-muted">{portfolioCountText}</div>
            </div>

            {categoryFilters.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={portfolioHref(id, selectedBriefId)}
                  aria-current={selectedCategory ? undefined : "true"}
                  className={selectedCategory ? inactiveFilterClass : activeFilterClass}
                >
                  {copy.portfolio.all}
                </Link>
                {categoryFilters.map((category) => (
                  <Link
                    key={category}
                    href={portfolioHref(id, selectedBriefId, category)}
                    aria-current={selectedCategory === category ? "true" : undefined}
                    className={
                      selectedCategory === category
                        ? activeFilterClass
                        : inactiveFilterClass
                    }
                  >
                    {professionalOptionLabel(category)}
                  </Link>
                ))}
              </div>
            ) : null}

            {prErr ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                <div className="font-semibold">{copy.portfolio.loadError}</div>
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
                    <h3 className="text-2xl font-bold">{copy.portfolio.comingSoon}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {copy.portfolio.comingSoonBody}
                    </p>
                    {isOwner ? (
                      <Link
                        href="/account/projects"
                        className="mt-4 w-fit rounded-xl bg-white px-4 py-3 text-sm font-semibold text-foreground"
                      >
                        {copy.actions.addFirstProject}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : !visibleProjects.length ? (
              <div className="mt-5 rounded-2xl border border-dashed border-line bg-background p-6">
                <h3 className="text-xl font-bold">{copy.portfolio.emptyCategory}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {copy.portfolio.emptyCategoryBody}
                </p>
                <Link
                  href={portfolioHref(id, selectedBriefId)}
                  className="mt-4 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  {copy.actions.showAllProjects}
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
                      category={project.category ? professionalOptionLabel(project.category) : copy.portfolio.eyebrow}
                      description={project.description}
                      images={projectGallery(project, index)}
                      title={project.title || copy.defaults.untitledProject}
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
                          {copy.actions.viewProject}
                        </Link>
                        <FavoriteButton
                          entityType="project"
                          entityKey={project.id}
                          initialSaved={savedFavorites.has(`project:${project.id}`)}
                        />
                        {project.project_url ? (
                          <a
                            href={project.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                          >
                          {copy.actions.openProjectWebsite}
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
                <div className="text-sm font-semibold text-primary">{copy.reviews.eyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.reviews.heading}</h2>
              </div>
              {hasVerifiedGoogleRating ? (
                <GoogleRating rating={profile.google_rating} count={profile.google_review_count} url={profile.google_business_url} />
              ) : (
                <span className="rounded-full bg-background px-4 py-2 text-sm font-semibold text-muted">
                  {copy.reviews.noGoogleReviews}
                </span>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="rounded-lg border border-line bg-background p-5 text-center">
                <div className="text-5xl font-bold text-primary">
                  {profile.google_rating ? profile.google_rating.toFixed(1) : copy.reviews.new}
                </div>
                <div className="mt-2 text-sm text-muted">
                  {profile.google_review_count
                    ? copy.reviews.reviewCount(profile.google_review_count)
                    : copy.reviews.noLinkedRating}
                </div>
              </div>
              <div className="rounded-lg border border-dashed border-line bg-background p-5">
                <h3 className="text-lg font-bold">
                  {hasVerifiedGoogleRating ? copy.reviews.linkedHeading : copy.reviews.unlinkedHeading}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {copy.reviews.body}
                </p>
                {websiteHref(profile.google_business_url) ? (
                  <a href={websiteHref(profile.google_business_url)!} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white">
                    {copy.reviews.readOnGoogle}
                  </a>
                ) : null}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-line bg-primary text-white shadow-sm">
            <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="text-sm font-semibold text-white/72">
                  {copy.compass.eyebrow}
                </div>
                <h2 className="mt-2 text-3xl font-bold">{copy.compass.heading}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                  {copy.compass.body}
                </p>
              </div>
              <Link
                href="/project-compass"
                className="rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-foreground"
              >
                {copy.actions.createBrief}
              </Link>
            </div>
          </section>
        </div>

        <aside className="hidden h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24 lg:block">
          <div className="text-sm font-semibold text-primary">{profileCopy.labels.profileSummary}</div>
          <div className="mt-4 grid gap-4">
            <div>
              <div className="text-sm text-muted">{profileCopy.labels.bestMatch}</div>
              <div className="mt-1 font-semibold">
                {specialties[0] ? professionalOptionLabel(specialties[0]) : copy.defaults.interiorProjects}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted">{profileCopy.labels.location}</div>
              <div className="mt-1 font-semibold">{location}</div>
            </div>
            <div>
              <div className="text-sm text-muted">{profileCopy.labels.experience}</div>
              <div className="mt-1 font-semibold">
                {profileExperienceLabel(profile.years_experience)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted">{profileCopy.labels.portfolio}</div>
              <div className="mt-1 font-semibold">
                {profileProjectCountLabel(projects.length)}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h3 className="text-lg font-bold">{copy.summary.contractorsHeading}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {copy.summary.contractorsBody}
            </p>
          </div>
        </aside>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{title}</div>
            <div className="truncate text-xs text-muted">{copy.contact.mobileResponseNote}</div>
          </div>
          {isOwner ? (
            <Link
              href="/account/projects"
              className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              {copy.actions.manage}
            </Link>
          ) : canSendBrief && !profile.is_demo ? (
            <Link
              href={briefRequestHref(profile.id, selectedBriefId)}
              className="shrink-0 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
            >
              {copy.actions.sendBrief}
            </Link>
          ) : (
            <span className="shrink-0 rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold text-muted">
              {profile.is_demo ? copy.badges.demoProfile : copy.actions.designerAccount}
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
