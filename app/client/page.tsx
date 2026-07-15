import Link from "next/link";
import { redirect } from "next/navigation";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Inquiry = {
  id: string;
  designer_id: string;
  subject: string;
  status: string;
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
      .select("id, designer_id, subject, status, created_at")
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
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
            <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{copy.title}</h1>
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
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(([label, value, href]) => (
            <Link key={label} href={href} className="rounded-lg border border-line bg-card p-5 shadow-sm transition hover:border-primary">
              <div className="text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-4xl font-bold text-primary">{value}</div>
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
                    <Link key={inquiry.id} href={`/account/inquiries/${inquiry.id}`} className="rounded-lg border border-line bg-card p-5 shadow-sm transition hover:border-primary">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-sm font-semibold text-primary">
                            {designer?.full_name || copy.defaultProfessional}
                          </div>
                          <h3 className="mt-1 text-xl font-bold">{inquiry.subject}</h3>
                          <div className="mt-2 text-sm text-muted">
                            {designer?.profession_type === "Studio" ? copy.studio : copy.defaultProfessional} · {formatDate(inquiry.created_at, copy.dateLocale)}
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
              <div className="mt-5 rounded-lg border border-dashed border-line bg-card p-8">
                <h3 className="text-xl font-bold">{copy.emptyTitle}</h3>
                <p className="mt-2 max-w-xl leading-7 text-muted">
                  {copy.emptyBody}
                </p>
                <Link href="/project-compass" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                  {copy.emptyCta}
                </Link>
              </div>
            )}
          </section>

          <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-40">
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
