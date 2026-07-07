import Link from "next/link";
import { redirect } from "next/navigation";
import { countLabel } from "@/lib/count-label";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Brief = {
  id: string;
  title: string | null;
  project_type: string | null;
  goal: string | null;
  style_direction: string | null;
  support_scope: string | null;
  budget_signal: string | null;
  timeline: string | null;
  area_m2: number | null;
  room_count: number | null;
  room_types: string[] | null;
  property_status: string | null;
  visualization_need: string | null;
  supervision_need: string | null;
  location: string | null;
  reference_photo_names: string[] | null;
  designer_search_href: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function matchingDesignersHref(brief: Brief) {
  const source = brief.designer_search_href?.startsWith("/designers")
    ? brief.designer_search_href
    : "/designers";
  const url = new URL(source, "https://archicompass.local");
  url.searchParams.set("match", "brief");
  url.searchParams.set("brief", brief.id);
  if (!url.searchParams.has("sort")) url.searchParams.set("sort", "recommended");
  if (!url.searchParams.has("view")) url.searchParams.set("view", "list");
  return `${url.pathname}?${url.searchParams.toString()}`;
}

export default async function ClientBriefsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("project_briefs")
    .select("id, title, project_type, goal, style_direction, support_scope, budget_signal, timeline, area_m2, room_count, room_types, property_status, visualization_need, supervision_need, location, reference_photo_names, designer_search_href, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const briefs = (data ?? []) as Brief[];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">Biblioteka Project Compass</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Zapisane briefy</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Your saved project prompts stay here with scope, budget, timing, and reference context.
            </p>
          </div>
          <Link href="/project-compass" className="w-fit rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Utwórz kolejny brief</Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">Briefs could not be loaded: {error.message}</div>
        ) : briefs.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {briefs.map((brief) => (
              <article key={brief.id} className="rounded-lg border border-line bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-primary">{brief.project_type || "Brief projektowy"}</div>
                    <h2 className="mt-1 text-2xl font-bold">{brief.title || "Brief bez tytułu"}</h2>
                    <div className="mt-2 text-sm text-muted">Saved {formatDate(brief.created_at)}</div>
                  </div>
                  <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                    {countLabel(brief.reference_photo_names?.length ?? 0, "photo")}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ["Goal", brief.goal],
                    ["Styl", brief.style_direction],
                    ["Wsparcie", brief.support_scope],
                    ["Budżet", brief.budget_signal],
                    ["Termin", brief.timeline],
                    ["Area", brief.area_m2 ? `${brief.area_m2} m2` : null],
                    ["Pomieszczenia", brief.room_types?.join(", ") || (brief.room_count ? String(brief.room_count) : null)],
                    ["Nieruchomość", brief.property_status],
                    ["3D", brief.visualization_need],
                    ["Nadzór", brief.supervision_need],
                    ["Lokalizacja", brief.location],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-line bg-background p-3">
                      <div className="text-muted">{label}</div>
                      <div className="mt-1 font-semibold">{value || "Nie podano"}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/account/briefs#${brief.id}`} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Wyślij lub zarządzaj briefem</Link>
                  <Link href={matchingDesignersHref(brief)} className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary">Znajdź dopasowanych projektantów</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-card p-8">
            <h2 className="text-2xl font-bold">Nie masz jeszcze zapisanych briefów</h2>
            <p className="mt-2 max-w-xl leading-7 text-muted">Project Compass zamieni zdjęcia referencyjne i praktyczne potrzeby w brief, który możesz wielokrotnie wykorzystać.</p>
            <Link href="/project-compass" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Utwórz brief projektowy</Link>
          </div>
        )}
      </section>
    </main>
  );
}
