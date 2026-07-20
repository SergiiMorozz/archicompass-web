import { sendTransactionalEmail } from "@/lib/email/send-transactional-email";
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
    `Otwórz zapytanie: ${appUrl()}/studio/inbox/${inquiryId}`,
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

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f3ee;color:#1f172a;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:28px;">
      <div style="font-size:14px;font-weight:700;color:#8b5e34;">ArchiCompass</div>
      <h1 style="margin:12px 0 8px;font-size:28px;line-height:1.2;">Nowe zapytanie AI Project Compass</h1>
      <p style="margin:0 0 20px;color:#665f68;line-height:1.6;">
        ${escapeHtml(designer.full_name || "Dzień dobry")}, klient wysłał zapisany brief projektowy.
      </p>

      ${
        message
          ? `<div style="margin:0 0 20px;padding:16px;border:1px solid #e2d8ce;border-radius:14px;background:#fff;">
              <div style="font-size:13px;font-weight:700;color:#8b5e34;">Wiadomość klienta</div>
              <p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(message)}</p>
            </div>`
          : ""
      }

      <div style="margin:0 0 20px;padding:16px;border:1px solid #e2d8ce;border-radius:14px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#8b5e34;">Podsumowanie briefu</div>
        <table style="width:100%;margin-top:10px;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
                <td style="padding:8px 0;color:#665f68;width:150px;">${escapeHtml(label)}</td>
                <td style="padding:8px 0;font-weight:700;">${escapeHtml(value || "Nie podano")}</td>
              </tr>`
            )
            .join("")}
        </table>
      </div>

      <div style="margin:0 0 20px;padding:16px;border-radius:14px;background:#1f172a;color:#fff;">
        <pre style="margin:0;white-space:pre-wrap;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;">${escapeHtml(
          brief.brief_text
        )}</pre>
      </div>

      ${
        clientEmail
          ? `<p style="margin:0 0 20px;color:#665f68;line-height:1.6;">E-mail klienta: <strong>${escapeHtml(
              clientEmail
            )}</strong></p>`
          : ""
      }

      <a href="${appUrl()}/studio/inbox/${inquiryId}" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#8b5e34;color:#fff;text-decoration:none;font-weight:700;">
        Otwórz zapytanie
      </a>
    </div>
  </body>
</html>`;
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
