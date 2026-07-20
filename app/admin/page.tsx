import Link from "next/link";
import { getWorkspaceCopy } from "@/content/workspace-copy";
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
  registrations_30?: number;
  ai_analyses_30?: number;
  briefs_saved_30?: number;
  inquiries_sent_30?: number;
  messages_sent_30?: number;
  hidden_profiles?: number;
  hidden_projects?: number;
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

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function accountLabel(user: AdminUser, labels: { professional: string; client: string; noProfile: string }) {
  if (user.profession_type || user.user_type === "professional") return labels.professional;
  return user.user_type === "client" ? labels.client : labels.noProfile;
}

function reviewClass(status: string) {
  if (status === "needs_review") return "bg-red-50 text-red-700";
  if (status === "priority") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-emerald-50 text-emerald-800";
}

export default async function AdminOverviewPage() {
  const copy = getWorkspaceCopy().adminOverview;
  const { supabase } = await requireAdmin();
  const [statsResult, usersResult, contentResult] = await Promise.all([
    supabase.rpc("admin_dashboard_stats"),
    supabase.rpc("admin_user_directory", {
      account_type: "all",
      page_limit: 8,
      page_offset: 0,
      review_filter: "all",
      search_text: null,
      visibility_filter: "all",
    }),
    supabase.from("inspiration_articles").select("status"),
  ]);

  const stats = (statsResult.data ?? {}) as AdminStats;
  const users = (usersResult.data ?? []) as AdminUser[];
  const briefCount = numberValue(stats.briefs);
  const inquiryCount = numberValue(stats.inquiries);
  const contentRows = contentResult.data ?? [];
  const publishedArticles = contentRows.filter((article) => article.status === "published").length;
  const cards = [
    [copy.cards[0], numberValue(stats.users), copy.details.newIn30(numberValue(stats.signups_30))],
    [copy.cards[1], numberValue(stats.professionals), copy.details.profileSupply],
    [copy.cards[2], numberValue(stats.clients), copy.details.activeAccounts(numberValue(stats.active_30))],
    [copy.cards[3], numberValue(stats.projects), copy.details.publicWork],
    [copy.cards[4], briefCount, copy.details.aiResult],
    [copy.cards[5], inquiryCount, copy.details.entirePlatform],
    [copy.cards[6], contentRows.length, copy.details.published(publishedArticles)],
    [copy.cards[7], numberValue(stats.hidden_profiles) + numberValue(stats.hidden_projects), copy.details.hidden(numberValue(stats.hidden_profiles), numberValue(stats.hidden_projects))],
    [copy.cards[8], numberValue(stats.profile_views_30), copy.details.last30Days],
  ];
  const funnelCards = [
    [copy.funnel.cards[0], numberValue(stats.registrations_30)],
    [copy.funnel.cards[1], numberValue(stats.ai_analyses_30)],
    [copy.funnel.cards[2], numberValue(stats.briefs_saved_30)],
    [copy.funnel.cards[3], numberValue(stats.inquiries_sent_30)],
    [copy.funnel.cards[4], numberValue(stats.messages_sent_30)],
  ];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              {copy.intro}
            </p>
          </div>
          <Link
            href="/admin/users"
            className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white"
          >
            {copy.openUsersCta}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {statsResult.error || usersResult.error || contentResult.error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {copy.loadError}
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

        <section className="mt-8 rounded-lg border border-line bg-primary-soft/40 p-5 sm:p-6">
          <div className="text-sm font-semibold text-primary">{copy.funnel.eyebrow}</div>
          <h2 className="mt-1 text-2xl font-bold">{copy.funnel.title}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {funnelCards.map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border border-line bg-card p-4">
                <div className="text-sm font-semibold text-muted">{label}</div>
                <div className="mt-2 text-3xl font-bold text-primary">{value}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-primary">{copy.activityEyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.recentAccounts}</h2>
              </div>
              <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline">
                {copy.viewAll}
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
                      <div className="font-semibold">{user.full_name || user.email || copy.accountLabels.noProfile}</div>
                      <div className="mt-1 text-sm text-muted">
                        {accountLabel(user, copy.accountLabels)} | {copy.joined} {formatDate(user.created_at, copy.dateLocale)}
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${reviewClass(user.review_status)}`}>
                      {user.review_status.replace("_", " ")}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-sm text-muted">{copy.noAccounts}</div>
              )}
            </div>
          </section>

          <aside className="grid h-fit gap-5">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{copy.privacyEyebrow}</div>
              <h2 className="mt-1 text-2xl font-bold">{copy.privacyTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {copy.privacyBody}
              </p>
            </section>

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">{copy.contentEyebrow}</div>
              <h2 className="mt-1 text-2xl font-bold">{copy.contentTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {copy.contentBody}
              </p>
              <Link href="/admin/content" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                {copy.manageContentCta}
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
