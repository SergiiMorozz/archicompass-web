import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { countLabel } from "@/lib/count-label";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  applyDemoProfilePresentation,
  getDemoProfilePresentation,
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
  hourly_rate: number | null;
  years_experience: number | null;
  created_at: string;
};

type SP = {
  q?: string;
  location?: string;
  specialty?: string;
  minRate?: string;
  maxRate?: string;
  sort?: "recommended" | "newest" | "rate";
  view?: "grid" | "list";
};

const trendChips = [
  { label: "Eco-friendly", params: { specialty: "eco-friendly" } },
  { label: "Smart Home", params: { specialty: "smart home" } },
  { label: "Luxury", params: { specialty: "luxury" } },
  { label: "Minimalist", params: { specialty: "minimalist" } },
  { label: "Warsaw", params: { location: "Warsaw" } },
];

const styleFilters = [
  "Minimalist",
  "Scandinavian",
  "Modern",
  "Industrial",
  "Contemporary",
  "Traditional",
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
  return value === "newest" || value === "rate" ? value : "recommended";
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

function rateLabel(rate: number | null) {
  return rate ? `${rate} PLN/hour` : "Budget discussed after brief";
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

function experienceLabel(value: number | null) {
  if (!value) return "Experience not provided";
  return value === 1 ? "1 year experience" : `${value}+ years experience`;
}

function DesignerCard({
  profile,
  index,
  requestedLocation,
  requestedSpecialty,
  initialSaved,
  view,
}: {
  profile: Profile;
  index: number;
  requestedLocation: string;
  requestedSpecialty: string;
  initialSaved: boolean;
  view: "grid" | "list";
}) {
  const title = profileTitle(profile);
  const type = profileType(profile);
  const location = profileLocation(profile);
  const cover = coverImages[index % coverImages.length];
  const specialties = profile.specialties?.filter(Boolean).slice(0, 5) ?? [];
  const demo = getDemoProfilePresentation(profile.id);
  const matchItems = [
    ["Style / specialty", requestedSpecialty || demo?.bestFor || specialties[0] || type],
    ["Project fit", demo?.projectFit || "Review the portfolio for similar room and project types"],
    ["Location", requestedLocation || location],
  ];

  if (view === "list") {
    return (
      <article className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <div className="grid lg:grid-cols-[280px_1fr]">
          <Link
            href={`/designers/${profile.id}`}
            className="relative min-h-[240px] bg-cover bg-center"
            style={{ backgroundImage: `url(${cover})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/72 to-transparent" />
            <div className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-2xl border-2 border-white bg-primary text-xl font-bold text-white shadow">
              {initials(title)}
            </div>
            <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
              {demo ? "Demo profile" : "Beta profile"}
            </div>
          </Link>

          <div className="p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Link href={`/designers/${profile.id}`} className="text-2xl font-bold hover:text-primary">
                  {title}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
                    {demo ? "Example profile" : "Early professional"}
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
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
              {profile.bio || "This beta profile has not added a public introduction yet."}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {specialties.length ? (
                specialties.map((specialty) => (
                  <span key={specialty} className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                    {specialty}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                  {type}
                </span>
              )}
            </div>

            <div className="mt-5 rounded-lg bg-primary-soft p-4">
              <div className="text-xs font-semibold uppercase text-primary">Why it may fit</div>
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
                <div className="text-xl font-bold text-primary">{rateLabel(profile.hourly_rate)}</div>
                <div className="text-sm text-muted">{demo?.budgetFit || "Beta portfolio profile"}</div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/designers/${profile.id}`}
                  className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  View Portfolio
                </Link>
                <Link
                  href={`/account/briefs?designer=${profile.id}`}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  Send Brief
                </Link>
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
        href={`/designers/${profile.id}`}
        className="relative block h-64 bg-cover bg-center"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f172a]/78 via-[#1f172a]/20 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-sm font-semibold text-foreground shadow-sm">
          {demo ? "Demo" : "Beta"}
        </div>
        <div className="absolute bottom-4 left-4 grid h-14 w-14 place-items-center rounded-2xl border-2 border-white bg-primary text-xl font-bold text-white shadow">
          {initials(title)}
        </div>
      </Link>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/designers/${profile.id}`} className="block truncate text-xl font-bold hover:text-primary">
              {title}
            </Link>
            <p className="mt-1 text-sm text-muted">{type}</p>
          </div>
          <FavoriteButton compact entityType="designer" entityKey={profile.id} initialSaved={initialSaved} />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
            {demo ? "Example profile" : "Early professional"}
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-muted">
          <span>{location}</span>
          <span>{experienceLabel(profile.years_experience)}</span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
          {profile.bio || "This beta profile has not added a public introduction yet."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {specialties.length ? (
            specialties.slice(0, 3).map((specialty) => (
              <span key={specialty} className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                {specialty}
              </span>
            ))
          ) : (
            <span className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
              {type}
            </span>
          )}
        </div>

        <div className="mt-5 rounded-lg bg-primary-soft p-4 text-sm">
          <div className="text-xs font-semibold uppercase text-primary">Best fit signal</div>
          <div className="mt-2 font-semibold">{matchItems[0][1]}</div>
          <div className="mt-1 text-muted">{matchItems[2][1]}</div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
          <div>
            <div className="font-bold text-primary">{rateLabel(profile.hourly_rate)}</div>
            <div className="text-xs text-muted">{demo?.budgetFit || "Beta portfolio profile"}</div>
          </div>
          <Link
            href={`/designers/${profile.id}`}
            className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
          >
            View Portfolio
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
  const view = selectedView(first(sp.view));
  const sort = selectedSort(first(sp.sort));

  const minRateRaw = first(sp.minRate).trim();
  const maxRateRaw = first(sp.maxRate).trim();
  const minRate = minRateRaw ? Number(minRateRaw) : NaN;
  const maxRate = maxRateRaw ? Number(maxRateRaw) : NaN;

  const supabase = await createSupabaseServerClient();

  const query = supabase
    .from("profiles")
    .select(
      "id, full_name, bio, location, profession_type, user_type, specialties, hourly_rate, years_experience, created_at"
    )
    .eq("user_type", "professional")
    .order("created_at", { ascending: false })
    .limit(60);

  const { data, error } = await query;
  const { data: userData } = await supabase.auth.getUser();
  const { data: favoriteData } = userData.user
    ? await supabase
        .from("favorites")
        .select("entity_key")
        .eq("user_id", userData.user.id)
        .eq("entity_type", "designer")
    : { data: [] };
  const savedDesignerIds = new Set((favoriteData ?? []).map((item) => item.entity_key));
  const normalizedQuery = q.toLowerCase();
  const normalizedLocation = location.toLowerCase();
  const normalizedSpecialty = specialty
    .toLowerCase()
    .replace(/(istic|ist|ism)$/, "");

  let profiles = ((data ?? []) as Profile[])
    .map(applyDemoProfilePresentation)
    .filter((profile) => {
      const searchable = [
        profile.full_name,
        profile.bio,
        profile.profession_type,
        ...(profile.specialties ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const specialtyText = (profile.specialties ?? []).join(" ").toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesLocation =
        !normalizedLocation ||
        (profile.location ?? "").toLowerCase().includes(normalizedLocation);
      const matchesSpecialty =
        !normalizedSpecialty || specialtyText.includes(normalizedSpecialty);
      const matchesMinimum =
        Number.isNaN(minRate) ||
        (profile.hourly_rate !== null && profile.hourly_rate >= minRate);
      const matchesMaximum =
        Number.isNaN(maxRate) ||
        (profile.hourly_rate !== null && profile.hourly_rate <= maxRate);

      return (
        matchesQuery &&
        matchesLocation &&
        matchesSpecialty &&
        matchesMinimum &&
        matchesMaximum
      );
    });

  if (sort === "rate") {
    profiles = profiles.sort(
      (a, b) => (a.hourly_rate ?? Number.MAX_SAFE_INTEGER) - (b.hourly_rate ?? Number.MAX_SAFE_INTEGER)
    );
  }

  const base = {
    q,
    location,
    specialty,
    minRate: Number.isNaN(minRate) ? "" : String(minRate),
    maxRate: Number.isNaN(maxRate) ? "" : String(maxRate),
    sort,
  };

  const gridHref = "/designers" + qs({ ...base, view: "grid" });
  const listHref = "/designers" + qs({ ...base, view: "list" });
  const hasFilters = Boolean(q || location || specialty || minRateRaw || maxRateRaw);

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight">Find Designer</h1>
            <p className="mt-4 text-lg leading-8 text-muted">
              Browse beta designer and architect profiles by style, location, and
              project fit.
            </p>
          </div>

          <form action="/designers" className="mx-auto mt-9 max-w-4xl">
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="sort" value={sort} />
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-background p-3 shadow-sm sm:flex-row">
              <input
                name="q"
                defaultValue={q}
                placeholder="Search designers by name, style, or specialty..."
                className="min-h-12 flex-1 rounded-xl bg-transparent px-3 outline-none"
              />
              <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white">
                Search
              </button>
            </div>
          </form>

          <div className="mt-7 flex flex-wrap justify-center gap-2">
            <span className="rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold">
              Trending
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

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[290px_1fr]">
        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Filters</h2>
              <p className="mt-1 text-sm text-muted">{countLabel(profiles.length, "result")}</p>
            </div>
            {hasFilters ? (
              <Link href="/designers" className="text-sm font-semibold text-primary hover:underline">
                Reset all
              </Link>
            ) : null}
          </div>

          <form action="/designers" className="mt-6 grid gap-6">
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="sort" value={sort} />
            <input type="hidden" name="q" value={q} />

            <label className="block text-sm font-semibold">
              Location
              <input
                name="location"
                defaultValue={location}
                placeholder="Enter city or ZIP code"
                className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-3 font-normal outline-none focus:border-primary"
              />
            </label>

            <div>
              <div className="text-sm font-semibold">Budget Range</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <input
                  name="minRate"
                  defaultValue={Number.isNaN(minRate) ? "" : String(minRate)}
                  placeholder="Min"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-line bg-background px-3 py-3 outline-none focus:border-primary"
                />
                <input
                  name="maxRate"
                  defaultValue={Number.isNaN(maxRate) ? "" : String(maxRate)}
                  placeholder="Max"
                  inputMode="numeric"
                  className="w-full rounded-xl border border-line bg-background px-3 py-3 outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold">Design Style</div>
              <div className="mt-3 grid gap-3">
                {styleFilters.map((style) => (
                  <label key={style} className="flex items-center gap-3 text-sm text-muted">
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="specialty"
                        value={style.toLowerCase()}
                        defaultChecked={specialty.toLowerCase() === style.toLowerCase()}
                        className="h-4 w-4 accent-primary"
                      />
                      {style}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              Apply Filters
            </button>
          </form>
        </aside>

        <div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">
                {countLabel(profiles.length, "designer")} found
              </p>
              <h2 className="mt-1 text-2xl font-bold">Recommended professionals</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={"/designers" + qs({ ...base, view, sort: "recommended" })}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  sort === "recommended" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Recommended
              </Link>
              <Link
                href={"/designers" + qs({ ...base, view, sort: "newest" })}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  sort === "newest" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Newest
              </Link>
              <Link
                href={listHref}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  view === "list" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                List
              </Link>
              <Link
                href={gridHref}
                className={[
                  "rounded-xl border border-line px-4 py-2 text-sm font-semibold",
                  view === "grid" ? "bg-primary text-white" : "bg-card text-muted",
                ].join(" ")}
              >
                Grid
              </Link>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
              <div className="font-semibold">Error loading profiles</div>
              <div className="mt-1 text-sm">{error.message}</div>
            </div>
          ) : profiles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-line bg-card p-8 text-center">
              <div className="text-xl font-bold">No designers match these filters</div>
              <p className="mt-2 text-muted">Try removing a filter or searching a different city.</p>
              <Link
                href="/designers"
                className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Show All Designers
              </Link>
            </div>
          ) : view === "grid" ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile, index) => (
                <DesignerCard
                  key={profile.id}
                  profile={profile}
                  index={index}
                  requestedLocation={location}
                  requestedSpecialty={specialty}
                  initialSaved={savedDesignerIds.has(profile.id)}
                  view={view}
                />
              ))}
            </div>
          ) : (
            <div className="mt-7 grid gap-5">
              {profiles.map((profile, index) => (
                <DesignerCard
                  key={profile.id}
                  profile={profile}
                  index={index}
                  requestedLocation={location}
                  requestedSpecialty={specialty}
                  initialSaved={savedDesignerIds.has(profile.id)}
                  view={view}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
