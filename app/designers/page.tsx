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
  view?: "grid" | "list";
};

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

export default async function DesignersPage({
  searchParams,
}: {
  searchParams?: Promise<SP>;
}) {
  const sp = (await searchParams) ?? {};

  const q = first(sp.q).trim();
  const location = first(sp.location).trim();
  const specialty = first(sp.specialty).trim();
  const view = (first(sp.view) as "grid" | "list") || "grid";

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
    .order("created_at", { ascending: false })
    .limit(60);

  if (q) query = query.ilike("full_name", `%${q}%`);
  if (location) query = query.ilike("location", `%${location}%`);
  if (specialty) query = query.contains("specialties", [specialty]);
  if (!Number.isNaN(minRate)) query = query.gte("hourly_rate", minRate);
  if (!Number.isNaN(maxRate)) query = query.lte("hourly_rate", maxRate);

  const { data, error } = await query;
  const profiles = (data ?? []) as Profile[];

  const base = {
    q,
    location,
    specialty,
    minRate: Number.isNaN(minRate) ? "" : String(minRate),
    maxRate: Number.isNaN(maxRate) ? "" : String(maxRate),
  };

  const gridHref = "/designers" + qs({ ...base, view: "grid" });
  const listHref = "/designers" + qs({ ...base, view: "list" });

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Designers</h1>
            <p className="mt-1 text-zinc-600">Browse professionals from our database.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={gridHref}
              className={`rounded-full border px-4 py-2 text-sm ${
                view === "grid"
                  ? "bg-black text-white border-black"
                  : "hover:bg-zinc-50"
              }`}
            >
              Grid
            </Link>
            <Link
              href={listHref}
              className={`rounded-full border px-4 py-2 text-sm ${
                view === "list"
                  ? "bg-black text-white border-black"
                  : "hover:bg-zinc-50"
              }`}
            >
              List
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
          <form action="/designers" className="contents">
            <input type="hidden" name="view" value={view} />

            <div>
              <label className="text-xs text-zinc-600">Search name</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="e.g. Anna"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-600">Location</label>
              <input
                name="location"
                defaultValue={location}
                placeholder="e.g. Warsaw"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-600">Specialty</label>
              <input
                name="specialty"
                defaultValue={specialty}
                placeholder="e.g. modern interiors"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-600">Min rate</label>
                <input
                  name="minRate"
                  defaultValue={Number.isNaN(minRate) ? "" : String(minRate)}
                  placeholder="e.g. 50"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-600">Max rate</label>
                <input
                  name="maxRate"
                  defaultValue={Number.isNaN(maxRate) ? "" : String(maxRate)}
                  placeholder="e.g. 200"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex gap-3">
              <button
                type="submit"
                className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Apply filters
              </button>

              <Link
                href="/designers"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Reset
              </Link>
            </div>
          </form>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-medium">Error loading profiles</div>
            <div className="text-sm mt-1">{error.message}</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="mt-6 rounded-2xl border p-6">
            <div className="font-medium">No profiles found</div>
            <div className="mt-2 text-sm text-zinc-600">Try changing filters.</div>
          </div>
        ) : view === "list" ? (
          <div className="mt-8 space-y-3">
            {profiles.map((p) => {
              const title = p.full_name || "Unnamed professional";
              const type = p.profession_type || p.user_type || "Professional";
              const subtitle = p.location ? `${type} · ${p.location}` : type;

              return (
                <Link
                  key={p.id}
                  href={`/designers/${p.id}`}
                  className="block rounded-2xl border p-5 hover:bg-zinc-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold">{title}</div>
                      <div className="mt-1 text-sm text-zinc-600">{subtitle}</div>

                      {p.specialties?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {p.specialties.slice(0, 6).map((s) => (
                            <span
                              key={s}
                              className="rounded-full border px-3 py-1 text-xs text-zinc-700"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <p className="mt-3 text-sm text-zinc-700 line-clamp-2">
                        {p.bio || "No bio yet."}
                      </p>
                    </div>

                    <div className="shrink-0 text-sm text-zinc-600">
                      {p.hourly_rate ? `${p.hourly_rate}/h` : "rate n/a"}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => {
              const title = p.full_name || "Unnamed professional";
              const type = p.profession_type || p.user_type || "Professional";
              const subtitle = p.location ? `${type} · ${p.location}` : type;

              return (
                <div key={p.id} className="rounded-2xl border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold truncate">{title}</div>
                      <div className="mt-1 text-sm text-zinc-600">{subtitle}</div>
                    </div>
                    <div className="shrink-0 text-sm text-zinc-600">
                      {p.hourly_rate ? `${p.hourly_rate}/h` : "rate n/a"}
                    </div>
                  </div>

                  {p.specialties?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.specialties.slice(0, 6).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border px-3 py-1 text-xs text-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <p className="mt-3 text-sm text-zinc-700 line-clamp-3">
                    {p.bio || "No bio yet."}
                  </p>

                  <Link className="mt-4 inline-block text-sm underline" href={`/designers/${p.id}`}>
                    View profile →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
