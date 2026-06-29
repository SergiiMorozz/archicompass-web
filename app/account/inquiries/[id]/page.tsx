import Link from "next/link";
import { revalidatePath } from "next/cache";
import { notFound, redirect } from "next/navigation";
import ReferencePhotoGrid from "@/components/ReferencePhotoGrid";
import { referencePhotoPreviews } from "@/lib/reference-photos";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Inquiry = {
  id: string;
  client_id: string;
  designer_id: string;
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
  created_at: string;
};

type Profile = {
  id: string;
  full_name: string | null;
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
  if (!body) redirect(`/account/inquiries/${inquiryId}?error=Write%20a%20message%20before%20sending`);
  if (body.length > 4000) redirect(`/account/inquiries/${inquiryId}?error=Message%20is%20too%20long`);

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  const { data: inquiry } = await supabase
    .from("designer_inquiries")
    .select("id, client_id, designer_id")
    .eq("id", inquiryId)
    .maybeSingle();
  if (!inquiry || (inquiry.client_id !== user.id && inquiry.designer_id !== user.id)) {
    redirect("/account/inquiries");
  }

  const { error } = await supabase.from("inquiry_messages").insert({
    inquiry_id: inquiryId,
    sender_id: user.id,
    body,
  });
  if (error) {
    redirect(`/account/inquiries/${inquiryId}?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account/inquiries");
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
    .select("id, client_id, designer_id, subject, message, status, brief_snapshot, brief_text, reference_photo_names, reference_photo_paths, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!inquiryData) notFound();
  const inquiry = inquiryData as Inquiry;
  if (inquiry.client_id !== user.id && inquiry.designer_id !== user.id) notFound();

  await supabase
    .from("inquiry_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("inquiry_id", inquiry.id)
    .neq("sender_id", user.id)
    .is("read_at", null);

  const otherId = inquiry.client_id === user.id ? inquiry.designer_id : inquiry.client_id;
  const [{ data: messageData }, { data: profileData }, photos] = await Promise.all([
    supabase
      .from("inquiry_messages")
      .select("id, sender_id, body, created_at")
      .eq("inquiry_id", inquiry.id)
      .order("created_at", { ascending: true }),
    supabase.from("profiles").select("id, full_name, email").eq("id", otherId).maybeSingle(),
    referencePhotoPreviews(supabase, inquiry.reference_photo_names, inquiry.reference_photo_paths),
  ]);
  const messages = (messageData ?? []) as Message[];
  const other = profileData as Profile | null;
  const otherName = other?.full_name || other?.email || "Conversation participant";
  const originalAuthor = inquiry.client_id === user.id ? "You" : otherName;

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Link href="/account/inquiries" className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary">
            Back to requests
          </Link>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-primary">Conversation with {otherName}</div>
              <h1 className="mt-2 text-4xl font-bold">{inquiry.subject}</h1>
            </div>
            <span className={`w-fit rounded-full px-3 py-1 text-sm font-semibold capitalize ${statusClass(inquiry.status)}`}>
              {inquiry.status}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="rounded-lg border border-line bg-card p-5 shadow-sm sm:p-6">
          {sp.sent ? (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Message sent.
            </div>
          ) : null}
          {sp.error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {sp.error}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Messages</h2>
            <Link href={`/account/inquiries/${inquiry.id}`} className="text-sm font-semibold text-primary hover:underline">
              Refresh
            </Link>
          </div>

          <div className="mt-6 grid gap-4">
            {inquiry.message ? (
              <div className={[
                "max-w-[85%] rounded-lg p-4",
                inquiry.client_id === user.id ? "ml-auto bg-primary text-white" : "mr-auto bg-background",
              ].join(" ")}>
                <div className="text-xs font-semibold opacity-70">{originalAuthor} · original note</div>
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
                    {mine ? "You" : otherName} · {formatDate(message.created_at)}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
                </div>
              );
            })}
          </div>

          <form action={sendParticipantMessage} className="mt-6 border-t border-line pt-6">
            <input type="hidden" name="inquiry_id" value={inquiry.id} />
            <label className="block text-sm font-semibold">
              Reply
              <textarea name="body" required maxLength={4000} rows={5} placeholder="Write your message..." className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <button type="submit" className="mt-3 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Send message
            </button>
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
