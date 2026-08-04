import type { SiteLocale } from "@/lib/site-locale";

const copy = {
  pl: {
    metadata: {
      title: "Poradniki o projektowaniu wnętrz i remoncie",
      description: "Praktyczne poradniki ArchiCompass o planowaniu wnętrza, briefie, budżecie remontu i wyborze projektanta.",
    },
    breadcrumb: "Poradniki",
    eyebrow: "Baza wiedzy ArchiCompass",
    headline: "Mądrzej zaplanowany projekt wnętrza.",
    body: "Konkretne poradniki, checklisty i decyzje, które pomagają przejść od inspiracji do dobrze przygotowanego projektu.",
    searchCta: "Znajdź projektanta",
    emptyTitle: "Poradniki są właśnie przygotowywane",
    emptyBody: "Pierwsze kompletne materiały pojawią się tutaj wraz z polską i angielską wersją każdego tematu.",
    backToIndex: "Wróć do poradników",
    label: "Poradnik",
    articleCtaEyebrow: "Kolejny krok",
    articleCtaTitle: "Zamień decyzje z poradnika w uporządkowany brief.",
    articleCtaProjectCompass: "Otwórz AI Project Compass",
    articleCtaDirectory: "Przejdź do Katalogu Projektantów",
    editorialTeam: "Zespół redakcyjny ArchiCompass",
    readCta: "Czytaj poradnik",
    count: (value: number) => `${value} ${value === 1 ? "poradnik" : "poradników"}`,
  },
  en: {
    metadata: {
      title: "Interior Design and Renovation Guides",
      description: "Practical ArchiCompass guides on planning an interior project, preparing a brief, renovation budgets and choosing a designer.",
    },
    breadcrumb: "Guides",
    eyebrow: "ArchiCompass knowledge base",
    headline: "Plan your interior project with more clarity.",
    body: "Practical guides, checklists and decision support that help you move from inspiration to a well-defined project.",
    searchCta: "Find a designer",
    emptyTitle: "Guides are being prepared",
    emptyBody: "The first complete guides will appear here with a dedicated Polish and English version for every topic.",
    backToIndex: "Back to guides",
    label: "Guide",
    articleCtaEyebrow: "Your next step",
    articleCtaTitle: "Turn the decisions from this guide into a structured brief.",
    articleCtaProjectCompass: "Open AI Project Compass",
    articleCtaDirectory: "Browse the Designer Directory",
    editorialTeam: "ArchiCompass editorial team",
    readCta: "Read guide",
    count: (value: number) => `${value} ${value === 1 ? "guide" : "guides"}`,
  },
} as const;

export function getGuidesCopy(locale: SiteLocale) {
  return copy[locale];
}
