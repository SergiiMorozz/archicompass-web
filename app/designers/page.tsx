import type { Metadata } from "next";
import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import GoogleRating from "@/components/GoogleRating";
import JsonLd from "@/components/JsonLd";
import { countLabel, polishCountLabel } from "@/lib/count-label";
import {
  type MatchBrief,
  type ProfessionalMatch,
  scoreProfessionalMatch,
} from "@/lib/designer-matching";
import { getAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requiredServiceCapabilities, serviceCapabilities, serviceCapabilityLabel } from "@/lib/service-capabilities";
import { availabilityLabel, availabilityStatuses, pricingLabel, pricingModelLabel, workModeLabel, workModes } from "@/lib/profile-pricing";
import {
  designerStyles,
  professionalOptionLabel,
  projectServiceCategories,
  specialistFocusOptions,
} from "@/lib/professional-options";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { locationPath, seoLocations } from "@/lib/seo-locations";
import { distanceBetweenLocations } from "@/lib/location-distance";
import {
  applyDemoProfilePresentation,
  getDemoProfilePresentation,
} from "@/lib/public-demo-profiles";

export const revalidate = 0;

export const metadata: Metadata = pageMetadata({
  title: "Projektanci wnętrz i pracownie projektowe",
  description:
    "Znajdź projektantów wnętrz i pracownie według miasta, stylu, usług, budżetu, dostępności, portfolio i opinii Google. Porównaj profile i wyślij brief.",
  path: "/designers",
});

type Profile = {
  id: string;
  avatar_url: string | null;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  service_categories: string[] | null;
  languages: string[] | null;
  service_capabilities: string[] | null;
  hourly_rate: number | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  years_experience: number | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  is_demo: boolean;
  created_at: string;
};

type Studio = {
  id: string;
  name: string;
  bio: string | null;
  location: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  hourly_rate: number | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  years_experience: number | null;
  google_business_url: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  is_demo: boolean;
  created_at: string;
};

type SP = {
  match?: string;
  brief?: string;
  projectType?: string;
  goal?: string;
  style?: string;
  support?: string;
  budget?: string;
  timeline?: string;
  area?: string;
  roomCount?: string;
  rooms?: string;
  propertyStatus?: string;
  visualization?: string;
  supervision?: string;
  cues?: string;
  q?: string;
  location?: string;
  specialty?: string;
  minRate?: string;
  maxRate?: string;
  pricingModel?: string;
  styles?: string | string[];
  services?: string | string[];
  projectCategories?: string | string[];
  focus?: string | string[];
  availability?: string;
  workMode?: string;
  minExperience?: string;
  maxProjectBudget?: string;
  profileType?: "all" | "designer" | "studio";
  sort?: "recommended" | "newest" | "rate" | "experience";
  view?: "grid" | "list";
};

type BriefMatchContext = MatchBrief;

type PortfolioProject = {
  profile_id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
};

const trendChips = [
  { label: "Ekologiczne wnętrza", params: { specialty: "sustainable design" } },
  { label: "Smart home", params: { specialty: "smart homes" } },
  { label: "Quiet luxury", params: { specialty: "quiet luxury" } },
  { label: "Minimalizm", params: { specialty: "minimalist" } },
  { label: "Warszawa", params: { location: "Warsaw" } },
];

const coverImages = [
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
];

function first(v: string | string[] | undefined) {
  if (!v) return "";
  return Array.isArray(v) ? v[0] : v;
}

function many(v: string | string[] | undefined) {
  const values = Array.isArray(v) ? v : v ? [v] : [];
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  );
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function qs(obj: Record<string, string>) {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== "") p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : "";
}

function selectedView(value: string) {
  return value === "grid" || value === "list" ? value : "list";
}

