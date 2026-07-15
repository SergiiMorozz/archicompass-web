import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type ProjectCompassOption = {
  label: string;
  value: string;
  description: string;
  specialty?: string;
};

type ProjectCompassOptions = {
  projectTypes: ProjectCompassOption[];
  goals: ProjectCompassOption[];
  styles: ProjectCompassOption[];
  scopes: ProjectCompassOption[];
  budgets: ProjectCompassOption[];
  timelines: ProjectCompassOption[];
  propertyStatuses: ProjectCompassOption[];
  visualizationNeeds: ProjectCompassOption[];
  supervisionNeeds: ProjectCompassOption[];
  visualCues: ProjectCompassOption[];
  roomTypeLabels: Record<string, string>;
};

type ProjectCompassCopy = {
  metadata: {
    title: string;
    description: string;
  };
  options: ProjectCompassOptions;
  ui: {
    defaultLocation: string;
    notProvided: string;
    none: string;
    notSelected: string;
    stylesHint: string;
    confidence: Record<"low" | "medium" | "high", string>;
    hero: {
      eyebrow: string;
      title: string;
      body: string;
      insightTitle: string;
      insightBody: string;
    };
    steps: {
      projectType: string;
      space: string;
      spaceBody: string;
      area: string;
      areaPlaceholder: string;
      roomsCount: string;
      roomsCountPlaceholder: string;
      roomsIncluded: string;
      propertyStatus: string;
      goal: string;
      photos: string;
      photosBody: string;
      photoLimit: string;
      photoLimitReached: string;
      addPhotos: string;
      photoTypes: string;
      removePhoto: string;
      noPhotos: string;
      aiTitle: string;
      aiBody: string;
      analyzing: string;
      analyze: string;
      aiPrivacyBefore: string;
      privacy: string;
      aiPrivacyAfter: string;
      manyPhotos: (count: number) => string;
      suggestedStyle: string;
      confidencePrefix: string;
      closestDirection: string;
      colors: string;
      materials: string;
      styleClues: string;
      tooLittleData: string;
      describeNeeds: string;
      watchOuts: string;
      analysisUnavailable: string;
      visualCues: string;
      style: string;
      scope: string;
      budget: string;
      timeline: string;
      visualization: string;
      supervision: string;
    };
    location: string;
    locationPlaceholder: string;
    notes: string;
    notesPlaceholder: string;
    ready: string;
    readyBody: string;
    designerOnly: string;
    saveAndFind: string;
    saving: string;
    viewMatches: string;
    copyBrief: string;
    briefCopied: string;
    brief: {
      title: string;
      goal: string;
      area: string;
      rooms: string;
      property: string;
      style: string;
      photos: string;
      visualCues: string;
      support: string;
      budget: string;
      timeline: string;
      visualization: string;
      supervision: string;
      nextStep: string;
      designerTip: string;
      designerTipBody: (cue: string, scope: string) => string;
      designerNoticeTitle: string;
      designerNoticeBody: string;
      saveForLater: string;
      savedTitle: string;
      savedBody: (count: number) => string;
      openSavedBriefs: string;
      saveFailed: string;
      mobileMatches: string;
      mobileSaveAndFind: string;
      mobileSaving: string;
      mobileCopied: string;
      mobileCopy: string;
    };
    draft: {
      investment: (value: string) => string;
      goal: (value: string) => string;
      area: (value: string) => string;
      roomCount: (value: string) => string;
      rooms: (value: string) => string;
      propertyStatus: (value: string) => string;
      style: (value: string) => string;
      photos: (count: number, names: string) => string;
      noPhotos: string;
      analysis: (style: string, confidence: string) => string;
      analysisSummary: (value: string) => string;
      palette: (value: string) => string;
      materials: (value: string) => string;
      designerTip: (value: string) => string;
      visualCues: (value: string) => string;
      scope: (value: string) => string;
      budget: (value: string) => string;
      timeline: (value: string) => string;
      visualization: (value: string) => string;
      supervision: (value: string) => string;
      location: (value: string) => string;
      notes: (value: string) => string;
    };
    nextSteps: {
      consultation: string;
      endToEnd: string;
      clarify: string;
      default: string;
    };
    share: {
      fallbackSummary: string;
      imageLoadError: string;
      canvasError: string;
      canvasTitle: string;
      canvasStyle: string;
      canvasPalette: string;
      canvasMaterials: string;
      canvasDesignerFit: string;
      canvasFooter: string;
      defaultFileName: string;
      captionStyle: (style: string, confidence: string) => string;
      captionDesignerFit: (value: string) => string;
      captionCta: string;
      downloadSuccess: string;
      downloadError: string;
      shareTitle: (style: string) => string;
      shareSuccess: string;
      shareLinkSuccess: string;
      shareFallbackSuccess: string;
      shareError: string;
      captionSuccess: string;
      captionError: string;
      eyebrow: string;
      title: string;
      body: string;
      preparing: string;
      share: string;
      creating: string;
      download: string;
      copying: string;
      copied: string;
      copy: string;
      cardTitle: string;
      imageAlt: (index: number, name: string) => string;
      palette: string;
      materials: string;
      designerFit: string;
      footer: string;
      createdWith: string;
    };
    errors: {
      copy: string;
      noPhotos: string;
      analysis: string;
      save: string;
    };
  };
};

