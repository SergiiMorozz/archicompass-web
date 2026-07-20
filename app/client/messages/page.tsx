import Link from "next/link";
import { redirect } from "next/navigation";
import ConversationAutoRefresh from "@/components/ConversationAutoRefresh";
import UnreadPageTitle from "@/components/UnreadPageTitle";
import { getWorkspaceCopy } from "@/content/workspace-copy";
import { briefInquirySubject } from "@/lib/brief-labels";
import { clientUnreadByInquiry, unreadTotal } from "@/lib/inquiry-unread";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Inquiry = {
  id: string;
  designer_id: string;
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

type Profile = {
  id: string;
  full_name: string | null;
  profession_type: string | null;
  location: string | null;
};

type Studio = {
  id: string;
  name: string;
  location: string | null;
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "accepted") return "bg-emerald-50 text-emerald-800";
  if (status === "declined") return "bg-red-50 text-red-700";
  if (status === "reviewing") return "bg-[#fff3df] text-[#8a5a00]";
  return "bg-primary-soft text-primary";
}

export default async function ClientMessagesPage({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const copy = getWorkspaceCopy().clientMessages;
  const selectedView = sp.view === "unread" ? "unread" : "all";
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: inquiryData, error } = await supabase
    .from("designer_inquiries")
      .select("id, designer_id, studio_id, subject, message, status, brief_snapshot, created_at")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const inquiries = (inquiryData ?? []) as Inquiry[];
  const inquiryIds = inquiries.map((inquiry) => inquiry.id);
  const designerIds = Array.from(new Set(inquiries.map((inquiry) => inquiry.designer_id)));
  const studioIds = Array.from(
    new Set(inquiries.map((inquiry) => inquiry.studio_id).filter((id): id is string => Boolean(id)))
  );

  const [{ data: messageData }, { data: profileData }, { data: studioData }] = await Promise.all([
    inquiryIds.length
      ? supabase
          .from("inquiry_messages")
          .select("inquiry_id, sender_id, body, read_at, created_at")
          .in("inquiry_id", inquiryIds)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    designerIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name, profession_type, location")
          .in("id", designerIds)
      : Promise.resolve({ data: [] }),
    studioIds.length
      ? supabase.from("studios").select("id, name, location").in("id", studioIds)
      : Promise.resolve({ data: [] }),
  ]);

  const messages = (messageData ?? []) as Message[];
  const profiles = (profileData ?? []) as Profile[];
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const studios = (studioData ?? []) as Studio[];
  const studiosById = new Map(studios.map((studio) => [studio.id, studio]));
  const latestByInquiry = new Map<string, Message>();
  messages.forEach((message) => {
    if (!latestByInquiry.has(message.inquiry_id)) latestByInquiry.set(message.inquiry_id, message);
  });
  const unreadByInquiry = clientUnreadByInquiry(inquiries, messages, user.id);
  const totalUnread = unreadTotal(unreadByInquiry);
  const sortedInquiries = [...inquiries].sort((left, right) => {
    const leftDate = latestByInquiry.get(left.id)?.created_at || left.created_at;
    const rightDate = latestByInquiry.get(right.id)?.created_at || right.created_at;
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });
  const visibleInquiries = selectedView === "unread"
    ? sortedInquiries.filter((inquiry) => (unreadByInquiry.get(inquiry.id) ?? 0) > 0)
    : sortedInquiries;

  return (
    <main>
      <UnreadPageTitle count={totalUnread} label={copy.unreadPageTitle} />
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
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/client/messages"
            className={[
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
              selectedView === "all" ? "bg-primary text-white" : "border border-line bg-card text-muted",
            ].join(" ")}
          >
            {copy.allConversations} {inquiries.length}
          </Link>
          <Link
            href="/client/messages?view=unread"
            className={[
              "shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold",
              selectedView === "unread" ? "bg-primary text-white" : "border border-line bg-card text-muted",
            ].join(" ")}
          >
            {copy.unread} {totalUnread}
          </Link>
          </div>
          <ConversationAutoRefresh />
        </div>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">{copy.loadError}: {error.message}</div>
        ) : visibleInquiries.length ? (
          <div className="grid gap-4">
            {visibleInquiries.map((inquiry) => {
              const profile = profilesById.get(inquiry.designer_id);
              const studio = inquiry.studio_id ? studiosById.get(inquiry.studio_id) : null;
              const recipientName = studio?.name || profile?.full_name || copy.defaultProfessional;
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
                        {unread ? <span className="rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-white">{unread} {copy.newMessages}</span> : null}
                      </div>
                      <h2 className="mt-3 text-2xl font-bold">{briefInquirySubject(inquiry.brief_snapshot)}</h2>
                      <div className="mt-2 text-sm text-muted">
                        {recipientName}
                        {studio ? ` · ${copy.studio}` : profile?.profession_type ? ` · ${profile.profession_type}` : ""}
                        {studio?.location || profile?.location ? ` · ${studio?.location || profile?.location}` : ""}
                      </div>
                      <div className="mt-4 rounded-lg bg-background p-4 text-sm leading-6 text-muted">
                        <div className="font-semibold text-foreground">
                          {latest
                            ? latest.sender_id === user.id
                              ? copy.you
                              : recipientName
                            : copy.openingMessage}
                        </div>
                        <p className="mt-1 line-clamp-2">{latest?.body || inquiry.message || copy.openToSeeBrief}</p>
                        <div className="mt-2 text-xs">{formatDate(latest?.created_at || inquiry.created_at, copy.dateLocale)}</div>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Link href={`/account/inquiries/${inquiry.id}`} className="rounded-xl bg-primary px-5 py-3 text-center text-sm font-semibold text-white">
                        {unread ? copy.readMessage : copy.openConversation}
                      </Link>
                      <Link href={studio ? `/studios/${studio.id}` : `/designers/${inquiry.designer_id}`} className="rounded-xl border border-line bg-background px-5 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary">
                        {studio ? copy.viewStudio : copy.viewProfessional}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-card p-8">
            <h2 className="text-2xl font-bold">{selectedView === "unread" ? copy.allReadTitle : copy.noMessagesTitle}</h2>
            <p className="mt-2 max-w-xl leading-7 text-muted">
              {selectedView === "unread"
                ? copy.allReadBody
                : copy.noMessagesBody}
            </p>
            <Link href={selectedView === "unread" ? "/client/messages" : "/designers"} className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
              {selectedView === "unread" ? copy.allConversationsCta : copy.browseProfessionalsCta}
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
