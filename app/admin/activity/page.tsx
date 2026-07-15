import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getWorkspaceCopy } from "@/content/workspace-copy";

export const revalidate = 0;

type AuditItem = {
  id: number;
  actor_id: string;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function actionLabel(value: string, copy: ReturnType<typeof getWorkspaceCopy>["adminActivity"]) {
  return copy.actions[value] ?? value.replaceAll("_", " ");
}

export default async function AdminActivityPage() {
  const copy = getWorkspaceCopy().adminActivity;
  const { supabase } = await requireAdmin("analytics");
  const { data, error } = await supabase.rpc("admin_activity_feed", { page_limit: 100 });
  const activity = (data ?? []) as AuditItem[];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            {copy.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {copy.loadError(error.message)}
          </div>
        ) : activity.length ? (
          <div className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
            {activity.map((item) => (
              <article
                key={item.id}
                className="grid gap-3 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
              >
                <div>
                  <div className="font-semibold">{actionLabel(item.action, copy)}</div>
                  <div className="mt-1 text-sm text-muted">
                    {item.actor_email || item.actor_id} | {item.target_type}
                    {item.target_id ? ` ${item.target_id}` : ""}
                  </div>
                  {typeof item.metadata?.status === "string" ? (
                    <div className="mt-2 text-xs font-semibold capitalize text-primary">
                      {copy.status}: {String(item.metadata.status).replace("_", " ")}
                    </div>
                  ) : null}
                  {typeof item.metadata?.visibility === "string" ? (
                    <div className="mt-2 text-xs font-semibold capitalize text-primary">
                      {copy.visibility}: {item.metadata.visibility === "hidden" ? copy.hidden : copy.visible}
                    </div>
                  ) : null}
                </div>
                <div className="text-sm text-muted">{formatDate(item.created_at, copy.dateLocale)}</div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-card p-8">
            <h2 className="text-2xl font-bold">{copy.emptyTitle}</h2>
            <p className="mt-2 text-muted">{copy.emptyBody}</p>
            <Link href="/admin/users" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              {copy.openUsers}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
