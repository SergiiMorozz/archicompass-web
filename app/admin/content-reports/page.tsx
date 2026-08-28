import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { siteLocale } from "@/lib/site-locale";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
type ContentReport = {
  id: string;
  target_type: "profile" | "project";
  target_profile_id: string;
  target_project_id: string | null;
  category: string;
  details: string | null;
  status: ReportStatus;
  moderation_note: string | null;
  created_at: string;
  reviewed_at: string | null;
};

const statuses: ReportStatus[] = ["pending", "reviewing", "resolved", "dismissed"];

const copy = siteLocale === "en" ? {
  eyebrow: "Moderation",
  title: "Content reports",
  intro: "Review reports submitted from public profiles and portfolio projects. Reporter fingerprints and account identifiers are intentionally not shown here.",
  all: "All",
  empty: "There are no reports in this view.",
  target: "Reported content",
  category: "Reason",
  details: "Reporter details",
  status: "Status",
  note: "Internal note (optional)",
  save: "Save review",
  updated: "The report review has been saved.",
  error: "Could not save the report review.",
  profile: "Profile",
  project: "Portfolio project",
} : {
  eyebrow: "Moderacja",
  title: "Zgłoszenia treści",
  intro: "Sprawdzaj zgłoszenia przesłane z publicznych profili i realizacji portfolio. Odciski połączeń oraz identyfikatory kont zgłaszających celowo nie są tu wyświetlane.",
  all: "Wszystkie",
  empty: "W tym widoku nie ma zgłoszeń.",
  target: "Zgłoszona treść",
  category: "Powód",
  details: "Opis zgłaszającego",
  status: "Status",
  note: "Notatka wewnętrzna (opcjonalnie)",
  save: "Zapisz weryfikację",
  updated: "Weryfikacja zgłoszenia została zapisana.",
  error: "Nie udało się zapisać weryfikacji zgłoszenia.",
  profile: "Profil",
  project: "Projekt portfolio",
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function textValue(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function reportPath(report: Pick<ContentReport, "target_type" | "target_profile_id" | "target_project_id">) {
  return report.target_type === "profile"
    ? `/designers/${report.target_profile_id}`
    : report.target_project_id ? `/projects/${report.target_project_id}` : "/admin/content-reports";
}

async function updateReport(formData: FormData) {
  "use server";

  const id = textValue(formData, "id", 100);
  const status = textValue(formData, "status", 30);
  const note = textValue(formData, "moderation_note", 4000);
  if (!isUuid(id) || !statuses.includes(status as ReportStatus)) {
    redirect("/admin/content-reports?error=invalid");
  }

  const { user } = await requireAdmin("moderation");
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("content_reports")
    .update({
      status,
      moderation_note: note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) redirect("/admin/content-reports?error=save");
  revalidatePath("/admin/content-reports");
  redirect("/admin/content-reports?updated=1");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(siteLocale === "en" ? "en-GB" : "pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminContentReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; updated?: string; error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const selectedStatus = statuses.includes(sp.status as ReportStatus) ? sp.status as ReportStatus : "all";
  await requireAdmin("moderation");
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("content_reports")
    .select("id, target_type, target_profile_id, target_project_id, category, details, status, moderation_note, created_at, reviewed_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const allReports = (data ?? []) as ContentReport[];
  const reports = selectedStatus === "all" ? allReports : allReports.filter((report) => report.status === selectedStatus);

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{copy.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.updated ? <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{copy.updated}</div> : null}
        {sp.error ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{copy.error}</div> : null}
        {error ? <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{copy.error}</div> : null}

        <div className="flex gap-2 overflow-x-auto pb-2">
          {["all", ...statuses].map((status) => (
            <Link
              key={status}
              href={status === "all" ? "/admin/content-reports" : `/admin/content-reports?status=${status}`}
              className={[
                "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
                selectedStatus === status ? "bg-primary text-white" : "border border-line bg-card text-muted",
              ].join(" ")}
            >
              {status === "all" ? `${copy.all} ${allReports.length}` : `${status} ${allReports.filter((report) => report.status === status).length}`}
            </Link>
          ))}
        </div>

        {reports.length ? (
          <div className="mt-5 grid gap-5">
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-line bg-card p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">{copy.category}: {report.category}</div>
                    <h2 className="mt-2 text-xl font-bold">
                      {report.target_type === "profile" ? copy.profile : copy.project}
                    </h2>
                    <p className="mt-1 text-sm text-muted">{formatDate(report.created_at)}{report.reviewed_at ? ` · ${copy.status}: ${report.status}` : ""}</p>
                  </div>
                  <Link href={reportPath(report)} className="w-fit rounded-xl border border-line bg-background px-4 py-2 text-sm font-semibold text-primary hover:border-primary">
                    {copy.target}
                  </Link>
                </div>

                {report.details ? <p className="mt-4 rounded-xl bg-background p-4 text-sm leading-6 text-foreground">{report.details}</p> : <p className="mt-4 text-sm text-muted">{copy.details}: —</p>}

                <form action={updateReport} className="mt-5 grid gap-4 border-t border-line pt-5 lg:grid-cols-[180px_minmax(0,1fr)_auto] lg:items-end">
                  <input type="hidden" name="id" value={report.id} />
                  <label className="grid gap-2 text-sm font-semibold">
                    {copy.status}
                    <select name="status" defaultValue={report.status} className="rounded-xl border border-line bg-background px-3 py-2.5 font-normal">
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-semibold">
                    {copy.note}
                    <input name="moderation_note" defaultValue={report.moderation_note ?? ""} maxLength={4000} className="rounded-xl border border-line bg-background px-3 py-2.5 font-normal" />
                  </label>
                  <button className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">{copy.save}</button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-line bg-card p-8 text-muted">{copy.empty}</div>
        )}
      </section>
    </main>
  );
}
