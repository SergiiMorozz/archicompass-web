import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type ProjectCompassJourneyCopy = {
  metadata: {
    title: string;
    description: string;
  };
  hero: {
    back: string;
    eyebrow: string;
    titleBefore: string;
    titleHighlight: string;
    titleAfter: string;
    body: string;
    previewLabel: string;
    previewStyle: string;
    imageAlt: string;
    benefits: string[];
    start: string;
    photosHint: string;
  };
  rail: Array<{ id: "inspiration" | "project" | "matches"; number: string; title: string; body: string }>;
  inspiration: {
    title: string;
    body: string;
    upload: string;
    uploadHint: string;
    selected: (count: number) => string;
    analyse: string;
    analysing: string;
    continue: string;
    refine: string;
    privacy: string;
    transparency: string;
  };
  analysis: {
    ready: string;
    result: string;
    suggestedStyle: string;
    confidence: string;
    palette: string;
    materials: string;
    cues: string;
    designerPrompt: string;
  };
  project: {
    title: string;
    body: string;
    details: string;
    preferences: string;
    scope: string;
    budget: string;
    continue: string;
    summary: string;
  };
  matches: {
    title: string;
    body: string;
    ready: string;
    incomplete: string;
    backToProject: string;
    save: string;
    saving: string;
    find: string;
    findWithAccount: string;
    view: string;
    copy: string;
    copied: string;
    designerNotice: string;
    briefLabel: string;
    noStyle: string;
    manualStyle: string;
    noProject: string;
  };
};

