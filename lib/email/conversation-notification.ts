import { sendTransactionalEmail } from "@/lib/email/send-transactional-email";
import { emailSiteUrl, escapeEmailHtml, transactionalEmailHtml } from "@/lib/email/transactional-layout";

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

function short(value: string, limit = 500) {
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function conversationUrl(inquiryId: string, role: ConversationRecipient["role"]) {
  const path = role === "client" ? "/account/inquiries/" : "/studio/inbox/";
  return `${emailSiteUrl()}${path}${inquiryId}`;
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
  if (!recipient.email) {
    return { error: "Odbiorca nie ma adresu e-mail.", status: "skipped" };
  }

  const url = conversationUrl(inquiryId, recipient.role);
  const preview = body.trim().slice(0, 1200);
  const isReminder = kind === "unread_reminder";
  const title = `${isReminder ? "Przypomnienie o nieodczytanej wiadomości" : "Nowa wiadomość ArchiCompass"}: ${
    short(subject, 120) || "Rozmowa o projekcie"
  }`;
  const text = [
    `${recipient.name || "Dzień dobry"},`,
    "",
    isReminder
      ? `Wiadomość od ${senderName} czeka w ArchiCompass od 24 godzin.`
      : `${senderName} wysłał(a) nową wiadomość w ArchiCompass:`,
    "",
    preview,
    "",
    `Otwórz rozmowę: ${url}`,
  ].join("\n");
  const html = transactionalEmailHtml({
  bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e5d7fb;border-radius:16px;background:#faf7ff;"><tr><td style="padding:16px 18px 8px;color:#5c20c2;font-size:13px;font-weight:700;">${escapeEmailHtml(subject)}</td></tr><tr><td style="padding:0 18px 18px;color:#4b3b60;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeEmailHtml(preview)}</td></tr></table>`,
  ctaHref: url,
  ctaLabel: isReminder ? "Przeczytaj wiadomość" : "Otwórz rozmowę",
  eyebrow: isReminder ? "Przypomnienie" : "Wiadomości",
  footerNote: "Rozmowy, brief i kolejne kroki projektu znajdziesz w jednym miejscu w ArchiCompass.",
  greeting: recipient.name || "Dzień dobry",
  intro: isReminder
    ? `Wiadomość od ${senderName} pozostaje nieodczytana od 24 godzin.`
    : `${senderName} odpowiedział(a) w rozmowie o projekcie.`,
  preheader: title,
  steps: [
    {
      title: isReminder ? "Wróć do rozmowy" : "Sprawdź odpowiedź",
      body: isReminder ? "Przeczytaj wiadomość, aby rozmowa o projekcie mogła iść dalej." : "Otwórz pełną rozmowę, aby zobaczyć kontekst i odpowiedzieć klientowi lub projektantowi.",
    },
  ],
    title: isReminder ? "Przypomnienie o wiadomości" : "Nowa wiadomość",
  });

  return sendTransactionalEmail({
    html,
    subject: title,
    text,
    to: recipient.email,
  });
}
