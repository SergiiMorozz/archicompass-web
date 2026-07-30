import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type ServicesPricingCopy = {
  footerLabel: string;
  metadata: { title: string; description: string };
  hero: { eyebrow: string; title: string; body: string };
  client: { label: string; title: string; body: string; price: string; features: string[] };
  servicesTitle: string;
  servicesBody: string;
  studioCoverage: { title: string; body: string };
  priceNote: string;
  primaryCta: string;
  pricingCta: string;
};

const copy: Record<SiteLocale, ServicesPricingCopy> = {
  pl: {
    footerLabel: "Ceny i usługi",
    metadata: {
      title: "Ceny i usługi ArchiCompass",
      description: "Sprawdź bezpłatne funkcje dla klientów oraz plany, usługi i ceny dla projektantów wnętrz i pracowni ArchiCompass.",
    },
    hero: {
      eyebrow: "Jedna platforma dla dobrych decyzji projektowych",
      title: "Ceny i usługi ArchiCompass",
      body: "Klienci korzystają bezpłatnie z AI Project Compass, Katalogu Projektantów i rozmów. Projektanci oraz pracownie otrzymują 3 miesiące pełnego dostępu bez opłat, a później wybierają plan dopasowany do sposobu pracy.",
    },
    client: {
      label: "Dla klientów",
      title: "Planowanie projektu bez opłat",
      body: "Przygotuj konkretny brief, porównaj profesjonalistów i zachowaj cały proces w jednym miejscu.",
      price: "Bezpłatnie",
      features: ["AI Project Compass i analiza inspiracji", "Katalog projektantów oraz pracowni", "Zapisywanie projektów, artykułów i profesjonalistów", "Briefy i rozmowy z wybranymi specjalistami"],
    },
    servicesTitle: "Co obejmują plany profesjonalne",
    servicesBody: "Każdy plan pomaga prowadzić publiczny profil, portfolio i kontakt z klientami. Konkretne ceny i funkcje są widoczne od razu, bez ukrytych opłat.",
    studioCoverage: {
      title: "Jeden plan pracowni, zespół bez podwójnych opłat",
      body: "Aktywna płatna subskrypcja pracowni obejmuje osobiste profile wszystkich aktywnych członków zespołu. Nie muszą oni wykupywać własnego planu, dopóki należą do aktywnej pracowni.",
    },
    priceNote: "Wszystkie kwoty dla profesjonalistów są cenami netto. VAT jest naliczany zgodnie z obowiązującą stawką. Firmy mogą podać dane do faktury oraz NIP / VAT UE.",
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
      body: "Clients use AI Project Compass, the Designer Directory, and conversations at no cost. Designers and studios receive three months of full access free of charge, then choose the plan that fits how they work.",
    },
    client: {
      label: "For clients",
      title: "Plan your project at no cost",
      body: "Prepare a clear brief, compare professionals, and keep the whole process in one place.",
      price: "Free",
      features: ["AI Project Compass and inspiration analysis", "Designer and studio directory", "Save projects, articles, and professionals", "Briefs and conversations with selected professionals"],
    },
    servicesTitle: "What professional plans include",
    servicesBody: "Each plan supports a public profile, portfolio, and client communication. Prices and included features are shown clearly from the start, with no hidden charges.",
    studioCoverage: {
      title: "One studio plan, no duplicate member fees",
      body: "An active paid studio subscription includes the personal profiles of all active team members. They do not need a separate plan while they belong to an active studio.",
    },
    priceNote: "All professional prices are net prices. VAT is charged at the applicable rate. Companies can provide invoice details and a NIP / EU VAT ID.",
    primaryCta: "Create a professional account",
    pricingCta: "View full pricing",
  },
};

export function getServicesPricingCopy(locale: SiteLocale = siteLocale) {
  return copy[locale];
}
