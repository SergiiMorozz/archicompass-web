import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type HomeCopy = {
  metadata: { title: string; description: string };
  hero: {
    eyebrow: string;
    headline: string;
    lead: string[];
    body: string;
    primaryCta: string;
    secondaryCta: string;
    designerCta: string;
    benefits: string[];
  };
  metrics: { designers: string; projects: string; reviews: string; caption: string };
  howItWorks: {
    eyebrow: string;
    headline: string;
    body: string;
    steps: Array<{ number: string; title: string; body: string }>;
  };
  matching: { title: string; body: string; cta: string };
  aiProjectCompass: {
    eyebrow: string;
    headline: string;
    body: string;
    signals: string[];
    cta: string;
    inspirationLabels: string[];
    imageAlt: string[];
    analysedByAi: string;
    imageSummary: string;
    paletteAriaLabel: string;
    designerMatching: string;
    aiConclusion: string;
    example: {
      eyebrow: string;
      status: string;
      style: string;
      summary: string;
      items: [string, string][];
    };
  };
  latestProjects: {
    eyebrow: string;
    headline: string;
    cta: string;
    emptyTitle: string;
    emptyBody: string;
    fallbackCategory: string;
    fallbackTitle: string;
  };
  inspirationHub: {
    eyebrow: string;
    headline: string;
    body: string;
    cta: string;
    readCta: string;
    emptyTitle: string;
    emptyCta: string;
  };
  forDesigners: { eyebrow: string; headline: string; body: string; cta: string };
  projectCategories: Record<string, string>;
};

export type SiteCopy = {
  locale: SiteLocale;
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    category: string;
    organizationDescription: string;
  };
  header: {
    nav: Array<{ href: string; label: string; featured?: boolean }>;
    languageSwitch: string;
    messages: string;
    account: string;
    workspaceTitle: string;
    clientWorkspace: string;
    designerStudio: string;
    admin: string;
    accountSettings: string;
    menuLabel: string;
    userPanel: string;
    signIn: string;
    join: string;
  };
  footer: {
    brandDescription: string;
    company: string;
    navigationTitle: string;
    popularLocationsTitle: string;
    legalTitle: string;
    copyright: string;
    navigation: Array<{ href: string; label: string }>;
    locations: Array<{ href: string; label: string }>;
    privacy: string;
    terms: string;
    cookies: string;
    contact: string;
  };
  home: HomeCopy;
};

const sharedCompany = "SM Advisory, Sergii Moroz · NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska";

