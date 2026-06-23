import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  "Minimalistic",
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
  return rate ? `${rate} PLN/project` : "Rate on request";
}

function profileTitle(profile: Profile) {
  return profile.full_name || "Unnamed professional";
}

function profileType(profile: Profile) {
  return profile.profession_type || profile.user_type || "Professional";
}

function profileLocation(profile: Profile) {
  return profile.location || "Location flexible";
}

function DesignerCard({
  profile,
  index,
  view,
}: {
  profile: Profile;
  index: number;
  view: "grid" | "list";
}) {
  const title = profileTitle(profile);
  const type = profileType(profile);
  const location = profileLocation(profile);
  const cover = coverImages[index % coverImages.length];
  const specialties = profile.specialties?.filter(Boolean).slice(0, 5) ?? [];

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
              4.5
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
                    Early Professional
                  </span>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    Verified
                  </span>
                  <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                    Portfolio
                  </span>
                </div>
              </div>
              <button className="h-10 rounded-xl border border-line bg-background px-4 text-sm font-semibold">
                Save
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              <span>{location}</span>
              <span>5+ years</span>
              <span>Replies in 1-2 days</span>
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
              {profile.bio || "Portfolio-ready professional profile. Add more profile details to make this card shine."}
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

            <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xl font-bold text-primary">{rateLabel(profile.hourly_rate)}</div>
                <div className="text-sm text-muted">Portfolio profile</div>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/designers/${profile.id}`}
                  className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                >
                  View Portfolio
                </Link>
                <button className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  Request Estimate
                </button>
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
          4.5
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
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-background text-sm">
            Save
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-[#fff3df] px-3 py-1 text-xs font-semibold text-[#b56b08]">
            Early Professional
          </span>
          <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
            Verified
          </span>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-muted">
          <span>{location}</span>
          <span>5+ years experience</span>
          <span>Replies in 1-2 days</span>
        </div>

        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
          {profile.bio || "Portfolio-ready professional profile. Add more profile details to make this card shine."}
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

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-5">
          <div>
            <div className="font-bold text-primary">{rateLabel(profile.hourly_rate)}</div>
            <div className="text-xs text-muted">Portfolio profile</div>
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

  let query = supabase
    .from("profiles")
    .select(
      "id, full_name, bio, location, profession_type, user_type, specialties, hourly_rate, created_at"
    )
    .eq("user_type", "professional")
    .limit(60);

  if (q) query = query.ilike("full_name", `%${q}%`);
  if (location) query = query.ilike("location", `%${location}%`);
  if (specialty) query = query.contains("specialties", [specialty]);
  if (!Number.isNaN(minRate)) query = query.gte("hourly_rate", minRate);
  if (!Number.isNaN(maxRate)) query = query.lte("hourly_rate", maxRate);

  if (sort === "rate") {
    query = query.order("hourly_rate", { ascending: true, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  const profiles = (data ?? []) as Profile[];

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
              Search verified interior designers and architects by style, location,
              and budget.
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
              <p className="mt-1 text-sm text-muted">{profiles.length} result{profiles.length === 1 ? "" : "s"}</p>
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
                  <label key={style} className="flex items-center justify-between gap-3 text-sm text-muted">
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
                    <span className="rounded-full bg-background px-2 py-1 text-xs">0</span>
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
                {profiles.length} designer{profiles.length === 1 ? "" : "s"} found
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
                <DesignerCard key={profile.id} profile={profile} index={index} view={view} />
              ))}
            </div>
          ) : (
            <div className="mt-7 grid gap-5">
              {profiles.map((profile, index) => (
                <DesignerCard key={profile.id} profile={profile} index={index} view={view} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
