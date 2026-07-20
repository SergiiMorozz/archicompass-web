import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { briefInquirySubject } from "@/lib/brief-labels";
import { profileTypeLabel } from "@/lib/profile-system-labels";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Inquiry = {
  id: string;
  designer_id: string;
  subject: string;
  status: string;
  brief_snapshot: Record<string, unknown> | null;
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
  profession_type: string | null;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800";
  if (status === "declined") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-primary-soft text-primary";
}

export default async function ClientOverviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ profileUpdated?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const copy = getWorkspaceCopy().clientOverview;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const [briefResult, favoriteResult, inquiryResult] = await Promise.all([
    supabase
      .from("project_briefs")
      .select("id, title, project_type, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("favorites").select("id").eq("user_id", user.id),
    supabase
      .from("designer_inquiries")
      .select("id, designer_id, subject, status, brief_snapshot, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const briefs = briefResult.data ?? [];
  const favorites = favoriteResult.data ?? [];
  const inquiries = (inquiryResult.data ?? []) as Inquiry[];
  const inquiryIds = inquiries.map((inquiry) => inquiry.id);
  const designerIds = Array.from(new Set(inquiries.map((inquiry) => inquiry.designer_id)));

  const [{ count: unreadMessages }, { data: designerData }] = await Promise.all([
    inquiryIds.length
      ? supabase
          .from("inquiry_messages")
          .select("id", { count: "exact", head: true })
          .in("inquiry_id", inquiryIds)
          .neq("sender_id", user.id)
          .is("read_at", null)
      : Promise.resolve({ count: 0 }),
    designerIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, profession_type")
          .in("id", designerIds)
      : Promise.resolve({ data: [] }),
  ]);
  const designers = (designerData ?? []) as Profile[];
  const designersById = new Map(designers.map((profile) => [profile.id, profile]));

  const stats = [
    [copy.stats[0], String(briefs.length), "/client/briefs"],
    [copy.stats[1], String(favorites.length), "/client/favorites"],
    [copy.stats[2], String(inquiries.length), "/client/messages"],
    [copy.stats[3], String(unreadMessages ?? 0), "/client/messages"],
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
            <Link href="/project-compass" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              {copy.createBrief}
            </Link>
            <Link href="/designers" className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold hover:border-primary hover:text-primary">
              {copy.openDirectory}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {sp.profileUpdated ? (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            {copy.profileUpdated}
          </div>
        ) : null}
        <section className="overflow-hidden rounded-2xl border border-[#39224b] bg-[#281735] p-6 text-white shadow-[0_20px_45px_rgba(54,31,73,0.14)] sm:p-8">
          <div className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
            <div>
              <div className="text-sm font-bold text-[#51d7c9]">{copy.actionEyebrow}</div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{copy.actionTitle}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/75">{copy.actionBody}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                href="/project-compass"
                className="group rounded-xl bg-primary p-5 transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/80"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-white/70">{copy.actionStep}</div>
                <div className="mt-7 flex items-end justify-between gap-3 text-lg font-bold">
                  <span>{copy.createBrief}</span>
                  <span className="text-2xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
              </Link>
              <Link
                href="/designers"
                className="group rounded-xl border border-white/20 bg-white/10 p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/80"
              >
                <div className="text-xs font-bold uppercase tracking-wide text-white/60">{copy.directoryStep}</div>
                <div className="mt-7 flex items-end justify-between gap-3 text-lg font-bold">
                  <span>{copy.openDirectory}</span>
                  <span className="text-2xl transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, href]) => (
            <Link key={label} href={href} className="rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
              <div className="text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-4xl font-bold tracking-tight text-primary">{value}</div>
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section>
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-primary">{copy.activityEyebrow}</div>
                <h2 className="mt-1 text-3xl font-bold">{copy.conversationsTitle}</h2>
              </div>
              <Link href="/client/messages" className="text-sm font-semibold text-primary hover:underline">{copy.viewAll}</Link>
            </div>

            {inquiries.length ? (
              <div className="mt-5 grid gap-4">
                {inquiries.slice(0, 5).map((inquiry) => {
                  const designer = designersById.get(inquiry.designer_id);
                  return (
                    <Link key={inquiry.id} href={`/account/inquiries/${inquiry.id}`} className="rounded-2xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary hover:shadow-md">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-primary">
                            {designer?.full_name || copy.defaultProfessional}
                          </div>
                          <h3 className="mt-1 text-xl font-bold">{briefInquirySubject(inquiry.brief_snapshot)}</h3>
                          <div className="mt-2 text-sm text-muted">
                            {designer?.profession_type ? profileTypeLabel(designer.profession_type) : copy.defaultProfessional} · {formatDate(inquiry.created_at, copy.dateLocale)}
                          </div>
                        </div>
                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(inquiry.status)}`}>
                          {copy.statuses[inquiry.status] || inquiry.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-primary/35 bg-card p-8 sm:p-10">
                <div className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">AI Project Compass</div>
                <h3 className="mt-4 text-xl font-bold">{copy.emptyTitle}</h3>
                <p className="mt-2 max-w-xl leading-7 text-muted">
                  {copy.emptyBody}
                </p>
                <Link href="/project-compass" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  {copy.emptyCta}
                </Link>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-2xl border border-primary/20 bg-card p-6 shadow-sm lg:sticky lg:top-40">
            <div className="text-sm font-semibold text-primary">{copy.nextStepEyebrow}</div>
            <h2 className="mt-2 text-2xl font-bold">
              {briefs.length ? copy.nextStepWithBrief : copy.nextStepWithoutBrief}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {briefs.length
                ? copy.nextStepWithBriefBody
                : copy.nextStepWithoutBriefBody}
            </p>
            <div className="mt-6 grid gap-3">
              <Link href="/client/briefs" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">{copy.savedBriefsCta}</Link>
              <Link href="/client/favorites" className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">{copy.favoritesCta}</Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