const values = {
  projectTypes: ["Apartment", "House", "Single room", "Office"],
  goals: ["Clarify direction", "Plan renovation", "Full design project", "Find the right pro"],
  styles: [
    "Warm minimalism",
    "Scandinavian",
    "Modern classic",
    "Industrial",
    "Japandi",
    "Contemporary",
    "Mid-century modern",
    "Art Deco",
    "Mediterranean",
    "Bohemian",
    "Eclectic",
    "Rustic / organic",
    "Traditional",
    "Luxury contemporary",
    "Not sure yet",
  ],
  scopes: ["Consultation", "Concept package", "Technical design", "End-to-end support"],
  budgets: [
    "Under 50k PLN total project budget",
    "50k-100k PLN total project budget",
    "100k-200k PLN total project budget",
    "200k-400k PLN total project budget",
    "400k-800k PLN total project budget",
    "800k+ PLN total project budget",
    "Total project budget not decided",
  ],
  timelines: ["As soon as possible", "In 1-3 months", "In 3-6 months", "Just exploring"],
  propertyStatuses: [
    "New build / developer condition",
    "Existing property",
    "Renovation in progress",
    "Not purchased yet",
  ],
  visualizationNeeds: ["Not needed", "Selected rooms", "Full project", "Not sure yet"],
  supervisionNeeds: [
    "Not needed",
    "Consultations / site visits",
    "Author's supervision",
    "Full project coordination",
  ],
  visualCues: [
    "Natural wood",
    "Bright neutral palette",
    "Hidden storage",
    "Bold color accents",
    "Dark contrast",
    "Luxury details",
    "Eco materials",
    "Smart home",
    "Compact solutions",
    "Soft curves",
  ],
} as const;

