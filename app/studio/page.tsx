import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { briefInquirySubject, briefSnapshotLabel } from "@/lib/brief-labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getStudioMemberships, inquiryRecipientFilter } from "@/lib/studios";
import { profileReadinessScore } from "@/lib/profile-readiness";

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

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function snapshotValue(snapshot: Record<string, unknown> | null, key: string) {
  return briefSnapshotLabel(snapshot, key);
}

function statusClass(status: string) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800";
  if (status === "declined") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-primary-soft text-primary";
}

export default async function StudioOverviewPage() {
  const copy = getWorkspaceCopy().studioOverview;
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
      .select("full_name, profile_headline, location, profession_type, specialties, bio, email, service_capabilities, pricing_model, price_from, price_to, work_modes, availability_status, years_experience")
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
  const readiness = profileReadinessScore(profile, true);

  const stats = [
    [copy.stats[0], String(views.length), copy.details[0]],
    [copy.stats[1], String(newRequests), copy.details[1]],
    [copy.stats[2], String(unreadMessages ?? 0), copy.details[2]],
    [copy.stats[3], `${conversion}%`, copy.details[3](accepted, inquiries.length)],
  ];

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
              {copy.intro}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/studio/inbox" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              {copy.inboxCta}
            </Link>
              <Link href="/account/projects" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                {copy.addProjectCta}
              </Link>
              <Link href="/studio/team" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
                {copy.studioTeamCta}
              </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, detail]) => (
            <article key={label} className="rounded-2xl border border-line bg-card p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-4xl font-bold tracking-tight text-primary">{value}</div>
              <div className="mt-2 text-sm text-muted">{detail}</div>
            </article>
          ))}
        </div>

        <section className="mt-7 overflow-hidden rounded-2xl border border-[#39224b] bg-[#281735] p-6 text-white shadow-[0_20px_45px_rgba(54,31,73,0.14)] sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.8fr)] lg:items-center">
            <div>
              <div className="text-sm font-bold text-[#51d7c9]">{copy.focusEyebrow}</div>
              <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">{copy.focusTitle}</h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/75">{copy.focusBody}</p>
            </div>
            <div className="grid gap-3 rounded-xl border border-white/15 bg-white/10 p-4 sm:p-5">
              <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#51d7c9] text-xs font-bold text-[#281735]">1</span>
                {copy.focusProfileStep}
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 text-sm font-semibold">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-[#281735]">2</span>
                {copy.focusPortfolioStep}
              </div>
              <Link href="/account/profile" className="mt-1 rounded-xl bg-primary px-4 py-3 text-center text-sm font-bold text-white transition hover:brightness-110">
                {copy.focusProfileCta}
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-primary">{copy.opportunitiesEyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.receivedBriefs}</h2>
              </div>
              <Link href="/studio/inbox" className="text-sm font-semibold text-primary hover:underline">
                {copy.viewAll}
              </Link>
            </div>

            {inquiryResult.error ? (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                {copy.loadError}: {inquiryResult.error.message}
              </div>
            ) : inquiries.length ? (
              <div className="mt-5 grid gap-4">
                {inquiries.slice(0, 5).map((inquiry) => {
                  const client = clientsById.get(inquiry.client_id);
                  return (
                    <Link
                      key={inquiry.id}
                      href={`/studio/inbox/${inquiry.id}`}
                      className="rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-primary">
                            {client?.full_name || client?.email || copy.newClient}
                          </div>
                          <h3 className="mt-1 text-xl font-bold">{briefInquirySubject(inquiry.brief_snapshot)}</h3>
                        </div>
                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusClass(inquiry.status)}`}>
                          {copy.statuses[inquiry.status] || inquiry.status}
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                        <span>{snapshotValue(inquiry.brief_snapshot, "project_type")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "style_direction")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "location")}</span>
                        <span>{formatDate(inquiry.created_at, copy.dateLocale)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-primary/35 bg-card p-8 sm:p-10">
                <div className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{copy.readinessEyebrow}</div>
                <h3 className="mt-4 text-xl font-bold">{copy.emptyTitle}</h3>
                <p className="mt-2 max-w-xl leading-7 text-muted">
                  {copy.emptyBody}
                </p>
                <Link href={`/designers/${user.id}`} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  {copy.publicProfileCta}
                </Link>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-primary/20 bg-card p-6 shadow-sm lg:sticky lg:top-40">
            <div className="text-sm font-semibold text-primary">{copy.readinessEyebrow}</div>
            <div className="mt-2 text-4xl font-bold">{readiness}%</div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-soft">
              <div className="h-full rounded-full bg-primary" style={{ width: `${readiness}%` }} />
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              {copy.readinessBody}
            </p>
            <div className="mt-6 grid gap-3">
              <Link href="/account/profile" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
                {copy.editProfileCta}
              </Link>
              <Link href="/account/projects" className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">
                {copy.manageProjectsCta(projects.length)}
              </Link>
              <Link href="/studio/analytics" className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">
                {copy.analyticsCta}
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
