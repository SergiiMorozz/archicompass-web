import { escapeEmailHtml, transactionalEmailHtml } from "@/lib/email/transactional-layout";
import { sendTransactionalEmail, type TransactionalEmailResult } from "@/lib/email/send-transactional-email";

type PortfolioImportEmailInput = {
  jobId: string;
  locale: "pl" | "en";
  recipientEmail: string;
  recipientName: string | null;
};

export function sendPortfolioImportReadyEmail({
  jobId,
  locale,
  recipientEmail,
  recipientName,
}: PortfolioImportEmailInput): Promise<TransactionalEmailResult> {
  const isEnglish = locale === "en";
  const reviewUrl = `https://archicompass.pl${isEnglish ? "/en" : ""}/studio/portfolio-assistant/${jobId}/review`;
  const greeting = recipientName ? (isEnglish ? `Hello, ${recipientName}` : `Dzień dobry, ${recipientName}`) : isEnglish ? "Hello" : "Dzień dobry";
  const subject = isEnglish ? "Your portfolio is ready to review" : "Twoje portfolio jest gotowe do przeglądu";
  const heading = isEnglish ? "Your portfolio import is ready" : "Twój import portfolio jest gotowy";
  const body = isEnglish
    ? "We have finished preparing your imported portfolio. Review the proposed projects and profile suggestions before publishing anything publicly."
    : "Zakończyliśmy przygotowywanie zaimportowanego portfolio. Przejrzyj proponowane projekty i sugestie dla profilu, zanim opublikujesz cokolwiek publicznie.";
  const accountNote = isEnglish
    ? "For privacy, open the review after signing in to the same ArchiCompass account that started the import."
    : "Dla ochrony prywatności otwórz przegląd po zalogowaniu na to samo konto ArchiCompass, z którego uruchomiono import.";
  const cta = isEnglish ? "Review portfolio" : "Przejdź do przeglądu";
  const steps = isEnglish
    ? [
        { title: "Review the proposals", body: "Check the imported projects, photos and suggested descriptions." },
        { title: "Complete your profile", body: "Confirm the contact details, services and profile suggestions that represent your work." },
        { title: "Publish only what you choose", body: "Nothing becomes public until you approve it." },
      ]
    : [
        { title: "Przejrzyj propozycje", body: "Sprawdź zaimportowane projekty, zdjęcia i sugerowane opisy." },
        { title: "Uzupełnij profil", body: "Potwierdź dane kontaktowe, usługi i sugestie, które dobrze pokazują Twoją pracę." },
        { title: "Opublikuj tylko to, co wybierzesz", body: "Nic nie stanie się publiczne bez Twojej akceptacji." },
      ];

  return sendTransactionalEmail({
    subject,
    text: `${greeting},\n\n${body}\n\n${accountNote}\n\n${cta}: ${reviewUrl}\n\nArchiCompass`,
    to: recipientEmail,
    html: transactionalEmailHtml({
      bodyHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;border-collapse:separate;border-spacing:0;border:1px solid #e5d7fb;border-radius:16px;background:#faf7ff;"><tr><td style="padding:16px 18px;color:#4b3b60;font-size:14px;line-height:1.55;"><strong style="display:block;margin-bottom:4px;color:#5c20c2;">${isEnglish ? "Ready for your decision" : "Gotowe do Twojej decyzji"}</strong>${escapeEmailHtml(isEnglish ? "The import is complete. Take a moment to check every proposed item before you share it with clients." : "Import został zakończony. Poświęć chwilę na sprawdzenie każdej propozycji, zanim pokażesz ją klientom.")}</td></tr></table>`,
      ctaHref: reviewUrl,
      ctaLabel: cta,
      eyebrow: isEnglish ? "AI Portfolio Assistant" : "Asystent portfolio AI",
      footerNote: isEnglish
        ? "A clearer portfolio helps the right clients understand your work before the first conversation."
        : "Czytelne portfolio pomaga właściwym klientom zrozumieć Twoją pracę jeszcze przed pierwszą rozmową.",
      greeting,
      intro: body,
      locale,
      preheader: subject,
      privacyNote: accountNote,
      steps,
      title: heading,
    }),
  });
}
