import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type ReportTargetType = "profile" | "project";

const copy: Record<SiteLocale, {
  action: { profile: string; project: string };
  title: { profile: string; project: string };
  intro: string;
  category: string;
  categories: Array<{ value: string; label: string }>;
  details: string;
  detailsHint: string;
  submit: string;
  sending: string;
  success: string;
  error: string;
  rateLimited: string;
  close: string;
}> = {
  pl: {
    action: { profile: "Zgłoś profil lub treść", project: "Zgłoś tę treść" },
    title: { profile: "Zgłoś profil lub treść", project: "Zgłoś projekt portfolio" },
    intro: "Zgłoszenie trafia wyłącznie do zespołu ArchiCompass. Nie podawaj haseł, danych kart ani innych poufnych informacji.",
    category: "Powód zgłoszenia",
    categories: [
      { value: "copyright", label: "Naruszenie praw autorskich" },
      { value: "impersonation", label: "Podszywanie się pod inną osobę lub firmę" },
      { value: "misleading", label: "Wprowadzająca w błąd informacja lub autorstwo" },
      { value: "privacy", label: "Problem z prywatnością lub wizerunkiem" },
      { value: "illegal", label: "Treść bezprawna" },
      { value: "spam", label: "Spam lub nadużycie" },
      { value: "other", label: "Inny powód" },
    ],
    details: "Krótko opisz problem (opcjonalnie)",
    detailsHint: "Maksymalnie 2000 znaków.",
    submit: "Wyślij zgłoszenie",
    sending: "Wysyłanie…",
    success: "Dziękujemy. Zgłoszenie zostało przekazane do weryfikacji.",
    error: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie później lub napisz na contact@archicompass.pl.",
    rateLimited: "Osiągnięto limit zgłoszeń z tego połączenia. Spróbuj ponownie później lub napisz na contact@archicompass.pl.",
    close: "Zamknij",
  },
  en: {
    action: { profile: "Report profile or content", project: "Report this content" },
    title: { profile: "Report profile or content", project: "Report portfolio project" },
    intro: "Your report goes only to the ArchiCompass team. Do not include passwords, card details, or other confidential information.",
    category: "Reason for report",
    categories: [
      { value: "copyright", label: "Copyright infringement" },
      { value: "impersonation", label: "Impersonation of a person or business" },
      { value: "misleading", label: "Misleading information or authorship" },
      { value: "privacy", label: "Privacy or image concern" },
      { value: "illegal", label: "Illegal content" },
      { value: "spam", label: "Spam or abuse" },
      { value: "other", label: "Other reason" },
    ],
    details: "Briefly describe the issue (optional)",
    detailsHint: "Maximum 2,000 characters.",
    submit: "Send report",
    sending: "Sending…",
    success: "Thank you. Your report has been sent for review.",
    error: "We could not send the report. Try again later or contact contact@archicompass.pl.",
    rateLimited: "The report limit for this connection has been reached. Try again later or contact contact@archicompass.pl.",
    close: "Close",
  },
};

export function getContentReportCopy(locale: SiteLocale = siteLocale) {
  return copy[locale];
}
