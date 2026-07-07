import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { countLabel } from "@/lib/count-label";
import { getStudioMemberships, inquiryRecipientFilter } from "@/lib/studios";

export const revalidate = 0;

type Inquiry = {
  id: string;
  client_id: string;
  subject: string;
  status: string;
  brief_snapshot: Record<string, unknown> | null;
  created_at: string;
};

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function snapshotValue(snapshot: Record<string, unknown> | null, key: string) {
  const value = snapshot?.[key];
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string").join(", ") || "Not specified";
  return typeof value === "string" && value.trim() ? value : "Not specified";
}

function statusClass(status: string) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800";
  if (status === "declined") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-primary-soft text-primary";
}

function profileReadiness(profile: Record<string, unknown> | null) {
  if (!profile) return 0;
  const values = [
    profile.full_name,
    profile.bio,
    profile.location,
    profile.profession_type,
    Array.isArray(profile.specialties) && profile.specialties.length ? "specialties" : null,
    profile.years_experience,
  ];
  return Math.round((values.filter(Boolean).length / values.length) * 100);
}

export default async function StudioOverviewPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: memberships } = await getStudioMemberships(supabase, user.id, "active");
  const studioIds = memberships.map((membership) => membership.studio_id);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [profileResult, projectResult, inquiryResult, viewResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, bio, location, profession_type, specialties, years_experience")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("projects").select("id").eq("profile_id", user.id),
    supabase
      .from("designer_inquiries")
      .select("id, client_id, subject, status, brief_snapshot, created_at")
      .or(inquiryRecipientFilter(user.id, studioIds))
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("profile_views")
      .select("created_at")
      .eq("profile_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString()),
  ]);

  const profile = profileResult.data as Record<string, unknown> | null;
  const projects = projectResult.data ?? [];
  const inquiries = (inquiryResult.data ?? []) as Inquiry[];
  const views = viewResult.data ?? [];
  const inquiryIds = inquiries.map((inquiry) => inquiry.id);
  const clientIds = Array.from(new Set(inquiries.map((inquiry) => inquiry.client_id)));

  const { count: unreadMessages } = inquiryIds.length
    ? await supabase
        .from("inquiry_messages")
        .select("id", { count: "exact", head: true })
        .in("inquiry_id", inquiryIds)
        .in("sender_id", clientIds)
        .is("read_at", null)
    : { count: 0 };

  const { data: clientsData } = clientIds.length
    ? await supabase.from("profiles").select("id, full_name, email").in("id", clientIds)
    : { data: [] };
  const clients = (clientsData ?? []) as ClientProfile[];
  const clientsById = new Map(clients.map((client) => [client.id, client]));

  const accepted = inquiries.filter((inquiry) => inquiry.status === "accepted").length;
  const newRequests = inquiries.filter((inquiry) => inquiry.status === "sent").length;
  const conversion = inquiries.length ? Math.round((accepted / inquiries.length) * 100) : 0;
  const readiness = profileReadiness(profile);

  const stats = [
    ["Wyświetlenia profilu", String(views.length), "Ostatnie 30 dni"],
    ["Nowe zapytania", String(newRequests), "Oczekują na sprawdzenie"],
    ["Nieprzeczytane wiadomości", String(unreadMessages ?? 0), "We wszystkich aktywnych zapytaniach"],
    ["Zaakceptowane", `${conversion}%`, `${accepted} z ${inquiries.length || 0} zapytań`],
  ];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">Panel profesjonalisty</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Pulpit projektanta</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              Przeglądaj dopasowane briefy, odpowiadaj klientom, rozwijaj portfolio i
              obserwuj skuteczność profilu.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/studio/inbox" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Otwórz zapytania
            </Link>
              <Link href="/account/projects" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                Add project
              </Link>
              <Link href="/studio/team" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                Studio and team
              </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, detail]) => (
            <article key={label} className="rounded-lg border border-line bg-card p-5 shadow-sm">
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
                <div className="text-sm font-semibold text-primary">Najnowsze możliwości</div>
                <h2 className="mt-1 text-3xl font-bold">Otrzymane briefy</h2>
              </div>
              <Link href="/studio/inbox" className="text-sm font-semibold text-primary hover:underline">
                Zobacz wszystkie
              </Link>
            </div>

            {inquiryResult.error ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                Nie udało się wczytać zapytań: {inquiryResult.error.message}
              </div>
            ) : inquiries.length ? (
              <div className="mt-5 grid gap-4">
                {inquiries.slice(0, 5).map((inquiry) => {
                  const client = clientsById.get(inquiry.client_id);
                  return (
                    <Link
                      key={inquiry.id}
                      href={`/studio/inbox/${inquiry.id}`}
                      className="rounded-lg border border-line bg-card p-5 shadow-sm transition hover:border-primary"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-primary">
                            {client?.full_name || client?.email || "Nowy klient"}
                          </div>
                          <h3 className="mt-1 text-xl font-bold">{inquiry.subject}</h3>
                        </div>
                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(inquiry.status)}`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                        <span>{snapshotValue(inquiry.brief_snapshot, "project_type")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "style_direction")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "location")}</span>
                        <span>{formatDate(inquiry.created_at)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-8">
                <h3 className="text-xl font-bold">Nie masz jeszcze nowych briefów</h3>
                <p className="mt-2 max-w-xl leading-7 text-muted">
                  Uzupełnij profil publiczny i dodaj mocne projekty portfolio. Nowe
                  zapytania klientów pojawią się tutaj automatycznie.
                </p>
                <Link href={`/designers/${user.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  Zobacz profil publiczny
                </Link>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-40">
            <div className="text-sm font-semibold text-primary">Kompletność profilu</div>
            <div className="mt-2 text-4xl font-bold">{readiness}%</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-soft">
              <div className="h-full rounded-full bg-primary" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Kompletny profil daje klientom więcej informacji przed wysłaniem briefu.
            </p>
            <div className="mt-6 grid gap-3">
              <Link href="/account/profile" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
                Edytuj profil
              </Link>
              <Link href="/account/projects" className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">
                Manage {countLabel(projects.length, "project")}
              </Link>
              <Link href="/studio/analytics" className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">
                Otwórz statystyki
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
