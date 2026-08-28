import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type ContentGuidelinesCopy = {
  metadata: { title: string; description: string };
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  sections: Array<{ title: string; paragraphs: string[]; bullets?: string[] }>;
  relatedTitle: string;
  relatedLinks: { href: string; label: string }[];
  contactLabel: string;
  companyLine: string;
};

const companyLine = "SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska";

const copy: Record<SiteLocale, ContentGuidelinesCopy> = {
  pl: {
    metadata: { title: "Zasady publikacji treści", description: "Zasady publikowania profili, portfolio, opinii i innych treści w ArchiCompass." },
    eyebrow: "Zasady społeczności", title: "Zasady publikacji treści", effectiveDate: "Obowiązuje od: 28 sierpnia 2026 r.",
    intro: "Te krótkie zasady pomagają utrzymać ArchiCompass jako wiarygodne miejsce dla klientów, projektantów i pracowni. Uzupełniają Regulamin, ale go nie zastępują.",
    sections: [
      { title: "Publikuj tylko materiały, do których masz prawa", paragraphs: ["Dodawaj wyłącznie zdjęcia, wizualizacje, teksty i dane, których możesz używać, przechowywać, analizować i — gdy wybierzesz publikację — udostępniać publicznie. Jeżeli materiał powstał dla klienta lub z udziałem innych twórców, zadbaj o wymagane zgody."], bullets: ["Nie przedstawiaj cudzej pracy jako własnej.", "Nie przesyłaj materiałów objętych poufnością ani danych osób trzecich bez odpowiedniej podstawy."] },
      { title: "Dbaj o prawdziwość profilu i portfolio", paragraphs: ["Opis usług, doświadczenia, kwalifikacji, cen, dostępności i autorstwa powinien być rzetelny oraz aktualny. Wyniki AI są propozycjami — sprawdź je przed publikacją."], bullets: ["Nie podszywaj się pod osobę, pracownię lub markę.", "Nie używaj fałszywych opinii ani nie wprowadzaj w błąd co do kwalifikacji, realizacji lub współpracy."] },
      { title: "Nie publikuj treści bezprawnych ani szkodliwych", paragraphs: ["Nie wolno dodawać spamu, treści naruszających prawo lub prawa osób trzecich, złośliwych plików, treści nękających, dyskryminujących albo służących oszustwu."], bullets: ["Nie używaj danych z ArchiCompass do masowego marketingu lub nękania.", "Nie obchodź ograniczeń technicznych, zasad bezpieczeństwa ani limitów platformy."] },
      { title: "Co może zrobić ArchiCompass", paragraphs: ["Możemy poprosić o wyjaśnienie, ograniczyć widoczność, ukryć lub usunąć treść, a w uzasadnionych przypadkach ograniczyć albo zawiesić Konto. Działamy proporcjonalnie do ryzyka, dostępnych informacji i obowiązującego prawa."], bullets: ["Możesz zgłosić publiczny profil lub projekt przez link „Zgłoś”.", "Zgłoszenia dotyczące bezpieczeństwa wyślij na admin@archicompass.pl, a pytania ogólne na contact@archicompass.pl."] },
    ],
    relatedTitle: "Powiązane informacje", relatedLinks: [{ href: "/terms", label: "Regulamin" }, { href: "/privacy", label: "Polityka prywatności" }, { href: "/ai-transparency", label: "AI i przejrzystość" }], contactLabel: "Kontakt z ArchiCompass", companyLine,
  },
  en: {
    metadata: { title: "Content Guidelines", description: "Rules for publishing profiles, portfolios, reviews, and other content on ArchiCompass." },
    eyebrow: "Community rules", title: "Content Guidelines", effectiveDate: "Effective from: 28 August 2026",
    intro: "These short rules help keep ArchiCompass a trustworthy place for clients, designers, and studios. They supplement, but do not replace, the Terms and Conditions.",
    sections: [
      { title: "Publish only material you have the right to use", paragraphs: ["Add only photos, visualisations, text, and data that you may use, store, analyse and — where you choose publication — make public. If material was created for a client or with other creators, make sure you have the necessary permissions."], bullets: ["Do not present someone else’s work as your own.", "Do not submit confidential material or third-party personal data without an appropriate basis."] },
      { title: "Keep profiles and portfolios accurate", paragraphs: ["Your services, experience, qualifications, prices, availability, and authorship claims should be accurate and current. AI results are suggestions — review them before publishing."], bullets: ["Do not impersonate a person, studio, or brand.", "Do not use fake reviews or mislead people about qualifications, work, or collaboration."] },
      { title: "Do not publish unlawful or harmful content", paragraphs: ["Do not add spam, content that infringes law or third-party rights, malicious files, harassment, discriminatory material, or content intended to deceive."], bullets: ["Do not use ArchiCompass data for mass marketing or harassment.", "Do not bypass technical restrictions, security controls, or platform limits."] },
      { title: "What ArchiCompass may do", paragraphs: ["We may ask for clarification, limit visibility, hide or remove content and, where justified, limit or suspend an Account. We act proportionately to the risk, available information, and applicable law."], bullets: ["You can report a public profile or project using the “Report” link.", "Send security reports to admin@archicompass.pl and general questions to contact@archicompass.pl."] },
    ],
    relatedTitle: "Related information", relatedLinks: [{ href: "/terms", label: "Terms and Conditions" }, { href: "/privacy", label: "Privacy Policy" }, { href: "/ai-transparency", label: "AI and transparency" }], contactLabel: "Contact ArchiCompass", companyLine,
  },
};

export function getContentGuidelinesCopy(locale: SiteLocale = siteLocale) {
  return copy[locale];
}
