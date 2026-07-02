type ConversationRecipient = {
  email: string | null;
  name: string | null;
  role: "client" | "designer";
};

type NotificationStatus = "not_configured" | "sent" | "failed" | "skipped";

export type ConversationNotificationResult = {
  error: string | null;
  status: NotificationStatus;
};

function appUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3001";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function short(value: string, limit = 500) {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function conversationUrl(inquiryId: string, role: ConversationRecipient["role"]) {
  const path = role === "client" ? "/account/inquiries/" : "/studio/inbox/";
  return `${appUrl()}${path}${inquiryId}`;
}

export async function sendConversationNotificationEmail({
  body,
  inquiryId,
  kind = "new_message",
  recipient,
  senderName,
  subject,
}: {
  body: string;
  inquiryId: string;
  kind?: "new_message" | "unread_reminder";
  recipient: ConversationRecipient;
  senderName: string;
  subject: string;
}): Promise<ConversationNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_EMAIL_FROM;

  if (!recipient.email) {
    return { error: "Recipient has no email address.", status: "skipped" };
  }
  if (!apiKey || !from) {
    return { error: null, status: "not_configured" };
  }

  const url = conversationUrl(inquiryId, recipient.role);
  const preview = body.trim().slice(0, 1200);
  const isReminder = kind === "unread_reminder";
  const title = `${isReminder ? "Unread message reminder" : "New ArchiCompass message"}: ${
    short(subject, 120) || "Project conversation"
  }`;
  const text = [
    `${recipient.name || "Hello"},`,
    "",
    isReminder
      ? `A message from ${senderName} has been waiting for 24 hours on ArchiCompass.`
      : `${senderName} sent a new message on ArchiCompass:`,
    "",
    preview,
    "",
    `Open conversation: ${url}`,
  ].join("\n");
  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f7f3ee;color:#1f172a;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:28px;">
      <div style="font-size:14px;font-weight:700;color:#6f2f9f;">ArchiCompass</div>
      <h1 style="margin:12px 0 8px;font-size:28px;line-height:1.2;">${
        isReminder ? "Unread message reminder" : "New message"
      }</h1>
      <p style="margin:0 0 20px;color:#665f68;line-height:1.6;">
        ${escapeHtml(recipient.name || "Hello")}, ${
          isReminder
            ? `a message from ${escapeHtml(senderName)} has been unread for 24 hours.`
            : `${escapeHtml(senderName)} replied in your project conversation.`
        }
      </p>
      <div style="margin:0 0 20px;padding:16px;border:1px solid #e2d8ce;border-radius:12px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#6f2f9f;">${escapeHtml(subject)}</div>
        <p style="margin:8px 0 0;white-space:pre-wrap;line-height:1.6;">${escapeHtml(preview)}</p>
      </div>
      <a href="${url}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:#6f2f9f;color:#fff;text-decoration:none;font-weight:700;">
        ${isReminder ? "Read message" : "Open conversation"}
      </a>
    </div>
  </body>
</html>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from,
        html,
        reply_to: process.env.INQUIRY_EMAIL_REPLY_TO || undefined,
        subject: title,
        text,
        to: recipient.email,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return {
        error: `Resend ${response.status}: ${short(await response.text())}`,
        status: "failed",
      };
    }
    return { error: null, status: "sent" };
  } catch (error) {
    return {
      error: error instanceof Error ? short(error.message) : "Email request failed.",
      status: "failed",
    };
  }
}
