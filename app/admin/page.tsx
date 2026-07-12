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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function accountLabel(user: AdminUser) {
  if (user.profession_type || user.user_type === "professional") return "Specjalista";
  return user.user_type === "client" ? "Klient" : "Brak profilu";
}

function reviewClass(status: string) {
  if (status === "needs_review") return "bg-red-50 text-red-700";
  if (status === "priority") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-emerald-50 text-emerald-800";
}

export default async function AdminOverviewPage() {
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
    ["Konta", numberValue(stats.users), `${numberValue(stats.signups_30)} nowych w 30 dni`],
    ["Specjaliści", numberValue(stats.professionals), "Podaż profili"],
    ["Klienci", numberValue(stats.clients), `${numberValue(stats.active_30)} aktywnych kont`],
    ["Projekty portfolio", numberValue(stats.projects), "Prace publiczne"],
    ["Zapisane briefy", briefCount, "Wynik Project Compass"],
    ["Zapytania", inquiryCount, "W całej platformie"],
    ["Artykuły Inspiration Hub", contentRows.length, `${publishedArticles} opublikowanych`],
    ["Ukryte treści", numberValue(stats.hidden_profiles) + numberValue(stats.hidden_projects), `${numberValue(stats.hidden_profiles)} profili, ${numberValue(stats.hidden_projects)} projektów`],
    ["Wyświetlenia profili", numberValue(stats.profile_views_30), "Ostatnie 30 dni"],
  ];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">Operacje platformy</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Admin</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Monitoruj platformę, sprawdzaj konta i obserwuj, jak użytkownicy przechodzą
              od inspiracji do rozmowy z projektantem.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white"
          >
            Otwórz użytkowników
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {statsResult.error || usersResult.error || contentResult.error ? (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Nie udało się wczytać danych admina. Sprawdź migracje bazy oraz aktywną rolę owner/admin dla tego konta.
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
                <div className="text-sm font-semibold text-primary">Najnowsza aktywność</div>
                <h2 className="mt-1 text-3xl font-bold">Ostatnie konta</h2>
              </div>
              <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline">
                Zobacz wszystkie
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
                      <div className="font-semibold">{user.full_name || user.email || "Konto bez nazwy"}</div>
                      <div className="mt-1 text-sm text-muted">
                        {accountLabel(user)} | Dołączył/a {formatDate(user.created_at)}
                      </div>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${reviewClass(user.review_status)}`}>
                      {user.review_status.replace("_", " ")}
                    </span>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-sm text-muted">Brak kont do wyświetlenia.</div>
              )}
            </div>
          </section>

          <aside className="grid h-fit gap-5">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Granica prywatności</div>
              <h2 className="mt-1 text-2xl font-bold">Tylko dane operacyjne</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Ten panel pokazuje liczniki, dane kont, profile publiczne i projekty publiczne.
                Treści prywatnych wiadomości i prywatne zdjęcia referencyjne pozostają poza panelem admina.
              </p>
            </section>

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Treści</div>
              <h2 className="mt-1 text-2xl font-bold">Inspiration Hub</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Twórz szkice, publikuj artykuły i zarządzaj wyróżnionymi inspiracjami z chronionego edytora.
              </p>
              <Link href="/admin/content" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                Zarządzaj treściami
              </Link>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
