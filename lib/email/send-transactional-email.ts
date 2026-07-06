import nodemailer from "nodemailer";

type EmailStatus = "not_configured" | "sent" | "failed";

export type TransactionalEmailResult = {
  error: string | null;
  status: EmailStatus;
};

type TransactionalEmail = {
  html: string;
  replyTo?: string | null;
  subject: string;
  text: string;
  to: string;
};

let smtpTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function shortError(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

function sender() {
  return (
    process.env.INQUIRY_EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    (process.env.SMTP_USER ? `ArchiCompass <${process.env.SMTP_USER}>` : "")
  );
}

function smtpSettings() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) return null;

  const port = Number(process.env.SMTP_PORT || "465");
  return {
    host,
    pass,
    port: Number.isFinite(port) ? port : 465,
    secure: process.env.SMTP_SECURE !== "false",
    user,
  };
}

export async function sendTransactionalEmail(
  email: TransactionalEmail
): Promise<TransactionalEmailResult> {
  const from = sender();
  const smtp = smtpSettings();

  if (smtp && from) {
    try {
      smtpTransport ??= nodemailer.createTransport({
        auth: { pass: smtp.pass, user: smtp.user },
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure,
      });

      await smtpTransport.sendMail({
        from,
        html: email.html,
        replyTo: email.replyTo || process.env.INQUIRY_EMAIL_REPLY_TO || "contact@archicompass.pl",
        subject: email.subject,
        text: email.text,
        to: email.to,
      });

      return { error: null, status: "sent" };
    } catch (error) {
      return {
        error: error instanceof Error ? shortError(error.message) : "SMTP delivery failed.",
        status: "failed",
      };
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !from) return { error: null, status: "not_configured" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      body: JSON.stringify({
        from,
        html: email.html,
        reply_to: email.replyTo || process.env.INQUIRY_EMAIL_REPLY_TO || undefined,
        subject: email.subject,
        text: email.text,
        to: email.to,
      }),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return {
        error: `Resend ${response.status}: ${shortError(await response.text())}`,
        status: "failed",
      };
    }

    return { error: null, status: "sent" };
  } catch (error) {
    return {
      error: error instanceof Error ? shortError(error.message) : "Email delivery failed.",
      status: "failed",
    };
  }
}
