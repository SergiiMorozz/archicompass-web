type EmailLocale = "pl" | "en";

type EmailStep = {
  body: string;
  title: string;
};

type TransactionalEmailLayout = {
  bodyHtml?: string;
  ctaHref: string;
  ctaLabel: string;
  eyebrow: string;
  footerNote?: string;
  greeting: string;
  intro: string;
  locale?: EmailLocale;
  preheader: string;
  privacyNote?: string;
  steps?: EmailStep[];
  title: string;
};

export function emailSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://archicompass.pl");
  return url.replace(/\/$/, "");
}

export function escapeEmailHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

export function transactionalEmailHtml({
  bodyHtml = "",
  ctaHref,
  ctaLabel,
  eyebrow,
  footerNote,
  greeting,
  intro,
  locale = "pl",
  preheader,
  privacyNote,
  steps = [],
  title,
}: TransactionalEmailLayout) {
  const isEnglish = locale === "en";
  const stepsTitle = isEnglish ? "What happens next" : "Co dalej";
  const defaultFooter = isEnglish
    ? "ArchiCompass helps turn project decisions into a clear brief and the right professional connection."
    : "ArchiCompass pomaga zamieniać decyzje projektowe w jasny brief i kontakt z właściwym specjalistą.";
  const transactionalNote = isEnglish
    ? "This is a transactional notification connected with your ArchiCompass account or activity."
    : "To jest powiadomienie transakcyjne związane z Twoim kontem lub aktywnością w ArchiCompass.";
  const brandUrl = `${emailSiteUrl()}/brand/archicompass-logo-email.png`;
  const homeUrl = emailSiteUrl();

  return `<!doctype html>
<html lang="${locale}">
  <head>
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  </head>
  <body style="margin:0;padding:0;background:#f8f6fc;color:#25183c;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;color:#f8f6fc;font-size:1px;line-height:1px;">
      ${escapeEmailHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;background:#f8f6fc;">
      <tr>
        <td align="center" style="padding:32px 16px 40px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border-collapse:separate;border-spacing:0;background:#ffffff;border:1px solid #e7ddf5;border-radius:24px;overflow:hidden;">
            <tr>
              <td style="height:6px;background:#6d28d9;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:30px 32px 12px;">
                <a href="${homeUrl}" style="display:inline-block;text-decoration:none;">
                  <img src="${brandUrl}" width="184" alt="ArchiCompass" style="display:block;width:184px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 32px 0;">
                <span style="display:inline-block;border:1px solid #ddccff;border-radius:999px;background:#f4edff;padding:7px 11px;color:#6325c6;font-size:11px;font-weight:700;letter-spacing:1px;line-height:1;text-transform:uppercase;">
                  <span style="font-size:13px;vertical-align:-1px;">✦</span>&nbsp; ${escapeEmailHtml(eyebrow)}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0;">
                <h1 style="margin:0;color:#25183c;font-size:30px;font-weight:700;letter-spacing:-0.5px;line-height:1.22;">${escapeEmailHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 0;color:#392951;font-size:16px;line-height:1.65;">
                <p style="margin:0 0 10px;font-weight:700;">${escapeEmailHtml(greeting)},</p>
                <p style="margin:0;color:#665a78;">${escapeEmailHtml(intro)}</p>
              </td>
            </tr>
            ${bodyHtml ? `<tr><td style="padding:22px 32px 0;">${bodyHtml}</td></tr>` : ""}
            ${
              steps.length
                ? `<tr>
                    <td style="padding:22px 32px 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e5d7fb;border-radius:16px;background:#faf7ff;">
                        <tr>
                          <td style="padding:18px 18px 4px;color:#5c20c2;font-size:13px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;">${stepsTitle}</td>
                        </tr>
                        ${steps
                          .map(
                            (step, index) => `<tr>
                              <td style="padding:${index === steps.length - 1 ? "10px 18px 20px" : "10px 18px"};">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                                  <tr>
                                    <td valign="top" style="padding:1px 11px 0 0;">
                                      <span style="display:inline-block;width:20px;height:20px;border-radius:10px;background:#6d28d9;color:#ffffff;font-size:11px;font-weight:700;line-height:20px;text-align:center;">${index + 1}</span>
                                    </td>
                                    <td style="color:#4b3b60;font-size:14px;line-height:1.5;">
                                      <strong style="color:#2c1f42;">${escapeEmailHtml(step.title)}</strong><br />
                                      <span>${escapeEmailHtml(step.body)}</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>`
                          )
                          .join("")}
                      </table>
                    </td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding:26px 32px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td style="border-radius:12px;background:#6d28d9;">
                      <a href="${ctaHref}" style="display:inline-block;border:1px solid #6d28d9;border-radius:12px;color:#ffffff;padding:14px 20px;text-decoration:none;font-size:16px;font-weight:700;line-height:1.2;">${escapeEmailHtml(ctaLabel)}&nbsp; →</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            ${
              privacyNote
                ? `<tr><td style="padding:18px 32px 0;color:#756a85;font-size:13px;line-height:1.55;">${escapeEmailHtml(privacyNote)}</td></tr>`
                : ""
            }
            <tr>
              <td style="padding:26px 32px 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:collapse;border-top:1px solid #eee8f6;">
                  <tr>
                    <td style="padding-top:20px;color:#867b94;font-size:12px;line-height:1.55;">
                      <p style="margin:0 0 7px;">${escapeEmailHtml(footerNote || defaultFooter)}</p>
                      <p style="margin:0;">${escapeEmailHtml(transactionalNote)} <a href="${homeUrl}" style="color:#6325c6;font-weight:700;text-decoration:none;">archicompass.pl</a> · <a href="mailto:contact@archicompass.pl" style="color:#6325c6;font-weight:700;text-decoration:none;">contact@archicompass.pl</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
