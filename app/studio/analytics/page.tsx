import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type View = { created_at: string };
type Inquiry = { id: string; status: string; created_at: string };
type Message = { inquiry_id: string; created_at: string };

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function dayKey(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0"),
  ].join("-");
}

function shortDay(value: Date) {
  return new Intl.DateTimeFormat("en", { day: "2-digit", month: "short" }).format(value);
}

export default async function StudioAnalyticsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [viewResult, inquiryResult, projectResult] = await Promise.all([
    supabase
      .from("profile_views")
      .select("created_at")
      .eq("profile_id", user.id)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("designer_inquiries")
      .select("id, status, created_at")
      .eq("designer_id", user.id)
      .gte("created_at", ninetyDaysAgo.toISOString())
      .order("created_at", { ascending: true }),
    supabase.from("projects").select("id").eq("profile_id", user.id),
  ]);

  const views = (viewResult.data ?? []) as View[];
  const inquiries = (inquiryResult.data ?? []) as Inquiry[];
  const projects = projectResult.data ?? [];
  const inquiryIds = inquiries.map((inquiry) => inquiry.id);
  const { data: replyData } = inquiryIds.length
    ? await supabase
        .from("inquiry_messages")
        .select("inquiry_id, created_at")
        .in("inquiry_id", inquiryIds)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [] };
  const replies = (replyData ?? []) as Message[];

  const firstReplyByInquiry = new Map<string, Date>();
  replies.forEach((reply) => {
    if (!firstReplyByInquiry.has(reply.inquiry_id)) {
      firstReplyByInquiry.set(reply.inquiry_id, new Date(reply.created_at));
    }
  });
  const responseHours = inquiries
    .map((inquiry) => {
      const reply = firstReplyByInquiry.get(inquiry.id);
      return reply ? (reply.getTime() - new Date(inquiry.created_at).getTime()) / 3_600_000 : null;
    })
    .filter((value): value is number => value !== null && value >= 0);
  const averageResponse = responseHours.length
    ? responseHours.reduce((sum, value) => sum + value, 0) / responseHours.length
    : null;

  const daily = Array.from({ length: 14 }, (_, index) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() - (13 - index));
    const key = dayKey(date);
    return {
      date,
      key,
      views: views.filter((view) => dayKey(new Date(view.created_at)) === key).length,
      inquiries: inquiries.filter((inquiry) => dayKey(new Date(inquiry.created_at)) === key).length,
    };
  });
  const maxDaily = Math.max(1, ...daily.map((day) => day.views));
  const views30 = views.filter((view) => new Date(view.created_at) >= thirtyDaysAgo).length;
  const inquiries30 = inquiries.filter((inquiry) => new Date(inquiry.created_at) >= thirtyDaysAgo).length;
  const accepted = inquiries.filter((inquiry) => inquiry.status === "accepted").length;
  const acceptance = inquiries.length ? Math.round((accepted / inquiries.length) * 100) : 0;

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">Profile performance</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">Analytics</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            See real profile visits, Project Compass requests, accepted fit, and your
            measured response time. Tracking starts with this Studio release.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Views", String(views30), "Last 30 days"],
            ["Requests", String(inquiries30), "Last 30 days"],
            ["Accepted fit", `${acceptance}%`, `${accepted} accepted`],
            ["First response", averageResponse === null ? "No data" : averageResponse < 24 ? `${Math.round(averageResponse)}h` : `${(averageResponse / 24).toFixed(1)}d`, "Measured from in-app replies"],
          ].map(([label, value, detail]) => (
            <article key={label} className="rounded-lg border border-line bg-card p-5 shadow-sm">
              <div className="text-sm font-semibold text-muted">{label}</div>
              <div className="mt-2 text-4xl font-bold text-primary">{value}</div>
              <div className="mt-2 text-sm text-muted">{detail}</div>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Last 14 days</div>
                <h2 className="mt-1 text-3xl font-bold">Profile views</h2>
              </div>
              <div className="text-sm text-muted">One browser session per profile per day</div>
            </div>

            <div className="mt-8 grid grid-cols-14 items-end gap-2" style={{ gridTemplateColumns: `repeat(${daily.length}, minmax(0, 1fr))` }}>
              {daily.map((day) => (
                <div key={day.key} className="grid gap-2 text-center">
                  <div className="flex h-48 items-end rounded-md bg-background px-1">
                    <div
                      className="w-full rounded-t-md bg-primary"
                      style={{ height: `${Math.max(day.views ? 8 : 2, (day.views / maxDaily) * 100)}%` }}
                      title={`${day.views} views, ${day.inquiries} requests`}
                    />
                  </div>
                  <div className="text-[10px] text-muted">{shortDay(day.date)}</div>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid h-fit gap-5">
            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">90-day funnel</div>
              <h2 className="mt-1 text-2xl font-bold">From view to fit</h2>
              <div className="mt-6 grid gap-4">
                {[
                  ["Profile views", views.length, 100],
                  ["Requests", inquiries.length, views.length ? Math.min(100, (inquiries.length / views.length) * 100) : 0],
                  ["Accepted", accepted, inquiries.length ? (accepted / inquiries.length) * 100 : 0],
                ].map(([label, value, width]) => (
                  <div key={String(label)}>
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-primary-soft">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Number(width)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-line bg-card p-6 shadow-sm">
              <div className="text-sm font-semibold text-primary">Portfolio supply</div>
              <div className="mt-2 text-4xl font-bold">{projects.length}</div>
              <p className="mt-2 text-sm leading-6 text-muted">
                Public project{projects.length === 1 ? "" : "s"} available for clients to review before sending a brief.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href="/account/projects" className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white">
                  Manage projects
                </Link>
                <Link href={`/designers/${user.id}`} className="rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">
                  Open public profile
                </Link>
              </div>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}
