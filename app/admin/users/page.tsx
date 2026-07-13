import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  user_type: string | null;
  profession_type: string | null;
  location: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  project_count: number;
  brief_count: number;
  sent_inquiry_count: number;
  received_inquiry_count: number;
  review_status: string;
  profile_visibility: string;
  total_count: number;
};

const accountTypes = ["all", "professional", "client", "no_profile"] as const;
const reviewStatuses = ["all", "clear", "needs_review", "priority"] as const;
const visibilityStatuses = ["all", "visible", "hidden"] as const;
const pageSize = 30;

const fieldClass =
  "rounded-xl border border-line bg-card px-4 py-3 text-sm text-foreground outline-none focus:border-primary";

function formatDate(value: string | null) {
  if (!value) return "Nigdy";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function safePage(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function selectedValue<T extends readonly string[]>(value: string | undefined, options: T) {
  return options.includes(value as T[number]) ? (value as T[number]) : options[0];
}

function accountLabel(user: AdminUser) {
  if (user.profession_type || user.user_type === "professional") return "Specjalista";
  if (!user.full_name && !user.user_type) return "Brak profilu";
  return user.user_type === "client" ? "Klient" : user.user_type || "Klient";
}

function reviewLabel(status: string) {
  if (status === "needs_review") return "Do sprawdzenia";
  if (status === "priority") return "Priorytet";
  return "Czyste";
}

function visibilityLabel(status: string) {
  return status === "hidden" ? "Ukryty" : "Widoczny";
}

function reviewClass(status: string) {
  if (status === "needs_review") return "bg-red-50 text-red-700";
  if (status === "priority") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-emerald-50 text-emerald-800";
}

function pageHref({
  page,
  q,
  type,
  review,
  visibility,
}: {
  page: number;
  q: string;
  type: string;
  review: string;
  visibility: string;
}) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (type !== "all") params.set("type", type);
  if (review !== "all") params.set("review", review);
  if (visibility !== "all") params.set("visibility", visibility);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; q?: string; review?: string; type?: string; visibility?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const q = sp.q?.trim().slice(0, 120) ?? "";
  const type = selectedValue(sp.type, accountTypes);
  const review = selectedValue(sp.review, reviewStatuses);
  const visibility = selectedValue(sp.visibility, visibilityStatuses);
  const page = safePage(sp.page);
  const { supabase } = await requireAdmin("users");
  const { data, error } = await supabase.rpc("admin_user_directory", {
    account_type: type,
    page_limit: pageSize,
    page_offset: (page - 1) * pageSize,
    review_filter: review,
    search_text: q || null,
    visibility_filter: visibility,
  });
  const users = (data ?? []) as AdminUser[];
  const total = Number(users[0]?.total_count ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">Użytkownicy</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Konta</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Znajdź klientów i specjalistów, sprawdzaj aktywność publiczną
            oraz zapisuj wewnętrzne notatki operacyjne.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <form className="grid gap-3 rounded-lg border border-line bg-card p-4 shadow-sm xl:grid-cols-[minmax(220px,1fr)_180px_170px_160px_auto]">
          <input
            name="q"
            defaultValue={q}
            placeholder="Szukaj po nazwie, e-mailu lub lokalizacji"
            className={fieldClass}
          />
          <select name="type" defaultValue={type} className={fieldClass}>
            <option value="all">Wszystkie typy kont</option>
            <option value="professional">Specjaliści</option>
            <option value="client">Klienci</option>
            <option value="no_profile">Bez profilu</option>
          </select>
          <select name="review" defaultValue={review} className={fieldClass}>
            <option value="all">Wszystkie statusy</option>
            <option value="clear">Czyste</option>
            <option value="needs_review">Do sprawdzenia</option>
            <option value="priority">Priorytet</option>
          </select>
          <select name="visibility" defaultValue={visibility} className={fieldClass}>
            <option value="all">Każda widoczność</option>
            <option value="visible">Widoczne</option>
            <option value="hidden">Ukryte</option>
          </select>
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
            Zastosuj filtry
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted">
            <span className="font-semibold text-foreground">{total}</span> pasujących kont
          </div>
          {(q || type !== "all" || review !== "all" || visibility !== "all") ? (
            <Link href="/admin/users" className="text-sm font-semibold text-primary hover:underline">
              Wyczyść filtry
            </Link>
          ) : null}
        </div>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Nie udało się wczytać użytkowników: {error.message}
          </div>
        ) : users.length ? (
          <div className="mt-5 overflow-x-auto rounded-lg border border-line bg-card shadow-sm">
            <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
              <thead className="bg-background text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-4 font-semibold">Konto</th>
                  <th className="px-4 py-4 font-semibold">Typ</th>
                  <th className="px-4 py-4 font-semibold">Projekty</th>
                  <th className="px-4 py-4 font-semibold">Briefy</th>
                  <th className="px-4 py-4 font-semibold">Zapytania</th>
                  <th className="px-4 py-4 font-semibold">Ostatnie logowanie</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Widoczność</th>
                  <th className="px-5 py-4 text-right font-semibold">Akcja</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="border-t border-line align-top">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{user.full_name || "Konto bez nazwy"}</div>
                      <div className="mt-1 text-muted">{user.email || "Brak e-maila"}</div>
                      <div className="mt-1 text-xs text-muted">
                        Dołączył/a {formatDate(user.created_at)}
                        {user.location ? ` | ${user.location}` : ""}
                      </div>
                    </td>
                    <td className="px-4 py-4">{accountLabel(user)}</td>
                    <td className="px-4 py-4 font-semibold">{Number(user.project_count)}</td>
                    <td className="px-4 py-4 font-semibold">{Number(user.brief_count)}</td>
                    <td className="px-4 py-4 font-semibold">
                      {Number(user.sent_inquiry_count) + Number(user.received_inquiry_count)}
                    </td>
                    <td className="px-4 py-4">{formatDate(user.last_sign_in_at)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${reviewClass(user.review_status)}`}>
                        {reviewLabel(user.review_status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={[
                        "rounded-full px-3 py-1 text-xs font-semibold capitalize",
                        user.profile_visibility === "hidden"
                          ? "bg-red-50 text-red-700"
                          : "bg-emerald-50 text-emerald-800",
                      ].join(" ")}>
                        {visibilityLabel(user.profile_visibility)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/users/${user.user_id}`}
                        className="inline-flex rounded-xl border border-line bg-background px-4 py-2.5 font-semibold hover:border-primary hover:text-primary"
                      >
                        Otwórz
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-8">
            <h2 className="text-2xl font-bold">Brak pasujących kont</h2>
            <p className="mt-2 text-muted">Wyczyść filtry albo użyj szerszego wyszukiwania.</p>
          </div>
        )}

        {totalPages > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-4">
            {page > 1 ? (
              <Link href={pageHref({ page: page - 1, q, type, review, visibility })} className="rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold">
                Poprzednia
              </Link>
            ) : <span />}
            <span className="text-sm text-muted">Strona {page} z {totalPages}</span>
            {page < totalPages ? (
              <Link href={pageHref({ page: page + 1, q, type, review, visibility })} className="rounded-xl border border-line bg-card px-4 py-3 text-sm font-semibold">
                Następna
              </Link>
            ) : <span />}
          </div>
        ) : null}
      </section>
    </main>
  );
}
