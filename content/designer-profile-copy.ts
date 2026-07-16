import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type DesignerProfileCopy = {
  metadata: {
    notFoundTitle: string;
    notFoundDescription: string;
    defaultName: string;
    defaultProfession: string;
    defaultDescription: (name: string) => string;
    home: string;
    directory: string;
  };
  defaults: {
    untitledProfile: string;
    contactAfterBrief: string;
    primarySpecialty: string;
    secondarySpecialty: string;
    remoteStudio: string;
    noBio: string;
    interiorProjects: string;
    untitledProject: string;
    polishEnglish: string;
  };
  navigation: {
    backToDirectory: string;
  };
  badges: {
    demoProfileLong: string;
    professionalProfileLong: string;
    demo: string;
    new: string;
    demoProfile: string;
    professionalProfile: string;
    portfolioAdded: string;
  };
  actions: {
    editProfile: string;
    manageProjects: string;
    viewPortfolio: string;
    sendBrief: string;
    designerAccount: string;
    editPublicDetails: string;
    addPortfolioProject: string;
    openWebsite: string;
    showAllProjects: string;
    addFirstProject: string;
    viewProject: string;
    openProjectWebsite: string;
    createBrief: string;
    manage: string;
  };
  contact: {
    eyebrow: string;
    heading: (name: string) => string;
    body: string;
    platformResponseValue: string;
    demoNotice: string;
    designerNotice: string;
    mobileResponseNote: string;
  };
  owner: {
    title: string;
    body: string;
  };
  studios: {
    eyebrow: string;
    heading: (name: string, count: number) => string;
  };
  about: {
    eyebrow: string;
    heading: string;
  };
  services: {
    eyebrow: string;
    heading: string;
    unavailable: string;
    terms: string;
    consultation: (type: string) => string;
    concept: (style: string) => string;
    support: (style: string) => string;
    consultationBody: string;
    conceptBody: string;
    supportBody: string;
    customQuote: string;
  };
  portfolio: {
    eyebrow: string;
    heading: string;
    all: string;
    loadError: string;
    comingSoon: string;
    comingSoonBody: string;
    emptyCategory: string;
    emptyCategoryBody: string;
    selectedCount: (visible: number, total: number) => string;
  };
  reviews: {
    eyebrow: string;
    heading: string;
    noGoogleReviews: string;
    new: string;
    noLinkedRating: string;
    reviewCount: (count: number) => string;
    linkedHeading: string;
    unlinkedHeading: string;
    body: string;
    readOnGoogle: string;
  };
  compass: {
    eyebrow: string;
    heading: string;
    body: string;
  };
  summary: {
    contractorsHeading: string;
    contractorsBody: string;
  };
};

