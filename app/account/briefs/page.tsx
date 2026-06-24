import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type ProjectBrief = {
  id: string;
  title: string | null;
  project_type: string | null;
  goal: string | null;
  style_direction: string | null;
  support_scope: string | null;
  budget_signal: string | null;
  location: string | null;
  visual_cues: string[] | null;
  reference_photo_names: string[] | null;
  brief_text: string;
  designer_search_href: string | null;
  created_at: string;
};

function createdLabel(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function SavedBriefsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: briefsData, error } = await supabase
    .from("project_briefs")
    .select(
      "id, title, project_type, goal, style_direction, support_scope, budget_signal, location, visual_cues, reference_photo_names, brief_text, designer_search_href, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(24);

  const briefs = (briefsData ?? []) as ProjectBrief[];

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            Back to account
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">Project Compass</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Saved briefs
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                Review briefs created with Project Compass before sending them to a
                designer.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">Saved briefs</div>
              <div className="mt-2 text-3xl font-bold text-primary">{briefs.length}</div>
              <Link
                href="/project-compass"
                className="mt-4 flex rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white"
              >
                <span className="w-full">Create new brief</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error.message}
          </div>
        ) : !briefs.length ? (
          <div className="rounded-2xl border border-dashed border-line bg-card p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold">No saved briefs yet</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted">
              Build a Project Compass brief with your style direction, visual cues, and
              reference photos, then save it here.
            </p>
            <Link
              href="/project-compass"
              className="mt-6 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Build project brief
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {briefs.map((brief) => (
              <article
                key={brief.id}
                className="rounded-2xl border border-line bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-primary">
                      {brief.project_type || "Project brief"}
                    </div>
                    <h2 className="mt-1 text-2xl font-bold">
                      {brief.title || "Untitled brief"}
                    </h2>
                    <div className="mt-2 text-sm text-muted">
                      Saved {createdLabel(brief.created_at)}
                    </div>
                  </div>
                  <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                    {brief.reference_photo_names?.length ?? 0} photo
                    {(brief.reference_photo_names?.length ?? 0) === 1 ? "" : "s"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ["Goal", brief.goal],
                    ["Style", brief.style_direction],
                    ["Support", brief.support_scope],
                    ["Budget", brief.budget_signal],
                    ["Location", brief.location],
                    ["Visual cues", brief.visual_cues?.join(", ") || "Not tagged"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-line bg-background p-3">
                      <div className="text-muted">{label}</div>
                      <div className="mt-1 font-semibold">{value || "Not specified"}</div>
                    </div>
                  ))}
                </div>

                <pre className="mt-5 max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-[#1f172a] p-4 text-xs leading-6 text-white/78">
                  {brief.brief_text}
                </pre>

                <div className="mt-5 flex flex-wrap gap-3">
                  {brief.designer_search_href ? (
                    <Link
                      href={brief.designer_search_href}
                      className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                    >
                      Find matching designers
                    </Link>
                  ) : null}
                  <Link
                    href="/project-compass"
                    className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
                  >
                    Create another brief
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
