type BriefForEmail = {
  title: string | null;
  project_type: string | null;
  goal: string | null;
  style_direction: string | null;
  support_scope: string | null;
  budget_signal: string | null;
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
  return `${label}: ${value?.trim() || "Not specified"}`;
}

function shortError(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

function emailSubject(brief: BriefForEmail) {
  return `New ArchiCompass request: ${brief.title || brief.project_type || "Project brief"}`;
}

function emailText({
  brief,
  clientEmail,
  message,
}: {
  brief: BriefForEmail;
  clientEmail: string | null;
  message: string | null;
}) {
  return [
    "You received a new Project Compass request on ArchiCompass.",
    "",
    clientEmail ? `Client email: ${clientEmail}` : null,
    message ? `Client message: ${message}` : null,
    "",
    briefLine("Project", brief.project_type),
    briefLine("Goal", brief.goal),
    briefLine("Style", brief.style_direction),
    briefLine("Support", brief.support_scope),
    briefLine("Budget", brief.budget_signal),
    briefLine("Location", brief.location),
    brief.visual_cues?.length ? `Visual cues: ${brief.visual_cues.join(", ")}` : null,
    `Reference photos: ${brief.reference_photo_names?.length ?? 0}`,
    "",
    "Brief:",
    brief.brief_text,
    "",
    `Open requests: ${appUrl()}/account/inquiries`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

function emailHtml({
  brief,
  clientEmail,
  designer,
  message,
}: {
  brief: BriefForEmail;
  clientEmail: string | null;
  designer: DesignerForEmail;
  message: string | null;
}) {
  const rows: Array<[string, string | null | undefined]> = [
    ["Project", brief.project_type],
    ["Goal", brief.goal],
    ["Style", brief.style_direction],
    ["Support", brief.support_scope],
    ["Budget", brief.budget_signal],
    ["Location", brief.location],
    ["Visual cues", brief.visual_cues?.join(", ")],
    ["Reference photos", String(brief.reference_photo_names?.length ?? 0)],
  ];

  return `<!doctype html>
<html>
  <body style="margin:0;background:#f7f3ee;color:#1f172a;font-family:Arial,sans-serif;">
    <div style="max-width:680px;margin:0 auto;padding:28px;">
      <div style="font-size:14px;font-weight:700;color:#8b5e34;">ArchiCompass</div>
      <h1 style="margin:12px 0 8px;font-size:28px;line-height:1.2;">New Project Compass request</h1>
      <p style="margin:0 0 20px;color:#665f68;line-height:1.6;">
        ${escapeHtml(designer.full_name || "Hello")}, a client sent you a saved project brief.
      </p>

      ${
        message
          ? `<div style="margin:0 0 20px;padding:16px;border:1px solid #e2d8ce;border-radius:14px;background:#fff;">
              <div style="font-size:13px;font-weight:700;color:#8b5e34;">Client message</div>
              <p style="margin:8px 0 0;line-height:1.6;">${escapeHtml(message)}</p>
            </div>`
          : ""
      }

      <div style="margin:0 0 20px;padding:16px;border:1px solid #e2d8ce;border-radius:14px;background:#fff;">
        <div style="font-size:13px;font-weight:700;color:#8b5e34;">Brief snapshot</div>
        <table style="width:100%;margin-top:10px;border-collapse:collapse;">
          ${rows
            .map(
              ([label, value]) => `<tr>
                <td style="padding:8px 0;color:#665f68;width:150px;">${escapeHtml(label)}</td>
                <td style="padding:8px 0;font-weight:700;">${escapeHtml(value || "Not specified")}</td>
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
          ? `<p style="margin:0 0 20px;color:#665f68;line-height:1.6;">Client email: <strong>${escapeHtml(
              clientEmail
            )}</strong></p>`
          : ""
      }

      <a href="${appUrl()}/account/inquiries" style="display:inline-block;padding:12px 18px;border-radius:12px;background:#8b5e34;color:#fff;text-decoration:none;font-weight:700;">
        Open request
      </a>
    </div>
  </body>
</html>`;
}

export async function sendInquiryNotificationEmail({
  brief,
  clientEmail,
  designer,
  message,
}: {
  brief: BriefForEmail;
  clientEmail: string | null;
  designer: DesignerForEmail;
  message: string | null;
}): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_EMAIL_FROM;

  if (!designer.email) {
    return {
      error: "Designer profile has no email address.",
      sentAt: null,
      status: "skipped",
    };
  }

  if (!apiKey || !from) {
    return {
      error: null,
      sentAt: null,
      status: "not_configured",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from,
        html: emailHtml({ brief, clientEmail, designer, message }),
        reply_to: process.env.INQUIRY_EMAIL_REPLY_TO || clientEmail || undefined,
        subject: emailSubject(brief),
        text: emailText({ brief, clientEmail, message }),
        to: designer.email,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        error: `Resend ${response.status}: ${shortError(body)}`,
        sentAt: null,
        status: "failed",
      };
    }

    return {
      error: null,
      sentAt: new Date().toISOString(),
      status: "sent",
    };
  } catch (error) {
    return {
      error: error instanceof Error ? shortError(error.message) : "Email request failed.",
      sentAt: null,
      status: "failed",
    };
  }
}