const pl: SiteCopy = {
  locale: "pl",
  seo: {
    defaultTitle: "Katalog projektantów wnętrz z pomocą AI",
    defaultDescription: "Znajdź projektantów wnętrz i pracownie projektowe według lokalizacji, stylu, usług i portfolio. Zamień zdjęcia inspiracji w precyzyjny brief z pomocą AI.",
    category: "Platforma projektowania wnętrz",
    organizationDescription: "Platforma wspierana przez AI, która pomaga znaleźć projektantów wnętrz i pracownie projektowe.",
  },
  header: {
    nav: [
      { href: "/", label: "Strona główna" },
      { href: "/project-compass", label: "AI Project Compass", featured: true },
      { href: "/designers", label: "Katalog Projektantów" },
      { href: "/inspiration", label: "Inspiration Hub" },
    ],
    languageSwitch: "EN",
    messages: "Wiadomości",
    account: "Konto",
    workspaceTitle: "Twoje strefy",
    clientWorkspace: "Strefa klienta",
    designerStudio: "Studio projektanta",
    admin: "Admin",
    accountSettings: "Ustawienia konta",
    menuLabel: "Otwórz lub zamknij menu",
    userPanel: "Panel użytkownika",
    signIn: "Zaloguj się",
    join: "Dołącz",
  },
  footer: {
    brandDescription: "Zamień inspiracje w precyzyjny brief projektowy, a następnie znajdź projektantów i architektów dopasowanych do Twojej inwestycji.",
    company: `Platforma prowadzona przez ${sharedCompany}`,
    navigationTitle: "Nawigacja",
    popularLocationsTitle: "Popularne lokalizacje",
    legalTitle: "Informacje prawne",
    copyright: "© 2026 ArchiCompass. Wszelkie prawa zastrzeżone.",
    navigation: [
      { href: "/", label: "Strona główna" },
      { href: "/project-compass", label: "AI Project Compass" },
      { href: "/designers", label: "Katalog Projektantów" },
      { href: "/inspiration", label: "Inspiration Hub" },
      { href: "/get-started", label: "Dołącz do ArchiCompass" },
    ],
    locations: [
      { href: "/interior-designers/poland/warsaw", label: "Projektanci w Warszawie" },
      { href: "/interior-designers/poland/krakow", label: "Projektanci w Krakowie" },
      { href: "/interior-designers/poland/wroclaw", label: "Projektanci we Wrocławiu" },
      { href: "/interior-designers/poland/gdansk", label: "Projektanci w Gdańsku" },
    ],
    privacy: "Polityka prywatności",
    terms: "Regulamin",
    cookies: "Polityka plików cookie",
    contact: "Kontakt",
  },
  home: {
    metadata: {
      title: "Katalog Projektantów wnętrz z pomocą AI",
      description: "Znajdź projektantów wnętrz i pracownie projektowe według lokalizacji, stylu, usług i portfolio. Stwórz precyzyjny brief na podstawie zdjęć inspiracji.",
    },
    hero: {
      eyebrow: "AI Project Compass",
      headline: "Inteligentne dopasowanie projektanta wnętrz z wykorzystaniem AI",
      lead: ["Znajdź projektanta idealnie dopasowanego do Twojej inwestycji.", "Zamień zdjęcia inspiracji w profesjonalny brief projektowy."],
      body: "AI rozpozna Twój styl i zarekomenduje projektantów najlepiej dopasowanych do zakresu prac, budżetu, estetyki oraz charakteru inwestycji.",
      primaryCta: "Poznaj swój styl i znajdź projektanta z AI",
      secondaryCta: "Katalog projektantów",
      designerCta: "Jesteś projektantem lub architektem? Utwórz swój profil",
      benefits: ["Sprawdzone portfolio", "Bezpośredni kontakt", "Bezpłatny start"],
    },
    metrics: { designers: "Projektanci i pracownie", projects: "Opublikowane realizacje", reviews: "Połączone opinie Google", caption: "Aktualne dane platformy" },
    howItWorks: {
      eyebrow: "Jak to działa",
      headline: "Od zapisanych inspiracji do konkretnej pierwszej rozmowy.",
      body: "ArchiCompass łączy Twój gust wizualny z informacjami, których projektant naprawdę potrzebuje: zakresem prac, typem pomieszczeń, budżetem, terminem, oczekiwanymi usługami i etapem inwestycji.",
      steps: [
        { number: "01", title: "Dodaj inspiracje", body: "Prześlij zdjęcia wnętrz, detali, materiałów i nastroju, który Ci się podoba. AI rozpozna wspólne cechy i kierunek stylistyczny." },
        { number: "02", title: "AI analizuje styl i tworzy brief", body: "AI wskazuje wspólne cechy inspiracji, a Ty uzupełniasz metraż, pomieszczenia, budżet, termin i oczekiwany zakres współpracy." },
        { number: "03", title: "Otrzymaj trafne dopasowania", body: "Otrzymujesz projektantów dopasowanych do stylu, zakresu, budżetu, lokalizacji i charakteru inwestycji - z portfolio, które możesz od razu porównać." },
      ],
    },
    matching: { title: "Precyzyjne dopasowanie zamiast przypadkowego szukania", body: "Z całej bazy projektantów w Polsce otrzymujesz osoby najlepiej dopasowane do Twojego stylu, zakresu prac, budżetu i lokalizacji.", cta: "Zacznij z AI" },
    aiProjectCompass: {
      eyebrow: "AI Project Compass",
      headline: "Z inspiracji powstaje konkretny kierunek.",
      body: "AI odczytuje wspólne cechy zdjęć i zamienia je w styl, paletę, materiały oraz wskazówki, które pomagają wybrać właściwego projektanta.",
      signals: ["Styl i paleta", "Sygnały do dopasowania"],
      cta: "Zobacz swój wynik AI",
      inspirationLabels: ["Inspiracja 01", "Inspiracja 02", "Inspiracja 03"],
      imageAlt: ["Przykładowa inspiracja wnętrza w naturalnym, ciepłym stylu", "Druga inspiracja do analizy stylu wnętrza", "Trzecia inspiracja do analizy stylu wnętrza"],
      analysedByAi: "Analizowane przez AI",
      imageSummary: "AI rozpoznaje światło, materiały i proporcje.",
      paletteAriaLabel: "Przykładowa paleta kolorów",
      designerMatching: "Dopasowanie projektantów",
      aiConclusion: "Wniosek AI:",
      example: {
        eyebrow: "Przykładowy wynik analizy",
        status: "Gotowe do briefu",
        style: "Ciepłe japandi",
        summary: "Twoje inspiracje łączą jasne drewno, miękkie światło i spokojne proporcje. Szukaj projektanta, który pracuje z naturalnymi materiałami i zabudowami na wymiar.",
        items: [["Paleta", "Krem, glina, ciepły dąb"], ["Materiały", "Jasne drewno, len, kamień"], ["Nastrój", "Spokojny, naturalny, uporządkowany"], ["Profil projektanta", "Wnętrza mieszkalne, zabudowy na wymiar, naturalne wykończenia"]],
      },
    },
    latestProjects: { eyebrow: "Najnowsze realizacje", headline: "Projekty w ArchiCompass", cta: "Zobacz wszystkich specjalistów", emptyTitle: "Pierwsze publiczne projekty pojawią się tutaj.", emptyBody: "Każdy opublikowany projekt automatycznie zaktualizuje licznik powyżej.", fallbackCategory: "Projekt wnętrza", fallbackTitle: "Projekt bez tytułu" },
    inspirationHub: { eyebrow: "Inspiration Hub", headline: "Inspiracje, które pomagają podejmować lepsze decyzje projektowe.", body: "Poznaj praktyczne poradniki o stylach, materiałach, planowaniu przestrzeni, remoncie i zrównoważonych wnętrzach. Zapisuj wybrane artykuły w strefie klienta.", cta: "Odkryj Inspiration Hub", readCta: "Czytaj artykuł", emptyTitle: "Przygotowujemy pierwsze poradniki i inspiracje.", emptyCta: "Otwórz Inspiration Hub" },
    forDesigners: { eyebrow: "Dla projektantów i pracowni", headline: "Pokaż najlepsze realizacje. Otrzymuj bardziej dopasowane zapytania.", body: "Utwórz publiczne portfolio, połącz opinie Google i zarządzaj uporządkowanymi briefami w jednym miejscu.", cta: "Dołącz jako specjalista" },
    projectCategories: { Apartment: "Mieszkanie", House: "Dom", Loft: "Loft", Hospitality: "Hotelarstwo i gastronomia", "Rental property": "Nieruchomość na wynajem", Kitchen: "Kuchnia", "Dining room": "Jadalnia", "Home office": "Gabinet domowy", Bedroom: "Sypialnia", Penthouse: "Penthouse", Office: "Biuro" },
  },
};

