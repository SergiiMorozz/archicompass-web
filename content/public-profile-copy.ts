import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type PublicProfileCopy = {
  labels: {
    location: string;
    experience: string;
    portfolio: string;
    price: string;
    availability: string;
    workMode: string;
    minimumProjectBudget: string;
    languages: string;
    contact: string;
    platformResponses: string;
    profileSummary: string;
    bestMatch: string;
  };
  values: {
    toBeAgreed: string;
    notSpecified: string;
    demoContactUnavailable: string;
  };
};

const publicProfileCopy: Record<SiteLocale, PublicProfileCopy> = {
  pl: {
    labels: {
      location: "Lokalizacja",
      experience: "Doświadczenie",
      portfolio: "Portfolio",
      price: "Cena",
      availability: "Dostępność",
      workMode: "Forma współpracy",
      minimumProjectBudget: "Minimalny budżet projektu",
      languages: "Języki",
      contact: "Kontakt",
      platformResponses: "Odpowiedzi na platformie",
      profileSummary: "Profil w skrócie",
      bestMatch: "Najlepsze dopasowanie",
    },
    values: {
      toBeAgreed: "Do uzgodnienia",
      notSpecified: "Nie określono",
      demoContactUnavailable: "Niedostępny w profilu demonstracyjnym",
    },
  },
  en: {
    labels: {
      location: "Location",
      experience: "Experience",
      portfolio: "Portfolio",
      price: "Price",
      availability: "Availability",
      workMode: "Working mode",
      minimumProjectBudget: "Minimum project budget",
      languages: "Languages",
      contact: "Contact",
      platformResponses: "Platform responses",
      profileSummary: "Profile at a glance",
      bestMatch: "Best match",
    },
    values: {
      toBeAgreed: "To be agreed",
      notSpecified: "Not specified",
      demoContactUnavailable: "Unavailable on a demo profile",
    },
  },
};

export function getPublicProfileCopy(locale: SiteLocale = siteLocale) {
  return publicProfileCopy[locale];
}
