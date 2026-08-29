import { sendTransactionalEmail } from "@/lib/email/send-transactional-email";
import { emailSiteUrl, escapeEmailHtml, transactionalEmailHtml } from "@/lib/email/transactional-layout";
import { briefLabel, briefListLabel, briefStyleLabel, briefTitle } from "@/lib/brief-labels";
import { polishVisualCues } from "@/lib/visual-cues";

type BriefForEmail = {
  title: string | null;
  project_type: string | null;
  goal: string | null;
  style_direction: string | null;
  support_scope: string | null;
  budget_signal: string | null;
  timeline: string | null;
  area_m2: number | null;
  room_count: number | null;
  room_types: string[] | null;
  property_status: string | null;
  visualization_need: string | null;
  supervision_need: string | null;
  location: string | null;
  visual_cues: string[] | null;
  reference_photo_names: string[] | null;
  brief_text: string;
};

type DesignerForEmail = {
  email: string | null;
  full_name: string | null;
};

type NotificationStatus = "not_configured" | "sent" | "failed" | "skipped";

type NotificationResult = {
  error: string | null;
  sentAt: string | null;
  status: NotificationStatus;
};

function briefLine(label: string, value: string | null | undefined) {
  return `${label}: ${value?.trim() || "Nie podano"}`;
}

function emailSubject(brief: BriefForEmail) {
  return `Nowe zapytanie ArchiCompass: ${briefTitle(brief)}`;
}