const en: SiteCopy = {
  locale: "en",
  seo: {
    defaultTitle: "Interior designer directory with AI matching",
    defaultDescription: "Find interior designers and design studios by location, style, services, and portfolio. Turn inspiration photos into a precise AI-assisted project brief.",
    category: "Interior design platform",
    organizationDescription: "An AI-assisted platform for finding interior designers and design studios.",
  },
  header: {
    nav: [
      { href: "/", label: "Home" },
      { href: "/project-compass", label: "AI Project Compass", featured: true },
      { href: "/designers", label: "Designer Directory" },
      { href: "/inspiration", label: "Inspiration Hub" },
    ],
    languageSwitch: "PL",
    messages: "Messages",
    account: "Account",
    workspaceTitle: "Your workspaces",
    clientWorkspace: "Client workspace",
    designerStudio: "Designer Studio",
    admin: "Admin",
    accountSettings: "Account settings",
    menuLabel: "Open or close menu",
    userPanel: "Your account",
    signIn: "Sign in",
    join: "Join",
  },
  footer: {
    brandDescription: "Turn inspiration into a precise project brief, then find designers and architects suited to your project.",
    company: `Platform operated by ${sharedCompany}`,
    navigationTitle: "Navigation",
    popularLocationsTitle: "Popular locations",
    legalTitle: "Legal information",
    copyright: "© 2026 ArchiCompass. All rights reserved.",
    navigation: [
      { href: "/", label: "Home" },
      { href: "/project-compass", label: "AI Project Compass" },
      { href: "/designers", label: "Designer Directory" },
      { href: "/inspiration", label: "Inspiration Hub" },
      { href: "/get-started", label: "Join ArchiCompass" },
    ],
    locations: [
      { href: "/interior-designers/poland/warsaw", label: "Designers in Warsaw" },
      { href: "/interior-designers/poland/krakow", label: "Designers in Krakow" },
      { href: "/interior-designers/poland/wroclaw", label: "Designers in Wroclaw" },
      { href: "/interior-designers/poland/gdansk", label: "Designers in Gdansk" },
    ],
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    cookies: "Cookie Policy",
    contact: "Contact",
  },
  home: {
    metadata: {
      title: "Interior designer directory with AI matching",
      description: "Find interior designers and design studios by location, style, services, and portfolio. Create a precise brief from your inspiration photos.",
    },
    hero: {
      eyebrow: "AI Project Compass",
      headline: "Intelligent AI-powered matching with the right interior designer.",
      lead: ["Find an interior designer precisely matched to your project.", "Turn inspiration photos into a professional project brief."],
      body: "AI recognises your style and recommends designers best suited to your scope, budget, aesthetic direction, and the character of your project.",
      primaryCta: "Explore your style and find your designer with AI",
      secondaryCta: "Designer directory",
      designerCta: "Are you a designer or architect? Create your profile",
      benefits: ["Verified portfolios", "Direct contact", "Free to start"],
    },
    metrics: { designers: "Designers and studios", projects: "Published projects", reviews: "Linked Google reviews", caption: "Live platform count" },
    howItWorks: {
      eyebrow: "How it works",
      headline: "From saved inspiration to a useful first conversation.",
      body: "ArchiCompass connects your visual taste with the information a designer really needs: scope, rooms, budget, timeline, services, and project status.",
      steps: [
        { number: "01", title: "Add inspiration", body: "Upload rooms, details, materials, and moods you like. AI recognises shared characteristics and a visual direction." },
        { number: "02", title: "AI analyses your style and creates a brief", body: "AI identifies shared cues in your inspirations, then you add area, rooms, budget, timing, and the scope of collaboration." },
        { number: "03", title: "Get relevant matches", body: "Receive designers suited to your style, scope, budget, location, and project character, with portfolios you can compare immediately." },
      ],
    },
    matching: { title: "A precise match instead of a random search", body: "From the full designer directory in Poland, you receive professionals best suited to your style, scope, budget, and location.", cta: "Start with AI" },
    aiProjectCompass: {
      eyebrow: "AI Project Compass",
      headline: "Inspiration becomes a clear direction.",
      body: "AI reads the shared characteristics of your photos and turns them into a style, palette, materials, and practical cues that help you choose the right designer.",
      signals: ["Style and palette", "Matching signals"],
      cta: "See your AI result",
      inspirationLabels: ["Inspiration 01", "Inspiration 02", "Inspiration 03"],
      imageAlt: ["Example of a natural, warm interior inspiration", "Second interior inspiration for style analysis", "Third interior inspiration for style analysis"],
      analysedByAi: "Analysed by AI",
      imageSummary: "AI recognises light, materials, and proportions.",
      paletteAriaLabel: "Example colour palette",
      designerMatching: "Designer matching",
      aiConclusion: "AI insight:",
      example: {
        eyebrow: "Example analysis result",
        status: "Ready for a brief",
        style: "Warm Japandi",
        summary: "Your inspiration combines light wood, soft light, and calm proportions. Look for a designer experienced with natural materials and custom joinery.",
        items: [["Palette", "Cream, clay, warm oak"], ["Materials", "Light wood, linen, stone"], ["Mood", "Calm, natural, considered"], ["Designer profile", "Residential interiors, custom joinery, natural finishes"]],
      },
    },
    latestProjects: { eyebrow: "Latest projects", headline: "Projects on ArchiCompass", cta: "See all specialists", emptyTitle: "The first public projects will appear here.", emptyBody: "Each published project automatically updates the live count above.", fallbackCategory: "Interior project", fallbackTitle: "Untitled project" },
    inspirationHub: { eyebrow: "Inspiration Hub", headline: "Inspiration that supports better design decisions.", body: "Explore practical guides to styles, materials, space planning, renovation, and sustainable interiors. Save the articles you want in your client workspace.", cta: "Explore Inspiration Hub", readCta: "Read article", emptyTitle: "Our first guides and inspirations are being prepared.", emptyCta: "Open Inspiration Hub" },
    forDesigners: { eyebrow: "For designers and studios", headline: "Show your best work. Receive more relevant project enquiries.", body: "Create a public portfolio, link Google reviews, and manage structured briefs in one place.", cta: "Join as a professional" },
    projectCategories: { Apartment: "Apartment", House: "House", Loft: "Loft", Hospitality: "Hospitality", "Rental property": "Rental property", Kitchen: "Kitchen", "Dining room": "Dining room", "Home office": "Home office", Bedroom: "Bedroom", Penthouse: "Penthouse", Office: "Office" },
  },
};

const contentByLocale: Record<SiteLocale, SiteCopy> = { pl, en };

export function getSiteCopy(locale: SiteLocale = siteLocale) {
  return contentByLocale[locale];
}
