import { NextResponse } from "next/server";
import {
  sendConversationNotificationEmail,
  type ConversationNotificationResult,
} from "@/lib/email/conversation-notification";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const batchSize = 100;
const maxAttempts = 3;

type Inquiry = {
  id: string;
  client_id: string;
  designer_id: string;
  studio_id: string | null;
  subject: string;
  message: string | null;
  brief_text: string;
  status: string;
  unread_reminder_email_attempts: number;
};

type Message = {
  id: string;
  inquiry_id: string;
  sender_id: string;
  body: string;
  unread_reminder_email_attempts: number;
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

type Counters = {
  failed: number;
  processed: number;
  sent: number;
  skipped: number;
};

function storedStatus(status: ConversationNotificationResult["status"]) {
  return status === "not_configured" ? "skipped" : status;
}

function resultError(result: ConversationNotificationResult) {
  if (result.status === "not_configured") return "Email delivery is not configured.";
  return result.error;
}

function countResult(counters: Counters, result: ConversationNotificationResult) {
  counters.processed += 1;
  if (result.status === "sent") counters.sent += 1;
  else if (result.status === "failed") counters.failed += 1;
  else counters.skipped += 1;
}

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch (error) {
    console.error("Unread reminder configuration error", error);
    return NextResponse.json({ error: "Reminder service is not configured" }, { status: 503 });
  }

  const now = new Date();
  const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const retryBefore = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString();
  const candidateFilter = `unread_reminder_email_last_attempt_at.is.null,unread_reminder_email_last_attempt_at.lte.${retryBefore}`;

  const [inquiryResult, messageResult] = await Promise.all([
    supabase
      .from("designer_inquiries")
      .select(
        "id, client_id, designer_id, studio_id, subject, message, brief_text, status, unread_reminder_email_attempts"
      )
      .eq("status", "sent")
      .lte("created_at", cutoff)
      .in("unread_reminder_email_status", ["pending", "failed"])
      .lt("unread_reminder_email_attempts", maxAttempts)
      .or(candidateFilter)
      .order("created_at", { ascending: true })
      .limit(batchSize),
    supabase
      .from("inquiry_messages")
      .select("id, inquiry_id, sender_id, body, unread_reminder_email_attempts")
      .is("read_at", null)
      .lte("created_at", cutoff)
      .in("unread_reminder_email_status", ["pending", "failed"])
      .lt("unread_reminder_email_attempts", maxAttempts)
      .or(candidateFilter)
      .order("created_at", { ascending: true })
      .limit(batchSize),
  ]);

  if (inquiryResult.error || messageResult.error) {
    console.error("Unread reminder query failed", inquiryResult.error || messageResult.error);
    return NextResponse.json({ error: "Reminder query failed" }, { status: 500 });
  }

  const inquiries = (inquiryResult.data ?? []) as Inquiry[];
  const messages = (messageResult.data ?? []) as Message[];
  const conversationIds = Array.from(new Set(messages.map((message) => message.inquiry_id)));
  const { data: messageInquiryData, error: messageInquiryError } = conversationIds.length
    ? await supabase
        .from("designer_inquiries")
        .select("id, client_id, designer_id, studio_id, subject, message, brief_text, status, unread_reminder_email_attempts")
        .in("id", conversationIds)
    : { data: [], error: null };
  if (messageInquiryError) {
    console.error("Unread reminder conversation lookup failed", messageInquiryError);
    return NextResponse.json({ error: "Conversation lookup failed" }, { status: 500 });
  }

  const messageInquiries = (messageInquiryData ?? []) as Inquiry[];
  const allInquiries = [...inquiries, ...messageInquiries];
  const profileIds = Array.from(
    new Set([
      ...allInquiries.flatMap((inquiry) => [inquiry.client_id, inquiry.designer_id]),
      ...messages.map((message) => message.sender_id),
    ])
  );
  const studioIds = Array.from(
    new Set(allInquiries.map((inquiry) => inquiry.studio_id).filter((id): id is string => Boolean(id)))
  );
  const [{ data: profileData }, { data: studioData }] = await Promise.all([
    profileIds.length
      ? supabase.from("profiles").select("id, full_name, email").in("id", profileIds)
      : Promise.resolve({ data: [] }),
    studioIds.length
      ? supabase.from("studios").select("id, name, email").in("id", studioIds)
      : Promise.resolve({ data: [] }),
  ]);
  const profiles = new Map(
    ((profileData ?? []) as Profile[]).map((profile) => [profile.id, profile])
  );
  const studios = new Map(((studioData ?? []) as Studio[]).map((studio) => [studio.id, studio]));
  const messageInquiryMap = new Map(messageInquiries.map((inquiry) => [inquiry.id, inquiry]));
  const counters: Counters = { failed: 0, processed: 0, sent: 0, skipped: 0 };

  for (const inquiry of inquiries) {
    const { data: stillUnread } = await supabase
      .from("designer_inquiries")
      .select("id")
      .eq("id", inquiry.id)
      .eq("status", "sent")
      .maybeSingle();
    if (!stillUnread) continue;

    const studio = inquiry.studio_id ? studios.get(inquiry.studio_id) : null;
    const designer = profiles.get(inquiry.designer_id);
    const client = profiles.get(inquiry.client_id);
    const result = await sendConversationNotificationEmail({
      body: inquiry.message || inquiry.brief_text || "A Project Compass request is waiting for review.",
      inquiryId: inquiry.id,
      kind: "unread_reminder",
      recipient: {
        email: studio?.email || designer?.email || null,
        name: studio?.name || designer?.full_name || null,
        role: "designer",
      },
      senderName: client?.full_name || client?.email || "Client",
      subject: inquiry.subject,
    });
    await supabase
      .from("designer_inquiries")
      .update({
        unread_reminder_email_attempts: inquiry.unread_reminder_email_attempts + 1,
        unread_reminder_email_error: resultError(result),
        unread_reminder_email_last_attempt_at: now.toISOString(),
        unread_reminder_email_sent_at: result.status === "sent" ? now.toISOString() : null,
        unread_reminder_email_status: storedStatus(result.status),
      })
      .eq("id", inquiry.id);
    countResult(counters, result);
  }

  for (const message of messages) {
    const inquiry = messageInquiryMap.get(message.inquiry_id);
    if (!inquiry) continue;
    const { data: stillUnread } = await supabase
      .from("inquiry_messages")
      .select("id")
      .eq("id", message.id)
      .is("read_at", null)
      .maybeSingle();
    if (!stillUnread) continue;

    const sentByClient = message.sender_id === inquiry.client_id;
    const studio = inquiry.studio_id ? studios.get(inquiry.studio_id) : null;
    const designer = profiles.get(inquiry.designer_id);
    const client = profiles.get(inquiry.client_id);
    const sender = profiles.get(message.sender_id);
    const result = await sendConversationNotificationEmail({
      body: message.body,
      inquiryId: inquiry.id,
      kind: "unread_reminder",
      recipient: sentByClient
        ? {
            email: studio?.email || designer?.email || null,
            name: studio?.name || designer?.full_name || null,
            role: "designer",
          }
        : {
            email: client?.email || null,
            name: client?.full_name || null,
            role: "client",
          },
      senderName:
        sender?.full_name || sender?.email || (sentByClient ? "Client" : "Design professional"),
      subject: inquiry.subject,
    });
    await supabase
      .from("inquiry_messages")
      .update({
        unread_reminder_email_attempts: message.unread_reminder_email_attempts + 1,
        unread_reminder_email_error: resultError(result),
        unread_reminder_email_last_attempt_at: now.toISOString(),
        unread_reminder_email_sent_at: result.status === "sent" ? now.toISOString() : null,
        unread_reminder_email_status: storedStatus(result.status),
      })
      .eq("id", message.id)
      .is("read_at", null);
    countResult(counters, result);
  }

  return NextResponse.json({ cutoff, ok: true, ...counters });
}
