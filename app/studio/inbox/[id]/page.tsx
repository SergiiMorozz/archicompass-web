import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import ConversationAutoRefresh from "@/components/ConversationAutoRefresh";
import PendingSubmitButton from "@/components/PendingSubmitButton";
import ReferencePhotoGrid from "@/components/ReferencePhotoGrid";
import { referencePhotoPreviews } from "@/lib/reference-photos";
import { getStudioMemberships } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Inquiry = {
  id: string;
  client_id: string;
  designer_id: string;
  studio_id: string | null;
  subject: string;
  message: string | null;
  status: string;
  brief_snapshot: Record<string, unknown> | null;
  brief_text: string;
  reference_photo_names: string[] | null;
  reference_photo_paths: string[] | null;
  created_at: string;
};

type Message = {
  id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ClientProfile = {
  full_name: string | null;
  email: string | null;
  location: string | null;
};

type TeamProfile = { id: string; full_name: string | null; email: string | null };

const statuses = ["reviewing", "accepted", "declined"] as const;

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function actionError(inquiryId: string, message: string): never {
  redirect(`/studio/inbox/${inquiryId}?error=${encodeURIComponent(message)}`);
}

async function sendMessage(formData: FormData) {
  "use server";

  const inquiryId = textValue(formData, "inquiry_id");
  const body = textValue(formData, "body");
  if (!inquiryId || !isUuid(inquiryId)) redirect("/studio/inbox");
  if (!body) actionError(inquiryId, "Write a message before sending.");
  if (body.length > 4000) actionError(inquiryId, "Messages can be up to 4,000 characters.");

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: canManage } = await supabase.rpc("can_manage_inquiry", {
    target_inquiry_id: inquiryId,
  });
  if (!canManage) actionError(inquiryId, "This conversation is not available.");

  const { data: inquiry } = await supabase
    .from("designer_inquiries")
    .select("id, designer_id, status")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!inquiry) actionError(inquiryId, "This conversation is not available.");

  const { error } = await supabase.from("inquiry_messages").insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    body,
  });
  if (error) actionError(inquiryId, error.message);

  if (inquiry.status === "sent") {
    await supabase
      .from("designer_inquiries")
      .update({ status: "reviewing", updated_at: new Date().toISOString() })
      .eq("id", inquiryId);
  }

  revalidatePath("/studio");
  revalidatePath("/studio/inbox");
  revalidatePath(`/studio/inbox/${inquiryId}`);
  revalidatePath("/account/inquiries");
  redirect(`/studio/inbox/${inquiryId}?sent=1`);
}

