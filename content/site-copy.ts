import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type HomeCopy = {
  metadata: { title: string; description: string };
  accessibility: {
    articleImage: (title: string) => string;
    heroImage: string;
    inspirationImages: [string, string, string, string, string];
    professionalImage: (name: string) => string;
    skipToMain: string;
  };
  hero: {
    badge: string;
    headline: string;
    accentHeadline: string;
    body: string;
    checklist: string[];
    primaryCta: string;
    secondaryCta: string;
    reassurance: string;
    visual: {
      tag: string;
      directionLabel: string;
      styleValue: string;
      paletteLabel: string;
      materialsLabel: string;
      materialsValue: string;
      matchLabel: string;
      matchValue: string;
      briefLabel: string;
      briefValue: string;
      professionalLabel: string;
      professionalValue: string;
      professionalSubtitle: string;
      cta: string;
    };
  };
  trust: {
    items: Array<{ icon: string; title: string; body: string }>;
  };
  howItWorks: {
    eyebrow: string;
    headline: string;
    body: string;
    cta: string;
    secondaryCta: string;
    stepOne: { number: string; title: string; body: string; note: string };
    stepTwo: {
      number: string;
      badge: string;
      title: string;
      body: string;
      preview: {
        styleLabel: string;
        styleValue: string;
        paletteLabel: string;
        paletteValue: string;
        materialsLabel: string;
        materialsValue: string;
        moodLabel: string;
        moodValue: string;
        summaryLabel: string;
        summaryValue: string;
        briefScopeLabel: string;
        briefScopeValue: string;
      };
      footer: string;
      emphasis: string;
    };
    stepThree: {
      number: string;
      title: string;
      body: string;
      matchCriteriaLabel: string;
      matchCriteria: string[];
      designers: Array<{ name: string; tag: string; location: string; match: string; mark: string }>;
    };
  };
  whyExists: {
    eyebrow: string;
    headline: string;
    body: string;
    body2: string;
    matchSentence: string;
    flow: string[];
  };
  forClients: {
    eyebrow: string;
    headline: string;
    body: string;
    checklist: string[];
    aiCompass: { badge: string; description: string; name: string; href: string };
    primaryCta: string;
    secondaryCta: string;
  };
  forDesigners: {
    eyebrow: string;
    headline: string;
    body: string;
    checklist: string[];
    aiAssistant: { badge: string; description: string; name: string; href: string };
    primaryCta: string;
    secondaryCta: string;
    pricingNote: string;
    pricingCta: string;
  };
  designerValue: {
    headline: string;
    items: Array<{ title: string; body: string; badge?: string; href?: string }>;
  };
  latestProjects: {
    eyebrow: string;
    headline: string;
    body: string;
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
  closingCta: { headline: string; body: string; primaryCta: string; secondaryCta: string };
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
  hero: { title: string; subtitle: string; searchPlaceholder: string; searchHelp: string; searchButton: string };
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
      resetPasswordCta: string;
      terms: string;
      privacy: string;
      legalConsentTitle: string;
      legalConsentBefore: string;
      legalConsentMiddle: string;
      legalConsentAfter: string;
      confirmationCreated: string;
      confirmationResent: string;
      errors: {
        emailRequired: string;
        passwordTooShort: string;
        invalidCredentials: string;
        emailNotConfirmed: string;
        emailRateLimit: string;
        alreadyRegistered: string;
        legalConsentRequired: string;
      };
    };
    passwordRecovery: {
      badge: string;
      forgotTitle: string;
      forgotDescription: string;
      emailLabel: string;
      sending: string;
      sendCta: string;
      sent: string;
      backToLogin: string;
      resetTitle: string;
      newPasswordLabel: string;
      repeatPasswordLabel: string;
      saving: string;
      saveCta: string;
      passwordTooShort: string;
      passwordsMismatch: string;
      updated: string;
      openAccount: string;
      checking: string;
      invalidTitle: string;
      invalidBody: string;
      newRequestCta: string;
    };
    onboarding: {
      welcome: string;
      titles: { choose: string; client: string; designer: string };
      intro: string;
      roleError: string;
      designerModeError: string;
      choice: {
        clientBadge: string;
        clientTitle: string;
        clientBody: string;
        clientCta: string;
        designerBadge: string;
        designerTitle: string;
        designerBody: string;
        designerCta: string;
      };
      clientPanel: {
        badge: string;
        title: string;
        body: string;
        nextStep: string;
        submit: string;
        alternative: string;
      };
      designerModes: {
        independentBadge: string;
        independentTitle: string;
        independentBody: string;
        independentCta: string;
        studioBadge: string;
        studioTitle: string;
        studioBody: string;
        studioCta: string;
        alternative: string;
      };
    };
  };
  inspiration: InspirationCopy;
  home: HomeCopy;
};

