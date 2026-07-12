import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import ConversationAutoRefresh from "@/components/ConversationAutoRefresh";
import PendingSubmitButton from "@/components/PendingSubmitButton";
import ReferencePhotoGrid from "@/components/ReferencePhotoGrid";
import MessageAttachments from "@/components/MessageAttachments";
import { sendConversationNotificationEmail } from "@/lib/email/conversation-notification";
import {
  attachmentFiles,
  messageAttachmentPreviews,
  uploadMessageAttachments,
  type MessageAttachment,
} from "@/lib/message-attachments";
import { referencePhotoPreviews } from "@/lib/reference-photos";
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
  attachment_names: string[] | null;
  attachment_paths: string[] | null;
  attachment_types: string[] | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type Studio = {
  id: string;
  name: string;
  email: string | null;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function sendParticipantMessage(formData: FormData) {
  "use server";

  const inquiryId = textValue(formData, "inquiry_id");
  const body = textValue(formData, "body");
  if (!inquiryId || !isUuid(inquiryId)) redirect("/account/inquiries");
  const files = attachmentFiles(formData);
  if (!body && !files.length) redirect(`/account/inquiries/${inquiryId}?error=Wpisz%20wiadomo%C5%9B%C4%87%20albo%20dodaj%20plik`);
  if ((body?.length ?? 0) > 4000) redirect(`/account/inquiries/${inquiryId}?error=Wiadomo%C5%9B%C4%87%20jest%20zbyt%20d%C5%82uga`);

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: inquiry } = await supabase
    .from("designer_inquiries")
    .select("id, client_id, designer_id, studio_id, subject")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!inquiry) redirect("/client/messages");
  if (inquiry.client_id !== user.id) redirect(`/studio/inbox/${inquiryId}`);

  const upload = await uploadMessageAttachments({ files, inquiryId, supabase, userId: user.id });
  if (upload.error) redirect(`/account/inquiries/${inquiryId}?error=${encodeURIComponent(upload.error)}`);

  const { data: insertedMessage, error } = await supabase.from("inquiry_messages").insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    body: body || "Udostępniono załączniki",
    attachment_names: upload.names,
    attachment_paths: upload.paths,
    attachment_types: upload.types,
  }).select("id").single();
  if (error) {
    if (upload.paths.length) await supabase.storage.from("message-attachments").remove(upload.paths);
    redirect(`/account/inquiries/${inquiryId}?error=${encodeURIComponent(error.message)}`);
  }

  const [{ data: senderProfile }, { data: designerProfile }, { data: studio }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", inquiry.designer_id)
        .maybeSingle(),
      inquiry.studio_id
        ? supabase
            .from("studios")
            .select("name, email")
            .eq("id", inquiry.studio_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);
  const notification = await sendConversationNotificationEmail({
    body: body || `Shared ${upload.names.join(", ")}`,
    inquiryId,
    recipient: {
      email: studio?.email || designerProfile?.email || null,
      name: studio?.name || designerProfile?.full_name || null,
      role: "designer",
    },
    senderName: senderProfile?.full_name || user.email || "Client",
    subject: inquiry.subject,
  });
  if (notification.error) {
    console.error("Conversation email notification failed", notification.error);
  }
  if (insertedMessage?.id) {
    await supabase.from("inquiry_messages").update({
      immediate_email_status: notification.status,
      immediate_email_sent_at: notification.status === "sent" ? new Date().toISOString() : null,
      immediate_email_error: notification.error,
    }).eq("id", insertedMessage.id);
  }

  revalidatePath("/account/inquiries");
  revalidatePath("/client");
  revalidatePath("/client/messages");
  revalidatePath(`/account/inquiries/${inquiryId}`);
  revalidatePath("/studio");
  revalidatePath("/studio/inbox");
  revalidatePath(`/studio/inbox/${inquiryId}`);
  redirect(`/account/inquiries/${inquiryId}?sent=1`);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
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

function statusLabel(status: string) {
  if (status === "accepted") return "Zaakceptowane";
  if (status === "declined") return "Odrzucone";
  if (status === "reviewing") return "W trakcie";
  if (status === "sent") return "Nowe";
  return status;
}

export default async function AccountConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; sent?: string }>;
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
    .select("id, client_id, designer_id, studio_id, subject, message, status, brief_snapshot, brief_text, reference_photo_names, reference_photo_paths, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!inquiryData) notFound();
  const inquiry = inquiryData as Inquiry;
  if (inquiry.client_id !== user.id) redirect(`/studio/inbox/${inquiry.id}`);

  await supabase
    .from("inquiry_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("inquiry_id", inquiry.id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const [{ data: messageData }, { data: profileData }, { data: studioData }, photos] = await Promise.all([
    supabase
      .from("inquiry_messages")
      .select("id, sender_id, body, read_at, created_at, attachment_names, attachment_paths, attachment_types")
      .eq("inquiry_id", inquiry.id)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("id", inquiry.designer_id).maybeSingle(),
    inquiry.studio_id
      ? supabase.from("studios").select("id, name, email").eq("id", inquiry.studio_id).maybeSingle()
      : Promise.resolve({ data: null }),
    referencePhotoPreviews(supabase, inquiry.reference_photo_names, inquiry.reference_photo_paths),
  ]);
  const messages = (messageData ?? []) as Message[];
  const messageAttachmentEntries = await Promise.all(messages.map(async (message): Promise<[string, MessageAttachment[]]> => [
    message.id,
    await messageAttachmentPreviews(supabase, message.attachment_names, message.attachment_paths, message.attachment_types),
  ]));
  const attachmentsByMessage = new Map(messageAttachmentEntries);
  const other = profileData as Profile | null;
  const studio = studioData as Studio | null;
  const otherName = studio?.name || other?.full_name || studio?.email || other?.email || "Projektant wnętrz";
  const originalAuthor = "Ty";

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/client/messages" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
            Wróć do wiadomości
          </Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-primary">Rozmowa z: {otherName}</div>
              <h1 className="mt-2 text-4xl font-bold">{inquiry.subject}</h1>
              <Link href={studio ? `/studios/${studio.id}` : `/designers/${inquiry.designer_id}`} className="mt-3 inline-flex text-sm font-bold text-primary hover:underline">
                {studio ? "Otwórz profil pracowni" : "Otwórz profil projektanta"}
              </Link>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusClass(inquiry.status)}`}>
              {statusLabel(inquiry.status)}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-line bg-card p-5 shadow-sm sm:p-6">
          {sp.sent ? (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Wiadomość została wysłana.
            </div>
          ) : null}
          {sp.error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {sp.error}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold">Wiadomości</h2>
            <div className="flex flex-wrap items-center gap-3">
              <ConversationAutoRefresh />
              <Link href={`/account/inquiries/${inquiry.id}`} className="text-sm font-semibold text-primary hover:underline">
                Odśwież
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4" aria-live="polite">
            {inquiry.message ? (
              <div className={[
                "max-w-[85%] rounded-lg p-4",
                inquiry.client_id === user.id ? "ml-auto bg-primary text-white" : "mr-auto bg-background",
              ].join(" ")}>
                <div className="text-xs font-semibold opacity-70">{originalAuthor} · pierwsza wiadomość</div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{inquiry.message}</p>
              </div>
            ) : null}

            {messages.map((message) => {
              const mine = message.sender_id === user.id;
              return (
                <div key={message.id} className={[
                  "max-w-[85%] rounded-lg p-4",
                  mine ? "ml-auto rounded-br-sm bg-primary text-white" : "mr-auto rounded-bl-sm bg-background",
                ].join(" ")}>
                  <div className="text-xs font-semibold opacity-70">
                    {mine ? "Ty" : otherName} · {formatDate(message.created_at)}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                  <MessageAttachments attachments={attachmentsByMessage.get(message.id) ?? []} inverted={mine} />
                  {mine ? (
                    <div className="mt-2 text-right text-[11px] font-semibold opacity-70">
                      {message.read_at ? "Przeczytano" : "Wysłano"}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <form action={sendParticipantMessage} className="sticky bottom-3 z-10 mt-6 rounded-xl border border-line bg-card p-4 shadow-lg">
            <input type="hidden" name="inquiry_id" value={inquiry.id} />
            <label className="block text-sm font-semibold">
              Reply
              <textarea name="body" maxLength={4000} rows={5} placeholder="Write your message..." className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <label className="mt-3 block text-sm font-semibold">
              Attach plans or documents <span className="font-normal text-muted">up to 5 files, 20 MB each</span>
              <input name="attachments" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.zip,.txt" className="mt-2 block w-full rounded-xl border border-dashed border-line bg-background px-4 py-3 text-sm font-normal text-muted" />
            </label>
            <PendingSubmitButton
              className="mt-3 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              idleLabel="Send message"
              pendingLabel="Sending..."
            />
          </form>
        </section>

        <aside className="grid h-fit gap-5 lg:sticky lg:top-24">
          <ReferencePhotoGrid photos={photos} title="Brief reference photos" />
          <details className="rounded-lg border border-line bg-card p-5 shadow-sm">
            <summary className="cursor-pointer font-semibold">Open full brief</summary>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-[#1f172a] p-4 text-xs leading-6 text-white/80">
              {inquiry.brief_text}
            </pre>
          </details>
        </aside>
      </section>
    </main>
  );
}