async function updateStatus(formData: FormData) {
  "use server";

  const inquiryId = textValue(formData, "inquiry_id");
  const status = textValue(formData, "status");
  if (!inquiryId || !isUuid(inquiryId)) redirect("/studio/inbox");
  if (!status || !statuses.includes(status as (typeof statuses)[number])) {
    actionError(inquiryId, "Choose a valid request status.");
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: canManage } = await supabase.rpc("can_manage_inquiry", {
    target_inquiry_id: inquiryId,
  });
  if (!canManage) actionError(inquiryId, "Only the receiving designer or studio team can update this request.");

  const { error } = await supabase.rpc("update_inquiry_status_with_message", {
    target_inquiry_id: inquiryId,
    new_status: status,
  });
  if (error) actionError(inquiryId, error.message);

  revalidatePath("/studio");
  revalidatePath("/studio/inbox");
  revalidatePath(`/studio/inbox/${inquiryId}`);
  revalidatePath("/client");
  revalidatePath("/client/messages");
  revalidatePath("/account/inquiries");
  revalidatePath(`/account/inquiries/${inquiryId}`);
  redirect(`/studio/inbox/${inquiryId}?status=1`);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
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

export default async function StudioConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; sent?: string; status?: string }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  if (!isUuid(id)) notFound();

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: inquiryData } = await supabase
    .from("designer_inquiries")
    .select(
      "id, client_id, designer_id, studio_id, subject, message, status, brief_snapshot, brief_text, reference_photo_names, reference_photo_paths, created_at"
    )
    .eq("id", id)
    .maybeSingle();
  if (!inquiryData) notFound();
  const inquiry = inquiryData as Inquiry;

  const { data: canManage } = await supabase.rpc("can_manage_inquiry", {
    target_inquiry_id: inquiry.id,
  });
  if (!canManage) notFound();

  if (inquiry.status === "sent") {
    const { data: opened } = await supabase
      .from("designer_inquiries")
      .update({ status: "reviewing", updated_at: new Date().toISOString() })
      .eq("id", inquiry.id)
      .eq("status", "sent")
      .select("id")
      .maybeSingle();
    if (opened) {
      inquiry.status = "reviewing";
      revalidatePath("/studio");
      revalidatePath("/studio/inbox");
      revalidatePath("/client");
      revalidatePath("/client/messages");
    }
  }

  await supabase
    .from("inquiry_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("inquiry_id", inquiry.id)
    .eq("sender_id", inquiry.client_id)
    .is("read_at", null);

  const [{ data: messageData }, { data: clientData }, photos] = await Promise.all([
    supabase
      .from("inquiry_messages")
      .select("id, sender_id, body, read_at, created_at")
      .eq("inquiry_id", inquiry.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("profiles")
      .select("full_name, email, location")
      .eq("id", inquiry.client_id)
      .maybeSingle(),
    referencePhotoPreviews(
      supabase,
      inquiry.reference_photo_names,
      inquiry.reference_photo_paths
    ),
  ]);
  const messages = (messageData ?? []) as Message[];
  const client = clientData as ClientProfile | null;
  const clientName = client?.full_name || client?.email || "Client";
  const { data: teamMemberships } = inquiry.studio_id
    ? await getStudioMemberships(supabase, user.id, "active")
    : { data: [] };
  const hasStudioAccess = inquiry.studio_id
    ? teamMemberships.some((membership) => membership.studio_id === inquiry.studio_id)
    : false;
  const { data: studioTeamData } = inquiry.studio_id && hasStudioAccess
    ? await supabase
        .from("studio_members")
        .select("user_id")
        .eq("studio_id", inquiry.studio_id)
        .eq("status", "active")
    : { data: [] };
  const teamUserIds = new Set<string>([
    inquiry.designer_id,
    ...(studioTeamData ?? []).map((member) => member.user_id),
  ]);
  const { data: teamProfileData } = teamUserIds.size
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", Array.from(teamUserIds))
    : { data: [] };
  const teamProfiles = new Map(
    ((teamProfileData ?? []) as TeamProfile[]).map((profile) => [profile.id, profile])
  );

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link href="/studio/inbox" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
            Back to inbox
          </Link>
          <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-primary">Conversation with {clientName}</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{inquiry.subject}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span>{client?.location || snapshotValue(inquiry.brief_snapshot, "location")}</span>
                <span>{formatDate(inquiry.created_at)}</span>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(inquiry.status)}`}>
                  {inquiry.status === "sent" ? "New" : inquiry.status}
                </span>
              </div>
            </div>
            <form action={updateStatus} className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <input type="hidden" name="inquiry_id" value={inquiry.id} />
              <label className="text-sm font-semibold">
                Lead status
                <select name="status" defaultValue={inquiry.status === "sent" ? "reviewing" : inquiry.status} className="mt-2 block rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary">
                  <option value="reviewing">Reviewing</option>
                  <option value="accepted">Accepted</option>
                  <option value="declined">Declined</option>
                </select>
              </label>
              <button type="submit" className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                Update
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid gap-6">
          {sp.sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Message sent. The client can now see it in their request history.
            </div>
          ) : null}
          {sp.status ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Lead status updated.
            </div>
          ) : null}
          {sp.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {sp.error}
            </div>
          ) : null}

          <section className="rounded-lg border border-line bg-card p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Messages</div>
                <h2 className="mt-1 text-3xl font-bold">Client conversation</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ConversationAutoRefresh />
                <Link href={`/studio/inbox/${inquiry.id}`} className="text-sm font-semibold text-primary hover:underline">
                  Refresh
                </Link>
              </div>
            </div>

            <div className="mt-6 grid gap-4" aria-live="polite">
              {inquiry.message ? (
                <div className="mr-auto max-w-[85%] rounded-lg rounded-bl-sm bg-background p-4">
                  <div className="text-xs font-semibold text-primary">{clientName} · original note</div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{inquiry.message}</p>
                </div>
              ) : null}

              {messages.map((message) => {
                const mine = message.sender_id === user.id;
                const fromTeam = teamUserIds.has(message.sender_id);
                const senderProfile = teamProfiles.get(message.sender_id);
                const senderLabel = mine
                  ? "You"
                  : fromTeam
                    ? senderProfile?.full_name || senderProfile?.email || "Studio team"
                    : clientName;
                return (
                  <div
                    key={message.id}
                    className={[
                      "max-w-[85%] rounded-lg p-4",
                      fromTeam
                        ? "ml-auto rounded-br-sm bg-primary text-white"
                        : "mr-auto rounded-bl-sm bg-background",
                    ].join(" ")}
                  >
                    <div className={`text-xs font-semibold ${fromTeam ? "text-white/70" : "text-primary"}`}>
                      {senderLabel} · {formatDate(message.created_at)}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                    {fromTeam ? (
                      <div className="mt-2 text-right text-[11px] font-semibold opacity-70">
                        {message.read_at ? "Read by client" : "Sent"}
                      </div>
                    ) : null}
                  </div>
                );
              })}

              {!inquiry.message && !messages.length ? (
                <div className="rounded-lg border border-dashed border-line bg-background p-6 text-sm leading-6 text-muted">
                  No messages yet. Start with one practical question about scope,
                  timeline, budget, or availability.
                </div>
              ) : null}
            </div>

            <form action={sendMessage} className="sticky bottom-3 z-10 mt-6 rounded-xl border border-line bg-card p-4 shadow-lg">
              <input type="hidden" name="inquiry_id" value={inquiry.id} />
              <label className="block text-sm font-semibold">
                Reply to {clientName}
                <textarea
                  name="body"
                  required
                  maxLength={4000}
                  rows={5}
                  placeholder="Ask a question, confirm fit, or suggest the next step..."
                  className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary"
                />
              </label>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-muted">
                  Messages are visible only to this client and the receiving designer or
                  active studio team.
                </p>
                <PendingSubmitButton
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
                  idleLabel="Send message"
                  pendingLabel="Sending..."
                />
              </div>
            </form>
          </section>
        </div>

        <aside className="grid h-fit gap-5 xl:sticky xl:top-40">
          <section className="rounded-lg border border-line bg-card p-5 shadow-sm">
            <div className="text-sm font-semibold text-primary">Project fit</div>
            <div className="mt-4 grid gap-3 text-sm">
              {[
                ["Project", snapshotValue(inquiry.brief_snapshot, "project_type")],
                ["Goal", snapshotValue(inquiry.brief_snapshot, "goal")],
                ["Style", snapshotValue(inquiry.brief_snapshot, "style_direction")],
                ["Support", snapshotValue(inquiry.brief_snapshot, "support_scope")],
                ["Budget", snapshotValue(inquiry.brief_snapshot, "budget_signal")],
                ["Area", snapshotValue(inquiry.brief_snapshot, "area_m2")],
                ["Rooms", snapshotValue(inquiry.brief_snapshot, "room_types")],
                ["Property", snapshotValue(inquiry.brief_snapshot, "property_status")],
                ["3D", snapshotValue(inquiry.brief_snapshot, "visualization_need")],
                ["Supervision", snapshotValue(inquiry.brief_snapshot, "supervision_need")],
                ["Location", snapshotValue(inquiry.brief_snapshot, "location")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
                  <span className="text-muted">{label}</span>
                  <span className="text-right font-semibold">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <ReferencePhotoGrid photos={photos} title="Client reference photos" />

          <details className="rounded-lg border border-line bg-card p-5 shadow-sm">
            <summary className="cursor-pointer font-semibold">Open full brief text</summary>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-[#1f172a] p-4 text-xs leading-6 text-white/80">
              {inquiry.brief_text}
            </pre>
          </details>
        </aside>
      </section>
    </main>
  );
}
