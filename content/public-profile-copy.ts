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
  gallery: {
    open: (title: string) => string;
    photoCount: (count: number) => string;
    openPhoto: (index: number, title: string) => string;
    fullSizeAlt: (title: string) => string;
    photoPosition: (current: number, total: number) => string;
    close: string;
    previous: string;
    next: string;
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
    gallery: {
      open: (title) => `Otwórz galerię: ${title}`,
      photoCount: (count) => {
        const absolute = Math.abs(count);
        const lastTwo = absolute % 100;
        const last = absolute % 10;
        const label = absolute === 1
          ? "zdjęcie"
          : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14)
            ? "zdjęcia"
            : "zdjęć";
        return `Zobacz ${count} ${label}`;
      },
      openPhoto: (index, title) => `Otwórz zdjęcie ${index}: ${title}`,
      fullSizeAlt: (title) => `${title} w pełnym rozmiarze`,
      photoPosition: (current, total) => `Zdjęcie ${current} z ${total}`,
      close: "Zamknij",
      previous: "Poprzednie",
      next: "Następne",
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
    gallery: {
      open: (title) => `Open gallery: ${title}`,
      photoCount: (count) => `View ${count} ${count === 1 ? "photo" : "photos"}`,
      openPhoto: (index, title) => `Open image ${index}: ${title}`,
      fullSizeAlt: (title) => `${title} full size`,
      photoPosition: (current, total) => `Image ${current} of ${total}`,
      close: "Close",
      previous: "Previous",
      next: "Next",
    },
  },
};

export function getPublicProfileCopy(locale: SiteLocale = siteLocale) {
  return publicProfileCopy[locale];
}