function emailText({
  brief,
  clientEmail,
  inquiryId,
  message,
}: {
  brief: BriefForEmail;
  clientEmail: string | null;
  inquiryId: string;
  message: string | null;
}) {
  return [
    "Otrzymujesz nowe zapytanie AI Project Compass w ArchiCompass.",
    "",
    clientEmail ? `E-mail klienta: ${clientEmail}` : null,
    message ? `Wiadomość klienta: ${message}` : null,
    "",
    briefLine("Projekt", briefLabel(brief.project_type)),
    briefLine("Cel", briefLabel(brief.goal)),
    briefLine("Style", briefStyleLabel(brief.style_direction)),
    briefLine("Zakres wsparcia", briefLabel(brief.support_scope)),
    briefLine("Budżet", briefLabel(brief.budget_signal)),
    briefLine("Termin", briefLabel(brief.timeline)),
    briefLine("Powierzchnia", brief.area_m2 ? `${brief.area_m2} m²` : null),
    briefLine("Liczba pomieszczeń", brief.room_count ? String(brief.room_count) : null),
    brief.room_types?.length ? `Pomieszczenia: ${briefListLabel(brief.room_types)}` : null,
    briefLine("Status nieruchomości", briefLabel(brief.property_status)),
    briefLine("Wizualizacja 3D", briefLabel(brief.visualization_need)),
    briefLine("Nadzór", briefLabel(brief.supervision_need)),
    briefLine("Lokalizacja", brief.location),
    brief.visual_cues?.length ? `Wskazówki wizualne: ${polishVisualCues(brief.visual_cues).join(", ")}` : null,
    `Zdjęcia referencyjne: ${brief.reference_photo_names?.length ?? 0}`,
    "",
    "Brief:",
    brief.brief_text,
    "",
    `Otwórz zapytanie: ${emailSiteUrl()}/studio/inbox/${inquiryId}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function emailHtml({
  brief,
  clientEmail,
  designer,
  inquiryId,
  message,
}: {
  brief: BriefForEmail;
  clientEmail: string | null;
  designer: DesignerForEmail;
  inquiryId: string;
  message: string | null;
}) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Projekt", briefLabel(brief.project_type)],
    ["Cel", briefLabel(brief.goal)],
    ["Style", briefStyleLabel(brief.style_direction)],
    ["Zakres wsparcia", briefLabel(brief.support_scope)],
    ["Budżet", briefLabel(brief.budget_signal)],
    ["Termin", briefLabel(brief.timeline)],
    ["Powierzchnia", brief.area_m2 ? `${brief.area_m2} m²` : null],
    ["Liczba pomieszczeń", brief.room_count ? String(brief.room_count) : null],
    ["Pomieszczenia", briefListLabel(brief.room_types)],
    ["Status nieruchomości", briefLabel(brief.property_status)],
    ["Wizualizacja 3D", briefLabel(brief.visualization_need)],
    ["Nadzór", briefLabel(brief.supervision_need)],
    ["Lokalizacja", brief.location],
    ["Wskazówki wizualne", polishVisualCues(brief.visual_cues).join(", ")],
    ["Zdjęcia referencyjne", String(brief.reference_photo_names?.length ?? 0)],
  ];

  const messageHtml = message
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin:0 0 16px;border-collapse:separate;border-spacing:0;border:1px solid #e5d7fb;border-radius:16px;background:#faf7ff;"><tr><td style="padding:16px 18px 8px;color:#5c20c2;font-size:13px;font-weight:700;">Wiadomość klienta</td></tr><tr><td style="padding:0 18px 18px;color:#4b3b60;font-size:14px;line-height:1.6;">${escapeEmailHtml(message)}</td></tr></table>`
    : "";
  const summaryRows = rows
    .map(
      ([label, value]) => `<tr><td style="padding:8px 0;color:#756a85;font-size:13px;line-height:1.45;vertical-align:top;width:42%;">${escapeEmailHtml(label)}</td><td style="padding:8px 0;color:#2c1f42;font-size:13px;font-weight:700;line-height:1.45;vertical-align:top;">${escapeEmailHtml(value || "Nie podano")}</td></tr>`
    )
    .join("");

  return transactionalEmailHtml({
    bodyHtml: `${messageHtml}<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e5d7fb;border-radius:16px;background:#ffffff;"><tr><td style="padding:16px 18px 4px;color:#5c20c2;font-size:13px;font-weight:700;">Podsumowanie briefu</td></tr><tr><td style="padding:0 18px 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;">${summaryRows}</table></td></tr></table><table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;margin-top:16px;border-collapse:separate;border-spacing:0;border-radius:16px;background:#2a1d43;"><tr><td style="padding:16px 18px;color:#ffffff;font-size:13px;line-height:1.6;white-space:pre-wrap;">${escapeEmailHtml(brief.brief_text)}</td></tr></table>${clientEmail ? `<p style="margin:16px 0 0;color:#756a85;font-size:13px;line-height:1.55;">E-mail klienta: <strong style="color:#3d2d53;">${escapeEmailHtml(clientEmail)}</strong></p>` : ""}`,
    ctaHref: `${emailSiteUrl()}/studio/inbox/${inquiryId}`,
    ctaLabel: "Otwórz zapytanie",
    eyebrow: "Nowe zapytanie",
    footerNote: "Przejrzyj brief przed odpowiedzią — dzięki temu pierwsza rozmowa będzie od razu bardziej konkretna.",
    greeting: designer.full_name || "Dzień dobry",
    intro: "Klient wysłał zapisany brief projektowy przez AI Project Compass.",
    preheader: `Nowe zapytanie: ${briefTitle(brief)}`,
    steps: [
      { title: "Przejrzyj brief", body: "Zobacz potrzeby klienta, zakres, budżet, termin i inspiracje." },
      { title: "Odpowiedz w rozmowie", body: "Wiadomość i dalsze ustalenia są dostępne w Studio projektanta." },
    ],
    title: "Nowe zapytanie AI Project Compass",
  });
}

export async function sendInquiryNotificationEmail({
  brief,
  clientEmail,
  designer,
  inquiryId,
  message,
}: {
  brief: BriefForEmail;
  clientEmail: string | null;
  designer: DesignerForEmail;
  inquiryId: string;
  message: string | null;
}): Promise<NotificationResult> {
  if (!designer.email) {
    return {
      error: "Profil projektanta nie ma adresu e-mail.",
      sentAt: null,
      status: "skipped",
    };
  }

  const result = await sendTransactionalEmail({
    html: emailHtml({ brief, clientEmail, designer, inquiryId, message }),
    replyTo: clientEmail,
    subject: emailSubject(brief),
    text: emailText({ brief, clientEmail, inquiryId, message }),
    to: designer.email,
  });

  return {
    error: result.error,
    sentAt: result.status === "sent" ? new Date().toISOString() : null,
    status: result.status,
  };
}
