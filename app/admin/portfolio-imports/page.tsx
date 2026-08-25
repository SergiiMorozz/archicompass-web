import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import AdminRetryButton from "@/components/portfolio-autopilot/AdminRetryButton";

export const revalidate = 0;
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

type JobRow = {
  id: string;
  user_id: string;
  source_type: string;
  source_url: string | null;
  status: string;
  images_found: number;
  projects_found: number;
  created_at: string;
};

function statusClass(status: string) {
  if (status === "FAILED") return "bg-red-50 text-red-700";
  if (status === "PUBLISHED") return "bg-emerald-50 text-emerald-800";
  if (status === "READY_FOR_REVIEW") return "bg-primary-soft text-primary";
  return "bg-[#fff3df] text-[#8a5a00]";
}

export default async function AdminPortfolioImportsPage() {
  const copy = getPortfolioAutopilotCopy().admin;
  const { supabase } = await requireAdmin("moderation");

  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .select("id, user_id, source_type, source_url, status, images_found, projects_found, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const jobs = (data ?? []) as JobRow[];
  const userIds = Array.from(new Set(jobs.map((job) => job.user_id)));
  const { data: profileRows } = userIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null }[] };
  const namesById = new Map((profileRows ?? []).map((row) => [row.id, row.full_name]));
  const designerLabel = (job: JobRow) => namesById.get(job.user_id) || job.user_id;

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">{copy.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error.message}</div>
        ) : jobs.length ? (
          <div className="overflow-x-auto rounded-lg border border-line bg-card shadow-sm">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">{copy.columns.designer}</th>
                  <th className="px-4 py-3">{copy.columns.source}</th>
                  <th className="px-4 py-3">{copy.columns.status}</th>
                  <th className="px-4 py-3">{copy.columns.images}</th>
                  <th className="px-4 py-3">{copy.columns.projects}</th>
                  <th className="px-4 py-3">{copy.columns.created}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3 font-medium">{designerLabel(job)}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted">{job.source_url || job.source_type}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(job.status)}`}>{job.status}</span>
                    </td>
                    <td className="px-4 py-3">{job.images_found}</td>
                    <td className="px-4 py-3">{job.projects_found}</td>
                    <td className="px-4 py-3 text-muted">{new Date(job.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{job.status === "FAILED" ? <AdminRetryButton jobId={job.id} /> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-card p-8 text-muted">No import jobs yet.</div>
        )}
      </section>
    </main>
  );
}