const journeyCopy: Record<SiteLocale, ProjectCompassJourneyCopy> = {
  pl: {
    metadata: {
      title: "AI Project Compass: przygotuj brief do projektu wnętrza",
      description:
        "Dodaj inspiracje, otrzymaj pomocniczą analizę AI i przygotuj uporządkowany brief do rozmowy z projektantem wnętrz.",
    },
    hero: {
      back: "Wróć do strony głównej",
      eyebrow: "AI PROJECT COMPASS",
      titleBefore: "Zamień inspiracje w",
      titleHighlight: "konkretny kierunek",
      titleAfter: "projektu",
      body:
        "Dodaj zdjęcia wnętrz, odpowiedz na kilka pytań, a AI Project Compass pomoże uporządkować styl, potrzeby i informacje potrzebne do rozmowy z projektantem.",
      previewLabel: "Przykładowy kierunek",
      previewStyle: "Ciepłe japandi",
      imageAlt: "Jasny salon w ciepłej, naturalnej palecie z drewnianymi meblami i dużym drzewem przy oknie.",
      benefits: ["Zacznij od inspiracji", "AI pomaga uporządkować kierunek", "Gotowy brief do rozmowy"],
      start: "Dodaj zdjęcia inspiracji",
      photosHint: "JPEG, PNG lub WebP. Możesz dodać do 10 zdjęć wnętrz, detali i materiałów.",
    },
    rail: [
      { id: "inspiration", number: "01", title: "Dodaj inspiracje", body: "Zdjęcia i pierwsza analiza AI" },
      { id: "project", number: "02", title: "Dopasujmy projekt", body: "Zakres, potrzeby, budżet i termin" },
      { id: "matches", number: "03", title: "Zobacz projektantów", body: "Zapisz brief i otwórz dopasowania" },
    ],
    inspiration: {
      title: "Zacznij od wnętrz, które naprawdę Ci się podobają",
      body:
        "Nie musisz znać nazwy stylu. Wybierz zdjęcia pokazujące atmosferę, światło, materiały i sposób życia, którego szukasz.",
      upload: "Dodaj inspiracje",
      uploadHint: "Najlepiej wybierz kilka zdjęć. Analiza wykorzysta maksymalnie pierwszych 6 zdjęć.",
      selected: (count) => `Wybrano zdjęcia: ${count}/10`,
      analyse: "Przeanalizuj inspiracje",
      analysing: "Analizujemy inspiracje…",
      continue: "Przejdź do szczegółów projektu",
      refine: "Doprecyzuj kierunek stylistyczny",
      privacy:
        "Analiza przesyła do dostawcy AI maksymalnie 6 zdjęć. Nie dodawaj wizerunku osób, adresów ani poufnych informacji.",
      transparency: "Jak działa AI",
    },
    analysis: {
      ready: "Analiza gotowa — poniżej znajdziesz wynik.",
      result: "Wynik analizy AI",
      suggestedStyle: "Proponowany kierunek",
      confidence: "Pewność analizy",
      palette: "Paleta",
      materials: "Materiały",
      cues: "Cechy wspólne",
      designerPrompt: "Wskazówka do rozmowy z projektantem",
    },
    project: {
      title: "Dopasujmy wynik do Twojej inwestycji",
      body:
        "AI porządkuje inspiracje, ale dopiero kontekst projektu pozwala trafniej wybrać projektanta. Uzupełnij tyle, ile wiesz na tym etapie.",
      details: "Szczegóły projektu",
      preferences: "Styl i preferencje",
      scope: "Zakres współpracy",
      budget: "Budżet i termin",
      continue: "Przejdź do podsumowania",
      summary: "Każdy uzupełniony element pomaga lepiej przygotować pierwszą rozmowę.",
    },
    matches: {
      title: "Twój brief i dopasowania",
      body:
        "Po zapisaniu briefu ArchiCompass przekaże jego kluczowe sygnały do katalogu projektantów, aby można było wrócić do niego później. Możesz też przejrzeć dopasowania bez zapisywania briefu. To punkt wyjścia do porównania portfolio, nie automatyczna decyzja.",
      ready: "Możesz już przejrzeć wstępne dopasowania. Uzupełnij pozostałe pola, aby rekomendacje były dokładniejsze.",
      incomplete: "Wybierz kierunek stylu i dodaj przynajmniej jedną informację o inwestycji, aby przejrzeć wstępne dopasowania.",
      backToProject: "Uzupełnij brakujące informacje",
      save: "Zapisz brief na później",
      saving: "Zapisujemy brief…",
      find: "Zapisz brief i przejdź do dopasowań",
      findWithAccount: "Zapisz brief — utwórz konto",
      view: "Przejrzyj dopasowania bez zapisywania briefu",
      copy: "Kopiuj brief",
      copied: "Brief skopiowany",
      designerNotice:
        "Konto projektanta może korzystać z analizy i podglądu dopasowań, ale nie może zapisywać ani wysyłać briefów klientów.",
      briefLabel: "Podsumowanie briefu",
      noStyle: "Kierunek stylistyczny pojawi się po analizie zdjęć.",
      manualStyle: "Kierunek został wybrany ręcznie. Dodaj zdjęcia, jeśli chcesz otrzymać także analizę AI palety i materiałów.",
      noProject: "Szczegóły projektu pojawią się po ich uzupełnieniu.",
    },
  },
  en: {
    metadata: {
      title: "AI Project Compass: prepare an interior project brief",
      description:
        "Add inspiration, receive supportive AI analysis and prepare a structured brief for an interior designer conversation.",
    },
    hero: {
      back: "Back to home",
      eyebrow: "AI PROJECT COMPASS",
      titleBefore: "Turn inspiration into a",
      titleHighlight: "clear direction",
      titleAfter: "for your project",
      body:
        "Add interior photos, answer a few questions, and let AI Project Compass help organise your style, needs and the information a designer needs for a first conversation.",
      previewLabel: "Sample direction",
      previewStyle: "Warm Japandi",
      imageAlt: "A bright living room in a warm, natural palette with wooden furniture and a large tree by the window.",
      benefits: ["Start with inspiration", "AI helps organise the direction", "A brief ready for conversation"],
      start: "Add inspiration photos",
      photosHint: "JPEG, PNG or WebP. Add up to 10 photos of interiors, details and materials.",
    },
    rail: [
      { id: "inspiration", number: "01", title: "Add inspiration", body: "Photos and initial AI analysis" },
      { id: "project", number: "02", title: "Shape the project", body: "Scope, needs, budget and timing" },
      { id: "matches", number: "03", title: "View designers", body: "Save the brief and open matches" },
    ],
    inspiration: {
      title: "Start with interiors you genuinely like",
      body:
        "You do not need to know the name of a style. Choose photos that show the atmosphere, light, materials and way of living you are looking for.",
      upload: "Add inspiration",
      uploadHint: "Several photos work best. The analysis uses up to the first 6 photos.",
      selected: (count) => `Photos selected: ${count}/10`,
      analyse: "Analyse inspiration",
      analysing: "Analysing inspiration…",
      continue: "Continue to project details",
      refine: "Refine the style direction",
      privacy:
        "The analysis sends up to 6 photos to the AI provider. Do not upload people, addresses or confidential information.",
      transparency: "How AI works",
    },
    analysis: {
      ready: "Analysis ready — your result is below.",
      result: "AI analysis result",
      suggestedStyle: "Suggested direction",
      confidence: "Analysis confidence",
      palette: "Palette",
      materials: "Materials",
      cues: "Shared features",
      designerPrompt: "A prompt for the designer conversation",
    },
    project: {
      title: "Let’s adapt the result to your project",
      body:
        "AI organises inspiration, but the project context is what helps you choose a designer more precisely. Add as much as you know at this stage.",
      details: "Project details",
      preferences: "Style and preferences",
      scope: "Collaboration scope",
      budget: "Budget and timeline",
      continue: "Continue to the summary",
      summary: "Each completed detail helps make the first conversation more useful.",
    },
    matches: {
      title: "Your brief and matches",
      body:
        "Once you save the brief, ArchiCompass sends its key signals to the designer directory so you can return to it later. You can also preview matches without saving the brief. It is a starting point for comparing portfolios, not an automatic decision.",
      ready: "You can already preview initial matches. Complete the remaining fields to make the recommendations more precise.",
      incomplete: "Choose a style direction and add at least one detail about your project to preview initial matches.",
      backToProject: "Complete the missing information",
      save: "Save brief for later",
      saving: "Saving brief…",
      find: "Save brief and go to matches",
      findWithAccount: "Save brief — create an account",
      view: "Preview matches without saving the brief",
      copy: "Copy brief",
      copied: "Brief copied",
      designerNotice:
        "A designer account can use the analysis and preview matches, but cannot save or send client briefs.",
      briefLabel: "Brief summary",
      noStyle: "The style direction will appear after image analysis.",
      manualStyle: "This direction was selected manually. Add photos if you would also like AI analysis of the palette and materials.",
      noProject: "Project details will appear once you add them.",
    },
  },
};

export function getProjectCompassJourneyCopy(locale: SiteLocale = siteLocale) {
  return journeyCopy[locale];
}
