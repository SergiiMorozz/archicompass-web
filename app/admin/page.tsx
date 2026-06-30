import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

type AdminStats = {
  users?: number;
  profiles?: number;
  professionals?: number;
  clients?: number;
  projects?: number;
  briefs?: number;
  inquiries?: number;
  favorites?: number;
  signups_30?: number;
  active_30?: number;
  profile_views_30?: number;
};

type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  user_type: string | null;
  profession_type: string | null;
  created_at: string;
  review_status: string;
};

function numberValue(value: number | undefined) {
  return Number(value ?? 0);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function accountLabel(user: AdminUser) {
  if (user.profession_type || user.user_type === "professional") return "Professional";
  return user.user_type || "Client";
}

function reviewClass(status: string) {
  if (status === "needs_review") return "bg-red-50 text-red-700";
  if (status === "priority") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-emerald-50 text-emerald-800";
}

export default async function AdminOverviewPage() {
  const { supabase } = await requireAdmin();
  const [statsResult, usersResult] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.rpc("admin_user_directory", {
      account_type: "all",
      page_limit: 8,
      page_offset: 0,
      review_filter: "all",
      search_text: null,
    }),
  ]);

  const stats = (statsResult.data ?? {}) as AdminStats;
  const users = (usersResult.data ?? []) as AdminUser[];
  const briefCount = numberValue(stats.briefs);
  const inquiryCount = numberValue(stats.inquiries);
  const cards = [
    ["Accounts", numberValue(stats.users), `${numberValue(stats.signups_30)} new in 30 days`],
    ["Professionals", numberValue(stats.professionals), "Profile supply"],
    ["Clients", numberValue(stats.clients), `${numberValue(stats.active_30)} active accounts`],
    ["Portfolio projects", numberValue(stats.projects), "Public work"],
    ["Saved briefs", briefCount, "Project Compass output"],
    ["Designer requests", inquiryCount, "Across the closed beta"],
    ["Favorites", numberValue(stats.favorites), "Saved platform items"],
    ["Profile views", numberValue(stats.profile_views_30), "Last 30 days"],
  ];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">Platform operations</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Admin overview</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Monitor the closed beta, review accounts, and understand how users move
              from inspiration to a designer conversation.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Open user directory
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {statsResult.error || usersResult.error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Admin data could not be loaded. Apply the Admin Workspace database migration
            and confirm this account has an active owner role.
          </div>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, detail]) => (
            <article key={String(label)} className="rounded-lg border border-line bg-card p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-4xl font-bold text-primary">{value}</div>
              <div className="mt-2 text-sm text-muted">{detail}</div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-primary">Latest activity</div>
                <h2 className="mt-1 text-3xl font-bold">Recent accounts</h2>
              </div>
              <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline">
                View all
              </Link>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-line bg-card shadow-sm">
              {users.length ? (
                users.map((user) => (
                  <Link
                    key={user.user_id}
                    href={`/admin/users/${user.user_id}`}
                    className="flex flex-col gap-3 border-b border-line px-5 py-4 last:border-b-0 hover:bg-primary-soft/40 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="font-semibold">{user.full_name || user.email || "Unnamed account"}</div>
                      <div className="mt-1 text-sm text-muted">
                        {accountLabel(user)} | Joined {formatDate(user.created_at)}
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${reviewClass(user.review_status)}`}>
                      {user.review_status.replace("_", " ")}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-sm text-muted">No accounts available yet.</div>
              )}
            </div>
          </section>

          <aside className="grid h-fit gap-5">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Privacy boundary</div>
              <h2 className="mt-1 text-2xl font-bold">Operational data only</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                This workspace exposes counts, account details, public profiles, and
                public projects. Message bodies and private reference photos remain
                outside the admin dashboard.
              </p>
            </section>

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Coming next</div>
              <h2 className="mt-1 text-2xl font-bold">Content operations</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Inspiration HUB and article publishing will use this same protected
                workspace, followed by staff permissions and future payment oversight.
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
