import Link from "next/link";
import ProjectCompass from "@/app/ai-style-finder/ProjectCompass";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectCompassGate() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const accountRole = user ? await getExplicitAccountRole(supabase, user.id) : null;

  if (accountRole === "designer") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <section className="rounded-lg border border-line bg-card p-8 shadow-sm">
          <div className="text-sm font-semibold text-primary">Client planning tool</div>
          <h1 className="mt-2 text-4xl font-bold">Project Compass is for client accounts</h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Your designer account receives project briefs and manages professional
            conversations. Client briefs cannot be created or sent from this account.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/studio"
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
            >
              Open Designer Studio
            </Link>
            <Link
              href="/designers"
              className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Browse marketplace
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <ProjectCompass />;
}
