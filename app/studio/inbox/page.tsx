import Link from "next/link";
import { redirect } from "next/navigation";
import ConversationAutoRefresh from "@/components/ConversationAutoRefresh";
import UnreadPageTitle from "@/components/UnreadPageTitle";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { briefSnapshotLabel } from "@/lib/brief-labels";
import { professionalUnreadByInquiry, unreadTotal } from "@/lib/inquiry-unread";
import { getStudioMemberships, inquiryRecipientFilter } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Inquiry = {
  id: string;
  client_id: string;
  studio_id: string | null;
  subject: string;
  message: string | null;
  status: string;
  brief_snapshot: Record<string, unknown> | null;
  created_at: string;
};

type Message = {
  inquiry_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  location: string | null;
};

type Studio = { id: string; name: string };

const statusFilters = ["all", "sent", "reviewing", "accepted", "declined"] as const;

function statusClass(status: string) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800";
  if (status === "declined") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-primary-soft text-primary";
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function snapshotValue(snapshot: Record<string, unknown> | null, key: string) {
  return briefSnapshotLabel(snapshot, key);
}

export default async function StudioInboxPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; view?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const copy = getWorkspaceCopy().studioInbox;
  const selectedView = sp.view === "unread" ? "unread" : "status";
  const selectedStatus = statusFilters.includes(sp.status as (typeof statusFilters)[number])
    ? (sp.status as (typeof statusFilters)[number])
    : "all";
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: memberships } = await getStudioMemberships(supabase, user.id, "active");
  const studioIds = memberships.map((membership) => membership.studio_id);

  const { data: inquiryData, error } = await supabase
    .from("designer_inquiries")
    .select("id, client_id, studio_id, subject, message, status, brief_snapshot, created_at")
    .or(inquiryRecipientFilter(user.id, studioIds))
    .order("created_at", { ascending: false })
    .limit(100);
  const inquiries = (inquiryData ?? []) as Inquiry[];
  const inquiryIds = inquiries.map((inquiry) => inquiry.id);

  const { data: messageData } = inquiryIds.length
    ? await supabase
        .from("inquiry_messages")
        .select("inquiry_id, sender_id, body, read_at, created_at")
        .in("inquiry_id", inquiryIds)
        .order("created_at", { ascending: false })
    : { data: [] };
  const messages = (messageData ?? []) as Message[];
  const latestByInquiry = new Map<string, Message>();
  messages.forEach((message) => {
    if (!latestByInquiry.has(message.inquiry_id)) {
      latestByInquiry.set(message.inquiry_id, message);
    }
  });
  const unreadByInquiry = professionalUnreadByInquiry(inquiries, messages);

  const clientIds = Array.from(new Set(inquiries.map((inquiry) => inquiry.client_id)));
  const { data: clientData } = clientIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email, location")
        .in("id", clientIds)
    : { data: [] };
  const clients = (clientData ?? []) as ClientProfile[];
  const clientsById = new Map(clients.map((client) => [client.id, client]));
  const { data: studioData } = studioIds.length
    ? await supabase.from("studios").select("id, name").in("id", studioIds)
    : { data: [] };
  const studiosById = new Map(
    ((studioData ?? []) as Studio[]).map((studio) => [studio.id, studio])
  );
  const totalUnread = unreadTotal(unreadByInquiry);
  const sortedInquiries = [...inquiries].sort((left, right) => {
    const leftDate = latestByInquiry.get(left.id)?.created_at || left.created_at;
    const rightDate = latestByInquiry.get(right.id)?.created_at || right.created_at;
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });
  const visibleInquiries = selectedView === "unread"
    ? sortedInquiries.filter((inquiry) => (unreadByInquiry.get(inquiry.id) ?? 0) > 0)
    : selectedStatus === "all"
      ? sortedInquiries
      : sortedInquiries.filter((inquiry) => inquiry.status === selectedStatus);

  return (
    <main>
      <UnreadPageTitle count={totalUnread} label={copy.pageTitle} />
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">{copy.eyebrow}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            {copy.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/studio/inbox?view=unread"
            className={[
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
              selectedView === "unread"
                ? "bg-foreground text-white"
                : "border border-line bg-card text-muted hover:border-primary hover:text-primary",
            ].join(" ")}
          >
            {copy.unread} {totalUnread}
          </Link>
          {statusFilters.map((status) => {
            const count =
              status === "all"
                ? inquiries.length
                : inquiries.filter((inquiry) => inquiry.status === status).length;
            return (
              <Link
                key={status}
                href={status === "all" ? "/studio/inbox" : `/studio/inbox?status=${status}`}
                className={[
                  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold capitalize",
                  selectedView === "status" && selectedStatus === status
                    ? "bg-primary text-white"
                    : "border border-line bg-card text-muted hover:border-primary hover:text-primary",
                ].join(" ")}
              >
                {copy.statuses[status] || status} {count}
              </Link>
            );
          })}
          </div>
          <ConversationAutoRefresh />
        </div>

        {error ? (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
            {copy.loadError}: {error.message}
          </div>
        ) : visibleInquiries.length ? (
          <div className="mt-6 grid gap-4">
            {visibleInquiries.map((inquiry) => {
              const client = clientsById.get(inquiry.client_id);
              const latest = latestByInquiry.get(inquiry.id);
              const unread = unreadByInquiry.get(inquiry.id) ?? 0;
              return (
                <article key={inquiry.id} className={`rounded-lg border bg-card p-5 shadow-sm ${unread ? "border-primary" : "border-line"}`}>
                  <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(inquiry.status)}`}>
                          {copy.statuses[inquiry.status] || inquiry.status}
                        </span>
                        {unread ? (
                          <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-white">
                            {unread} {copy.newMessages}
                          </span>
                        ) : null}
                        <span className="rounded-full border border-line bg-background px-3 py-1 text-xs font-semibold text-muted">
                          {inquiry.studio_id
                            ? studiosById.get(inquiry.studio_id)?.name || copy.studioInbox
                            : copy.personalProfile}
                        </span>
                      </div>
                      <h2 className="mt-3 text-2xl font-bold">{inquiry.subject}</h2>
                      <div className="mt-2 text-sm text-muted">
                        {client?.full_name || client?.email || copy.newClient}
                        {client?.location ? ` · ${client.location}` : ""}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
                        <span>{snapshotValue(inquiry.brief_snapshot, "project_type")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "style_direction")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "budget_signal")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "timeline")}</span>
                        <span>{snapshotValue(inquiry.brief_snapshot, "location")}</span>
                      </div>

                      <div className="mt-4 rounded-lg bg-background p-4 text-sm leading-6 text-muted">
                        <div className="font-semibold text-foreground">
                          {latest
                            ? latest.sender_id === inquiry.client_id
                              ? client?.full_name || client?.email || copy.client
                              : copy.youAndStudio
                            : copy.clientMessage}
                        </div>
                        <p className="mt-1 line-clamp-2">
                          {latest?.body || inquiry.message || copy.openToSeeBrief}
                        </p>
                        <div className="mt-2 text-xs">
                          {formatDate(latest?.created_at || inquiry.created_at, copy.dateLocale)}
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/studio/inbox/${inquiry.id}`}
                      className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white"
                    >
                      {unread ? copy.replyCta : copy.openConversationCta}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-lg border border-dashed border-line bg-card p-8">
            <h2 className="text-2xl font-bold">
              {selectedView === "unread" ? copy.allReadTitle : copy.noRequestsTitle}
            </h2>
            <p className="mt-2 max-w-xl leading-7 text-muted">
              {selectedView === "unread"
                ? copy.allReadBody
                : copy.noRequestsBody}
            </p>
            <Link href={selectedView === "unread" ? "/studio/inbox" : "/account/profile"} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              {selectedView === "unread" ? copy.viewAllCta : copy.improveProfileCta}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