function selectedSort(value: string) {
  return value === "newest" || value === "rate" || value === "experience"
    ? value
    : "recommended";
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

function profileTitle(profile: Profile) {
  return profile.full_name || "Profil bez nazwy";
}

function profileType(profile: Profile) {
  const labels: Record<string, string> = {
    "Interior architect": "Architekt wnętrz",
    "Interior designer": "Projektant wnętrz",
    "Interior design studio": "Pracownia projektowania wnętrz",
    "Interior design practice": "Pracownia projektowania wnętrz",
    "Interior architecture studio": "Pracownia architektury wnętrz",
    professional: "Specjalista",
  };
  const value = profile.profession_type || profile.user_type || "professional";
  return labels[value] || value;
}

function profileLocation(profile: Profile) {
  if (!profile.location) return "Praca zdalna / lokalizacja do uzgodnienia";
  return profile.location
    .replace("Warsaw", "Warszawa")
    .replace("Krakow", "Kraków")
    .replace("Wroclaw", "Wrocław")
    .replace("Gdansk", "Gdańsk")
    .replace("Poznan", "Poznań")
    .replace("Lodz", "Łódź")
    .replace("Poland", "Polska");
}

function experienceLabel(value: number | null) {
  if (!value) return "Brak informacji o doświadczeniu";
  return `${value}+ ${value === 1 ? "rok" : value < 5 ? "lata" : "lat"} doświadczenia`;
}

function professionalHref(type: "designer" | "studio", id: string, briefId: string) {
  const base = type === "studio" ? `/studios/${id}` : `/designers/${id}`;
  return briefId ? `${base}?brief=${encodeURIComponent(briefId)}` : base;
}

function StudioCard({
  briefContext,
  briefId,
  canSendBrief,
  initialSaved,
  matchResult,
  memberCount,
  studio,
}: {
  briefContext: BriefMatchContext | null;
  briefId: string;
  canSendBrief: boolean;
  initialSaved: boolean;
  matchResult: ProfessionalMatch | null;
  memberCount: number;
  studio: Studio;
}) {
  const requestedCapabilities = briefContext
    ? requiredServiceCapabilities(
        briefContext.visualization,
        briefContext.supervision,
        briefContext.support
      )
    : [];
  const availableCapabilities = studio.service_capabilities ?? [];
  const confirmedCapabilities = requestedCapabilities.filter((capability) =>
    availableCapabilities.includes(capability)
  );
  const studioHref = professionalHref("studio", studio.id, briefId);
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
      <Link
        href={studioHref}
        className="relative block h-52 bg-cover bg-center"
        style={{ backgroundImage: `url(${coverImages[1]})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/75 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary shadow-sm">
          Pracownia projektowa
        </span>
        <div className="absolute bottom-4 left-4 text-white">
          <div className="text-2xl font-bold">{studio.name}</div>
          <div className="mt-1 text-sm text-white/75">{studio.location || "Pracownia pracująca zdalnie"}</div>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-sm font-semibold text-primary">
            {polishCountLabel(memberCount, "powiązany projektant", "powiązanych projektantów", "powiązanych projektantów")}
          </div>
          <FavoriteButton compact entityType="studio" entityKey={studio.id} initialSaved={initialSaved} />
        </div>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted">
          {studio.bio || "Wspólny profil pracowni z zespołową skrzynką odbiorczą i projektami powiązanych projektantów."}
        </p>
        {matchResult ? (
          <div className="mt-4 rounded-lg bg-primary-soft p-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-primary">{matchResult.label}</div>
              <div className="text-lg font-bold text-primary">{matchResult.percent}%</div>
            </div>
            <div className="mt-3 grid gap-2">
              {matchResult.reasons.slice(0, 4).map((reason) => (
                <div key={reason.label} className="grid gap-1 sm:grid-cols-[90px_1fr]">
                  <span className="text-muted">{reason.label}</span>
                  <span className="font-semibold">{reason.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          {(studio.specialties ?? []).slice(0, 3).map((specialty) => (
            <span key={specialty} className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              {professionalOptionLabel(specialty)}
            </span>
          ))}
        </div>
        {briefContext && requestedCapabilities.length ? (
          <div className="mt-4 rounded-lg bg-primary-soft p-4 text-sm">
            <div className="text-xs font-semibold uppercase text-primary">Dopasowanie usług</div>
            <div className="mt-2 font-semibold">
              {confirmedCapabilities.length === requestedCapabilities.length
                ? "Wszystkie wymagane usługi są dostępne"
                : `${confirmedCapabilities.length}/${requestedCapabilities.length} wymaganych usług jest dostępnych`}
            </div>
          </div>
        ) : null}
        <div className="mt-4 grid gap-2 text-sm text-muted">
          <span className="font-semibold text-primary">{pricingLabel(studio)}</span>
          <span>{studio.availability_status ? availabilityLabel(studio.availability_status) : "Dostępność do potwierdzenia"}</span>
          {studio.work_modes?.length ? <span>{studio.work_modes.map(workModeLabel).join(" · ")}</span> : null}
        </div>
        <div className="mt-4">
          <GoogleRating compact rating={studio.google_rating} count={studio.google_review_count} url={studio.google_business_url} />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={studioHref} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
            Zobacz pracownię
          </Link>
          {canSendBrief ? (
            <Link href={`/account/briefs?studio=${studio.id}${briefId ? `&brief=${briefId}` : ""}`} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              Wyślij brief
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function DesignerCard({
  briefContext,
  briefId,
  canSendBrief,
  profile,
  index,
  matchResult,
  requestedLocation,
  requestedSpecialty,
  initialSaved,
  portfolioCount,
  portfolioCover,
  view,
}: {
  briefContext: BriefMatchContext | null;
  briefId: string;
  canSendBrief: boolean;
  profile: Profile;
  index: number;
  matchResult: ProfessionalMatch | null;
  requestedLocation: string;
  requestedSpecialty: string;
  initialSaved: boolean;
  portfolioCount: number;
  portfolioCover: string | null;
  view: "grid" | "list";
}) {
  const title = profileTitle(profile);
  const type = profileType(profile);
  const location = profileLocation(profile);
  const cover = portfolioCover || coverImages[index % coverImages.length];
  const specialties = profile.specialties?.filter(Boolean).slice(0, 5) ?? [];
  const availableCapabilities = profile.service_capabilities ?? [];
  const demo = getDemoProfilePresentation(profile.id);
  const specialtyText = normalizeSearchText(specialties.join(" "));
  const requestedSpecialtyText = normalizeSearchText(requestedSpecialty).replace(
    /(istic|ist|ism)$/,
    ""
  );
  const requestedStyle = briefContext?.style || requestedSpecialty;
  const styleMatch = requestedStyle && requestedSpecialtyText && specialtyText.includes(requestedSpecialtyText)
    ? `Wysokie · ${requestedStyle}`
    : requestedStyle
      ? `Porównaj · ${requestedStyle}`
      : demo?.bestFor || specialties[0] || type;
  const locationMatches = requestedLocation
    ? normalizeSearchText(location).includes(normalizeSearchText(requestedLocation))
    : false;
  const requestedCapabilities = briefContext
    ? requiredServiceCapabilities(
        briefContext.visualization,
        briefContext.supervision,
        briefContext.support
      )
    : [];
  const confirmedCapabilities = requestedCapabilities.filter((capability) =>
    availableCapabilities.includes(capability)
  );
  const fallbackMatchItems = [
    [briefContext ? "Dopasowanie stylu" : "Styl / specjalizacja", styleMatch],
    ["Typ projektu", briefContext?.projectType || demo?.projectFit || "Sprawdź w portfolio podobne pomieszczenia i typy projektów"],
    [
      "Lokalizacja",
      requestedLocation
        ? locationMatches
          ? `Dopasowanie lokalne · ${location}`
          : `Sprawdź możliwość współpracy zdalnej · ${location}`
        : location,
    ],
    ["Zakres wsparcia", briefContext?.support ? `Do potwierdzenia: ${briefContext.support.toLowerCase()}` : "Sprawdź dostępne usługi"],
    ...(briefContext?.visualization && briefContext.visualization !== "Not needed"
      ? [["Wizualizacje 3D", availableCapabilities.includes("3D visualization") ? "Dostępne" : `Do potwierdzenia · ${briefContext.visualization}`]]
      : []),
    ...(briefContext?.supervision && briefContext.supervision !== "Not needed"
      ? [["Nadzór", confirmedCapabilities.some((capability) => capability !== "3D visualization") ? "Dostępny" : `Do potwierdzenia · ${briefContext.supervision}`]]
      : []),
    ["Budżet", briefContext?.budget ? `${briefContext.budget} · wycena po analizie briefu` : "Wycena po analizie briefu"],
    ["Portfolio", polishCountLabel(portfolioCount, "publiczny projekt", "publiczne projekty", "publicznych projektów")],
  ];
  const matchItems = matchResult
    ? matchResult.reasons.map((reason) => [reason.label, reason.value])
    : fallbackMatchItems;
  const profileHref = professionalHref("designer", profile.id, briefId);
  const sendBriefHref = `/account/briefs?designer=${profile.id}${briefId ? `&brief=${briefId}` : ""}`;

  if (view === "list") {
    return (
      <article className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <Link
            href={profileHref}
            className="relative min-h-[240px] bg-cover bg-center"
            style={{ backgroundImage: `url(${cover})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/72 to-transparent" />
            <div className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-2xl border-2 border-white bg-primary text-xl font-bold text-white shadow">
              {initials(title)}
            </div>
            <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
              {profile.is_demo ? "Profil demonstracyjny" : "Profil specjalisty"}
            </div>
          </Link>

          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link href={profileHref} className="text-2xl font-bold hover:text-primary">
                  {title}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  {matchResult ? (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      {matchResult.percent}% · {matchResult.label}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
                    {profile.is_demo ? "Profil demonstracyjny" : "Specjalista"}
                  </span>
                  <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                    Portfolio
                  </span>
                </div>
              </div>
              <FavoriteButton compact entityType="designer" entityKey={profile.id} initialSaved={initialSaved} />
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <span>{location}</span>
              <span>{experienceLabel(profile.years_experience)}</span>
              <span>{profile.availability_status ? availabilityLabel(profile.availability_status) : "Dostępność do potwierdzenia"}</span>
              {profile.work_modes?.length ? <span>{profile.work_modes.map(workModeLabel).join(" · ")}</span> : null}
            </div>
            <div className="mt-3">
              <GoogleRating compact rating={profile.google_rating} count={profile.google_review_count} url={profile.google_business_url} />
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
              {profile.bio || "Ten specjalista nie dodał jeszcze opisu publicznego."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {specialties.length ? (
                specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                    {professionalOptionLabel(specialty)}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                  {type}
                </span>
              )}
            </div>

            <div className="mt-5 rounded-lg bg-primary-soft p-4">
              <div className="text-xs font-semibold uppercase text-primary">Dlaczego ten profil może pasować</div>
              <div className="mt-3 grid gap-2 text-sm">
                {matchItems.map(([label, value]) => (
                  <div key={label} className="grid gap-1 sm:grid-cols-[130px_1fr]">
                    <span className="text-muted">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xl font-bold text-primary">{pricingLabel(profile)}</div>
                <div className="text-sm text-muted">{profile.is_demo ? "Przykładowe portfolio" : demo?.budgetFit || "Profil z portfolio"}</div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={profileHref}
                  className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  Zobacz portfolio
                </Link>
                {canSendBrief && !profile.is_demo ? (
                  <Link
                    href={sendBriefHref}
                    className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                  >
                    Wyślij brief
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
      <Link
        href={profileHref}
        className="relative block h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/78 via-[#1f172a]/20 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
          {profile.is_demo ? "Profil demonstracyjny" : "Specjalista"}
        </div>
        <div className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-2xl border-2 border-white bg-primary text-xl font-bold text-white shadow">
          {initials(title)}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={profileHref} className="block truncate text-xl font-bold hover:text-primary">
              {title}
            </Link>
            <p className="mt-1 text-sm text-muted">{type}</p>
          </div>
          <FavoriteButton compact entityType="designer" entityKey={profile.id} initialSaved={initialSaved} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {matchResult ? (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {matchResult.percent}% · {matchResult.label}
            </span>
          ) : null}
          <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
            {profile.is_demo ? "Profil demonstracyjny" : "Profil specjalisty"}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-muted">
          <span>{location}</span>
          <span>{experienceLabel(profile.years_experience)}</span>
          <span>{profile.availability_status ? availabilityLabel(profile.availability_status) : "Dostępność do potwierdzenia"}</span>
          {profile.work_modes?.length ? <span>{profile.work_modes.map(workModeLabel).join(" · ")}</span> : null}
        </div>
        <div className="mt-3">
          <GoogleRating compact rating={profile.google_rating} count={profile.google_review_count} url={profile.google_business_url} />
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
          {profile.bio || "Ten specjalista nie dodał jeszcze opisu publicznego."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {specialties.length ? (
            specialties.slice(0, 3).map((specialty) => (
              <span key={specialty} className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                {professionalOptionLabel(specialty)}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
              {type}
            </span>
          )}
        </div>

        <div className="mt-5 rounded-lg bg-primary-soft p-4 text-sm">
          <div className="text-xs font-semibold uppercase text-primary">Najważniejszy sygnał dopasowania</div>
          <div className="mt-2 font-semibold">{matchItems[0][1]}</div>
          <div className="mt-1 text-muted">{matchItems[2][1]}</div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
          <div>
            <div className="font-bold text-primary">{pricingLabel(profile)}</div>
            <div className="text-xs text-muted">{profile.is_demo ? "Przykładowe portfolio" : demo?.budgetFit || "Profil z portfolio"}</div>
          </div>
          <Link
            href={profileHref}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            Zobacz portfolio
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function DesignersPage({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};

  const q = first(sp.q).trim();
  const location = first(sp.location).trim();
  const specialty = first(sp.specialty).trim();
  const selectedStyles = many(sp.styles);
  if (specialty && !selectedStyles.includes(specialty)) selectedStyles.push(specialty);
  const selectedServices = many(sp.services);
  const selectedProjectCategories = many(sp.projectCategories);
  const selectedFocus = many(sp.focus);
  const availability = first(sp.availability).trim();
  const workMode = first(sp.workMode).trim();
  const profileType = first(sp.profileType).trim() || "all";
  const matchingMode = first(sp.match) === "brief";
  const briefId = first(sp.brief).trim();
  const projectType = first(sp.projectType).trim();
  const goal = first(sp.goal).trim();
  const style = first(sp.style).trim();
  const support = first(sp.support).trim();
  const budget = first(sp.budget).trim();
  const timeline = first(sp.timeline).trim();
  const area = first(sp.area).trim();
  const roomCount = first(sp.roomCount).trim();
  const rooms = first(sp.rooms)
    .split(",")
    .map((room) => room.trim())
    .filter(Boolean);
  const propertyStatus = first(sp.propertyStatus).trim();
  const visualization = first(sp.visualization).trim();
  const supervision = first(sp.supervision).trim();
  const cues = first(sp.cues)
    .split(",")
    .map((cue) => cue.trim())
    .filter(Boolean)
    .slice(0, 5);
  const briefContext: BriefMatchContext | null = matchingMode
    ? {
        projectType,
        goal,
        style,
        support,
        budget,
        timeline,
        area,
        roomCount,
        rooms,
        propertyStatus,
        visualization,
        supervision,
        location,
        cues,
        searchSpecialty: specialty,
      }
    : null;
  const view = selectedView(first(sp.view));
  const sort = selectedSort(first(sp.sort));

  const minRateRaw = first(sp.minRate).trim();
  const maxRateRaw = first(sp.maxRate).trim();
  const minRate = minRateRaw ? Number(minRateRaw) : NaN;
  const maxRate = maxRateRaw ? Number(maxRateRaw) : NaN;
  const pricingModel = first(sp.pricingModel).trim();
  const minExperienceRaw = first(sp.minExperience).trim();
  const minExperience = minExperienceRaw ? Number(minExperienceRaw) : NaN;
  const maxProjectBudgetRaw = first(sp.maxProjectBudget).trim();
  const maxProjectBudget = maxProjectBudgetRaw ? Number(maxProjectBudgetRaw) : NaN;

  const supabase = await createSupabaseServerClient();

  const query = supabase
    .from("profiles")
    .select(
      "id, avatar_url, full_name, bio, location, profession_type, user_type, specialties, service_categories, languages, service_capabilities, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, years_experience, google_business_url, google_rating, google_review_count, is_demo, created_at"
    )
    .eq("user_type", "professional")
    .order("created_at", { ascending: false })
    .limit(60);

  const { data, error } = await query;
  const { data: studioData } = await supabase
    .from("studios")
    .select("id, name, bio, location, specialties, service_capabilities, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, years_experience, google_business_url, google_rating, google_review_count, is_demo, created_at")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(30);
  const { data: userData } = await supabase.auth.getUser();
  const viewerRole = userData.user
    ? await getAccountRole(supabase, userData.user.id)
    : "client";
  const canSendBrief = !userData.user || viewerRole === "client";
  const { data: favoriteData } = userData.user
    ? await supabase
        .from("favorites")
        .select("entity_type, entity_key")
        .eq("user_id", userData.user.id)
        .in("entity_type", ["designer", "studio"])
    : { data: [] };
  const savedDesignerIds = new Set(
    (favoriteData ?? [])
      .filter((item) => item.entity_type === "designer")
      .map((item) => item.entity_key)
  );
  const savedStudioIds = new Set(
    (favoriteData ?? [])
      .filter((item) => item.entity_type === "studio")
      .map((item) => item.entity_key)
  );
  const normalizedQuery = normalizeSearchText(q);
  const normalizedLocation = normalizeSearchText(location);
  const exactLocationExists = !normalizedLocation || [
    ...((data ?? []) as Profile[]).map((profile) => profile.location),
    ...((studioData ?? []) as Studio[]).map((studio) => studio.location),
  ].some((candidate) => normalizeSearchText(candidate ?? "").includes(normalizedLocation));
  const nearbyFallback = Boolean(normalizedLocation && !exactLocationExists);

  const locationMatches = (candidate: string | null) => {
    if (matchingMode || !normalizedLocation) return true;
    if (normalizeSearchText(candidate ?? "").includes(normalizedLocation)) return true;
    if (!nearbyFallback || !candidate) return false;
    const distance = distanceBetweenLocations(location, candidate);
    return distance !== null && distance <= 250;
  };

  let profiles = ((data ?? []) as Profile[])
    .map(applyDemoProfilePresentation)
    .filter((profile) => {
      const searchable = normalizeSearchText(
        [
          profile.full_name,
          profile.bio,
          profile.profession_type,
          ...(profile.specialties ?? []),
          ...(profile.service_capabilities ?? []),
        ]
          .filter(Boolean)
          .join(" ")
      );
      const specialtyText = normalizeSearchText((profile.specialties ?? []).join(" "));
      const categoryText = normalizeSearchText((profile.service_categories ?? []).join(" "));
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesLocation = locationMatches(profile.location);
      const matchesSpecialty = matchingMode || selectedStyles.length === 0 || selectedStyles.some((item) =>
        specialtyText.includes(normalizeSearchText(item).replace(/(istic|ist|ism)$/, ""))
      );
      const matchesServices = selectedServices.length === 0 || selectedServices.every((item) =>
        (profile.service_capabilities ?? []).includes(item)
      );
      const matchesCategories = selectedProjectCategories.length === 0 || selectedProjectCategories.some((item) =>
        categoryText.includes(normalizeSearchText(item))
      );
      const matchesFocus = selectedFocus.length === 0 || selectedFocus.some((item) =>
        specialtyText.includes(normalizeSearchText(item))
      );
      const matchesAvailability = !availability || profile.availability_status === availability;
      const matchesWorkMode = !workMode || (profile.work_modes ?? []).includes(workMode);
      const matchesExperience = Number.isNaN(minExperience) || (profile.years_experience ?? 0) >= minExperience;
      const matchesProjectBudget = Number.isNaN(maxProjectBudget) ||
        (profile.minimum_project_budget !== null && profile.minimum_project_budget <= maxProjectBudget);
      const matchesPricingModel = !pricingModel || profile.pricing_model === pricingModel;
      const matchesMinimum =
        Number.isNaN(minRate) ||
        ((profile.price_from ?? profile.hourly_rate) !== null &&
          (profile.price_from ?? profile.hourly_rate)! >= minRate);
      const matchesMaximum =
        Number.isNaN(maxRate) ||
        ((profile.price_from ?? profile.hourly_rate) !== null &&
          (profile.price_from ?? profile.hourly_rate)! <= maxRate);

      return (
        matchesQuery &&
        matchesLocation &&
        matchesSpecialty &&
        matchesServices &&
        matchesCategories &&
        matchesFocus &&
        matchesAvailability &&
        matchesWorkMode &&
        matchesExperience &&
        matchesProjectBudget &&
        matchesPricingModel &&
        matchesMinimum &&
        matchesMaximum
      );
    });

  let studios = ((studioData ?? []) as Studio[]).filter((studio) => {
    const searchable = normalizeSearchText(
      [studio.name, studio.bio, ...(studio.specialties ?? []), ...(studio.service_capabilities ?? [])]
        .filter(Boolean)
        .join(" ")
    );
    const specialtyText = normalizeSearchText((studio.specialties ?? []).join(" "));
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
    const matchesLocation = locationMatches(studio.location);
    const matchesSpecialty = matchingMode || selectedStyles.length === 0 || selectedStyles.some((item) =>
      specialtyText.includes(normalizeSearchText(item).replace(/(istic|ist|ism)$/, ""))
    );
    const matchesServices = selectedServices.length === 0 || selectedServices.every((item) =>
      (studio.service_capabilities ?? []).includes(item)
    );
    const matchesCategories = selectedProjectCategories.length === 0 || selectedProjectCategories.some((item) =>
      searchable.includes(normalizeSearchText(item))
    );
    const matchesFocus = selectedFocus.length === 0 || selectedFocus.some((item) =>
      specialtyText.includes(normalizeSearchText(item))
    );
    const matchesAvailability = !availability || studio.availability_status === availability;
    const matchesWorkMode = !workMode || (studio.work_modes ?? []).includes(workMode);
    const matchesExperience = Number.isNaN(minExperience) || (studio.years_experience ?? 0) >= minExperience;
    const matchesProjectBudget = Number.isNaN(maxProjectBudget) ||
      (studio.minimum_project_budget !== null && studio.minimum_project_budget <= maxProjectBudget);
    const matchesPricingModel = !pricingModel || studio.pricing_model === pricingModel;
    const matchesMinimum =
      Number.isNaN(minRate) ||
      ((studio.price_from ?? studio.hourly_rate) !== null &&
        (studio.price_from ?? studio.hourly_rate)! >= minRate);
    const matchesMaximum =
      Number.isNaN(maxRate) ||
      ((studio.price_from ?? studio.hourly_rate) !== null &&
        (studio.price_from ?? studio.hourly_rate)! <= maxRate);
    return matchesQuery && matchesLocation && matchesSpecialty && matchesServices && matchesCategories && matchesFocus && matchesAvailability && matchesWorkMode && matchesExperience && matchesProjectBudget && matchesPricingModel && matchesMinimum && matchesMaximum;
  });
  if (profileType === "designer") studios = [];
  if (profileType === "studio") profiles = [];
  const studioIds = studios.map((studio) => studio.id);
  const { data: studioMemberData } = studioIds.length
    ? await supabase
        .from("studio_members")
        .select("studio_id, user_id")
        .in("studio_id", studioIds)
        .eq("status", "active")
    : { data: [] };
  const studioMemberCounts = new Map<string, number>();
  const studioMemberProfileIds = new Map<string, string[]>();
  (studioMemberData ?? []).forEach((member) => {
    studioMemberCounts.set(
      member.studio_id,
      (studioMemberCounts.get(member.studio_id) ?? 0) + 1
    );
    studioMemberProfileIds.set(member.studio_id, [
      ...(studioMemberProfileIds.get(member.studio_id) ?? []),
      member.user_id,
    ]);
  });

  const profileIds = profiles.map((profile) => profile.id);
  const { data: portfolioProjectData } = profileIds.length
    ? await supabase
        .from("projects")
        .select("profile_id, title, category, description, image_url, image_urls, created_at")
        .in("profile_id", profileIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const portfolioCounts = new Map<string, number>();
  const portfolioCovers = new Map<string, string>();
  const portfolioProjects = new Map<string, PortfolioProject[]>();
  ((portfolioProjectData ?? []) as PortfolioProject[]).forEach((project) => {
    portfolioCounts.set(
      project.profile_id,
      (portfolioCounts.get(project.profile_id) ?? 0) + 1
    );
    if (!portfolioCovers.has(project.profile_id)) {
      const cover = project.image_url || project.image_urls?.[0];
      if (cover) portfolioCovers.set(project.profile_id, cover);
    }
    portfolioProjects.set(project.profile_id, [
      ...(portfolioProjects.get(project.profile_id) ?? []),
      project,
    ]);
  });

  const profileMatchResults = new Map<string, ProfessionalMatch>();
  const studioMatchResults = new Map<string, ProfessionalMatch>();
  if (briefContext) {
    profiles.forEach((profile) => {
      profileMatchResults.set(
        profile.id,
        scoreProfessionalMatch(profile, briefContext, portfolioProjects.get(profile.id) ?? [])
      );
    });
    studios.forEach((studio) => {
      const memberProjects = (studioMemberProfileIds.get(studio.id) ?? []).flatMap(
        (profileId) => portfolioProjects.get(profileId) ?? []
      );
      studioMatchResults.set(
        studio.id,
        scoreProfessionalMatch(studio, briefContext, memberProjects)
      );
    });
  }

  if (matchingMode && sort === "recommended") {
    profiles = profiles.sort(
      (left, right) =>
        (profileMatchResults.get(right.id)?.percent ?? 0) -
        (profileMatchResults.get(left.id)?.percent ?? 0)
    );
    studios = studios.sort(
      (left, right) =>
        (studioMatchResults.get(right.id)?.percent ?? 0) -
        (studioMatchResults.get(left.id)?.percent ?? 0)
    );
  } else if (sort === "rate") {
    profiles = profiles.sort(
      (a, b) =>
        (a.price_from ?? a.hourly_rate ?? Number.MAX_SAFE_INTEGER) -
      (b.price_from ?? b.hourly_rate ?? Number.MAX_SAFE_INTEGER)
    );
  } else if (sort === "experience") {
    profiles = profiles.sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0));
    studios = studios.sort((a, b) => (b.years_experience ?? 0) - (a.years_experience ?? 0));
  } else if (nearbyFallback && location) {
    const distance = (candidate: string | null) =>
      candidate ? distanceBetweenLocations(location, candidate) ?? Number.MAX_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
    profiles = profiles.sort((a, b) => distance(a.location) - distance(b.location));
    studios = studios.sort((a, b) => distance(a.location) - distance(b.location));
  }

  const base = {
    match: matchingMode ? "brief" : "",
    brief: briefId,
    projectType,
    goal,
    style,
    support,
    budget,
    timeline,
    area,
    roomCount,
    rooms: rooms.join(","),
    propertyStatus,
    visualization,
    supervision,
    cues: cues.join(","),
    q,
    location,
    specialty,
    minRate: Number.isNaN(minRate) ? "" : String(minRate),
    maxRate: Number.isNaN(maxRate) ? "" : String(maxRate),
    pricingModel,
    styles: selectedStyles.join(","),
    services: selectedServices.join(","),
    projectCategories: selectedProjectCategories.join(","),
    focus: selectedFocus.join(","),
    availability,
    workMode,
    minExperience: Number.isNaN(minExperience) ? "" : String(minExperience),
    maxProjectBudget: Number.isNaN(maxProjectBudget) ? "" : String(maxProjectBudget),
    profileType,
    sort,
  };

  const gridHref = "/designers" + qs({ ...base, view: "grid" });
  const listHref = "/designers" + qs({ ...base, view: "list" });
  const hasFilters = Boolean(q || location || selectedStyles.length || selectedServices.length || selectedProjectCategories.length || selectedFocus.length || availability || workMode || minExperienceRaw || maxProjectBudgetRaw || profileType !== "all" || minRateRaw || maxRateRaw || pricingModel);
  const matchingQueryEntries = briefContext
    ? [
        ["match", "brief"],
        ["brief", briefId],
        ["projectType", projectType],
        ["goal", goal],
        ["style", style],
        ["support", support],
        ["budget", budget],
        ["timeline", timeline],
        ["area", area],
        ["roomCount", roomCount],
        ["rooms", rooms.join(",")],
        ["propertyStatus", propertyStatus],
        ["visualization", visualization],
        ["supervision", supervision],
        ["cues", cues.join(",")],
        ["specialty", specialty],
      ].filter((entry) => entry[1])
    : [];

  return (
    <main>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Strona główna", path: "/" },
            { name: "Znajdź projektanta", path: "/designers" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Projektanci wnętrz i pracownie projektowe",
            description: "Publiczne profile projektantów wnętrz i pracowni w ArchiCompass.",
            url: absoluteUrl("/designers"),
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: profiles.length + studios.length,
              itemListElement: [
                ...studios.map((studio, index) => ({
                  "@type": "ListItem",
                  position: index + 1,
                  name: studio.name,
                  url: absoluteUrl(`/studios/${studio.id}`),
                })),
                ...profiles.map((profile, index) => ({
                  "@type": "ListItem",
                  position: studios.length + index + 1,
                  name: profileTitle(profile),
                  url: absoluteUrl(`/designers/${profile.id}`),
                })),
              ],
            },
          },
        ]}
      />
      <section className="border-b border-primary/15 bg-primary-soft px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
              Wyszukiwanie projektantów
            </span>
            <h1 className="mt-3 text-5xl font-bold tracking-tight">Znajdź projektanta wnętrz lub pracownię</h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              Przeglądaj profile projektantów, architektów i pracowni według stylu,
              lokalizacji oraz dopasowania do projektu.
            </p>
          </div>

          <form action="/designers" className="mx-auto mt-9 max-w-4xl">
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="sort" value={sort} />
            {briefContext && location ? <input type="hidden" name="location" value={location} /> : null}
            {briefContext && specialty ? <input type="hidden" name="specialty" value={specialty} /> : null}
            {matchingQueryEntries.map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
            <div className="flex flex-col gap-3 rounded-lg border border-primary/15 bg-card p-3 shadow-[0_14px_40px_rgba(104,40,200,0.10)] sm:flex-row">
              <input
                name="q"
                defaultValue={q}
                placeholder="Szukaj według nazwy, stylu lub specjalizacji..."
                className="min-h-12 flex-1 rounded-xl bg-transparent px-3 outline-none"
              />
              <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">
                Szukaj
              </button>
            </div>
          </form>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold">
              Popularne
            </span>
            {trendChips.map((chip) => (
              <Link
                key={chip.label}
                href={"/designers" + qs({ ...base, ...chip.params })}
                className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {briefContext ? (
        <section className="border-b border-line bg-primary-soft px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Dopasowanie na podstawie Project Compass</div>
                <h2 className="mt-1 text-2xl font-bold">Specjaliści dopasowani do Twojego briefu</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                  Wyniki uwzględniają styl, zakres, pomieszczenia, usługi, budżet,
                  lokalizację, termin i portfolio. Brakujące informacje są oznaczane
                  jako wymagające potwierdzenia.
                </p>
              </div>
              <Link href="/project-compass" className="rounded-xl border border-primary bg-card px-4 py-3 text-center text-sm font-semibold text-primary">
                Edytuj brief
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                briefContext.style,
                briefContext.projectType,
                briefContext.location,
                briefContext.budget,
                briefContext.support,
                briefContext.timeline,
                briefContext.area ? `${briefContext.area} m²` : "",
                briefContext.roomCount ? `${briefContext.roomCount} pom.` : "",
                briefContext.propertyStatus,
                briefContext.visualization,
                briefContext.supervision,
                ...briefContext.cues.slice(0, 3),
              ]
                .filter(Boolean)
                .map((item) => (
                  <span key={item} className="rounded-full border border-primary/20 bg-card px-3 py-1.5 text-sm font-semibold text-primary">
                    {item}
                  </span>
                ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[290px_1fr]">
        <aside className="h-fit max-h-[72vh] overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Filtry</h2>
              <p className="mt-1 text-sm text-muted">{polishCountLabel(profiles.length + studios.length, "wynik", "wyniki", "wyników")}</p>
            </div>
            {hasFilters ? (
              <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">
                Wyczyść
              </Link>
            ) : null}
          </div>

          <form action="/designers" className="mt-6 grid gap-6">
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="q" value={q} />
            {matchingQueryEntries.map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}

            <label className="block text-sm font-semibold">
              Lokalizacja
              <input
                name="location"
                defaultValue={location}
                placeholder="Wpisz miasto lub kod pocztowy"
                className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-3 font-normal outline-none focus:border-primary"
              />
            </label>

            <label className="block text-sm font-semibold">
              Typ profilu
              <select
                name="profileType"
                defaultValue={profileType}
                className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm font-normal outline-none focus:border-primary"
              >
                <option value="all">Projektanci i pracownie</option>
                <option value="designer">Niezależni projektanci</option>
                <option value="studio">Pracownie projektowe</option>
              </select>
            </label>

            <div>
              <div className="text-sm font-semibold">Dostępność i forma współpracy</div>
              <select
                name="availability"
                defaultValue={availability}
                className="mt-3 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Dowolna dostępność</option>
                {availabilityStatuses.map((status) => (
                  <option key={status} value={status}>{availabilityLabel(status)}</option>
                ))}
              </select>
              <select
                name="workMode"
                defaultValue={workMode}
                className="mt-3 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Dowolna forma współpracy</option>
                {workModes.map((mode) => (
                  <option key={mode} value={mode}>{workModeLabel(mode)}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-sm font-semibold">Opublikowana cena projektu</div>
              <p className="mt-1 text-xs leading-5 text-muted">Cena w PLN według wybranego modelu rozliczeń, nie całkowity budżet remontu.</p>
              <select
                name="pricingModel"
                defaultValue={pricingModel}
                className="mt-3 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm outline-none focus:border-primary"
              >
                <option value="">Dowolny model rozliczeń</option>
                <option value="Hourly">{pricingModelLabel("Hourly")}</option>
                <option value="Per m2">{pricingModelLabel("Per m2")}</option>
                <option value="Fixed package">{pricingModelLabel("Fixed package")}</option>
                <option value="Custom quote">{pricingModelLabel("Custom quote")}</option>
              </select>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  name="minRate"
                  defaultValue={Number.isNaN(minRate) ? "" : String(minRate)}
                  placeholder="Min."
                  inputMode="numeric"
                  className="w-full rounded-xl border border-line bg-background px-3 py-3 outline-none focus:border-primary"
                />
                <input
                  name="maxRate"
                  defaultValue={Number.isNaN(maxRate) ? "" : String(maxRate)}
                  placeholder="Maks."
                  inputMode="numeric"
                  className="w-full rounded-xl border border-line bg-background px-3 py-3 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Style wnętrz</div>
              <p className="mt-1 text-xs leading-5 text-muted">Wybierz jeden lub kilka stylów.</p>
              <div className="mt-3 grid gap-3">
                {designerStyles.map((style) => (
                  <label key={style} className="flex items-center gap-3 text-sm text-muted">
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="styles"
                        value={style}
                        defaultChecked={selectedStyles.some((item) => normalizeSearchText(item) === normalizeSearchText(style))}
                        className="h-4 w-4 accent-primary"
                      />
                      {professionalOptionLabel(style)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Typ projektu</div>
              <div className="mt-3 grid gap-3">
                {projectServiceCategories.map((category) => (
                  <label key={category} className="flex items-center gap-3 text-sm text-muted">
                    <input
                      type="checkbox"
                      name="projectCategories"
                      value={category}
                      defaultChecked={selectedProjectCategories.includes(category)}
                      className="h-4 w-4 accent-primary"
                    />
                    {professionalOptionLabel(category)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Usługi</div>
              <div className="mt-3 grid gap-3">
                {serviceCapabilities.map((service) => (
                  <label key={service} className="flex items-center gap-3 text-sm text-muted">
                    <input
                      type="checkbox"
                      name="services"
                      value={service}
                      defaultChecked={selectedServices.includes(service)}
                      className="h-4 w-4 accent-primary"
                    />
                    {serviceCapabilityLabel(service)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Doświadczenie w szczególnych projektach</div>
              <div className="mt-3 grid gap-3">
                {specialistFocusOptions.map((item) => (
                  <label key={item} className="flex items-center gap-3 text-sm text-muted">
                    <input
                      type="checkbox"
                      name="focus"
                      value={item}
                      defaultChecked={selectedFocus.includes(item)}
                      className="h-4 w-4 accent-primary"
                    />
                    {professionalOptionLabel(item)}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Doświadczenie i próg projektu</div>
              <label className="mt-3 block text-xs text-muted">
                Minimalne doświadczenie
                <select
                  name="minExperience"
                  defaultValue={Number.isNaN(minExperience) ? "" : String(minExperience)}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary"
                >
                  <option value="">Dowolne doświadczenie</option>
                  <option value="3">Minimum 3 lata</option>
                  <option value="5">Minimum 5 lat</option>
                  <option value="10">Minimum 10 lat</option>
                  <option value="15">Minimum 15 lat</option>
                </select>
              </label>
              <label className="mt-3 block text-xs text-muted">
                Maksymalny całkowity budżet projektu (PLN)
                <input
                  name="maxProjectBudget"
                  defaultValue={Number.isNaN(maxProjectBudget) ? "" : String(maxProjectBudget)}
                  placeholder="np. 100 000"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-3 text-sm text-foreground outline-none focus:border-primary"
                />
              </label>
            </div>

            <button className="sticky bottom-0 z-10 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg">
              Zastosuj filtry
            </button>
          </form>
        </aside>

        <div>
          {nearbyFallback && (profiles.length || studios.length) ? (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              Nie znaleziono profili dokładnie w lokalizacji <strong>{location}</strong>. Pokazujemy specjalistów z najbliższych rozpoznanych miast w Polsce, w promieniu do 250 km.
            </div>
          ) : null}
          {studios.length ? (
            <section className="mb-9">
              <div>
                <p className="text-sm font-semibold text-primary">
                  {polishCountLabel(studios.length, "znaleziona pracownia", "znalezione pracownie", "znalezionych pracowni")}
                </p>
                <h2 className="mt-1 text-2xl font-bold">Pracownie projektowe</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Skontaktuj się z całym zespołem i zobacz projekty powiązanych projektantów.
                </p>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                {studios.map((studio) => (
                  <StudioCard
                    key={studio.id}
                    briefContext={briefContext}
                    briefId={briefId}
                    studio={studio}
                    matchResult={studioMatchResults.get(studio.id) ?? null}
                    memberCount={studioMemberCounts.get(studio.id) ?? 0}
                    initialSaved={savedStudioIds.has(studio.id)}
                    canSendBrief={canSendBrief}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {polishCountLabel(profiles.length, "znaleziony projektant", "znalezieni projektanci", "znalezionych projektantów")}
              </p>
              <h2 className="mt-1 text-2xl font-bold">
                {briefContext ? "Rekomendowani do Twojego briefu" : "Polecani specjaliści"}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={"/designers" + qs({ ...base, view, sort: "recommended" })}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  sort === "recommended" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Polecane
              </Link>
              <Link
                href={"/designers" + qs({ ...base, view, sort: "newest" })}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  sort === "newest" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Najnowsze
              </Link>
              <Link
                href={"/designers" + qs({ ...base, view, sort: "experience" })}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  sort === "experience" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Doświadczenie
              </Link>
              <Link
                href={listHref}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  view === "list" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Lista
              </Link>
              <Link
                href={gridHref}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  view === "grid" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Siatka
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <div className="font-semibold">Nie udało się wczytać profili</div>
              <div className="mt-1 text-sm">{error.message}</div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-card p-8 text-center">
              <div className="text-xl font-bold">Żaden projektant nie spełnia wybranych kryteriów</div>
              <p className="mt-2 text-muted">
                {briefContext
                  ? "Nie znaleziono jeszcze dokładnego dopasowania. Poszerz lokalizację lub wybór stylów albo zapisz brief i wróć, gdy dołączą kolejni specjaliści."
                  : "Usuń część filtrów lub wyszukaj inne miasto."}
              </p>
              <Link
                href="/designers"
                className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Pokaż wszystkich projektantów
              </Link>
            </div>
          ) : view === "grid" ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile, index) => (
                <DesignerCard
                  key={profile.id}
                  briefContext={briefContext}
                  briefId={briefId}
                  canSendBrief={canSendBrief}
                  profile={profile}
                  index={index}
                  matchResult={profileMatchResults.get(profile.id) ?? null}
                  requestedLocation={location}
                  requestedSpecialty={specialty}
                  initialSaved={savedDesignerIds.has(profile.id)}
                  portfolioCount={portfolioCounts.get(profile.id) ?? 0}
                  portfolioCover={portfolioCovers.get(profile.id) ?? null}
                  view={view}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 grid gap-5">
              {profiles.map((profile, index) => (
                <DesignerCard
                  key={profile.id}
                  briefContext={briefContext}
                  briefId={briefId}
                  canSendBrief={canSendBrief}
                  profile={profile}
                  index={index}
                  matchResult={profileMatchResults.get(profile.id) ?? null}
                  requestedLocation={location}
                  requestedSpecialty={specialty}
                  initialSaved={savedDesignerIds.has(profile.id)}
                  portfolioCount={portfolioCounts.get(profile.id) ?? 0}
                  portfolioCover={portfolioCovers.get(profile.id) ?? null}
                  view={view}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <section className="border-t border-line bg-card px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase text-accent">Szukaj według lokalizacji</p>
          <h2 className="mt-2 text-3xl font-bold">Znajdź projektanta wnętrz w pobliżu inwestycji</h2>
          <p className="mt-3 max-w-3xl leading-7 text-muted">
            Przeglądaj katalogi miejskie i porównuj specjalistów według portfolio,
            usług, dopasowania do projektu, dostępności oraz połączonych opinii Google.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {seoLocations.map((item) => (
              <Link key={`${item.countrySlug}-${item.citySlug}`} href={locationPath(item)} className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">
                {item.city}, {item.country}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
