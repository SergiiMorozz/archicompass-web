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
  location: string | null;
  reference_photo_names: string[] | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function ClientBriefsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("project_briefs")
    .select("id, title, project_type, goal, style_direction, support_scope, budget_signal, timeline, location, reference_photo_names, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const briefs = (data ?? []) as Brief[];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">Project Compass library</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Saved briefs</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Your saved project prompts stay here with scope, budget, timing, and reference context.
            </p>
          </div>
          <Link href="/project-compass" className="w-fit rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Create another brief</Link>
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
                    <div className="text-sm font-semibold text-primary">{brief.project_type || "Project brief"}</div>
                    <h2 className="mt-1 text-2xl font-bold">{brief.title || "Untitled brief"}</h2>
                    <div className="mt-2 text-sm text-muted">Saved {formatDate(brief.created_at)}</div>
                  </div>
                  <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                    {countLabel(brief.reference_photo_names?.length ?? 0, "photo")}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  {[
                    ["Goal", brief.goal],
                    ["Style", brief.style_direction],
                    ["Support", brief.support_scope],
                    ["Budget", brief.budget_signal],
                    ["Timeline", brief.timeline],
                    ["Location", brief.location],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-line bg-background p-3">
                      <div className="text-muted">{label}</div>
                      <div className="mt-1 font-semibold">{value || "Not specified"}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link href={`/account/briefs#${brief.id}`} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Send or manage brief</Link>
                  <Link href="/designers" className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary">Find designers</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-card p-8">
            <h2 className="text-2xl font-bold">No saved briefs yet</h2>
            <p className="mt-2 max-w-xl leading-7 text-muted">Project Compass will turn reference images and practical needs into a brief you can reuse.</p>
            <Link href="/project-compass" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">Build project brief</Link>
          </div>
        )}
      </section>
    </main>
  );
}
