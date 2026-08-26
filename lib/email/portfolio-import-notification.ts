import { sendTransactionalEmail, type TransactionalEmailResult } from "@/lib/email/send-transactional-email";

type PortfolioImportEmailInput = {
  jobId: string;
  locale: "pl" | "en";
  recipientEmail: string;
  recipientName: string | null;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>\"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;",
    };
    return entities[character];
  });
}

export function sendPortfolioImportReadyEmail({
  jobId,
  locale,
  recipientEmail,
  recipientName,
}: PortfolioImportEmailInput): Promise<TransactionalEmailResult> {
  const isEnglish = locale === "en";
  const reviewUrl = `https://archicompass.pl${isEnglish ? "/en" : ""}/studio/portfolio-autopilot/${jobId}/review`;
  const greeting = recipientName ? (isEnglish ? `Hello, ${recipientName}` : `Dzień dobry, ${recipientName}`) : isEnglish ? "Hello" : "Dzień dobry";
  const subject = isEnglish ? "Your portfolio is ready to review" : "Twoje portfolio jest gotowe do przeglądu";
  const heading = isEnglish ? "Your portfolio import is ready" : "Twój import portfolio jest gotowy";
  const body = isEnglish
    ? "We have finished preparing your imported portfolio. Review the proposed projects and profile suggestions before publishing anything publicly."
    : "Zakończyliśmy przygotowywanie zaimportowanego portfolio. Przejrzyj proponowane projekty i sugestie dla profilu, zanim opublikujesz cokolwiek publicznie.";
  const cta = isEnglish ? "Review portfolio" : "Przejdź do przeglądu";

  return sendTransactionalEmail({
    subject,
    text: `${greeting},\n\n${body}\n\n${cta}: ${reviewUrl}\n\nArchiCompass`,
    to: recipientEmail,
    html: `
      <div style="margin:0;background:#f8f6fc;padding:32px 16px;color:#27193b;font-family:Arial,sans-serif">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e8e0f2;border-radius:20px;padding:32px">
          <p style="margin:0 0 18px;color:#6d28d9;font-size:14px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">ArchiCompass</p>
          <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#27193b">${escapeHtml(heading)}</h1>
          <p style="margin:0 0 12px;font-size:16px;line-height:1.6">${escapeHtml(greeting)},</p>
          <p style="margin:0 0 28px;font-size:16px;line-height:1.6;color:#5f5670">${escapeHtml(body)}</p>
          <a href="${reviewUrl}" style="display:inline-block;border-radius:12px;background:#6d28d9;color:#ffffff;padding:14px 20px;font-size:16px;font-weight:700;text-decoration:none">${escapeHtml(cta)}</a>
        </div>
      </div>
    `,
  });
}