const projectCompassCopy: Record<SiteLocale, ProjectCompassCopy> = {
  pl: {
    metadata: {
      title: "AI do rozpoznawania stylu wnętrza i tworzenia briefu",
      description:
        "Dodaj zdjęcia inspiracji, rozpoznaj styl, paletę kolorów i materiały dzięki AI, a następnie utwórz szczegółowy brief i znajdź dopasowanego projektanta wnętrz.",
    },
    options: {
      projectTypes: [
        { label: "Mieszkanie", value: values.projectTypes[0], description: "Mieszkanie własne, na wynajem lub apartament miejski." },
        { label: "Dom", value: values.projectTypes[1], description: "Dom prywatny, nowa inwestycja lub większy remont." },
        { label: "Jedno pomieszczenie", value: values.projectTypes[2], description: "Kuchnia, łazienka, sypialnia, salon lub inne wnętrze." },
        { label: "Biuro", value: values.projectTypes[3], description: "Miejsce pracy, pracownia lub przestrzeń obsługi klientów." },
      ],
      goals: [
        { label: "Określić kierunek", value: values.goals[0], description: "Potrzebuję koncepcji, zanim podejmę kosztowne decyzje." },
        { label: "Zaplanować remont", value: values.goals[1], description: "Potrzebuję układu funkcjonalnego, materiałów i konkretnych decyzji." },
        { label: "Kompleksowy projekt wnętrza", value: values.goals[2], description: "Chcę, aby projektant poprowadził cały proces." },
        { label: "Znaleźć właściwego specjalistę", value: values.goals[3], description: "Wiem, czego potrzebuję, ale nie wiem, komu powierzyć projekt." },
      ],
      styles: [
        { label: "Ciepły minimalizm", value: values.styles[0], description: "Spokojnie, czysto i naturalnie, ale bez chłodu.", specialty: "minimalist" },
        { label: "Skandynawski", value: values.styles[1], description: "Jasne wnętrza, funkcjonalność, miękkie faktury i proste formy.", specialty: "scandinavian" },
        { label: "Modern classic", value: values.styles[2], description: "Elegancja, harmonia i ponadczasowe detale.", specialty: "modern" },
        { label: "Industrialny", value: values.styles[3], description: "Loftowy charakter, wyraziste faktury, metal, beton i kontrast.", specialty: "industrial" },
        { label: "Japandi", value: values.styles[4], description: "Japoński spokój połączony ze skandynawskim ciepłem.", specialty: "minimalist" },
        { label: "Współczesny", value: values.styles[5], description: "Aktualne formy, dopracowane detale i harmonijna paleta materiałów.", specialty: "contemporary" },
        { label: "Mid-century modern", value: values.styles[6], description: "Czyste linie, ciepłe drewno, inspiracje vintage i funkcjonalne meble.", specialty: "mid-century" },
        { label: "Art déco", value: values.styles[7], description: "Geometria, szlachetne materiały, symetria i eleganckie akcenty.", specialty: "art deco" },
        { label: "Śródziemnomorski", value: values.styles[8], description: "Rozbielone słońcem kolory, kamień, tynk, drewno i swobodne faktury.", specialty: "mediterranean" },
        { label: "Boho", value: values.styles[9], description: "Warstwowe tekstylia, pamiątki, kolor i indywidualny charakter.", specialty: "bohemian" },
        { label: "Eklektyczny", value: values.styles[10], description: "Świadome połączenie epok, kolorów, sztuki i elementów na zamówienie.", specialty: "eclectic" },
        { label: "Rustykalny / organiczny", value: values.styles[11], description: "Naturalny kamień, postarzane drewno, rękodzieło i ziemiste ciepło.", specialty: "rustic" },
        { label: "Tradycyjny", value: values.styles[12], description: "Klasyczne proporcje, dopracowana stolarka i znajome formy.", specialty: "traditional" },
        { label: "Współczesny luksus", value: values.styles[13], description: "Stolarka na wymiar, kamień premium, światło i perfekcyjne detale.", specialty: "luxury" },
        { label: "Jeszcze nie wiem", value: values.styles[14], description: "Chcę, aby ArchiCompass pomógł mi nazwać ten kierunek." },
      ],
      scopes: [
        { label: "Konsultacja", value: values.scopes[0], description: "Krótkie spotkanie, które pomoże uniknąć nietrafionych decyzji." },
        { label: "Projekt koncepcyjny", value: values.scopes[1], description: "Moodboard, układ funkcjonalny, materiały i priorytety." },
        { label: "Projekt wykonawczy", value: values.scopes[2], description: "Rysunki, specyfikacje i detale gotowe dla wykonawców." },
        { label: "Kompleksowa obsługa", value: values.scopes[3], description: "Projekt, zakupy, koordynacja i wsparcie podczas realizacji." },
      ],
      budgets: [
        { label: "Do 50 tys. zł", value: values.budgets[0], description: "Jedno pomieszczenie, wyposażenie lub niewielki, precyzyjnie określony remont." },
        { label: "50-100 tys. zł", value: values.budgets[1], description: "Kilka pomieszczeń lub niewielkie mieszkanie z kontrolowanym zakresem." },
        { label: "100-200 tys. zł", value: values.budgets[2], description: "Gruntowny remont mieszkania lub kompleksowe niewielkie wnętrze." },
        { label: "200-400 tys. zł", value: values.budgets[3], description: "Kompleksowe wnętrze mieszkania lub domu z elementami na wymiar." },
        { label: "400-800 tys. zł", value: values.budgets[4], description: "Większy dom, materiały premium i rozbudowany zakres realizacji." },
        { label: "Powyżej 800 tys. zł", value: values.budgets[5], description: "Duża inwestycja lub projekt i realizacja w segmencie premium." },
        { label: "Jeszcze nie wiem", value: values.budgets[6], description: "Potrzebuję pomocy projektanta w ustaleniu realnego budżetu całości." },
      ],
      timelines: [
        { label: "Jak najszybciej", value: values.timelines[0], description: "Mogę już teraz rozmawiać z dostępnymi projektantami." },
        { label: "Za 1-3 miesiące", value: values.timelines[1], description: "Przygotowuję decyzje i chcę wkrótce wybrać krótką listę projektantów." },
        { label: "Za 3-6 miesięcy", value: values.timelines[2], description: "Planuję z wyprzedzeniem przed rozpoczęciem inwestycji." },
        { label: "Na razie się rozglądam", value: values.timelines[3], description: "Najpierw chcę uporządkować potrzeby i dopiero potem wybrać termin." },
      ],
      propertyStatuses: [
        { label: "Nowe mieszkanie lub dom", value: values.propertyStatuses[0], description: "Nowa nieruchomość przed odbiorem lub rozpoczęciem prac wykończeniowych." },
        { label: "Istniejące wnętrze", value: values.propertyStatuses[1], description: "Użytkowane, umeblowane lub wcześniej wykończone wnętrze." },
        { label: "Remont w toku", value: values.propertyStatuses[2], description: "Prace już trwają, ale nadal trzeba podjąć decyzje projektowe." },
        { label: "Nieruchomość jeszcze niekupiona", value: values.propertyStatuses[3], description: "Planuję przed wyborem lub odbiorem nieruchomości." },
      ],
      visualizationNeeds: [
        { label: "Nie potrzebuję", value: values.visualizationNeeds[0], description: "Wystarczą mi rzuty, próbki materiałów lub moodboard." },
        { label: "Wybrane pomieszczenia", value: values.visualizationNeeds[1], description: "Chcę realistycznych ujęć najważniejszych pomieszczeń." },
        { label: "Cały projekt", value: values.visualizationNeeds[2], description: "Potrzebuję wizualizacji 3D dla całego projektu." },
        { label: "Jeszcze nie wiem", value: values.visualizationNeeds[3], description: "Chcę, aby projektant doradził odpowiedni zakres." },
      ],
      supervisionNeeds: [
        { label: "Nie potrzebuję", value: values.supervisionNeeds[0], description: "Potrzebuję tylko projektu i dokumentacji." },
        { label: "Konsultacje / wizyty na budowie", value: values.supervisionNeeds[1], description: "Okresowe kontrole i pomoc przy decyzjach na miejscu." },
        { label: "Nadzór autorski", value: values.supervisionNeeds[2], description: "Projektant czuwa nad zgodnością realizacji z projektem." },
        { label: "Pełna koordynacja realizacji", value: values.supervisionNeeds[3], description: "Potrzebuję aktywnej koordynacji wykonawców, zamówień i dostaw." },
      ],
      visualCues: [
        { label: "Naturalne drewno", value: values.visualCues[0], description: "Dąb, fornir, widoczne usłojenie i ciepłe materiały.", specialty: "eco-friendly" },
        { label: "Jasna neutralna paleta", value: values.visualCues[1], description: "Biel, beż, greige i miękkie światło dzienne.", specialty: "minimalist" },
        { label: "Ukryte przechowywanie", value: values.visualCues[2], description: "Zabudowy, czyste linie i mniej wizualnego chaosu." },
        { label: "Wyraziste akcenty kolorystyczne", value: values.visualCues[3], description: "Mocne kolory ścian, sztuka, tekstylia i zdecydowany kontrast." },
        { label: "Ciemny kontrast", value: values.visualCues[4], description: "Czarne detale, nastrojowe wnętrza i wyrazista geometria.", specialty: "industrial" },
        { label: "Luksusowe detale", value: values.visualCues[5], description: "Kamień, mosiądz, stolarka na wymiar i wykończenie premium.", specialty: "luxury" },
        { label: "Materiały ekologiczne", value: values.visualCues[6], description: "Naturalne, trwałe materiały o mniejszym wpływie na środowisko.", specialty: "eco-friendly" },
        { label: "Smart home", value: values.visualCues[7], description: "Sceny świetlne, automatyka i zintegrowane technologie.", specialty: "smart home" },
        { label: "Rozwiązania do małych przestrzeni", value: values.visualCues[8], description: "Sprytne wykorzystanie miejsca, elastyczne meble i przechowywanie." },
        { label: "Miękkie linie", value: values.visualCues[9], description: "Zaokrąglone meble, spokojne formy i łagodne linie." },
      ],
      roomTypeLabels: { "Living room": "Salon", Kitchen: "Kuchnia", Bedroom: "Sypialnia", Bathroom: "Łazienka", "Home office": "Gabinet domowy", "Children's room": "Pokój dziecięcy", "Hall / storage": "Hol / przechowywanie", Other: "Inne" },
    },
    ui: {
      defaultLocation: "Warszawa", notProvided: "Nie podano", none: "Brak", notSelected: "Nie oznaczono",
      stylesHint: "Wybierz jeden lub kilka kierunków, maksymalnie cztery. Łączenie stylów jest naturalne i pomaga w lepszym dopasowaniu projektanta.",
      confidence: { high: "wysoka", medium: "średnia", low: "niska" },
      hero: { eyebrow: "AI Project Compass", title: "Zamień niejasny pomysł w konkretny brief projektowy", body: "Styl ma znaczenie, ale trafne dopasowanie zależy także od zakresu, budżetu, rodzaju wnętrza, zdjęć referencyjnych, terminu i potrzebnego wsparcia.", insightTitle: "Dlaczego to działa lepiej", insightBody: "Zamiast zgadywać nazwę stylu ArchiCompass porządkuje informacje, których projektant potrzebuje, aby ocenić, czy inwestycja pasuje do jego specjalizacji." },
      steps: {
        projectType: "1. Co planujesz?", space: "2. Opowiedz o przestrzeni", spaceBody: "Wystarczą dane orientacyjne. Pomogą projektantom oszacować zakres pracy jeszcze przed pierwszą rozmową.", area: "Powierzchnia, m²", areaPlaceholder: "np. 72", roomsCount: "Liczba pomieszczeń", roomsCountPlaceholder: "np. 3", roomsIncluded: "Pomieszczenia objęte projektem", propertyStatus: "3. Jaki jest status nieruchomości?", goal: "4. Czego potrzebujesz najbardziej?", photos: "5. Dodaj zdjęcia referencyjne", photosBody: "Dodaj 4-10 zdjęć wnętrz, detali lub nastrojów, które Ci się podobają. Podgląd pozostaje w tej przeglądarce do chwili uruchomienia analizy lub zapisania briefu. Zapisane pliki trafiają do prywatnego briefu.", photoLimit: "Osiągnięto limit zdjęć", photoLimitReached: "Osiągnięto limit zdjęć", addPhotos: "Dodaj zdjęcia referencyjne", photoTypes: "JPEG, PNG lub WebP. Dodaj kilka zdjęć, aby łatwiej rozpoznać wspólne cechy.", removePhoto: "Usuń", noPhotos: "Nie dodano jeszcze zdjęć. Zacznij od obrazów, które najlepiej oddają oczekiwany nastrój, materiał, światło lub detal.", aiTitle: "Analiza stylu ze zdjęć", aiBody: "ArchiCompass przeanalizuje zdjęcia i zaproponuje nazwę stylu, materiały, kolory oraz wskazówki pomocne przy wyborze projektanta.", analyzing: "Analizowanie...", analyze: "Analizuj zdjęcia", aiPrivacyBefore: "Uruchomienie analizy wysyła maksymalnie", privacy: "Polityce prywatności", aiPrivacyAfter: "zdjęć do dostawcy usługi AI. Nie przesyłaj zdjęć osób, adresów ani informacji poufnych.", manyPhotos: (count) => `Analiza AI wykorzysta pierwsze ${count} zdjęć, aby wynik był szybki i precyzyjny. Wszystkie zdjęcia nadal można zapisać w briefie.`, suggestedStyle: "Sugerowany styl", confidencePrefix: "pewność:", closestDirection: "Najbliższy kierunek", colors: "Kolory", materials: "Materiały", styleClues: "Cechy stylu", tooLittleData: "Za mało danych", describeNeeds: "Jak opisać potrzeby projektantowi", watchOuts: "Na co uważać", analysisUnavailable: "Analiza AI jest niedostępna", visualCues: "Co łączy te zdjęcia?", style: "6. Które kierunki są Ci najbliższe?", scope: "7. Jakiego zakresu pomocy potrzebujesz?", budget: "8. Całkowity budżet inwestycji (projektant + materiały + wykonanie)", timeline: "9. Kiedy chcesz rozpocząć?", visualization: "10. Czy potrzebujesz wizualizacji 3D?", supervision: "11. Jakiego nadzoru potrzebujesz?",
      },
      location: "Lokalizacja", locationPlaceholder: "Warszawa, Kraków, Gdańsk...", notes: "Dodatkowe informacje", notesPlaceholder: "Dzieci, wynajem, termin, wykonawca...", ready: "Gotowe?", readyBody: "Możesz zapisać brief, od razu przejść do dopasowanych projektantów albo skopiować tekst i wysłać go poza platformą.", designerOnly: "Jako projektant możesz korzystać z analizy AI i podglądu dopasowań, ale zapisywanie oraz wysyłanie briefów klienta jest zablokowane.", saveAndFind: "Zapisz brief i znajdź projektantów", saving: "Zapisywanie briefu...", viewMatches: "Zobacz dopasowania bez zapisywania", copyBrief: "Kopiuj brief", briefCopied: "Brief skopiowany",
      brief: {
        title: "Twój brief", goal: "Cel", area: "Powierzchnia", rooms: "Pomieszczenia", property: "Nieruchomość", style: "Styl", photos: "Zdjęcia", visualCues: "Cechy wizualne", support: "Wsparcie", budget: "Budżet", timeline: "Termin", visualization: "3D", supervision: "Nadzór", nextStep: "Rekomendowany następny krok", designerTip: "Wskazówka do wyboru projektanta", designerTipBody: (cue, scope) => `Szukaj portfolio z cechami takimi jak ${cue.toLowerCase()} i zapytaj, czy projektant oferuje zakres: ${scope.toLowerCase()}.`, designerNoticeTitle: "Jesteś zalogowany jako projektant", designerNoticeBody: "Analiza zdjęć AI, wskazówki stylistyczne, kopiowanie i podgląd dopasowań pozostają dostępne. Konto projektanta nie może zapisywać ani wysyłać briefów klienta.", saveForLater: "Zapisz na później", savedTitle: "Brief zapisany", savedBody: (count) => `Zapisano ${count} ${count === 1 ? "zdjęcie referencyjne" : count >= 2 && count <= 4 ? "zdjęcia referencyjne" : "zdjęć referencyjnych"}. Brief jest gotowy do wysłania projektantowi.`, openSavedBriefs: "Otwórz zapisane briefy", saveFailed: "Nie udało się zapisać briefu", mobileMatches: "Zobacz dopasowanych projektantów", mobileSaveAndFind: "Zapisz i znajdź projektantów", mobileSaving: "Zapisywanie...", mobileCopied: "Skopiowano", mobileCopy: "Kopiuj",
      },
      draft: {
        investment: (value) => `Rodzaj inwestycji: ${value}`, goal: (value) => `Główny cel: ${value}`, area: (value) => `Powierzchnia: ${value}`, roomCount: (value) => `Liczba pomieszczeń: ${value}`, rooms: (value) => `Pomieszczenia: ${value}`, propertyStatus: (value) => `Status nieruchomości: ${value}`, style: (value) => `Kierunek stylistyczny: ${value}`, photos: (count, names) => `Zdjęcia referencyjne: przesłano ${count} (${names})`, noPhotos: "Zdjęcia referencyjne: jeszcze nie dodano", analysis: (style, confidence) => `Analiza stylu AI: ${style} (pewność: ${confidence})`, analysisSummary: (value) => `Podsumowanie AI: ${value}`, palette: (value) => `Paleta kolorów AI: ${value}`, materials: (value) => `Materiały AI: ${value}`, designerTip: (value) => `Wskazówki do wyboru projektanta: ${value}`, visualCues: (value) => `Cechy wizualne: ${value}`, scope: (value) => `Potrzebny zakres wsparcia: ${value}`, budget: (value) => `Całkowity budżet inwestycji: ${value}`, timeline: (value) => `Planowany termin: ${value}`, visualization: (value) => `Wizualizacje 3D: ${value}`, supervision: (value) => `Nadzór: ${value}`, location: (value) => `Lokalizacja: ${value}`, notes: (value) => `Dodatkowe informacje: ${value}`,
      },
      nextSteps: { consultation: "Umów jedną konkretną konsultację i wykorzystaj brief, aby od początku rozmawiać o realnych potrzebach.", endToEnd: "Wybierz 2-3 projektantów z rozbudowanym portfolio i zapytaj o proces, dostępność oraz wsparcie podczas realizacji.", clarify: "Zacznij od projektu koncepcyjnego, zanim zamówisz dokumentację lub podejmiesz decyzje remontowe.", default: "Porównaj projektantów na podstawie podobnych realizacji, a następnie wyślij ten brief jako pierwszą wiadomość." },
      share: { fallbackSummary: "Spójny kierunek wnętrza odczytany z Twoich zdjęć referencyjnych.", imageLoadError: "Nie udało się przygotować zdjęcia referencyjnego.", canvasError: "Ta przeglądarka nie może utworzyć obrazu z wynikiem.", canvasTitle: "ANALIZA STYLU WNĘTRZA AI", canvasStyle: "TWÓJ STYL WNĘTRZA", canvasPalette: "PALETA", canvasMaterials: "MATERIAŁY", canvasDesignerFit: "DOPASOWANIE PROJEKTANTA", canvasFooter: "Dodaj 4 zdjęcia. Otrzymaj brief gotowy dla projektanta.", defaultFileName: "styl-wnetrza", captionStyle: (style, confidence) => `Mój styl wnętrza to ${style} (${confidence.toLowerCase()}).`, captionDesignerFit: (value) => `Dopasowanie projektanta: ${value}`, captionCta: "Dodaj swoje inspiracje i otrzymaj brief gotowy dla projektanta z ArchiCompass.", downloadSuccess: "Plik PNG został pobrany. Możesz opublikować go w relacji, poście lub wiadomości.", downloadError: "Nie udało się pobrać wyniku.", shareTitle: (style) => `Mój styl wnętrza: ${style}`, shareSuccess: "Wynik został udostępniony.", shareLinkSuccess: "Link do wyniku został udostępniony. Pobierz PNG, aby przesłać kartę wizualną.", shareFallbackSuccess: "Tekst został skopiowany, a plik PNG pobrany.", shareError: "Nie udało się udostępnić wyniku.", captionSuccess: "Podpis został skopiowany. Możesz wkleić go do posta lub wiadomości.", captionError: "Nie udało się skopiować podpisu.", eyebrow: "Gotowe do udostępnienia", title: "Twoja karta stylu ArchiCompass", body: "Pobierz pionowy plik PNG lub udostępnij go z telefonu. Karta wykorzystuje pierwsze cztery zdjęcia referencyjne.", preparing: "Przygotowywanie...", share: "Udostępnij wynik", creating: "Tworzenie PNG...", download: "Pobierz PNG", copying: "Kopiowanie...", copied: "Podpis skopiowany", copy: "Kopiuj podpis", cardTitle: "Analiza stylu wnętrza AI", imageAlt: (index, name) => `Inspiracja stylistyczna ${index}: ${name}`, palette: "Paleta", materials: "Materiały", designerFit: "Dopasowanie projektanta", footer: "Dodaj 4 zdjęcia. Otrzymaj brief gotowy dla projektanta.", createdWith: "Utworzono z ArchiCompass" },
      errors: { copy: "Nie udało się skopiować briefu.", noPhotos: "Dodaj co najmniej jedno zdjęcie referencyjne przed uruchomieniem analizy AI.", analysis: "Nie udało się przeprowadzić analizy stylu AI.", save: "Nie udało się zapisać briefu." },
    },
  },
  en: {
    metadata: {
      title: "AI interior style analysis and project brief builder",
      description: "Upload inspiration photos, use AI to identify the interior style, palette and materials, then create a detailed brief and find a matched interior designer.",
    },
    options: {
      projectTypes: [
        { label: "Apartment", value: values.projectTypes[0], description: "Your own home, rental apartment, or a city residence." },
        { label: "House", value: values.projectTypes[1], description: "A private house, new build, or a substantial renovation." },
        { label: "One room", value: values.projectTypes[2], description: "Kitchen, bathroom, bedroom, living room, or another interior." },
        { label: "Office", value: values.projectTypes[3], description: "A workplace, studio, or client-facing space." },
      ],
      goals: [
        { label: "Clarify the direction", value: values.goals[0], description: "I need a concept before making costly decisions." },
        { label: "Plan a renovation", value: values.goals[1], description: "I need a layout, materials, and clear decisions." },
        { label: "Full interior design", value: values.goals[2], description: "I want a designer to guide the whole process." },
        { label: "Find the right professional", value: values.goals[3], description: "I know what I need, but not who to trust with the project." },
      ],
      styles: [
        { label: "Warm minimalism", value: values.styles[0], description: "Calm, clean and natural, without feeling cold.", specialty: "minimalist" },
        { label: "Scandinavian", value: values.styles[1], description: "Bright interiors, functionality, soft textures and simple forms.", specialty: "scandinavian" },
        { label: "Modern classic", value: values.styles[2], description: "Elegance, harmony and timeless details.", specialty: "modern" },
        { label: "Industrial", value: values.styles[3], description: "Loft character, expressive textures, metal, concrete and contrast.", specialty: "industrial" },
        { label: "Japandi", value: values.styles[4], description: "Japanese restraint combined with Scandinavian warmth.", specialty: "minimalist" },
        { label: "Contemporary", value: values.styles[5], description: "Current forms, refined details and a balanced material palette.", specialty: "contemporary" },
        { label: "Mid-century modern", value: values.styles[6], description: "Clean lines, warm wood, vintage references and functional furniture.", specialty: "mid-century" },
        { label: "Art Deco", value: values.styles[7], description: "Geometry, noble materials, symmetry and elegant accents.", specialty: "art deco" },
        { label: "Mediterranean", value: values.styles[8], description: "Sun-washed colours, stone, plaster, wood and relaxed textures.", specialty: "mediterranean" },
        { label: "Bohemian", value: values.styles[9], description: "Layered textiles, personal pieces, colour and individual character.", specialty: "bohemian" },
        { label: "Eclectic", value: values.styles[10], description: "A deliberate mix of eras, colours, art and custom pieces.", specialty: "eclectic" },
        { label: "Rustic / organic", value: values.styles[11], description: "Natural stone, aged wood, craftsmanship and earthy warmth.", specialty: "rustic" },
        { label: "Traditional", value: values.styles[12], description: "Classic proportions, fine joinery and familiar forms.", specialty: "traditional" },
        { label: "Contemporary luxury", value: values.styles[13], description: "Bespoke joinery, premium stone, lighting and meticulous detailing.", specialty: "luxury" },
        { label: "I am not sure yet", value: values.styles[14], description: "I want ArchiCompass to help me name the direction." },
      ],
      scopes: [
        { label: "Consultation", value: values.scopes[0], description: "A focused meeting that helps avoid costly mistakes." },
        { label: "Concept design", value: values.scopes[1], description: "Moodboard, functional layout, materials and priorities." },
        { label: "Technical design", value: values.scopes[2], description: "Drawings, specifications and details ready for contractors." },
        { label: "End-to-end support", value: values.scopes[3], description: "Design, purchasing, coordination and support during delivery." },
      ],
      budgets: [
        { label: "Up to 50,000 PLN", value: values.budgets[0], description: "One room, furnishings, or a small, tightly scoped renovation." },
        { label: "50,000-100,000 PLN", value: values.budgets[1], description: "Several rooms or a small apartment with a controlled scope." },
        { label: "100,000-200,000 PLN", value: values.budgets[2], description: "A major apartment renovation or a comprehensive smaller interior." },
        { label: "200,000-400,000 PLN", value: values.budgets[3], description: "A complete apartment or house interior with bespoke elements." },
        { label: "400,000-800,000 PLN", value: values.budgets[4], description: "A larger house, premium materials and an extensive delivery scope." },
        { label: "Over 800,000 PLN", value: values.budgets[5], description: "A substantial investment or premium design-and-delivery project." },
        { label: "I am not sure yet", value: values.budgets[6], description: "I need a designer's help setting a realistic overall budget." },
      ],
      timelines: [
        { label: "As soon as possible", value: values.timelines[0], description: "I can speak with available designers now." },
        { label: "In 1-3 months", value: values.timelines[1], description: "I am preparing decisions and want to shortlist designers soon." },
        { label: "In 3-6 months", value: values.timelines[2], description: "I am planning ahead before the project begins." },
        { label: "I am just exploring", value: values.timelines[3], description: "I want to structure my needs before choosing a timeline." },
      ],
      propertyStatuses: [
        { label: "New apartment or house", value: values.propertyStatuses[0], description: "A new property before handover or fit-out works." },
        { label: "Existing interior", value: values.propertyStatuses[1], description: "An occupied, furnished, or previously finished property." },
        { label: "Renovation in progress", value: values.propertyStatuses[2], description: "Works have started, but design decisions are still needed." },
        { label: "Property not purchased yet", value: values.propertyStatuses[3], description: "I am planning before choosing or taking over a property." },
      ],
      visualizationNeeds: [
        { label: "I do not need them", value: values.visualizationNeeds[0], description: "Plans, material samples, or a moodboard are enough." },
        { label: "Selected rooms", value: values.visualizationNeeds[1], description: "I want realistic views of the key rooms." },
        { label: "The whole project", value: values.visualizationNeeds[2], description: "I need 3D visualisations for the full project." },
        { label: "I am not sure yet", value: values.visualizationNeeds[3], description: "I want the designer to advise on the right scope." },
      ],
      supervisionNeeds: [
        { label: "I do not need it", value: values.supervisionNeeds[0], description: "I only need the design and documentation." },
        { label: "Consultations / site visits", value: values.supervisionNeeds[1], description: "Periodic checks and help with on-site decisions." },
        { label: "Author's supervision", value: values.supervisionNeeds[2], description: "The designer ensures the execution follows the design." },
        { label: "Full delivery coordination", value: values.supervisionNeeds[3], description: "I need active coordination of contractors, orders and deliveries." },
      ],
      visualCues: [
        { label: "Natural wood", value: values.visualCues[0], description: "Oak, veneer, visible grain and warm materials.", specialty: "eco-friendly" },
        { label: "Bright neutral palette", value: values.visualCues[1], description: "White, beige, greige and soft daylight.", specialty: "minimalist" },
        { label: "Hidden storage", value: values.visualCues[2], description: "Built-ins, clean lines and less visual clutter." },
        { label: "Bold colour accents", value: values.visualCues[3], description: "Strong wall colours, art, textiles and confident contrast." },
        { label: "Dark contrast", value: values.visualCues[4], description: "Black details, moody interiors and strong geometry.", specialty: "industrial" },
        { label: "Luxury details", value: values.visualCues[5], description: "Stone, brass, bespoke joinery and premium finishes.", specialty: "luxury" },
        { label: "Eco-conscious materials", value: values.visualCues[6], description: "Natural, durable materials with a lower environmental impact.", specialty: "eco-friendly" },
        { label: "Smart home", value: values.visualCues[7], description: "Lighting scenes, automation and integrated technology.", specialty: "smart home" },
        { label: "Compact-space solutions", value: values.visualCues[8], description: "Smart use of space, flexible furniture and storage." },
        { label: "Soft curves", value: values.visualCues[9], description: "Rounded furniture, calm forms and gentle lines." },
      ],
      roomTypeLabels: { "Living room": "Living room", Kitchen: "Kitchen", Bedroom: "Bedroom", Bathroom: "Bathroom", "Home office": "Home office", "Children's room": "Children's room", "Hall / storage": "Hall / storage", Other: "Other" },
    },
    ui: {
      defaultLocation: "Warsaw", notProvided: "Not provided", none: "None", notSelected: "Not selected",
      stylesHint: "Choose one or several directions, up to four. Combining styles is natural and helps us match you with the right designer.",
      confidence: { high: "high", medium: "medium", low: "low" },
      hero: { eyebrow: "AI Project Compass", title: "Turn an unfinished idea into a clear project brief", body: "Style matters, but a strong match also depends on the scope, budget, type of interior, reference photos, timeline and support you need.", insightTitle: "Why this works better", insightBody: "Instead of asking you to guess a style name, ArchiCompass structures the information a designer needs to see whether the project fits their expertise." },
      steps: {
        projectType: "1. What are you planning?", space: "2. Tell us about the space", spaceBody: "Approximate details are enough. They help designers estimate the scope before the first conversation.", area: "Area, m²", areaPlaceholder: "e.g. 72", roomsCount: "Number of rooms", roomsCountPlaceholder: "e.g. 3", roomsIncluded: "Rooms included in the project", propertyStatus: "3. What is the property status?", goal: "4. What do you need most?", photos: "5. Add reference photos", photosBody: "Add 4-10 photos of interiors, details or moods you like. The preview stays in this browser until you run the analysis or save the brief. Saved files are added to your private brief.", photoLimit: "Photo limit reached", photoLimitReached: "Photo limit reached", addPhotos: "Add reference photos", photoTypes: "JPEG, PNG or WebP. Add several photos to make shared visual patterns easier to identify.", removePhoto: "Remove", noPhotos: "No photos have been added yet. Start with the images that best capture the mood, material, lighting or detail you want.", aiTitle: "Photo style analysis", aiBody: "ArchiCompass will analyse the photos and suggest a style name, materials, colours and cues that help you choose a designer.", analyzing: "Analysing...", analyze: "Analyse photos", aiPrivacyBefore: "Running the analysis sends up to", privacy: "Privacy Policy", aiPrivacyAfter: "photos to the AI service provider. Do not upload photos of people, addresses, or confidential information.", manyPhotos: (count) => `The AI analysis will use the first ${count} photos to keep the result fast and focused. All photos can still be saved with the brief.`, suggestedStyle: "Suggested style", confidencePrefix: "confidence:", closestDirection: "Closest direction", colors: "Colours", materials: "Materials", styleClues: "Style clues", tooLittleData: "Not enough information", describeNeeds: "How to describe your needs to a designer", watchOuts: "What to keep in mind", analysisUnavailable: "AI analysis is unavailable", visualCues: "What do these photos have in common?", style: "6. Which directions feel closest to you?", scope: "7. What kind of help do you need?", budget: "8. Total investment budget (designer + materials + works)", timeline: "9. When would you like to begin?", visualization: "10. Do you need 3D visualisations?", supervision: "11. What level of supervision do you need?",
      },
      location: "Location", locationPlaceholder: "Warsaw, Krakow, Gdansk...", notes: "Additional information", notesPlaceholder: "Children, rental, timing, contractor...", ready: "Ready?", readyBody: "Save the brief, open your matched designers straight away, or copy the text to use outside the platform.", designerOnly: "As a designer, you can use the AI analysis and preview the matches, but saving and sending a client brief is unavailable.", saveAndFind: "Save brief and find designers", saving: "Saving brief...", viewMatches: "View matches without saving", copyBrief: "Copy brief", briefCopied: "Brief copied",
      brief: {
        title: "Your brief", goal: "Goal", area: "Area", rooms: "Rooms", property: "Property", style: "Style", photos: "Photos", visualCues: "Visual cues", support: "Support", budget: "Budget", timeline: "Timeline", visualization: "3D", supervision: "Supervision", nextStep: "Recommended next step", designerTip: "Tip for choosing a designer", designerTipBody: (cue, scope) => `Look for portfolios with cues such as ${cue.toLowerCase()} and ask whether the designer offers ${scope.toLowerCase()}.`, designerNoticeTitle: "You are signed in as a designer", designerNoticeBody: "AI photo analysis, style guidance, copying and match previews remain available. A designer account cannot save or send client briefs.", saveForLater: "Save for later", savedTitle: "Brief saved", savedBody: (count) => `Saved ${count} reference ${count === 1 ? "photo" : "photos"}. The brief is ready to send to a designer.`, openSavedBriefs: "Open saved briefs", saveFailed: "Could not save the brief", mobileMatches: "View matched designers", mobileSaveAndFind: "Save and find designers", mobileSaving: "Saving...", mobileCopied: "Copied", mobileCopy: "Copy",
      },
      draft: {
        investment: (value) => `Project type: ${value}`, goal: (value) => `Main goal: ${value}`, area: (value) => `Area: ${value}`, roomCount: (value) => `Number of rooms: ${value}`, rooms: (value) => `Rooms: ${value}`, propertyStatus: (value) => `Property status: ${value}`, style: (value) => `Style direction: ${value}`, photos: (count, names) => `Reference photos: ${count} uploaded (${names})`, noPhotos: "Reference photos: none added yet", analysis: (style, confidence) => `AI style analysis: ${style} (confidence: ${confidence})`, analysisSummary: (value) => `AI summary: ${value}`, palette: (value) => `AI colour palette: ${value}`, materials: (value) => `AI materials: ${value}`, designerTip: (value) => `Guidance for choosing a designer: ${value}`, visualCues: (value) => `Visual cues: ${value}`, scope: (value) => `Support needed: ${value}`, budget: (value) => `Total investment budget: ${value}`, timeline: (value) => `Target timeline: ${value}`, visualization: (value) => `3D visualisations: ${value}`, supervision: (value) => `Supervision: ${value}`, location: (value) => `Location: ${value}`, notes: (value) => `Additional information: ${value}`,
      },
      nextSteps: { consultation: "Book one focused consultation and use this brief to discuss real needs from the start.", endToEnd: "Choose 2-3 designers with an extensive portfolio and ask about their process, availability and delivery support.", clarify: "Start with a concept design before commissioning technical documentation or making renovation decisions.", default: "Compare designers through similar projects, then send this brief as your first message." },
      share: { fallbackSummary: "A coherent interior direction identified from your reference photos.", imageLoadError: "Could not prepare a reference photo.", canvasError: "This browser cannot create the result image.", canvasTitle: "AI INTERIOR STYLE CHECK", canvasStyle: "YOUR INTERIOR STYLE", canvasPalette: "PALETTE", canvasMaterials: "MATERIALS", canvasDesignerFit: "DESIGNER FIT", canvasFooter: "Add 4 photos. Receive a brief ready for a designer.", defaultFileName: "interior-style", captionStyle: (style, confidence) => `My interior style is ${style} (${confidence.toLowerCase()} confidence).`, captionDesignerFit: (value) => `Designer fit: ${value}`, captionCta: "Add your inspirations and receive a brief ready for a designer with ArchiCompass.", downloadSuccess: "The PNG file has been downloaded. You can share it in a story, post, or message.", downloadError: "Could not download the result.", shareTitle: (style) => `My interior style: ${style}`, shareSuccess: "The result has been shared.", shareLinkSuccess: "The result link has been shared. Download the PNG to send the visual card.", shareFallbackSuccess: "The text was copied and the PNG file downloaded.", shareError: "Could not share the result.", captionSuccess: "The caption was copied. You can paste it into a post or message.", captionError: "Could not copy the caption.", eyebrow: "Ready to share", title: "Your ArchiCompass style card", body: "Download a vertical PNG or share it from your phone. The card uses the first four reference photos.", preparing: "Preparing...", share: "Share result", creating: "Creating PNG...", download: "Download PNG", copying: "Copying...", copied: "Caption copied", copy: "Copy caption", cardTitle: "AI interior style analysis", imageAlt: (index, name) => `Style inspiration ${index}: ${name}`, palette: "Palette", materials: "Materials", designerFit: "Designer fit", footer: "Add 4 photos. Receive a brief ready for a designer.", createdWith: "Created with ArchiCompass" },
      errors: { copy: "Could not copy the brief.", noPhotos: "Add at least one reference photo before starting the AI analysis.", analysis: "Could not complete the AI style analysis.", save: "Could not save the brief." },
    },
  },
};

export function getProjectCompassCopy(locale: SiteLocale = siteLocale) {
  return projectCompassCopy[locale];
}
