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

type CountWords = {
  singular: string;
  plural: string;
  few?: string;
};

type InspirationCopy = {
  metadata: { title: string; description: string };
  breadcrumbs: { home: string; hub: string };
  hero: { title: string; subtitle: string; searchPlaceholder: string; searchButton: string };
  categoryLabels: Record<string, string>;
  newDesigners: { eyebrow: string; title: string; seeAll: string };
  latestProjects: { eyebrow: string; title: string };
  featured: {
    title: string;
    findDesignerCta: string;
    readCta: string;
    noResultsTitle: string;
    noResultsBody: string;
    noResultsCta: string;
  };
  labels: {
    designerFallback: string;
    studio: string;
    designer: string;
    portfolio: string;
    untitledProject: string;
    articleCount: CountWords;
    reviewCount: CountWords;
    querySuffix: string;
    unavailable: string;
    openArticle: string;
    editorialTeam: string;
  };
  article: {
    notFoundTitle: string;
    notFoundDescription: string;
    backToHub: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaProjectCompass: string;
    ctaDirectory: string;
  };
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
  auth: {
    metadata: { getStartedTitle: string; getStartedDescription: string };
    securityBadge: string;
    signIn: { headline: string; description: string };
    signUp: { headline: string; description: string };
    audienceCards: Array<{ title: string; description: string }>;
    getStarted: {
      title: string;
      intro: string;
      clientTitle: string;
      clientDescription: string;
      clientCta: string;
      designerTitle: string;
      designerDescription: string;
      designerCta: string;
    };
    form: {
      homeLink: string;
      signInTab: string;
      signUpTab: string;
      joinAs: string;
      client: string;
      designer: string;
      roleNotice: string;
      emailLabel: string;
      passwordLabel: string;
      passwordPlaceholder: string;
      waiting: string;
      submitClient: string;
      submitDesigner: string;
      resendSending: string;
      resend: string;
      forgotPassword: string;
      termsPrefix: string;
      terms: string;
      and: string;
      privacy: string;
      confirmationCreated: string;
      confirmationResent: string;
      errors: {
        emailRequired: string;
        passwordTooShort: string;
        invalidCredentials: string;
        emailNotConfirmed: string;
        emailRateLimit: string;
        alreadyRegistered: string;
      };
    };
  };
  inspiration: InspirationCopy;
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
  auth: {
    metadata: {
      getStartedTitle: "Dołącz do ArchiCompass jako klient lub projektant",
      getStartedDescription: "Utwórz konto ArchiCompass, aby zaplanować wnętrze, zapisywać projektantów albo opublikować profesjonalny profil i portfolio.",
    },
    securityBadge: "Bezpieczne logowanie e-mailem i hasłem",
    signIn: { headline: "Witaj ponownie w ArchiCompass", description: "Zaloguj się adresem e-mail i ustalonym hasłem. Nie potrzebujesz linku do logowania." },
    signUp: { headline: "Utwórz konto ArchiCompass", description: "Wybierz jedną rolę konta. Po rejestracji strefa klienta i studio projektanta pozostają oddzielne." },
    audienceCards: [
      { title: "Dla klientów", description: "Zapisuj briefy, porównuj projektantów i prowadź rozmowy." },
      { title: "Dla projektantów", description: "Publikuj portfolio i otrzymuj zapytania od klientów." },
    ],
    getStarted: {
      title: "Dołącz do ArchiCompass",
      intro: "Wybierz właściwą ścieżkę i utwórz konto za pomocą adresu e-mail oraz hasła.",
      clientTitle: "Planuję projekt wnętrza",
      clientDescription: "Zapisuj projektantów i realizacje, przygotuj brief oraz prowadź rozmowy w jednym miejscu.",
      clientCta: "Kontynuuj jako klient",
      designerTitle: "Jestem projektantem",
      designerDescription: "Zarządzaj profilem, portfolio, zapytaniami od klientów, rozmowami i wynikami w Studio projektanta.",
      designerCta: "Kontynuuj jako specjalista",
    },
    form: {
      homeLink: "Przejdź do strony głównej",
      signInTab: "Zaloguj się",
      signUpTab: "Utwórz konto",
      joinAs: "Dołączam jako",
      client: "Klient",
      designer: "Projektant",
      roleNotice: "Jeden adres e-mail ma jedną rolę. Projektanci otrzymują briefy, a klienci je wysyłają.",
      emailLabel: "Adres e-mail",
      passwordLabel: "Hasło",
      passwordPlaceholder: "Co najmniej 8 znaków",
      waiting: "Proszę czekać...",
      submitClient: "Utwórz konto: klient",
      submitDesigner: "Utwórz konto: projektant",
      resendSending: "Wysyłanie...",
      resend: "Wyślij link ponownie",
      forgotPassword: "Nie pamiętasz hasła?",
      termsPrefix: "Tworząc konto, akceptujesz",
      terms: "Regulamin",
      and: "i",
      privacy: "Politykę prywatności",
      confirmationCreated: "Konto zostało utworzone. Otwórz wiadomość potwierdzającą e-mail - po potwierdzeniu przejdziesz od razu do uzupełnienia profilu. Jeśli jej nie widzisz, sprawdź folder Spam lub Oferty.",
      confirmationResent: "Wysłaliśmy nowy link potwierdzający. Otwórz najnowszą wiadomość, a po potwierdzeniu przejdziesz do uzupełnienia profilu.",
      errors: {
        emailRequired: "Wpisz adres e-mail.",
        passwordTooShort: "Hasło musi mieć co najmniej 8 znaków.",
        invalidCredentials: "Nieprawidłowy adres e-mail lub hasło. Poniżej możesz zresetować hasło.",
        emailNotConfirmed: "Potwierdź adres e-mail, korzystając z linku w wiadomości rejestracyjnej. Jeśli go nie widzisz, wyślij link ponownie.",
        emailRateLimit: "Wysłano zbyt wiele wiadomości. Odczekaj kilka minut i spróbuj ponownie.",
        alreadyRegistered: "Konto z tym adresem e-mail już istnieje. Zaloguj się lub zresetuj hasło.",
      },
    },
  },
  inspiration: {
    metadata: {
      title: "Inspiracje wnętrzarskie i praktyczne poradniki",
      description: "Poznaj inspiracje wnętrzarskie, poradniki, materiały i praktyczne wskazówki. Zapisuj pomysły i zamieniaj je w konkretny brief projektowy.",
    },
    breadcrumbs: { home: "Strona główna", hub: "Inspiration Hub" },
    hero: {
      title: "Inspiration Hub",
      subtitle: "Odkrywaj praktyczne porady, materiały, wnętrza i pomysły przygotowane przez redakcję ArchiCompass.",
      searchPlaceholder: "Szukaj artykułów i inspiracji...",
      searchButton: "Szukaj",
    },
    categoryLabels: { All: "Wszystkie", Inspiration: "Inspiracje", Trends: "Trendy", Guides: "Poradniki", Materials: "Materiały", Rooms: "Pomieszczenia", Sustainability: "Zrównoważone wnętrza" },
    newDesigners: { eyebrow: "Nowości w ArchiCompass", title: "Projektanci, którzy niedawno dołączyli", seeAll: "Zobacz wszystkich" },
    latestProjects: { eyebrow: "Najnowsze realizacje", title: "Nowe projekty od projektantów" },
    featured: {
      title: "Polecane inspiracje",
      findDesignerCta: "Otwórz Katalog Projektantów",
      readCta: "Czytaj artykuł",
      noResultsTitle: "Nie znaleziono artykułów",
      noResultsBody: "Spróbuj innego wyszukiwania lub wróć do wszystkich inspiracji.",
      noResultsCta: "Zobacz wszystkie artykuły",
    },
    labels: {
      designerFallback: "Projektant wnętrz",
      studio: "Pracownia projektowa",
      designer: "Projektant wnętrz",
      portfolio: "Portfolio",
      untitledProject: "Projekt bez tytułu",
      articleCount: { singular: "artykuł", few: "artykuły", plural: "artykułów" },
      reviewCount: { singular: "opinia", few: "opinie", plural: "opinii" },
      querySuffix: "dla zapytania",
      unavailable: "Treści inspiracyjne są chwilowo niedostępne.",
      openArticle: "Otwórz artykuł",
      editorialTeam: "Redakcja ArchiCompass",
    },
    article: {
      notFoundTitle: "Nie znaleziono artykułu",
      notFoundDescription: "Ten artykuł nie jest dostępny.",
      backToHub: "Wróć do Inspiration Hub",
      ctaEyebrow: "Zamień pomysły w projekt",
      ctaTitle: "Stwórz brief na podstawie swoich inspiracji",
      ctaProjectCompass: "Otwórz AI Project Compass",
      ctaDirectory: "Znajdź projektantów",
    },
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
  auth: {
    metadata: {
      getStartedTitle: "Join ArchiCompass as a client or designer",
      getStartedDescription: "Create an ArchiCompass account to plan your interior, save designers, or publish a professional profile and portfolio.",
    },
    securityBadge: "Secure sign-in with email and password",
    signIn: { headline: "Welcome back to ArchiCompass", description: "Sign in with your email address and password. You do not need a magic link." },
    signUp: { headline: "Create your ArchiCompass account", description: "Choose one account role. After registration, the client workspace and designer studio stay separate." },
    audienceCards: [
      { title: "For clients", description: "Save briefs, compare designers, and keep your conversations in one place." },
      { title: "For designers", description: "Publish a portfolio and receive enquiries from clients." },
    ],
    getStarted: {
      title: "Join ArchiCompass",
      intro: "Choose the right path and create an account with your email address and password.",
      clientTitle: "I am planning an interior project",
      clientDescription: "Save designers and projects, create a brief, and manage conversations in one place.",
      clientCta: "Continue as a client",
      designerTitle: "I am a designer",
      designerDescription: "Manage your profile, portfolio, client enquiries, conversations, and results in Designer Studio.",
      designerCta: "Continue as a professional",
    },
    form: {
      homeLink: "Go to the homepage",
      signInTab: "Sign in",
      signUpTab: "Create account",
      joinAs: "I am joining as",
      client: "Client",
      designer: "Designer",
      roleNotice: "One email address has one role. Designers receive briefs and clients send them.",
      emailLabel: "Email address",
      passwordLabel: "Password",
      passwordPlaceholder: "At least 8 characters",
      waiting: "Please wait...",
      submitClient: "Create account: client",
      submitDesigner: "Create account: designer",
      resendSending: "Sending...",
      resend: "Resend confirmation link",
      forgotPassword: "Forgot your password?",
      termsPrefix: "By creating an account, you accept the",
      terms: "Terms of Service",
      and: "and the",
      privacy: "Privacy Policy",
      confirmationCreated: "Your account has been created. Open the email confirmation message and you will go directly to complete your profile. If you cannot see it, check Spam or Promotions.",
      confirmationResent: "We sent a new confirmation link. Open the newest email, then you will go directly to complete your profile.",
      errors: {
        emailRequired: "Enter your email address.",
        passwordTooShort: "Your password must be at least 8 characters.",
        invalidCredentials: "Incorrect email address or password. You can reset your password below.",
        emailNotConfirmed: "Confirm your email address using the link in the registration email. If you cannot see it, send the link again.",
        emailRateLimit: "Too many emails have been sent. Wait a few minutes and try again.",
        alreadyRegistered: "An account with this email address already exists. Sign in or reset your password.",
      },
    },
  },
  inspiration: {
    metadata: {
      title: "Interior design inspiration and practical guides",
      description: "Explore interior design inspiration, guides, materials, and practical advice. Save ideas and turn them into a clear project brief.",
    },
    breadcrumbs: { home: "Home", hub: "Inspiration Hub" },
    hero: {
      title: "Inspiration Hub",
      subtitle: "Explore practical advice, materials, interiors, and ideas curated by the ArchiCompass editorial team.",
      searchPlaceholder: "Search articles and inspiration...",
      searchButton: "Search",
    },
    categoryLabels: { All: "All", Inspiration: "Inspiration", Trends: "Trends", Guides: "Guides", Materials: "Materials", Rooms: "Rooms", Sustainability: "Sustainable interiors" },
    newDesigners: { eyebrow: "New on ArchiCompass", title: "Designers who recently joined", seeAll: "See all" },
    latestProjects: { eyebrow: "Latest projects", title: "New projects from designers" },
    featured: {
      title: "Featured inspiration",
      findDesignerCta: "Open Designer Directory",
      readCta: "Read article",
      noResultsTitle: "No articles found",
      noResultsBody: "Try another search or return to all inspiration.",
      noResultsCta: "See all articles",
    },
    labels: {
      designerFallback: "Interior designer",
      studio: "Design studio",
      designer: "Interior designer",
      portfolio: "Portfolio",
      untitledProject: "Untitled project",
      articleCount: { singular: "article", plural: "articles" },
      reviewCount: { singular: "review", plural: "reviews" },
      querySuffix: "for",
      unavailable: "Inspiration content is temporarily unavailable.",
      openArticle: "Open article",
      editorialTeam: "ArchiCompass editorial team",
    },
    article: {
      notFoundTitle: "Article not found",
      notFoundDescription: "This article is not available.",
      backToHub: "Back to Inspiration Hub",
      ctaEyebrow: "Turn ideas into a project",
      ctaTitle: "Create a brief from your inspiration",
      ctaProjectCompass: "Open AI Project Compass",
      ctaDirectory: "Find designers",
    },
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