const designerProfileCopy: Record<SiteLocale, DesignerProfileCopy> = {
  pl: {
    metadata: {
      notFoundTitle: "Nie znaleziono projektanta",
      notFoundDescription: "Ten profil projektanta jest niedostępny.",
      defaultName: "Specjalista ArchiCompass",
      defaultProfession: "Projektant wnętrz",
      defaultDescription: (name) => `Zobacz profil ${name}, portfolio, specjalizacje, usługi, dostępność i dopasowanie do projektu w ArchiCompass.`,
      home: "Strona główna",
      directory: "Katalog Projektantów",
    },
    defaults: {
      untitledProfile: "Profil bez nazwy",
      contactAfterBrief: "Dane kontaktowe udostępniane są po wysłaniu briefu",
      primarySpecialty: "Wnętrza na miarę",
      secondarySpecialty: "Planowanie projektu",
      remoteStudio: "Pracownia pracująca zdalnie",
      noBio: "Ten specjalista nie dodał jeszcze pełnego opisu. Profil jest gotowy na portfolio, szczegóły usług i opinie klientów.",
      interiorProjects: "Projekty wnętrz",
      untitledProject: "Projekt bez tytułu",
      polishEnglish: "polski / angielski",
    },
    navigation: { backToDirectory: "Wróć do katalogu projektantów" },
    badges: {
      demoProfileLong: "Profil demonstracyjny ArchiCompass",
      professionalProfileLong: "Profil specjalisty ArchiCompass",
      demo: "Demo",
      new: "Nowy",
      demoProfile: "Profil demonstracyjny",
      professionalProfile: "Profil specjalisty",
      portfolioAdded: "Dodano portfolio",
    },
    actions: {
      editProfile: "Edytuj profil",
      manageProjects: "Zarządzaj projektami",
      viewPortfolio: "Zobacz portfolio",
      sendBrief: "Wyślij brief",
      designerAccount: "Konto projektanta",
      editPublicDetails: "Edytuj dane publiczne",
      addPortfolioProject: "Dodaj projekt do portfolio",
      openWebsite: "Otwórz stronę internetową",
      showAllProjects: "Pokaż wszystkie projekty",
      addFirstProject: "Dodaj pierwszy projekt",
      viewProject: "Zobacz projekt",
      openProjectWebsite: "Otwórz stronę projektu",
      createBrief: "Utwórz brief projektowy",
      manage: "Zarządzaj",
    },
    contact: {
      eyebrow: "Chcesz rozpocząć współpracę?",
      heading: (name) => `Skontaktuj się z ${name}`,
      body: "Opisz cele, termin i budżet. Specjalista będzie mógł ocenić, czy projekt odpowiada jego doświadczeniu i dostępności.",
      platformResponseValue: "Mierzone od pierwszej odpowiedzi w aplikacji",
      demoNotice: "Ten przykładowy profil pokazuje, jak może wyglądać kompletne portfolio w ArchiCompass. Nie może otrzymywać briefów projektowych.",
      designerNotice: "Konta projektantów otrzymują zapytania projektowe i nie mogą wysyłać briefów jako klienci.",
      mobileResponseNote: "Odpowiedzi telefoniczne i e-mailowe nie są mierzone",
    },
    owner: {
      title: "Widok właściciela",
      body: "Oglądasz własny profil publiczny. Korzystaj z narzędzi profilu i projektów, aby informacje na tej stronie były zawsze aktualne.",
    },
    studios: {
      eyebrow: "Powiązane pracownie",
      heading: (name, count) => `${name} należy do ${count} ${count === 1 ? "pracowni" : "pracowni"}`,
    },
    about: { eyebrow: "O profilu", heading: "Podejście do projektowania" },
    services: {
      eyebrow: "Oferowane usługi",
      heading: "Możliwe formy współpracy",
      unavailable: "Zakres usług nie został jeszcze potwierdzony. Wyślij brief i zapytaj o wizualizacje 3D, dokumentację lub nadzór.",
      terms: "Warunki współpracy",
      consultation: (type) => `Konsultacja: ${type}`,
      concept: (style) => `Koncepcja: ${style}`,
      support: (style) => `Wsparcie: ${style}`,
      consultationBody: "Doprecyzuj brief, budżet, zakres i najlepszy sposób działania przed rozpoczęciem pełnego projektu.",
      conceptBody: "Przekształć inspiracje i potrzeby w spójny kierunek wizualny, moodboard oraz strategię dla pomieszczeń.",
      supportBody: "Uzyskaj praktyczną pomoc przy układzie funkcjonalnym, materiałach, priorytetach i planowaniu kolejnych etapów.",
      customQuote: "Wycena indywidualna",
    },
    portfolio: {
      eyebrow: "Portfolio",
      heading: "Wybrane projekty",
      all: "Wszystkie",
      loadError: "Nie udało się wczytać projektów",
      comingSoon: "Portfolio pojawi się wkrótce",
      comingSoonBody: "Dodane projekty pojawią się tutaj jako karty ze zdjęciami, kategoriami, opisami i szczegółami realizacji.",
      emptyCategory: "W tej kategorii nie ma jeszcze projektów",
      emptyCategoryBody: "Pokaż wszystkie projekty lub wybierz inną kategorię.",
      selectedCount: (visible, total) => `${visible} z ${total} projektów`,
    },
    reviews: {
      eyebrow: "Opinie",
      heading: "Opinie klientów",
      noGoogleReviews: "Brak połączonych opinii Google",
      new: "Nowy",
      noLinkedRating: "Brak połączonej oceny",
      reviewCount: (count) => `${count} ${count === 1 ? "opinia Google" : "opinii Google"}`,
      linkedHeading: "Zobacz źródło w połączonym profilu Google",
      unlinkedHeading: "Tutaj można połączyć opinie Google",
      body: "ArchiCompass pokazuje podsumowanie publicznej oceny, a pełna treść opinii pozostaje w Google. Opinie zebrane bezpośrednio na platformie będą prezentowane osobno.",
      readOnGoogle: "Czytaj opinie w Google",
    },
    compass: {
      eyebrow: "Potrzebujesz pomocy w wyborze?",
      heading: "Porównaj tego projektanta z Twoim briefem",
      body: "ArchiCompass pomaga zamienić gust, budżet i typ projektu w precyzyjny brief jeszcze przed kontaktem ze specjalistami.",
    },
    summary: {
      contractorsHeading: "Polecani wykonawcy",
      contractorsBody: "Rekomendacje wykonawców pojawią się tutaj po połączeniu profili partnerów z realizacjami projektanta.",
    },
  },
  en: {
    metadata: {
      notFoundTitle: "Designer not found",
      notFoundDescription: "This designer profile is unavailable.",
      defaultName: "ArchiCompass professional",
      defaultProfession: "Interior designer",
      defaultDescription: (name) => `Explore ${name}'s profile, portfolio, specialties, services, availability, and project fit on ArchiCompass.`,
      home: "Home",
      directory: "Designer directory",
    },
    defaults: {
      untitledProfile: "Untitled profile",
      contactAfterBrief: "Contact details are shared after a brief is sent",
      primarySpecialty: "Tailored interiors",
      secondarySpecialty: "Project planning",
      remoteStudio: "Studio working remotely",
      noBio: "This professional has not added a full introduction yet. The profile is ready for a portfolio, service details, and client reviews.",
      interiorProjects: "Interior projects",
      untitledProject: "Untitled project",
      polishEnglish: "Polish / English",
    },
    navigation: { backToDirectory: "Back to designer directory" },
    badges: {
      demoProfileLong: "ArchiCompass demo profile",
      professionalProfileLong: "ArchiCompass professional profile",
      demo: "Demo",
      new: "New",
      demoProfile: "Demo profile",
      professionalProfile: "Professional profile",
      portfolioAdded: "Portfolio added",
    },
    actions: {
      editProfile: "Edit profile",
      manageProjects: "Manage projects",
      viewPortfolio: "View portfolio",
      sendBrief: "Send brief",
      designerAccount: "Designer account",
      editPublicDetails: "Edit public details",
      addPortfolioProject: "Add a portfolio project",
      openWebsite: "Open website",
      showAllProjects: "Show all projects",
      addFirstProject: "Add first project",
      viewProject: "View project",
      openProjectWebsite: "Open project website",
      createBrief: "Create project brief",
      manage: "Manage",
    },
    contact: {
      eyebrow: "Ready to start working together?",
      heading: (name) => `Contact ${name}`,
      body: "Describe your goals, timeline, and budget. The professional can assess whether the project fits their experience and availability.",
      platformResponseValue: "Measured from the first response in the app",
      demoNotice: "This example profile shows what a complete ArchiCompass portfolio can look like. It cannot receive project briefs.",
      designerNotice: "Designer accounts receive project enquiries and cannot send briefs as clients.",
      mobileResponseNote: "Phone and email responses are not measured",
    },
    owner: {
      title: "Owner view",
      body: "You are viewing your own public profile. Use profile and project tools to keep the information on this page current.",
    },
    studios: {
      eyebrow: "Connected studios",
      heading: (name, count) => `${name} is part of ${count} ${count === 1 ? "studio" : "studios"}`,
    },
    about: { eyebrow: "About the profile", heading: "Design approach" },
    services: {
      eyebrow: "Services offered",
      heading: "Ways to work together",
      unavailable: "The service scope has not been confirmed yet. Send a brief and ask about 3D visualisations, documentation, or supervision.",
      terms: "Terms of cooperation",
      consultation: (type) => `Consultation: ${type}`,
      concept: (style) => `Concept: ${style}`,
      support: (style) => `Support: ${style}`,
      consultationBody: "Clarify the brief, budget, scope, and best next step before committing to a full project.",
      conceptBody: "Turn inspiration and needs into a coherent visual direction, moodboard, and room strategy.",
      supportBody: "Get practical help with layout, materials, priorities, and planning the next project stages.",
      customQuote: "Custom quote",
    },
    portfolio: {
      eyebrow: "Portfolio",
      heading: "Selected projects",
      all: "All",
      loadError: "Projects could not be loaded",
      comingSoon: "Portfolio coming soon",
      comingSoonBody: "Added projects will appear here as cards with photos, categories, descriptions, and project details.",
      emptyCategory: "There are no projects in this category yet",
      emptyCategoryBody: "Show all projects or choose a different category.",
      selectedCount: (visible, total) => `${visible} of ${total} projects`,
    },
    reviews: {
      eyebrow: "Reviews",
      heading: "Client reviews",
      noGoogleReviews: "No linked Google reviews",
      new: "New",
      noLinkedRating: "No linked rating",
      reviewCount: (count) => `${count} Google ${count === 1 ? "review" : "reviews"}`,
      linkedHeading: "View the source on the linked Google profile",
      unlinkedHeading: "Google reviews can be linked here",
      body: "ArchiCompass shows a summary of the public rating, while full reviews remain on Google. Reviews collected directly on the platform will be presented separately.",
      readOnGoogle: "Read reviews on Google",
    },
    compass: {
      eyebrow: "Need help choosing?",
      heading: "Compare this designer with your brief",
      body: "ArchiCompass turns your taste, budget, and project type into a precise brief before you contact professionals.",
    },
    summary: {
      contractorsHeading: "Recommended contractors",
      contractorsBody: "Contractor recommendations will appear here after partner profiles are connected with the designer's completed projects.",
    },
  },
};

export function getDesignerProfileCopy(locale: SiteLocale = siteLocale) {
  return designerProfileCopy[locale];
}
