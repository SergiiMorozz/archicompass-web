import { siteLocale, type SiteLocale } from "@/lib/site-locale";
import type { BillingPlanCode, BillingStatus } from "@/lib/billing";

type PlanCopy = {
  title: string;
  description: string;
  monthly: string;
  yearly: string;
  yearlyNote: string;
  features: string[];
};

export type BillingCopy = {
  pricing: {
    metadata: { title: string; description: string };
    eyebrow: string;
    title: string;
    intro: string;
    founderTitle: string;
    founderBody: string;
    clientNote: string;
    monthlyLabel: string;
    yearlyLabel: string;
    plans: { designer: PlanCopy; studio: PlanCopy };
    vatNote: string;
    getStarted: string;
    signIn: string;
    faqTitle: string;
    faq: Array<{ question: string; answer: string }>;
  };
  plans: Record<BillingPlanCode, { label: string; interval: string }>;
  statuses: Record<BillingStatus, string>;
  studioNav: string;
  accountCard: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
  };
  billing: {
    metadataTitle: string;
    eyebrow: string;
    title: string;
    intro: string;
    founderBadge: string;
    founderBody: string;
    accessActive: string;
    accessRestricted: string;
    nextPayment: string;
    trialEnds: string;
    plan: string;
    managePayment: string;
    activatePlan: string;
    paymentUnavailable: string;
    paymentUnavailableBody: string;
    invoiceTitle: string;
    invoiceBody: string;
    noInvoices: string;
    openInvoice: string;
    downloadPdf: string;
    billingProfileTitle: string;
    billingProfileBody: string;
    billingEmail: string;
    legalEntityName: string;
    taxId: string;
    addressLine: string;
    postalCode: string;
    city: string;
    country: string;
    saveBillingProfile: string;
    saved: string;
    saveError: string;
    selectPlan: string;
    month: string;
    year: string;
    net: string;
    currentPlan: string;
    createInvoiceNote: string;
    notAvailable: string;
    includedWithStudio: string;
    includedWithStudioBody: (studioName: string) => string;
  };
  checkout: {
    loading: string;
    unavailable: string;
    error: string;
  };
  admin: {
    navLabel: string;
    eyebrow: string;
    title: string;
    intro: string;
    summary: {
      trialing: string;
      active: string;
      paymentIssue: string;
      restricted: string;
    };
    filters: { all: string; status: string; search: string; searchPlaceholder: string; apply: string };
    columns: { account: string; subject: string; status: string; access: string; plan: string; renewal: string; action: string };
    noAccounts: string;
    trial: string;
    status: string;
    accessGranted: string;
    accessRestricted: string;
    noPlan: string;
    noDate: string;
    extendTrial: string;
    restoreAccess: string;
    restrict: string;
    manualReason: string;
    updated: string;
    error: string;
  };
};