const companyDetails = "NIP 5252995634 · REGON 528006413 · ul. Grzybowska 2, lok. 31, 00-131 Warszawa, Polska";
const polishCompany = `Sergii Moroz, prowadzący działalność gospodarczą pod firmą Sergii Moroz Advisory (SM Advisory) · ${companyDetails}`;
const englishCompany = `Sergii Moroz, trading as Sergii Moroz Advisory (SM Advisory) · ${companyDetails}`;

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
      { href: "/ai-project-compass", label: "AI Project Compass", featured: true },
      { href: "/designers", label: "Katalog projektantów" },
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
    company: `Platforma prowadzona przez ${polishCompany}`,
    navigationTitle: "Nawigacja",
    popularLocationsTitle: "Popularne lokalizacje",
    legalTitle: "Informacje prawne",
    copyright: "© 2026 ArchiCompass. Wszelkie prawa zastrzeżone.",
    navigation: [
      { href: "/", label: "Strona główna" },
      { href: "/ai-project-compass", label: "AI Project Compass" },
      { href: "/designers", label: "Katalog Projektantów" },
      { href: "/inspiration", label: "Inspiration Hub" },
      { href: "/get-started", label: "Dołącz do ArchiCompass" },
    ],
    locations: [
      { href: "/projektanci-wnetrz/warsaw", label: "Projektanci w Warszawie" },
      { href: "/projektanci-wnetrz/krakow", label: "Projektanci w Krakowie" },
      { href: "/projektanci-wnetrz/wroclaw", label: "Projektanci we Wrocławiu" },
      { href: "/projektanci-wnetrz/gdansk", label: "Projektanci w Gdańsku" },
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
      resetPasswordCta: "Zresetuj hasło",
      terms: "Regulamin",
      privacy: "Polityką prywatności",
      legalConsentTitle: "Wymagane potwierdzenie",
      legalConsentBefore: "Akceptuję",
      legalConsentMiddle: "i potwierdzam, że zapoznałem/am się z",
      legalConsentAfter: ".",
      confirmationCreated: "Konto zostało utworzone. Otwórz wiadomość potwierdzającą e-mail - po potwierdzeniu przejdziesz od razu do uzupełnienia profilu. Jeśli jej nie widzisz, sprawdź folder Spam lub Oferty.",
      confirmationResent: "Wysłaliśmy nowy link potwierdzający. Otwórz najnowszą wiadomość, a po potwierdzeniu przejdziesz do uzupełnienia profilu.",
      errors: {
        emailRequired: "Wpisz adres e-mail.",
        passwordTooShort: "Hasło musi mieć co najmniej 8 znaków.",
        invalidCredentials: "Nieprawidłowy adres e-mail lub hasło. Poniżej możesz zresetować hasło.",
        emailNotConfirmed: "Potwierdź adres e-mail, korzystając z linku w wiadomości rejestracyjnej. Jeśli go nie widzisz, wyślij link ponownie.",
        emailRateLimit: "Wysłano zbyt wiele wiadomości. Odczekaj kilka minut i spróbuj ponownie.",
        alreadyRegistered: "Konto z tym adresem e-mail już istnieje. Zaloguj się lub zresetuj hasło.",
        legalConsentRequired: "Aby utworzyć konto, zaakceptuj Regulamin i potwierdź zapoznanie się z Polityką prywatności.",
      },
    },
    passwordRecovery: {
      badge: "Odzyskiwanie konta",
      forgotTitle: "Zresetuj hasło",
      forgotDescription: "Wpisz adres e-mail przypisany do konta. Link służy wyłącznie do zmiany hasła.",
      emailLabel: "Adres e-mail",
      sending: "Wysyłanie...",
      sendCta: "Wyślij wiadomość do zmiany hasła",
      sent: "Wysłaliśmy wiadomość do zmiany hasła. Otwórz ją, aby ustawić nowe hasło.",
      backToLogin: "Wróć do logowania",
      resetTitle: "Ustaw nowe hasło",
      newPasswordLabel: "Nowe hasło",
      repeatPasswordLabel: "Powtórz hasło",
      saving: "Zapisywanie...",
      saveCta: "Zapisz nowe hasło",
      passwordTooShort: "Hasło musi mieć co najmniej 8 znaków.",
      passwordsMismatch: "Hasła nie są takie same.",
      updated: "Hasło zostało zmienione. Możesz przejść do swojego konta.",
      openAccount: "Otwórz konto",
      checking: "Sprawdzanie linku...",
      invalidTitle: "Link do zmiany hasła nie jest już aktywny",
      invalidBody: "Otwórz najnowszą wiadomość z linkiem albo poproś o nowy link do zmiany hasła.",
      newRequestCta: "Wyślij nowy link",
    },
    onboarding: {
      welcome: "Witamy w ArchiCompass",
      titles: { choose: "Wybierz typ konta", client: "Skonfiguruj strefę klienta", designer: "W jaki sposób pracujesz?" },
      intro: "Najpierw wybierz rolę, a potem uzupełnij dane kontaktowe. Dzięki temu od razu trafisz do właściwej strefy platformy.",
      roleError: "Wybierz typ konta",
      designerModeError: "Wybierz sposób pracy",
      choice: {
        clientBadge: "Klient",
        clientTitle: "Planuję projekt wnętrza",
        clientBody: "Twórz briefy, zapisuj projektantów i realizacje oraz prowadź rozmowy.",
        clientCta: "Wybierz konto klienta",
        designerBadge: "Projektant",
        designerTitle: "Świadczę usługi projektowe",
        designerBody: "Opublikuj profil, zarządzaj portfolio i otrzymuj dopasowane zapytania.",
        designerCta: "Wybierz konto projektanta",
      },
      clientPanel: {
        badge: "Strefa klienta",
        title: "Wszystko, czego potrzebujesz do wyboru projektanta",
        body: "W tej strefie znajdziesz zapisane briefy, ulubionych projektantów, projekty i rozmowy. Konto klienta nie otrzymuje zapytań przeznaczonych dla projektantów.",
        nextStep: "Następny krok: uzupełnienie imienia, telefonu i lokalizacji, żeby projektanci mogli odpowiadać na briefy bez zgadywania podstawowych informacji.",
        submit: "Przejdź do uzupełnienia profilu",
        alternative: "Zamiast tego wybierz projektanta",
      },
      designerModes: {
        independentBadge: "Niezależny projektant",
        independentTitle: "Mój własny profil",
        independentBody: "Utwórz publiczny profil, portfolio, cennik i skrzynkę zapytań.",
        independentCta: "Utwórz mój profil",
        studioBadge: "Pracownia projektowa",
        studioTitle: "Utwórz zespół lub dołącz do niego",
        studioBody: "Skonfiguruj wspólny profil pracowni albo przyjmij istniejące zaproszenie do zespołu.",
        studioCta: "Kontynuuj jako pracownia",
        alternative: "Zamiast tego wybierz klienta",
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
      title: "Inspiracje wnętrzarskie i praktyczne poradniki",
      subtitle: "Odkrywaj praktyczne porady, materiały, wnętrza i pomysły przygotowane przez redakcję ArchiCompass.",
      searchPlaceholder: "Szukaj artykułów i inspiracji...",
      searchHelp: "Szukaj po tytule, temacie lub słowie kluczowym, np. „budżet remontu”, „japandi”, „brief”.",
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
      title: "Katalog projektantów wnętrz z dopasowaniem AI | ArchiCompass",
      description: "Zamień zdjęcia inspiracji w precyzyjny brief i znajdź projektantów wnętrz oraz architektów dopasowanych do Twojego projektu, budżetu i lokalizacji.",
    },
    accessibility: {
      articleImage: (title) => `Zdjęcie do artykułu „${title}”`,
      heroImage: "Jasny salon w ciepłej, naturalnej palecie z drewnianymi meblami i dużym drzewem przy oknie.",
      inspirationImages: [
        "Salon z jasną sofą, zielonym fotelem i zabudową z drewna.",
        "Moodboard z rzutem mieszkania, próbkami tkanin i drewnianymi detalami.",
        "Jasne mieszkanie z jadalnią, salonem i drewnianą zabudową.",
        "Moodboard z fotografiami wnętrz, próbkami tkanin i kamienia.",
        "Osoba analizująca plan mieszkania i próbki materiałów przy stole.",
      ],
      professionalImage: (name) => `Obraz profilu ${name}`,
      skipToMain: "Przejdź do głównej treści",
    },
    hero: {
      badge: "AI Project Compass",
      headline: "Znajdź projektanta, który zrozumie",
      accentHeadline: "Twoją wizję",
      body: "Zamień zdjęcia inspiracji w profesjonalny brief projektowy. AI pomoże rozpoznać styl i uporządkować informacje potrzebne do świadomego wyboru projektanta.",
      checklist: [
        "Dopasowanie na podstawie Twojego projektu",
        "Zweryfikowane portfolio i opinie",
        "Bezpośredni kontakt z projektantem",
        "Własny brief w jednym miejscu",
      ],
      primaryCta: "Poznaj swój styl i znajdź projektanta z AI",
      secondaryCta: "Katalog projektantów",
      reassurance: "Przykładowy wynik pokazuje, jak AI porządkuje inspiracje i brief.",
      visual: {
        tag: "Przykładowy wynik",
        directionLabel: "Kierunek stylistyczny",
        styleValue: "Ciepłe japandi",
        paletteLabel: "Paleta",
        materialsLabel: "Materiały",
        materialsValue: "Drewno, len, kamień",
        matchLabel: "Dopasowanie",
        matchValue: "98%",
        briefLabel: "Gotowość briefu",
        briefValue: "Wstępnie uporządkowany",
        professionalLabel: "Proponowana pracownia",
        professionalValue: "Studio Loft",
        professionalSubtitle: "Portfolio i opinie Google",
        cta: "Poznaj AI Project Compass",
      },
    },
    trust: {
      items: [
        { icon: "✅", title: "Zweryfikowane profile", body: "Portfolio i informacje o pracowni" },
        { icon: "⭐", title: "Opinie", body: "Opinie i źródła w jednym miejscu" },
        { icon: "💬", title: "Bezpośredni kontakt", body: "Bez pośredników" },
        { icon: "🆓", title: "Dla klientów", body: "Korzystanie z platformy bez opłat" },
      ],
    },
    howItWorks: {
      eyebrow: "Jak to działa",
      headline: "Od inspiracji do właściwego projektanta.",
      body: "Nie musisz znać nazw stylów ani tworzyć profesjonalnego briefu. Zacznij od wnętrz, materiałów i detali, które Ci się podobają - ArchiCompass pomoże uporządkować Twoją wizję.",
      cta: "Przeanalizuj inspiracje z AI",
      secondaryCta: "Zobacz przykład wyniku",
      stepOne: {
        number: "01",
        title: "Dodaj inspiracje",
        body: "Prześlij zdjęcia wnętrz, detali, materiałów lub realizacji, które najlepiej pokazują to, co Ci się podoba.",
        note: "Nie musisz wiedzieć, jak nazywa się Twój styl.",
      },
      stepTwo: {
        number: "02",
        badge: "AI Project Compass",
        title: "AI pomaga zrozumieć Twój kierunek",
        body: "ArchiCompass rozpoznaje powtarzające się cechy Twoich inspiracji - styl, kolory, materiały, światło i atmosferę - a następnie łączy je z informacjami o Twojej inwestycji.",
        preview: {
          styleLabel: "Kierunek stylistyczny",
          styleValue: "Ciepłe japandi",
          paletteLabel: "Paleta",
          paletteValue: "Krem, glina, ciepły dąb",
          materialsLabel: "Materiały",
          materialsValue: "Drewno, len, kamień",
          moodLabel: "Charakter",
          moodValue: "Spokojny, naturalny, ciepły",
          summaryLabel: "Opis kierunku",
          summaryValue: "Ciepły minimalizm, naturalne materiały i spokojna, domowa atmosfera.",
          briefScopeLabel: "Co warto doprecyzować",
          briefScopeValue: "Metraż, budżet, termin i oczekiwany zakres współpracy.",
        },
        footer: "Uzupełnij metraż, budżet, termin i oczekiwany zakres współpracy.",
        emphasis: "W efekcie powstaje brief, który projektant może naprawdę wykorzystać.",
      },
      stepThree: {
        number: "03",
        title: "Poznaj projektantów dopasowanych do Twojego projektu",
        body: "Porównaj specjalistów dopasowanych do charakteru projektu, zakresu usług, budżetu i lokalizacji - i sprawdź ich portfolio przed pierwszą rozmową.",
        matchCriteriaLabel: "Dopasowanie uwzględnia",
        matchCriteria: ["Styl i inspiracje", "Zakres współpracy", "Budżet i lokalizację"],
        designers: [
          { name: "Studio Wątek", tag: "Ciepłe japandi", location: "Warszawa", match: "92%", mark: "SW" },
          { name: "Marta Wysocka", tag: "soft minimalizm", location: "Warszawa", match: "88%", mark: "MW" },
          { name: "Piotr Zieliński", tag: "Naturalne materiały", location: "Gdańsk", match: "84%", mark: "PZ" },
        ],
      },
    },
    whyExists: {
      eyebrow: "Od inspiracji do briefu",
      headline: "Inspiracje stają się\nwskazówką dla\nprojektanta.",
      body: "Pinterest, Instagram i narzędzia AI sprawiły, że łatwiej niż kiedykolwiek znaleźć wnętrza, które nam się podobają. Trudniej jest przełożyć te obrazy na realny projekt — z określonym budżetem, zakresem prac, terminem i możliwościami konkretnej przestrzeni.",
      body2: "ArchiCompass pomaga uporządkować to, co masz w głowie, zanim rozpoczniesz rozmowę z projektantem.",
      matchSentence: "Na tej podstawie ArchiCompass proponuje projektantów dopasowanych do Twojego stylu, potrzeb i planowanego zakresu prac.",
      flow: ["Zdjęcia inspiracji", "Czytelny brief", "Świadomy wybór projektanta"],
    },
    forClients: {
      eyebrow: "Dla klientów",
      headline: "Znajdź projektanta, który pasuje do Twojego projektu.",
      body: "Porównuj portfolio, poznaj sposób pracy specjalistów i otrzymuj dopasowania na podstawie własnych inspiracji i informacji o inwestycji.",
      checklist: [
        "AI Project Compass oparty na Twoich inspiracjach",
        "Portfolio i zakres usług w jednym miejscu",
        "Dopasowanie do projektu i lokalizacji",
        "Bezpośredni kontakt ze specjalistą",
        "Bez opłat dla klientów",
      ],
      aiCompass: {
        badge: "AI",
        description: "Poznaj styl swoich inspiracji z pomocą AI",
        name: "AI Project Compass",
        href: "/ai-project-compass",
      },
      primaryCta: "Poznaj swój styl z AI",
      secondaryCta: "Katalog projektantów",
    },
    forDesigners: {
      eyebrow: "Dla projektantów i architektów",
      headline: "Rozwijaj pracownię dzięki lepiej dopasowanym zapytaniom.",
      body: "Pokaż swoje portfolio osobom, które aktywnie szukają projektanta - zanim się odezwą, mogą uporządkować zakres inwestycji, inspiracje, budżet i oczekiwania.",
      checklist: [
        "Profesjonalny profil pracowni",
        "Bezpośredni kontakt z potencjalnym klientem",
        "Brak prowizji od wartości projektu",
        "Portfolio dostępne dla nowych klientów",
        "Statystyki profilu i zapytań",
        "Pierwsze 3 miesiące bezpłatnie",
      ],
      aiAssistant: {
        badge: "AI",
        description: "Profil zbudowany za pomocą AI w kilka minut",
        name: "Asystent portfolio AI",
        href: "/portfolio-assistant",
      },
      primaryCta: "Dołącz jako specjalista",
      secondaryCta: "Dowiedz się więcej",
      pricingNote: "Pierwsze 3 miesiące bezpłatnie. Szczegóły cen znajdziesz w cenniku.",
      pricingCta: "Ceny i usługi",
    },
    designerValue: {
      headline: "Więcej niż kolejny katalog projektantów.",
      items: [
        { title: "Lepszy kontekst", body: "Klient może rozpocząć rozmowę z uporządkowanym briefem, zamiast samych zdjęć inspiracji." },
        { title: "Widoczność", body: "Pokaż portfolio klientom szukającym specjalisty do konkretnego rodzaju inwestycji." },
        { title: "Bez pośredników", body: "Kontakt odbywa się bezpośrednio między klientem a projektantem." },
        { title: "Rozwijaj profil", body: "Dodawaj realizacje, prezentuj zakres usług i buduj swoją obecność w ArchiCompass." },
        { badge: "AI", href: "/portfolio-assistant", title: "✨ AI · Uzupełnij profil w kilka minut", body: "Wskaż stronę lub zdjęcia realizacji — AI przygotuje szkic profilu, który tylko zatwierdzasz." },
      ],
    },
    latestProjects: {
      eyebrow: "Realizacje",
      headline: "Zobacz, jak pracują projektanci w ArchiCompass",
      body: "Poznaj realizacje i znajdź pracownie, których sposób myślenia o przestrzeni jest bliski Twoim inspiracjom.",
      cta: "Zobacz wszystkich projektantów",
      emptyTitle: "Pierwsze publiczne projekty pojawią się tutaj.",
      emptyBody: "Każdy opublikowany projekt automatycznie pojawi się w tym miejscu.",
      fallbackCategory: "Projekt wnętrza",
      fallbackTitle: "Projekt bez tytułu",
    },
    inspirationHub: { eyebrow: "Inspiration Hub", headline: "Inspiracje, które pomagają podejmować lepsze decyzje projektowe.", body: "Poznaj praktyczne poradniki o stylach, materiałach, planowaniu przestrzeni, remoncie i zrównoważonych wnętrzach. Zapisuj wybrane artykuły w strefie klienta.", cta: "Odkryj Inspiration Hub", readCta: "Czytaj artykuł", emptyTitle: "Przygotowujemy pierwsze poradniki i inspiracje.", emptyCta: "Otwórz Inspiration Hub" },
    closingCta: {
      headline: "Zacznij od tego, co już masz - swoich inspiracji.",
      body: "ArchiCompass pomoże zamienić je w konkretny kierunek projektu i znaleźć specjalistów, którzy mogą go zrealizować.",
      primaryCta: "Poznaj swój styl i znajdź projektanta z AI",
      secondaryCta: "Katalog projektantów",
    },
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
      { href: "/ai-project-compass", label: "AI Project Compass", featured: true },
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
    company: `Platform operated by ${englishCompany}`,
    navigationTitle: "Navigation",
    popularLocationsTitle: "Popular locations",
    legalTitle: "Legal information",
    copyright: "© 2026 ArchiCompass. All rights reserved.",
    navigation: [
      { href: "/", label: "Home" },
      { href: "/ai-project-compass", label: "AI Project Compass" },
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
      resetPasswordCta: "Reset password",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      legalConsentTitle: "Required acknowledgement",
      legalConsentBefore: "I accept the",
      legalConsentMiddle: "and confirm that I have read the",
      legalConsentAfter: ".",
      confirmationCreated: "Your account has been created. Open the email confirmation message and you will go directly to complete your profile. If you cannot see it, check Spam or Promotions.",
      confirmationResent: "We sent a new confirmation link. Open the newest email, then you will go directly to complete your profile.",
      errors: {
        emailRequired: "Enter your email address.",
        passwordTooShort: "Your password must be at least 8 characters.",
        invalidCredentials: "Incorrect email address or password. You can reset your password below.",
        emailNotConfirmed: "Confirm your email address using the link in the registration email. If you cannot see it, send the link again.",
        emailRateLimit: "Too many emails have been sent. Wait a few minutes and try again.",
        alreadyRegistered: "An account with this email address already exists. Sign in or reset your password.",
        legalConsentRequired: "To create an account, accept the Terms of Service and confirm that you have read the Privacy Policy.",
      },
    },
    passwordRecovery: {
      badge: "Account recovery",
      forgotTitle: "Reset your password",
      forgotDescription: "Enter the account email. This link is only for changing the password, not for every sign-in.",
      emailLabel: "Email",
      sending: "Sending...",
      sendCta: "Send reset email",
      sent: "Password reset email sent. Open it once to choose a new password.",
      backToLogin: "Back to sign in",
      resetTitle: "Choose a new password",
      newPasswordLabel: "New password",
      repeatPasswordLabel: "Repeat password",
      saving: "Saving...",
      saveCta: "Save new password",
      passwordTooShort: "Use at least 8 characters.",
      passwordsMismatch: "Passwords do not match.",
      updated: "Password updated. You can now continue to your account.",
      openAccount: "Open account",
      checking: "Checking your link...",
      invalidTitle: "This password reset link is no longer active",
      invalidBody: "Open the newest reset email or request a new password reset link.",
      newRequestCta: "Send a new link",
    },
    onboarding: {
      welcome: "Welcome to ArchiCompass",
      titles: { choose: "Choose your account type", client: "Set up your client workspace", designer: "How will you work?" },
      intro: "Choose your role first, then add your contact details. This takes you directly to the right workspace.",
      roleError: "Choose an account type",
      designerModeError: "Choose how you will work",
      choice: {
        clientBadge: "Client",
        clientTitle: "I am planning an interior project",
        clientBody: "Create briefs, save designers and projects, and manage conversations.",
        clientCta: "Choose client account",
        designerBadge: "Designer",
        designerTitle: "I provide design services",
        designerBody: "Publish a profile, manage a portfolio, and receive relevant enquiries.",
        designerCta: "Choose designer account",
      },
      clientPanel: {
        badge: "Client workspace",
        title: "Everything you need to choose a designer",
        body: "Your workspace includes saved briefs, favorite designers, projects, and conversations. A client account does not receive designer enquiries.",
        nextStep: "Next step: add your name, phone number, and location so designers can respond to briefs without guessing the basics.",
        submit: "Continue to complete your profile",
        alternative: "Choose designer instead",
      },
      designerModes: {
        independentBadge: "Independent designer",
        independentTitle: "My own profile",
        independentBody: "Create a public profile, portfolio, pricing, and an enquiry inbox.",
        independentCta: "Create my profile",
        studioBadge: "Design studio",
        studioTitle: "Create or join a team",
        studioBody: "Set up a shared studio profile or accept an existing team invitation.",
        studioCta: "Continue as a studio",
        alternative: "Choose client instead",
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
      title: "Interior design inspiration and practical guides",
      subtitle: "Explore practical advice, materials, interiors, and ideas curated by the ArchiCompass editorial team.",
      searchPlaceholder: "Search articles and inspiration...",
      searchHelp: "Search by title, topic, or keyword, for example “renovation budget”, “Japandi”, or “brief”.",
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
      description: "Turn inspiration photos into a precise brief and find interior designers and architects matched to your project, budget, and location.",
    },
    accessibility: {
      articleImage: (title) => `Article image for ${title}`,
      heroImage: "A bright living room in a warm natural palette, with wooden furniture and a large tree by the window.",
      inspirationImages: [
        "A living room with a light sofa, green armchair, and built-in wooden shelving.",
        "A moodboard with an apartment floor plan, fabric samples, and wooden details.",
        "A bright apartment with a dining area, living room, and built-in wooden cabinetry.",
        "A moodboard with interior photographs, fabric samples, and stone.",
        "A person reviewing an apartment plan and material samples at a table.",
      ],
      professionalImage: (name) => `Profile image of ${name}`,
      skipToMain: "Skip to main content",
    },
    hero: {
      badge: "AI Project Compass",
      headline: "Find a designer who understands",
      accentHeadline: "your vision",
      body: "Turn inspiration photos into a professional project brief. AI helps recognise your style and organise the details you need to choose a designer with confidence.",
      checklist: [
        "Matching based on your own project",
        "Verified portfolios and reviews",
        "Direct contact with the designer",
        "Your brief in one place",
      ],
      primaryCta: "Discover your style and find a designer with AI",
      secondaryCta: "Designer Directory",
      reassurance: "This example shows how AI helps organise inspiration and a project brief.",
      visual: {
        tag: "Example result",
        directionLabel: "Style direction",
        styleValue: "Warm Japandi",
        paletteLabel: "Palette",
        materialsLabel: "Materials",
        materialsValue: "Wood, linen, stone",
        matchLabel: "Match",
        matchValue: "98%",
        briefLabel: "Brief readiness",
        briefValue: "Structured to start",
        professionalLabel: "Suggested studio",
        professionalValue: "Studio Loft",
        professionalSubtitle: "Portfolio and Google reviews",
        cta: "Explore AI Project Compass",
      },
    },
    trust: {
      items: [
        { icon: "✅", title: "Verified profiles", body: "Portfolio and studio information" },
        { icon: "⭐", title: "Reviews", body: "Reviews and sources in one place" },
        { icon: "💬", title: "Direct contact", body: "No middlemen" },
        { icon: "🆓", title: "For clients", body: "Free to use the platform" },
      ],
    },
    howItWorks: {
      eyebrow: "How it works",
      headline: "From inspiration to the right designer.",
      body: "You don't need to know style names or write a professional brief. Start with the rooms, materials, and details you like - ArchiCompass will help organise your vision.",
      cta: "Analyse inspiration with AI",
      secondaryCta: "See an example result",
      stepOne: {
        number: "01",
        title: "Add inspiration",
        body: "Upload photos of rooms, details, materials, or projects that best show what you like.",
        note: "You don't need to know the name of your style.",
      },
      stepTwo: {
        number: "02",
        badge: "AI Project Compass",
        title: "AI helps you understand your direction",
        body: "ArchiCompass recognises the recurring traits in your inspiration - style, colours, materials, light, and mood - then connects them with the details of your project.",
        preview: {
          styleLabel: "Style direction",
          styleValue: "Warm Japandi",
          paletteLabel: "Palette",
          paletteValue: "Cream, clay, warm oak",
          materialsLabel: "Materials",
          materialsValue: "Wood, linen, stone",
          moodLabel: "Mood",
          moodValue: "Calm, natural, warm",
          summaryLabel: "Style summary",
          summaryValue: "Warm minimalism, natural materials, and a calm, lived-in atmosphere.",
          briefScopeLabel: "What to refine next",
          briefScopeValue: "Area, budget, timeline, and the scope of collaboration you expect.",
        },
        footer: "Add area, budget, timing, and the scope of collaboration you expect.",
        emphasis: "The result is a brief a designer can actually work from.",
      },
      stepThree: {
        number: "03",
        title: "Meet designers matched to your project",
        body: "Compare specialists matched to the character of your project, scope of services, budget, and location - and review their portfolio before the first conversation.",
        matchCriteriaLabel: "The match considers",
        matchCriteria: ["Style and inspiration", "Scope of work", "Budget and location"],
        designers: [
          { name: "Studio Wątek", tag: "Warm Japandi", location: "Warsaw", match: "92%", mark: "SW" },
          { name: "Marta Wysocka", tag: "Soft minimalism", location: "Warsaw", match: "88%", mark: "MW" },
          { name: "Piotr Zieliński", tag: "Natural materials", location: "Gdańsk", match: "84%", mark: "PZ" },
        ],
      },
    },
    whyExists: {
      eyebrow: "From inspiration to a brief",
      headline: "Inspiration becomes\na useful guide for\nyour designer.",
      body: "Pinterest, Instagram, and AI tools have made it easier than ever to find interiors we like. What is harder is turning those images into a real project — with a defined budget, scope of work, timeline, and the constraints of a specific space.",
      body2: "ArchiCompass helps organise what you have in mind before you start a conversation with a designer.",
      matchSentence: "Based on this, ArchiCompass suggests designers matched to your style, needs, and planned scope of work.",
      flow: ["Inspiration photos", "Clear brief", "Confident designer choice"],
    },
    forClients: {
      eyebrow: "For clients",
      headline: "Find a designer who fits your project.",
      body: "Compare portfolios, learn how specialists work, and get matches based on your own inspiration and project details.",
      checklist: [
        "AI Project Compass built from your inspiration",
        "Portfolio and services in one place",
        "Matching by project and location",
        "Direct contact with the specialist",
        "No fees for clients",
      ],
      aiCompass: {
        badge: "AI",
        description: "Understand the style behind your inspiration with AI",
        name: "AI Project Compass",
        href: "/ai-project-compass",
      },
      primaryCta: "Discover your style with AI",
      secondaryCta: "Designer Directory",
    },
    forDesigners: {
      eyebrow: "For designers and architects",
      headline: "Grow your studio with better-matched enquiries.",
      body: "Show your portfolio to people who are actively looking for a designer - before they reach out, they can organise the scope, inspiration, budget, and expectations for their project.",
      checklist: [
        "A professional studio profile",
        "Direct contact with a potential client",
        "No commission on project value",
        "Portfolio visible to new clients",
        "Profile and enquiry statistics",
        "First 3 months free",
      ],
      aiAssistant: {
        badge: "AI",
        description: "Profile built with AI in minutes",
        name: "AI Portfolio Assistant",
        href: "/portfolio-assistant",
      },
      primaryCta: "Join as a professional",
      secondaryCta: "Learn more",
      pricingNote: "The first 3 months are free. Find pricing details on the pricing page.",
      pricingCta: "Pricing and services",
    },
    designerValue: {
      headline: "More than another designer directory.",
      items: [
        { title: "Better context", body: "A client can start the conversation with an organised brief, not just inspiration photos." },
        { title: "Visibility", body: "Show your portfolio to clients looking for a specialist for a specific type of project." },
        { title: "No middlemen", body: "Contact happens directly between the client and the designer." },
        { title: "Grow your profile", body: "Add projects, present your services, and build your presence on ArchiCompass." },
        { badge: "AI", href: "/portfolio-assistant", title: "✨ AI · Build your profile in minutes", body: "Point us to your site or photos — AI drafts your profile for you to approve." },
      ],
    },
    latestProjects: {
      eyebrow: "Projects",
      headline: "See how designers work on ArchiCompass",
      body: "Explore projects and find studios whose way of thinking about space is close to your own inspiration.",
      cta: "See all designers",
      emptyTitle: "The first public projects will appear here.",
      emptyBody: "Each published project will automatically appear in this space.",
      fallbackCategory: "Interior project",
      fallbackTitle: "Untitled project",
    },
    inspirationHub: { eyebrow: "Inspiration Hub", headline: "Inspiration that supports better design decisions.", body: "Explore practical guides to styles, materials, space planning, renovation, and sustainable interiors. Save the articles you want in your client workspace.", cta: "Explore Inspiration Hub", readCta: "Read article", emptyTitle: "Our first guides and inspirations are being prepared.", emptyCta: "Open Inspiration Hub" },
    closingCta: {
      headline: "Start with what you already have - your inspiration.",
      body: "ArchiCompass will help turn it into a clear project direction and find specialists who can bring it to life.",
      primaryCta: "Discover your style and find a designer with AI",
      secondaryCta: "Designer Directory",
    },
    projectCategories: { Apartment: "Apartment", House: "House", Loft: "Loft", Hospitality: "Hospitality", "Rental property": "Rental property", Kitchen: "Kitchen", "Dining room": "Dining room", "Home office": "Home office", Bedroom: "Bedroom", Penthouse: "Penthouse", Office: "Office" },
  },
};

const contentByLocale: Record<SiteLocale, SiteCopy> = { pl, en };

export function getSiteCopy(locale: SiteLocale = siteLocale) {
  return contentByLocale[locale];
}
