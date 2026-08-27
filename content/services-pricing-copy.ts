import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type ServicesPricingCopy = {
  footerLabel: string;
  metadata: { title: string; description: string };
  hero: { eyebrow: string; title: string; body: string };
  client: { label: string; title: string; body: string; price: string; features: string[] };
  servicesTitle: string;
  servicesBody: string;
  studioCoverage: { title: string; body: string };
  faq: { badge: string; title: string; question: string; answer: string };
  priceNote: string;
  primaryCta: string;
  pricingCta: string;
};

const copy: Record<SiteLocale, ServicesPricingCopy> = {
  pl: {
    footerLabel: "Ceny i usługi",
    metadata: {
      title: "Ceny i usługi ArchiCompass",
      description: "Poznaj bezpłatne funkcje dla klientów oraz plany, zakres usług i ceny dla projektantów wnętrz i pracowni ArchiCompass.",
    },
    hero: {
      eyebrow: "Jedna platforma dla świadomych decyzji projektowych",
      title: "Ceny i usługi ArchiCompass",
      body: "Klienci mogą bezpłatnie korzystać z AI Project Compass, Katalogu Projektantów i rozmów z profesjonalistami. Projektanci i pracownie otrzymują pierwsze trzy miesiące pełnego dostępu bez opłat, a następnie wybierają plan dopasowany do swojego sposobu pracy.",
    },
    client: {
      label: "Dla klientów",
      title: "Bezpłatne narzędzia do zaplanowania wnętrza",
      body: "Przygotuj przemyślany brief, porównaj profile profesjonalistów i prowadź cały proces w jednym miejscu.",
      price: "Bezpłatnie",
      features: ["AI Project Compass i analiza inspiracji", "Katalog projektantów i pracowni", "Zapisywanie inspiracji, artykułów, projektów i profili", "Briefy i rozmowy z wybranymi specjalistami"],
    },
    servicesTitle: "Zakres planów dla profesjonalistów",
    servicesBody: "Każdy plan obejmuje narzędzia do prowadzenia publicznego profilu, portfolio oraz komunikacji z klientami. Ceny i zakres funkcji są przedstawione jasno, bez ukrytych opłat.",
    studioCoverage: {
      title: "Jeden plan pracowni, bez dodatkowych opłat za zespół",
      body: "Aktywna, płatna subskrypcja pracowni obejmuje osobiste profile wszystkich aktywnych członków zespołu. Nie muszą wykupywać odrębnego planu, dopóki pozostają aktywnymi członkami tej pracowni.",
    },
    faq: {
      badge: "Asystent portfolio AI",
      title: "Najczęstsze pytania",
      question: "Jak szybko mogę uzupełnić swój profil?",
      answer: "Skorzystaj z Asystenta portfolio AI — wystarczy podać adres swojej strony lub wgrać zdjęcia, a AI pogrupuje je w projekty i przygotuje szkic do Twojej akceptacji. Zwykle zajmuje to kilka minut; nic nie trafia do publicznego profilu bez Twojej zgody.",
    },
    priceNote: "Wszystkie ceny dla profesjonalistów są cenami netto. VAT naliczamy zgodnie z obowiązującą stawką. Firmy mogą podać dane do faktury oraz NIP lub numer VAT UE.",
    primaryCta: "Załóż konto profesjonalisty",
    pricingCta: "Zobacz pełny cennik",
  },
  en: {
    footerLabel: "Prices and services",
    metadata: {
      title: "ArchiCompass prices and services",
      description: "Explore free client features and clear plans, services, and prices for ArchiCompass interior designers and studios.",
    },
    hero: {
      eyebrow: "One platform for better project decisions",
      title: "ArchiCompass prices and services",
      body: "Clients can use AI Project Compass, the Designer Directory, and conversations with professionals at no cost. Designers and studios receive full access for the first three months at no charge, then choose the plan that fits the way they work.",
    },
    client: {
      label: "For clients",
      title: "Free tools for planning your interior",
      body: "Prepare a thoughtful brief, compare professional profiles, and keep the whole process in one place.",
      price: "Free",
      features: ["AI Project Compass and inspiration analysis", "Designer and studio directory", "Save inspiration, articles, projects, and profiles", "Briefs and conversations with selected professionals"],
    },
    servicesTitle: "What professional plans include",
    servicesBody: "Each plan includes tools for a public profile, portfolio, and client communication. Prices and included features are presented clearly, with no hidden charges.",
    studioCoverage: {
      title: "One studio plan, with no extra fees for the team",
      body: "An active paid studio subscription includes the personal profiles of all active team members. They do not need a separate plan while they remain active members of that studio.",
    },
    faq: {
      badge: "AI Portfolio Assistant",
      title: "Frequently asked questions",
      question: "How quickly can I set up my profile?",
      answer: "Use the AI Portfolio Assistant — just provide your website address or upload photos, and AI will group them into projects and prepare a draft for your approval. It usually takes a few minutes; nothing goes live without your confirmation.",
    },
    priceNote: "All professional prices are net prices. VAT is charged at the applicable rate. Companies can provide invoice details and a NIP / EU VAT ID.",
    primaryCta: "Create a professional account",
    pricingCta: "View full pricing",
  },
};

export function getServicesPricingCopy(locale: SiteLocale = siteLocale) {
  return copy[locale];
}