const copy: Record<SiteLocale, BillingCopy> = {
  pl: {
    pricing: {
      metadata: {
        title: "Cennik dla projektantów i pracowni",
        description: "Przejrzyste plany ArchiCompass dla projektantów wnętrz i pracowni projektowych.",
      },
      eyebrow: "Dla profesjonalistów",
      title: "Rozwijaj profil, portfolio i relacje z klientami.",
      intro: "ArchiCompass pozostaje bezpłatny dla klientów. Projektanci i pracownie otrzymują pełny dostęp przez pierwsze trzy miesiące, a następnie wybierają plan, aby zachować aktywny profil, portfolio i możliwość otrzymywania zapytań.",
      founderTitle: "Pierwsze 3 miesiące bezpłatnie",
      founderBody: "Nie prosimy o kartę przy rejestracji. W trakcie bezpłatnego okresu możesz przygotować profil, opublikować portfolio i sprawdzić dopasowania z briefów.",
      clientNote: "Konto klienta, AI Project Compass, zapisywanie inspiracji i kontakt z profesjonalistami pozostają bezpłatne.",
      monthlyLabel: "Miesięcznie",
      yearlyLabel: "Rocznie",
      plans: {
        designer: {
          title: "Projektant",
          description: "Dla niezależnych projektantów i architektów wnętrz.",
          monthly: "89 zł / miesiąc",
          yearly: "599 zł / rok",
          yearlyNote: "Oszczędzasz przy rozliczeniu rocznym.",
          features: ["Profil w Katalogu Projektantów", "Portfolio i projekty", "Briefy, wiadomości i statystyki", "Ocena w Google i linki do mediów społecznościowych"],
        },
        studio: {
          title: "Pracownia",
          description: "Dla zespołów działających pod wspólnym profilem pracowni.",
          monthly: "199 zł / miesiąc",
          yearly: "1 099 zł / rok",
          yearlyNote: "Lepsza stawka przy rozliczeniu rocznym.",
          features: ["Wspólny profil pracowni i portfolio", "Zespół projektantów i wspólna skrzynka", "Osobiste profile aktywnych członków zespołu bez dodatkowej opłaty", "Statystyki i rozliczenia dla firmy"],
        },
      },
      vatNote: "Wszystkie ceny są cenami netto. VAT naliczamy zgodnie z obowiązującą stawką. Firmy mogą podać dane do faktury oraz NIP lub numer VAT UE.",
      getStarted: "Załóż konto profesjonalisty",
      signIn: "Zaloguj się do rozliczeń",
      faqTitle: "Jak działają rozliczenia",
      faq: [
        { question: "Kiedy zaczyna się płatność?", answer: "Po 90 dniach bezpłatnego dostępu. Przed końcem okresu wybierzesz plan miesięczny lub roczny." },
        { question: "Co dzieje się bez opłaty?", answer: "Profil profesjonalisty, portfolio i odbiór nowych zapytań mogą zostać ograniczone do czasu aktywacji planu." },
        { question: "Czy otrzymam fakturę VAT?", answer: "Tak. W panelu rozliczeń podasz dane firmy oraz NIP / VAT UE. Po uruchomieniu płatności faktury będą dostępne w tym samym miejscu." },
        { question: "Czy członkowie pracowni płacą za własne profile?", answer: "Nie. Aktywna subskrypcja pracowni obejmuje osobiste profile wszystkich aktywnych członków jej zespołu." },
      ],
    },
    plans: {
      designer_monthly: { label: "Projektant", interval: "miesięcznie" },
      designer_yearly: { label: "Projektant", interval: "rocznie" },
      studio_monthly: { label: "Pracownia", interval: "miesięcznie" },
      studio_yearly: { label: "Pracownia", interval: "rocznie" },
    },
    statuses: { trialing: "Okres bezpłatny", active: "Aktywna", past_due: "Wymaga płatności", trial_expired: "Okres bezpłatny zakończony", cancelled: "Anulowana", suspended: "Ograniczona" },
    studioNav: "Rozliczenia",
    accountCard: { eyebrow: "Plan ArchiCompass", title: "Dostęp profesjonalny", body: "Sprawdź okres bezpłatny, wybierz plan i uzupełnij dane do faktury VAT.", cta: "Otwórz rozliczenia" },
    billing: {
      metadataTitle: "Rozliczenia", eyebrow: "Rozliczenia profesjonalne", title: "Plan, płatności i faktury", intro: "Zarządzaj planem ArchiCompass, danymi firmy oraz fakturami za subskrypcję.", founderBadge: "Pierwsze 3 miesiące bezpłatnie", founderBody: "Twój profil profesjonalisty pozostaje aktywny w okresie bezpłatnym. Przed jego końcem wybierzesz plan, aby zachować widoczność, portfolio i możliwość otrzymywania zapytań.", accessActive: "Dostęp aktywny", accessRestricted: "Dostęp ograniczony", nextPayment: "Kolejne odnowienie", trialEnds: "Bezpłatny dostęp do", plan: "Plan", managePayment: "Zarządzaj płatnością", activatePlan: "Aktywuj plan", paymentUnavailable: "Płatności online są przygotowane", paymentUnavailableBody: "Twoje rozliczenia i dane do faktury są już zapisane. Aktywacja płatności Stripe nastąpi przed końcem bezpłatnego okresu.", invoiceTitle: "Faktury", invoiceBody: "Po aktywacji płatności faktury i dokumenty VAT będą dostępne tutaj.", noInvoices: "Nie ma jeszcze faktur.", openInvoice: "Otwórz fakturę", downloadPdf: "Pobierz PDF", billingProfileTitle: "Dane do faktury", billingProfileBody: "Jeżeli kupujesz jako firma, podaj pełną nazwę, NIP / VAT UE i adres. Dane będą przekazane do systemu płatności podczas zakupu.", billingEmail: "E-mail do rozliczeń", legalEntityName: "Nazwa firmy", taxId: "NIP / VAT UE", addressLine: "Adres", postalCode: "Kod pocztowy", city: "Miasto", country: "Kraj", saveBillingProfile: "Zapisz dane do faktury", saved: "Dane do faktury zostały zapisane.", saveError: "Nie udało się zapisać danych. Spróbuj ponownie.", selectPlan: "Wybierz plan", month: "miesiąc", year: "rok", net: "netto + VAT", currentPlan: "Aktualny plan", createInvoiceNote: "Faktura VAT jest generowana przez system płatności po udanej opłacie. Przed płatnością wpisz dane firmy, jeśli są potrzebne.", notAvailable: "Brak danych", includedWithStudio: "Profil objęty planem pracowni", includedWithStudioBody: (studioName) => `Twój osobisty profil jest bez dodatkowej opłaty objęty aktywną subskrypcją pracowni ${studioName}. Nie wybieraj osobnego planu, dopóki pozostajesz aktywnym członkiem zespołu.` },
    checkout: { loading: "Otwieranie bezpiecznej płatności…", unavailable: "Płatności online nie są jeszcze aktywne.", error: "Nie udało się rozpocząć płatności. Spróbuj ponownie lub skontaktuj się z nami." },
    admin: {
      navLabel: "Rozliczenia", eyebrow: "Finanse", title: "Subskrypcje i płatności", intro: "Monitoruj bezpłatne okresy, aktywne plany, płatności wymagające uwagi i ręcznie ograniczaj lub przywracaj dostęp profesjonalny.", summary: { trialing: "Okres bezpłatny", active: "Aktywne subskrypcje", paymentIssue: "Wymagają uwagi", restricted: "Ograniczone" }, filters: { all: "Wszystkie", status: "Status", search: "Szukaj", searchPlaceholder: "Nazwa, e-mail lub NIP", apply: "Zastosuj" }, columns: { account: "Konto", subject: "Profil", status: "Status", access: "Dostęp", plan: "Plan", renewal: "Termin", action: "Działanie" }, noAccounts: "Nie znaleziono kont rozliczeniowych.", trial: "Trial", status: "Status", accessGranted: "Aktywny", accessRestricted: "Ograniczony", noPlan: "Plan nie wybrany", noDate: "Brak terminu", extendTrial: "Przedłuż trial o 30 dni", restoreAccess: "Przywróć dostęp na 30 dni", restrict: "Ogranicz dostęp", manualReason: "Notatka dla zespołu (opcjonalnie)", updated: "Dostęp rozliczeniowy został zaktualizowany.", error: "Nie udało się zaktualizować dostępu rozliczeniowego." },
  },
  en: {
    pricing: {
      metadata: { title: "Pricing for designers and studios", description: "Clear ArchiCompass plans for interior designers and design studios." },
      eyebrow: "For professionals", title: "Grow your profile, portfolio, and client relationships.", intro: "ArchiCompass remains free for clients. Designers and studios receive full access for their first 3 months, then choose a plan to keep their profile, portfolio, and enquiries active.", founderTitle: "Your first 3 months are free", founderBody: "No card is required at registration. During your complimentary period, you can complete your profile, publish your portfolio, and test brief matching.", clientNote: "Client accounts, AI Project Compass, saved inspiration, and contacting professionals remain free.", monthlyLabel: "Monthly", yearlyLabel: "Yearly",
      plans: {
        designer: { title: "Designer", description: "For independent interior designers and architects.", monthly: "PLN 89 / month", yearly: "PLN 599 / year", yearlyNote: "Save with annual billing.", features: ["Profile in the Designer Directory", "Portfolio and projects", "Briefs, messages, and analytics", "Google Business rating and social links"] },
        studio: { title: "Studio", description: "For teams operating under a shared studio profile.", monthly: "PLN 199 / month", yearly: "PLN 1,099 / year", yearlyNote: "A better rate with annual billing.", features: ["Shared studio profile and portfolio", "Designer team and shared inbox", "Personal profiles for active team members at no extra cost", "Analytics and company billing"] },
      },
      vatNote: "All prices are net prices. VAT is charged at the applicable rate. Companies can provide invoice details and a NIP / EU VAT ID.", getStarted: "Create a professional account", signIn: "Sign in to billing", faqTitle: "How billing works", faq: [
        { question: "When does payment start?", answer: "After 90 days of complimentary access. Before the period ends, you will choose a monthly or annual plan." },
        { question: "What happens if I do not pay?", answer: "The professional profile, portfolio, and new enquiry reception may be restricted until a plan is activated." },
        { question: "Will I receive a VAT invoice?", answer: "Yes. In Billing, enter your company details and NIP / EU VAT ID. Once payments are enabled, invoices will be available there." },
        { question: "Do studio members pay for their personal profiles?", answer: "No. An active studio subscription includes the personal profiles of all active studio team members." },
      ],
    },
    plans: { designer_monthly: { label: "Designer", interval: "monthly" }, designer_yearly: { label: "Designer", interval: "yearly" }, studio_monthly: { label: "Studio", interval: "monthly" }, studio_yearly: { label: "Studio", interval: "yearly" } },
    statuses: { trialing: "Complimentary period", active: "Active", past_due: "Payment required", trial_expired: "Complimentary period ended", cancelled: "Cancelled", suspended: "Restricted" },
    studioNav: "Billing",
    accountCard: { eyebrow: "ArchiCompass plan", title: "Professional access", body: "Check your complimentary period, choose a plan, and add your VAT invoice details.", cta: "Open billing" },
    billing: { metadataTitle: "Billing", eyebrow: "Professional billing", title: "Plan, payments, and invoices", intro: "Manage your ArchiCompass plan, company details, and subscription invoices.", founderBadge: "First 3 months free", founderBody: "Your professional profile remains active during the complimentary period. Before it ends, choose a plan to keep your visibility, portfolio, and ability to receive enquiries.", accessActive: "Access active", accessRestricted: "Access restricted", nextPayment: "Next renewal", trialEnds: "Complimentary access until", plan: "Plan", managePayment: "Manage payment", activatePlan: "Activate plan", paymentUnavailable: "Online payments are prepared", paymentUnavailableBody: "Your billing and invoice details are already saved. Stripe payment activation will be available before the complimentary period ends.", invoiceTitle: "Invoices", invoiceBody: "After payment activation, invoices and VAT documents will be available here.", noInvoices: "There are no invoices yet.", openInvoice: "Open invoice", downloadPdf: "Download PDF", billingProfileTitle: "Invoice details", billingProfileBody: "If you are purchasing as a company, provide the full legal name, NIP / EU VAT ID, and address. This information is sent to the payment system when you purchase.", billingEmail: "Billing email", legalEntityName: "Company legal name", taxId: "NIP / EU VAT ID", addressLine: "Address", postalCode: "Postcode", city: "City", country: "Country", saveBillingProfile: "Save invoice details", saved: "Invoice details have been saved.", saveError: "We could not save your details. Try again.", selectPlan: "Choose a plan", month: "month", year: "year", net: "net + VAT", currentPlan: "Current plan", createInvoiceNote: "A VAT invoice is generated by the payment system after a successful payment. Enter your company details before payment if needed.", notAvailable: "Not available", includedWithStudio: "Profile included in the studio plan", includedWithStudioBody: (studioName) => `Your personal profile is included at no additional cost in the active subscription of ${studioName}. Do not choose a separate plan while you remain an active team member.` },
    checkout: { loading: "Opening secure checkout…", unavailable: "Online payments are not active yet.", error: "We could not start checkout. Try again or contact us." },
    admin: { navLabel: "Billing", eyebrow: "Finance", title: "Subscriptions and payments", intro: "Monitor complimentary periods, active plans, payments requiring attention, and manually restrict or restore professional access.", summary: { trialing: "Complimentary period", active: "Active subscriptions", paymentIssue: "Need attention", restricted: "Restricted" }, filters: { all: "All", status: "Status", search: "Search", searchPlaceholder: "Name, email, or tax ID", apply: "Apply" }, columns: { account: "Account", subject: "Profile", status: "Status", access: "Access", plan: "Plan", renewal: "Date", action: "Action" }, noAccounts: "No billing accounts found.", trial: "Trial", status: "Status", accessGranted: "Active", accessRestricted: "Restricted", noPlan: "No plan selected", noDate: "No date", extendTrial: "Extend trial by 30 days", restoreAccess: "Restore access for 30 days", restrict: "Restrict access", manualReason: "Team note (optional)", updated: "Billing access was updated.", error: "We could not update billing access." },
  },
};

export function getBillingCopy(locale: SiteLocale = siteLocale) {
  return copy[locale];
}
