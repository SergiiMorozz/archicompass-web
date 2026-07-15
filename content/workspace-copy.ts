import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type ClientOverviewCopy = {
  dateLocale: string;
  statuses: Record<string, string>;
  stats: [string, string, string, string];
  eyebrow: string;
  title: string;
  intro: string;
  createBrief: string;
  openDirectory: string;
  profileUpdated: string;
  activityEyebrow: string;
  conversationsTitle: string;
  viewAll: string;
  defaultProfessional: string;
  studio: string;
  emptyTitle: string;
  emptyBody: string;
  emptyCta: string;
  nextStepEyebrow: string;
  nextStepWithBrief: string;
  nextStepWithoutBrief: string;
  nextStepWithBriefBody: string;
  nextStepWithoutBriefBody: string;
  savedBriefsCta: string;
  favoritesCta: string;
};

type AccountCopy = {
  defaultName: string;
  settingsEyebrow: string;
  professionalIntro: string;
  clientIntro: string;
  designer: string;
  client: string;
  openStudio: string;
  publicProfile: string;
  deletedTitle: string;
  deletedBody: string;
  updated: string;
  profileEyebrow: string;
  professionalProfile: string;
  contactDetails: string;
  professionalProfileBody: string;
  contactDetailsBody: string;
  profileReadiness: (score: number) => string;
  portfolioEyebrow: string;
  manageProjects: string;
  manageProjectsBody: string;
  projects: string;
  specialties: string;
  studioEyebrow: string;
  studioAndTeam: string;
  studioAndTeamBody: string;
  activeStudios: string;
  aiHistory: string;
  savedBriefs: string;
  tool: string;
  aiAnalysis: string;
  active: string;
  enquiriesEyebrow: string;
  enquiries: string;
  professionalEnquiriesBody: string;
  clientEnquiriesBody: string;
  received: string;
  sent: string;
  role: string;
  nextEyebrow: string;
  professionalNextTitle: string;
  clientNextTitle: string;
  professionalNextCta: string;
  clientNextCta: string;
  stepsProfessional: [string, string, string, string, string, string];
  stepsClient: [string, string, string, string, string, string];
  accessEyebrow: string;
  accessTitle: string;
  email: string;
  accountType: string;
  account: string;
  openClientZone: string;
  publicProfileLink: string;
  openProfile: string;
  compass: {
    professionalTitle: string;
    clientTitle: string;
    professionalBody: string;
    clientBody: string;
  };
};

type AdminUsersCopy = {
  dateLocale: string;
  never: string;
  professional: string;
  client: string;
  noProfile: string;
  needsReview: string;
  priority: string;
  clear: string;
  hidden: string;
  visible: string;
  eyebrow: string;
  title: string;
  intro: string;
  searchPlaceholder: string;
  allAccountTypes: string;
  professionals: string;
  clients: string;
  noProfileOption: string;
  allReviewStatuses: string;
  allVisibility: string;
  applyFilters: string;
  matches: (count: number) => string;
  clearFilters: string;
  table: [string, string, string, string, string, string, string, string, string];
  unnamedAccount: string;
  noEmail: string;
  joined: string;
  open: string;
  emptyTitle: string;
  emptyBody: string;
  previous: string;
  next: string;
  page: (page: number, total: number) => string;
};

type AdminTeamCopy = {
  dateLocale: string;
  owner: string;
  admin: string;
  active: string;
  revoked: string;
  accessControl: string;
  title: string;
  intro: string;
  accessGranted: string;
  accessRevoked: string;
  loadError: string;
  unnamedAccount: string;
  noEmail: string;
  added: string;
  revokeAccess: string;
  restoreAccess: string;
  noAdmins: string;
  addAdmin: string;
  grantAccess: string;
  instructions: string;
  emailLabel: string;
  accessScope: string;
  grantAdminAccess: string;
  permissions: Record<string, string>;
};

type AdminActivityCopy = {
  dateLocale: string;
  eyebrow: string;
  title: string;
  intro: string;
  loadError: (message: string) => string;
  actions: Record<string, string>;
  status: string;
  visibility: string;
  hidden: string;
  visible: string;
  emptyTitle: string;
  emptyBody: string;
  openUsers: string;
};

type StudioConversationCopy = {
  dateLocale: string;
  client: string;
  professional: string;
  attachmentOnly: string;
  attachmentNotice: (names: string) => string;
  back: string;
  conversationWith: (name: string) => string;
  new: string;
  statusLabel: string;
  reviewing: string;
  accepted: string;
  declined: string;
  update: string;
  messageSent: string;
  statusUpdated: string;
  messagesEyebrow: string;
  messagesTitle: string;
  refresh: string;
  openingMessage: string;
  you: string;
  studioTeam: string;
  readByClient: string;
  sent: string;
  emptyMessages: string;
  replyTo: (name: string) => string;
  replyPlaceholder: string;
  attachFiles: string;
  attachmentLimit: string;
  privacyNotice: string;
  sendMessage: string;
  sending: string;
  matchEyebrow: string;
  briefFields: [string, string, string, string, string, string, string, string, string, string, string];
  contactEyebrow: string;
  email: string;
  phone: string;
  notSpecified: string;
  referencePhotos: string;
  fullBrief: string;
  errors: {
    missingMessage: string;
    messageTooLong: string;
    unavailable: string;
    invalidStatus: string;
    statusPermission: string;
  };
};

type WorkspaceCopy = {
  account: AccountCopy;
  clientOverview: ClientOverviewCopy;
  clientMessages: {
    dateLocale: string;
    statuses: Record<string, string>;
    unreadPageTitle: string;
    eyebrow: string;
    title: string;
    intro: string;
    allConversations: string;
    unread: string;
    loadError: string;
    defaultProfessional: string;
    studio: string;
    newMessages: string;
    you: string;
    openingMessage: string;
    openToSeeBrief: string;
    readMessage: string;
    openConversation: string;
    viewStudio: string;
    viewProfessional: string;
    allReadTitle: string;
    noMessagesTitle: string;
    allReadBody: string;
    noMessagesBody: string;
    allConversationsCta: string;
    browseProfessionalsCta: string;
  };
  clientBriefs: {
    dateLocale: string;
    eyebrow: string;
    title: string;
    intro: string;
    createAnother: string;
    loadError: string;
    defaultType: string;
    untitled: string;
    savedOn: string;
    photoLabel: (count: number) => string;
    fields: [string, string, string, string, string, string, string, string, string, string, string];
    notSpecified: string;
    manageCta: string;
    findMatchesCta: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
  };
  clientFavorites: {
    eyebrow: string;
    title: string;
    intro: string;
    loadError: string;
    designersEyebrow: string;
    designersTitle: string;
    findMore: string;
    defaultProfessional: string;
    studio: string;
    designerBioFallback: string;
    openProfile: string;
    designersEmpty: string;
    studiosEyebrow: string;
    studiosTitle: string;
    studioBioFallback: string;
    openStudio: string;
    studiosEmpty: string;
    projectsEyebrow: string;
    projectsTitle: string;
    openProject: string;
    untitledProject: string;
    portfolio: string;
    projectDescriptionFallback: string;
    projectsEmpty: string;
    inspirationEyebrow: string;
    inspirationTitle: string;
    discoverInspiration: string;
    articlesEmpty: string;
  };
  studioOverview: {
    dateLocale: string;
    statuses: Record<string, string>;
    stats: [string, string, string, string];
    details: [string, string, string, (accepted: number, total: number) => string];
    eyebrow: string;
    title: string;
    intro: string;
    inboxCta: string;
    addProjectCta: string;
    studioTeamCta: string;
    opportunitiesEyebrow: string;
    receivedBriefs: string;
    viewAll: string;
    loadError: string;
    newClient: string;
    emptyTitle: string;
    emptyBody: string;
    publicProfileCta: string;
    readinessEyebrow: string;
    readinessBody: string;
    editProfileCta: string;
    manageProjectsCta: (count: number) => string;
    analyticsCta: string;
  };
  studioInbox: {
    dateLocale: string;
    statuses: Record<string, string>;
    pageTitle: string;
    eyebrow: string;
    title: string;
    intro: string;
    unread: string;
    loadError: string;
    newMessages: string;
    studioInbox: string;
    personalProfile: string;
    newClient: string;
    client: string;
    youAndStudio: string;
    clientMessage: string;
    openToSeeBrief: string;
    replyCta: string;
    openConversationCta: string;
    allReadTitle: string;
    noRequestsTitle: string;
    allReadBody: string;
    noRequestsBody: string;
    viewAllCta: string;
    improveProfileCta: string;
  };
  studioAnalytics: {
    dateLocale: string;
    eyebrow: string;
    title: string;
    intro: string;
    stats: [string, string, string, string];
    last30Days: string;
    acceptedDetail: (count: number) => string;
    noData: string;
    hours: string;
    days: string;
    responseDetail: string;
    last14Days: string;
    profileViews: string;
    dailySessionDetail: string;
    chartTitle: (views: number, inquiries: number) => string;
    funnelEyebrow: string;
    funnelTitle: string;
    portfolioEyebrow: string;
    projectCount: (count: number) => string;
    manageProjectsCta: string;
    publicProfileCta: string;
  };
  adminNav: {
    dashboard: string;
    users: string;
    content: string;
    activity: string;
    team: string;
    publicSite: string;
    ariaLabel: string;
  };
  adminUsers: AdminUsersCopy;
  adminTeam: AdminTeamCopy;
  adminActivity: AdminActivityCopy;
  studioConversation: StudioConversationCopy;
  adminOverview: {
    dateLocale: string;
    accountLabels: { professional: string; client: string; noProfile: string };
    cards: [string, string, string, string, string, string, string, string, string];
    details: {
      newIn30: (count: number) => string;
      profileSupply: string;
      activeAccounts: (count: number) => string;
      publicWork: string;
      aiResult: string;
      entirePlatform: string;
      published: (count: number) => string;
      hidden: (profiles: number, projects: number) => string;
      last30Days: string;
    };
    eyebrow: string;
    title: string;
    intro: string;
    openUsersCta: string;
    loadError: string;
    activityEyebrow: string;
    recentAccounts: string;
    viewAll: string;
    joined: string;
    noAccounts: string;
    privacyEyebrow: string;
    privacyTitle: string;
    privacyBody: string;
    contentEyebrow: string;
    contentTitle: string;
    contentBody: string;
    manageContentCta: string;
  };
};

const workspaceCopyByLocale: Record<SiteLocale, WorkspaceCopy> = {
  pl: {
    account: {
      defaultName: "Twoje konto ArchiCompass",
      settingsEyebrow: "Ustawienia konta",
      professionalIntro: "Tutaj aktualizujesz dane konta i profil publiczny. Codzienna praca z briefami, portfolio i zespołem jest w Studio projektanta.",
      clientIntro: "Tutaj aktualizujesz dane konta. Briefy, ulubione i rozmowy znajdziesz w Strefie klienta.",
      designer: "Projektant",
      client: "Klient",
      openStudio: "Przejdź do Studio",
      publicProfile: "Zobacz profil publiczny",
      deletedTitle: "Profil profesjonalisty został usunięty",
      deletedBody: "Publiczny profil i portfolio zostały usunięte. Konto projektanta, rozmowy i członkostwa w pracowniach pozostają aktywne.",
      updated: "Dane profilu zostały zaktualizowane.",
      profileEyebrow: "Dane i widoczność",
      professionalProfile: "Profil publiczny",
      contactDetails: "Dane kontaktowe",
      professionalProfileBody: "Aktualizuj dane, specjalizacje, ceny, kontakt i podejście projektowe.",
      contactDetailsBody: "Imię, telefon i lokalizacja pojawią się przy briefach i pomogą projektantom sprawnie odpowiedzieć.",
      profileReadiness: (score) => `${score}% kompletności profilu`,
      portfolioEyebrow: "Zarządzanie portfolio",
      manageProjects: "Zarządzaj projektami",
      manageProjectsBody: "Dodawaj karty projektów, które budują wiarygodność profilu publicznego i mogą pojawiać się również w powiązanych pracowniach.",
      projects: "Projekty",
      specialties: "Specjalizacje",
      studioEyebrow: "Profil pracowni",
      studioAndTeam: "Pracownia i zespół",
      studioAndTeamBody: "Utwórz pracownię, zaproś projektantów i korzystaj ze wspólnej skrzynki zapytań oraz połączonego portfolio zespołu.",
      activeStudios: "Aktywne pracownie",
      aiHistory: "Analizy w historii",
      savedBriefs: "Briefy",
      tool: "Narzędzie",
      aiAnalysis: "Analiza AI",
      active: "Aktywne",
      enquiriesEyebrow: "Zapytania projektowe",
      enquiries: "Zapytania z briefem",
      professionalEnquiriesBody: "Przeglądaj zapytania kierowane do Twojego profilu i pracowni, do których należysz.",
      clientEnquiriesBody: "Śledź briefy wysłane do projektantów i pracowni oraz kontynuuj rozmowy.",
      received: "Otrzymane",
      sent: "Wysłane",
      role: "Rola",
      nextEyebrow: "Najlepsze kolejne działania",
      professionalNextTitle: "Przygotuj profil dla klientów",
      clientNextTitle: "Poprowadź projekt dalej",
      professionalNextCta: "Otwórz Studio projektanta",
      clientNextCta: "Przeglądaj projektantów",
      stepsProfessional: [
        "1. Uzupełnij podstawy", "Dodaj lokalizację, specjalizację, ceny i kontakt, aby klienci szybko ocenili dopasowanie.",
        "2. Dodaj pierwszy projekt", "Już jedna mocna karta portfolio sprawia, że publiczny profil wygląda znacznie bardziej wiarygodnie.",
        "3. Sprawdź widok publiczny", "Otwórz profil jak klient i sprawdź, czy opowieść jest jasna.",
      ],
      stepsClient: [
        "1. Stwórz jasny brief", "Określ typ inwestycji, budżet, termin, styl i dodaj zdjęcia referencyjne.",
        "2. Porównaj specjalistów", "Porównaj niezależnych projektantów i pracownie, zanim wyślesz brief.",
        "3. Kontynuuj w wiadomościach", "Przechowuj odpowiedzi, decyzje i kontekst projektu razem w strefie klienta.",
      ],
      accessEyebrow: "Twoje konto",
      accessTitle: "Dostęp i dane",
      email: "E-mail",
      accountType: "Typ konta",
      account: "Konto",
      openClientZone: "Otwórz Strefę klienta",
      publicProfileLink: "Link do profilu publicznego",
      openProfile: "Otwórz profil",
      compass: {
        professionalTitle: "Analizuj inspiracje",
        clientTitle: "Zapisane briefy",
        professionalBody: "Uruchom analizę AI zdjęć referencyjnych, aby rozpoznać styl, materiały i język projektu. Projektanci mogą korzystać z narzędzia, ale nie wysyłają briefów jako klienci.",
        clientBody: "Przejrzyj briefy z inspiracjami, budżetem i zakresem przed kontaktem z projektantem lub pracownią.",
      },
    },
    clientOverview: {
      dateLocale: "pl-PL",
      statuses: { accepted: "Zaakceptowane", declined: "Odrzucone", reviewing: "W trakcie", sent: "Nowe" },
      stats: ["Zapisane briefy", "Ulubione", "Zapytania do projektantów", "Nieprzeczytane wiadomości"],
      eyebrow: "Twój projekt wnętrza",
      title: "Pulpit klienta",
      intro: "Trzymaj inspiracje, briefy, ulubionych specjalistów i wszystkie rozmowy w jednym miejscu: od pierwszego pomysłu do wyboru projektanta.",
      createBrief: "Utwórz brief",
      openDirectory: "Otwórz Katalog Projektantów",
      profileUpdated: "Dane konta zostały zaktualizowane.",
      activityEyebrow: "Ostatnia aktywność",
      conversationsTitle: "Rozmowy z projektantami",
      viewAll: "Zobacz wszystkie",
      defaultProfessional: "Projektant wnętrz",
      studio: "Pracownia projektowa",
      emptyTitle: "Nie masz jeszcze rozmów z projektantami",
      emptyBody: "Utwórz brief w AI Project Compass, zapisz go i wyślij do projektanta, którego portfolio pasuje do Twojego projektu.",
      emptyCta: "Uruchom AI Project Compass",
      nextStepEyebrow: "Twój następny krok",
      nextStepWithBrief: "Porównaj najlepiej dopasowanych",
      nextStepWithoutBrief: "Zamień inspiracje w brief",
      nextStepWithBriefBody: "Zapisuj interesujących projektantów i realizacje w Ulubionych, a potem wyślij dobrze przygotowany brief.",
      nextStepWithoutBriefBody: "Dodaj inspiracje, zakres, budżet i termin, aby projektanci mogli dobrze zrozumieć inwestycję przed odpowiedzią.",
      savedBriefsCta: "Otwórz zapisane briefy",
      favoritesCta: "Przejrzyj ulubione",
    },
    clientMessages: {
      dateLocale: "pl-PL",
      statuses: { accepted: "Zaakceptowane", declined: "Odrzucone", reviewing: "W trakcie", sent: "Nowe" },
      unreadPageTitle: "Wiadomości",
      eyebrow: "Komunikacja z projektantami",
      title: "Wiadomości",
      intro: "Prowadź rozmowy z projektantami obok dokładnego briefu i referencji, które zostały wysłane.",
      allConversations: "Wszystkie rozmowy",
      unread: "Nieprzeczytane",
      loadError: "Nie udało się wczytać wiadomości",
      defaultProfessional: "Projektant wnętrz",
      studio: "Pracownia projektowa",
      newMessages: "nowe",
      you: "Ty",
      openingMessage: "Twoja wiadomość wprowadzająca",
      openToSeeBrief: "Otwórz rozmowę, aby zobaczyć cały brief.",
      readMessage: "Przeczytaj wiadomość",
      openConversation: "Otwórz rozmowę",
      viewStudio: "Zobacz profil pracowni",
      viewProfessional: "Zobacz profil projektanta",
      allReadTitle: "Wszystko przeczytane",
      noMessagesTitle: "Nie masz jeszcze wiadomości",
      allReadBody: "Nowe odpowiedzi pojawią się tutaj oraz w liczniku Wiadomości.",
      noMessagesBody: "Wyślij zapisany brief projektantowi, a rozmowa pojawi się w tym miejscu.",
      allConversationsCta: "Zobacz wszystkie rozmowy",
      browseProfessionalsCta: "Przeglądaj projektantów",
    },
    clientBriefs: {
      dateLocale: "pl-PL",
      eyebrow: "Biblioteka AI Project Compass",
      title: "Zapisane briefy",
      intro: "Twoje zapisane briefy pozostają tutaj razem z zakresem prac, budżetem, terminem i zdjęciami referencyjnymi.",
      createAnother: "Utwórz kolejny brief",
      loadError: "Nie udało się wczytać briefów",
      defaultType: "Brief projektowy",
      untitled: "Brief bez tytułu",
      savedOn: "Zapisano",
      photoLabel: (count) => `${count} ${count === 1 ? "zdjęcie" : count % 10 >= 2 && count % 10 <= 4 && (count < 10 || count > 20) ? "zdjęcia" : "zdjęć"}`,
      fields: ["Cel", "Styl", "Wsparcie", "Budżet", "Termin", "Powierzchnia", "Pomieszczenia", "Nieruchomość", "3D", "Nadzór", "Lokalizacja"],
      notSpecified: "Nie podano",
      manageCta: "Wyślij lub zarządzaj briefem",
      findMatchesCta: "Znajdź dopasowanych projektantów",
      emptyTitle: "Nie masz jeszcze zapisanych briefów",
      emptyBody: "AI Project Compass zamieni zdjęcia referencyjne i praktyczne potrzeby w brief, który możesz wielokrotnie wykorzystać.",
      emptyCta: "Utwórz brief projektowy",
    },
    clientFavorites: {
      eyebrow: "Twoja krótka lista",
      title: "Ulubione",
      intro: "Porównuj projektantów, pracownie, projekty i inspiracje bez gubienia tego, co naprawdę pasuje do Twojej przestrzeni.",
      loadError: "Nie udało się wczytać ulubionych",
      designersEyebrow: "Osoby warte uwagi",
      designersTitle: "Zapisani projektanci",
      findMore: "Znajdź więcej",
      defaultProfessional: "Projektant wnętrz",
      studio: "Pracownia projektowa",
      designerBioFallback: "Otwórz profil, aby poznać podejście i realizacje tego projektanta.",
      openProfile: "Otwórz profil",
      designersEmpty: "Zapisuj projektantów z katalogu, aby utworzyć tutaj krótką listę.",
      studiosEyebrow: "Zespoły warte uwagi",
      studiosTitle: "Zapisane pracownie",
      studioBioFallback: "Otwórz profil pracowni, aby zobaczyć jej zespół i wspólne portfolio.",
      openStudio: "Otwórz pracownię",
      studiosEmpty: "Zapisuj profile pracowni podczas porównywania zespołów.",
      projectsEyebrow: "Wnętrza i pomysły",
      projectsTitle: "Zapisane projekty",
      openProject: "Otwórz projekt",
      untitledProject: "Projekt bez tytułu",
      portfolio: "Portfolio",
      projectDescriptionFallback: "Otwórz projekt, aby zobaczyć galerię i profil autora.",
      projectsEmpty: "Zapisuj realizacje portfolio podczas porównywania kierunków wizualnych.",
      inspirationEyebrow: "Pomysły, do których warto wrócić",
      inspirationTitle: "Zapisane inspiracje",
      discoverInspiration: "Odkrywaj Inspiration Hub",
      articlesEmpty: "Zapisuj artykuły z Inspiration Hub, aby zachować tutaj przydatne pomysły.",
    },
    studioOverview: {
      dateLocale: "pl-PL",
      statuses: { accepted: "Zaakceptowane", declined: "Odrzucone", reviewing: "W trakcie", sent: "Nowe" },
      stats: ["Wyświetlenia profilu", "Nowe zapytania", "Nieprzeczytane wiadomości", "Zaakceptowane"],
      details: ["Ostatnie 30 dni", "Oczekują na sprawdzenie", "We wszystkich aktywnych zapytaniach", (accepted, total) => `${accepted} z ${total} zapytań`],
      eyebrow: "Panel profesjonalisty",
      title: "Pulpit projektanta",
      intro: "Przeglądaj dopasowane briefy, odpowiadaj klientom, rozwijaj portfolio i obserwuj skuteczność profilu.",
      inboxCta: "Otwórz zapytania",
      addProjectCta: "Dodaj projekt",
      studioTeamCta: "Pracownia i zespół",
      opportunitiesEyebrow: "Najnowsze możliwości",
      receivedBriefs: "Otrzymane briefy",
      viewAll: "Zobacz wszystkie",
      loadError: "Nie udało się wczytać zapytań",
      newClient: "Nowy klient",
      emptyTitle: "Nie masz jeszcze nowych briefów",
      emptyBody: "Uzupełnij profil publiczny i dodaj mocne projekty portfolio. Nowe zapytania klientów pojawią się tutaj automatycznie.",
      publicProfileCta: "Zobacz profil publiczny",
      readinessEyebrow: "Kompletność profilu",
      readinessBody: "Kompletny profil daje klientom więcej informacji przed wysłaniem briefu.",
      editProfileCta: "Edytuj profil",
      manageProjectsCta: (count) => `Zarządzaj projektami (${count})`,
      analyticsCta: "Otwórz statystyki",
    },
    studioInbox: {
      dateLocale: "pl-PL",
      statuses: { all: "Wszystkie", accepted: "Zaakceptowane", declined: "Odrzucone", reviewing: "W trakcie", sent: "Nowe" },
      pageTitle: "Zapytania projektowe",
      eyebrow: "Komunikacja z klientami",
      title: "Otrzymane briefy",
      intro: "Oceniaj dopasowanie projektu, aktualizuj status i prowadź każdą rozmowę bezpośrednio przy oryginalnym briefie klienta.",
      unread: "Nieprzeczytane",
      loadError: "Nie udało się wczytać zapytań",
      newMessages: "nowe",
      studioInbox: "Skrzynka pracowni",
      personalProfile: "Profil osobisty",
      newClient: "Nowy klient",
      client: "Klient",
      youAndStudio: "Ty / zespół pracowni",
      clientMessage: "Wiadomość klienta",
      openToSeeBrief: "Otwórz brief, aby zobaczyć pełny kontekst projektu.",
      replyCta: "Odpowiedz klientowi",
      openConversationCta: "Otwórz rozmowę",
      allReadTitle: "Wszystko przeczytane",
      noRequestsTitle: "Brak zapytań w tym widoku",
      allReadBody: "Nowe odpowiedzi klientów pojawią się tutaj oraz w liczniku zapytań.",
      noRequestsBody: "Nowe briefy z AI Project Compass pojawią się tutaj razem z inspiracjami, zakresem, budżetem i wiadomością klienta.",
      viewAllCta: "Zobacz wszystkie zapytania",
      improveProfileCta: "Ulepsz profil publiczny",
    },
    studioAnalytics: {
      dateLocale: "pl-PL",
      eyebrow: "Skuteczność profilu",
      title: "Statystyki",
      intro: "Zobacz rzeczywiste wizyty profilu, zapytania z AI Project Compass, zaakceptowane dopasowania i zmierzony czas odpowiedzi.",
      stats: ["Wyświetlenia", "Zapytania", "Zaakceptowane", "Pierwsza odpowiedź"],
      last30Days: "Ostatnie 30 dni",
      acceptedDetail: (count) => `${count} zaakceptowanych`,
      noData: "Brak danych",
      hours: "godz.",
      days: "dni",
      responseDetail: "Na podstawie odpowiedzi w platformie",
      last14Days: "Ostatnie 14 dni",
      profileViews: "Wyświetlenia profilu",
      dailySessionDetail: "Jedna sesja przeglądarki na profil dziennie",
      chartTitle: (views, inquiries) => `${views} wyświetleń, ${inquiries} zapytań`,
      funnelEyebrow: "Lejek z ostatnich 90 dni",
      funnelTitle: "Od wyświetlenia do współpracy",
      portfolioEyebrow: "Zawartość portfolio",
      projectCount: (count) => `${count} ${count === 1 ? "publiczny projekt" : "publiczne projekty"} dostępne dla klientów przed wysłaniem briefu.`,
      manageProjectsCta: "Zarządzaj projektami",
      publicProfileCta: "Otwórz profil publiczny",
    },
    adminUsers: {
      dateLocale: "pl-PL",
      never: "Nigdy",
      professional: "Specjalista",
      client: "Klient",
      noProfile: "Brak profilu",
      needsReview: "Do sprawdzenia",
      priority: "Priorytet",
      clear: "Czyste",
      hidden: "Ukryty",
      visible: "Widoczny",
      eyebrow: "Użytkownicy",
      title: "Konta",
      intro: "Znajdź klientów i specjalistów, sprawdzaj aktywność publiczną oraz zapisuj wewnętrzne notatki operacyjne.",
      searchPlaceholder: "Szukaj po nazwie, e-mailu lub lokalizacji",
      allAccountTypes: "Wszystkie typy kont",
      professionals: "Specjaliści",
      clients: "Klienci",
      noProfileOption: "Bez profilu",
      allReviewStatuses: "Wszystkie statusy",
      allVisibility: "Każda widoczność",
      applyFilters: "Zastosuj filtry",
      matches: (count) => `${count} pasujących kont`,
      clearFilters: "Wyczyść filtry",
      table: ["Konto", "Typ", "Projekty", "Briefy", "Zapytania", "Ostatnie logowanie", "Status", "Widoczność", "Akcja"],
      unnamedAccount: "Konto bez nazwy",
      noEmail: "Brak e-maila",
      joined: "Dołączył/a",
      open: "Otwórz",
      emptyTitle: "Brak pasujących kont",
      emptyBody: "Wyczyść filtry albo użyj szerszego wyszukiwania.",
      previous: "Poprzednia",
      next: "Następna",
      page: (page, total) => `Strona ${page} z ${total}`,
    },
    adminTeam: {
      dateLocale: "pl-PL",
      owner: "właściciel",
      admin: "administrator",
      active: "Aktywny",
      revoked: "Cofnięty",
      accessControl: "Kontrola dostępu",
      title: "Zespół admin",
      intro: "Nadawaj zaufanym osobom dostęp do użytkowników, moderacji, treści, statystyk, finansów i aktywności administracyjnej.",
      accessGranted: "Dostęp administratora został nadany.",
      accessRevoked: "Dostęp administratora został cofnięty.",
      loadError: "Nie udało się wczytać dostępu zespołu. Najpierw zastosuj migrację Admin Team.",
      unnamedAccount: "Konto bez nazwy",
      noEmail: "Brak e-maila",
      added: "Dodano",
      revokeAccess: "Cofnij dostęp",
      restoreAccess: "Przywróć dostęp",
      noAdmins: "Nie znaleziono kont administracyjnych.",
      addAdmin: "Dodaj administratora",
      grantAccess: "Nadaj dostęp",
      instructions: "Osoba musi najpierw utworzyć konto ArchiCompass. Wybierz zakresy dostępu, które mają być przypisane do jej roli admin.",
      emailLabel: "E-mail konta",
      accessScope: "Zakres dostępu",
      grantAdminAccess: "Nadaj dostęp administratora",
      permissions: { users: "Użytkownicy", moderation: "Moderacja", content: "Treści", analytics: "Statystyki", team: "Zespół admin", finance: "Finanse" },
    },
    adminActivity: {
      dateLocale: "pl-PL",
      eyebrow: "Dziennik działań",
      title: "Aktywność admina",
      intro: "Sprawdzaj wrażliwe działania administracyjne razem z osobą wykonującą, celem i czasem operacji.",
      loadError: (message) => `Nie udało się wczytać aktywności: ${message}`,
      actions: { admin_access_granted: "Nadano dostęp administratora", admin_access_revoked: "Odebrano dostęp administratora", content_visibility_updated: "Zmieniono widoczność treści", user_review_updated: "Zmieniono status weryfikacji użytkownika" },
      status: "Status",
      visibility: "Widoczność",
      hidden: "ukryte",
      visible: "widoczne",
      emptyTitle: "Brak działań administracyjnych",
      emptyBody: "Zmiany weryfikacji i moderacji pojawią się tutaj.",
      openUsers: "Otwórz użytkowników",
    },
    studioConversation: {
      dateLocale: "pl-PL",
      client: "Klient",
      professional: "Projektant wnętrz",
      attachmentOnly: "Udostępniono załączniki",
      attachmentNotice: (names) => `Udostępniono załączniki: ${names}`,
      back: "Wróć do zapytań",
      conversationWith: (name) => `Rozmowa z: ${name}`,
      new: "Nowe",
      statusLabel: "Status zapytania",
      reviewing: "W trakcie analizy",
      accepted: "Zaakceptowane",
      declined: "Odrzucone",
      update: "Aktualizuj",
      messageSent: "Wiadomość została wysłana. Klient widzi ją w historii zapytania.",
      statusUpdated: "Status zapytania został zaktualizowany.",
      messagesEyebrow: "Wiadomości",
      messagesTitle: "Rozmowa z klientem",
      refresh: "Odśwież",
      openingMessage: "pierwsza wiadomość",
      you: "Ty",
      studioTeam: "Zespół pracowni",
      readByClient: "Przeczytane przez klienta",
      sent: "Wysłano",
      emptyMessages: "Nie ma jeszcze wiadomości. Zacznij od konkretnego pytania o zakres, termin, budżet lub dostępność.",
      replyTo: (name) => `Odpowiedz: ${name}`,
      replyPlaceholder: "Zadaj pytanie, potwierdź dopasowanie lub zaproponuj następny krok...",
      attachFiles: "Dodaj plany lub dokumenty",
      attachmentLimit: "do 5 plików, po 20 MB",
      privacyNotice: "Wiadomości widzi tylko ten klient oraz projektant lub aktywny zespół pracowni.",
      sendMessage: "Wyślij wiadomość",
      sending: "Wysyłanie...",
      matchEyebrow: "Dopasowanie projektu",
      briefFields: ["Projekt", "Cel", "Styl", "Wsparcie", "Budżet", "Powierzchnia", "Pomieszczenia", "Nieruchomość", "3D", "Nadzór", "Lokalizacja"],
      contactEyebrow: "Kontakt z klientem",
      email: "E-mail",
      phone: "Telefon",
      notSpecified: "Nie podano",
      referencePhotos: "Zdjęcia referencyjne klienta",
      fullBrief: "Otwórz pełną treść briefu",
      errors: {
        missingMessage: "Napisz wiadomość lub dodaj załącznik przed wysłaniem.",
        messageTooLong: "Wiadomość może mieć maksymalnie 4000 znaków.",
        unavailable: "Ta rozmowa nie jest dostępna.",
        invalidStatus: "Wybierz prawidłowy status zapytania.",
        statusPermission: "Tylko projektant lub zespół pracowni może zmienić status tego zapytania.",
      },
    },
    adminNav: {
      dashboard: "Pulpit",
      users: "Użytkownicy",
      content: "Treści",
      activity: "Aktywność",
      team: "Zespół",
      publicSite: "Strona publiczna",
      ariaLabel: "Panel administratora",
    },
    adminOverview: {
      dateLocale: "pl-PL",
      accountLabels: { professional: "Specjalista", client: "Klient", noProfile: "Brak profilu" },
      cards: ["Konta", "Specjaliści", "Klienci", "Projekty portfolio", "Zapisane briefy", "Zapytania", "Artykuły Inspiration Hub", "Ukryte treści", "Wyświetlenia profili"],
      details: {
        newIn30: (count) => `${count} nowych w 30 dni`,
        profileSupply: "Podaż profili",
        activeAccounts: (count) => `${count} aktywnych kont`,
        publicWork: "Prace publiczne",
        aiResult: "Wynik AI Project Compass",
        entirePlatform: "W całej platformie",
        published: (count) => `${count} opublikowanych`,
        hidden: (profiles, projects) => `${profiles} profili, ${projects} projektów`,
        last30Days: "Ostatnie 30 dni",
      },
      eyebrow: "Operacje platformy",
      title: "Admin",
      intro: "Monitoruj platformę, sprawdzaj konta i obserwuj, jak użytkownicy przechodzą od inspiracji do rozmowy z projektantem.",
      openUsersCta: "Otwórz użytkowników",
      loadError: "Nie udało się wczytać danych admina. Sprawdź migracje bazy oraz aktywną rolę owner/admin dla tego konta.",
      activityEyebrow: "Najnowsza aktywność",
      recentAccounts: "Ostatnie konta",
      viewAll: "Zobacz wszystkie",
      joined: "Dołączył/a",
      noAccounts: "Brak kont do wyświetlenia.",
      privacyEyebrow: "Granica prywatności",
      privacyTitle: "Tylko dane operacyjne",
      privacyBody: "Ten panel pokazuje liczniki, dane kont, profile publiczne i projekty publiczne. Treści prywatnych wiadomości i prywatne zdjęcia referencyjne pozostają poza panelem admina.",
      contentEyebrow: "Treści",
      contentTitle: "Inspiration Hub",
      contentBody: "Twórz szkice, publikuj artykuły i zarządzaj wyróżnionymi inspiracjami z chronionego edytora.",
      manageContentCta: "Zarządzaj treściami",
    },
  },
  en: {
    account: {
      defaultName: "Your ArchiCompass account",
      settingsEyebrow: "Account settings",
      professionalIntro: "Update your account and public profile here. Your daily brief, portfolio, and team work lives in Designer Studio.",
      clientIntro: "Update your account details here. Find briefs, favorites, and conversations in Client Workspace.",
      designer: "Designer",
      client: "Client",
      openStudio: "Open Designer Studio",
      publicProfile: "View public profile",
      deletedTitle: "Professional profile deleted",
      deletedBody: "The public profile and portfolio have been removed. Your designer account, conversations, and studio memberships remain active.",
      updated: "Profile details have been updated.",
      profileEyebrow: "Details and visibility",
      professionalProfile: "Public profile",
      contactDetails: "Contact details",
      professionalProfileBody: "Update your details, specialties, pricing, contact information, and design approach.",
      contactDetailsBody: "Your name, phone number, and location appear with briefs and help designers respond efficiently.",
      profileReadiness: (score) => `${score}% profile readiness`,
      portfolioEyebrow: "Portfolio management",
      manageProjects: "Manage projects",
      manageProjectsBody: "Add project cards that build trust in your public profile and can also appear in connected studios.",
      projects: "Projects",
      specialties: "Specialties",
      studioEyebrow: "Studio profile",
      studioAndTeam: "Studio and team",
      studioAndTeamBody: "Create a studio, invite designers, and use a shared enquiry inbox and connected team portfolio.",
      activeStudios: "Active studios",
      aiHistory: "Saved analyses",
      savedBriefs: "Briefs",
      tool: "Tool",
      aiAnalysis: "AI analysis",
      active: "Active",
      enquiriesEyebrow: "Project enquiries",
      enquiries: "Brief enquiries",
      professionalEnquiriesBody: "Review enquiries sent to your profile and any studios you belong to.",
      clientEnquiriesBody: "Track briefs sent to designers and studios, then continue the conversation.",
      received: "Received",
      sent: "Sent",
      role: "Role",
      nextEyebrow: "Best next steps",
      professionalNextTitle: "Prepare your profile for clients",
      clientNextTitle: "Move your project forward",
      professionalNextCta: "Open Designer Studio",
      clientNextCta: "Browse designers",
      stepsProfessional: [
        "1. Complete the essentials", "Add your location, specialty, pricing, and contact details so clients can assess the fit quickly.",
        "2. Add your first project", "Even one strong portfolio card makes a public profile look far more credible.",
        "3. Review the public view", "Open your profile as a client and check that the story is clear.",
      ],
      stepsClient: [
        "1. Create a clear brief", "Set the project type, budget, timing, style, and add reference photos.",
        "2. Compare professionals", "Compare independent designers and studios before you send a brief.",
        "3. Continue in messages", "Keep replies, decisions, and project context together in Client Workspace.",
      ],
      accessEyebrow: "Your account",
      accessTitle: "Access and details",
      email: "Email",
      accountType: "Account type",
      account: "Account",
      openClientZone: "Open Client Workspace",
      publicProfileLink: "Public profile link",
      openProfile: "Open profile",
      compass: {
        professionalTitle: "Analyze inspiration",
        clientTitle: "Saved briefs",
        professionalBody: "Run an AI analysis of reference photos to recognize the style, materials, and design language. Designers can use the tool but cannot send briefs as clients.",
        clientBody: "Review briefs with inspiration, budget, and scope before contacting a designer or studio.",
      },
    },
    clientOverview: {
      dateLocale: "en-GB",
      statuses: { accepted: "Accepted", declined: "Declined", reviewing: "In review", sent: "New" },
      stats: ["Saved briefs", "Favorites", "Designer enquiries", "Unread messages"],
      eyebrow: "Your interior project",
      title: "Client dashboard",
      intro: "Keep inspiration, briefs, favorite professionals, and every conversation in one place: from the first idea to choosing a designer.",
      createBrief: "Create a brief",
      openDirectory: "Open Designer Directory",
      profileUpdated: "Your account details have been updated.",
      activityEyebrow: "Recent activity",
      conversationsTitle: "Conversations with designers",
      viewAll: "View all",
      defaultProfessional: "Interior designer",
      studio: "Design studio",
      emptyTitle: "You do not have any designer conversations yet",
      emptyBody: "Create a brief in AI Project Compass, save it, and send it to a designer whose portfolio suits your project.",
      emptyCta: "Open AI Project Compass",
      nextStepEyebrow: "Your next step",
      nextStepWithBrief: "Compare your best matches",
      nextStepWithoutBrief: "Turn inspiration into a brief",
      nextStepWithBriefBody: "Save interesting designers and projects in Favorites, then send a well-prepared brief.",
      nextStepWithoutBriefBody: "Add inspiration, scope, budget, and timing so designers can understand your project before responding.",
      savedBriefsCta: "Open saved briefs",
      favoritesCta: "Review favorites",
    },
    clientMessages: {
      dateLocale: "en-GB",
      statuses: { accepted: "Accepted", declined: "Declined", reviewing: "In review", sent: "New" },
      unreadPageTitle: "Messages",
      eyebrow: "Designer communication",
      title: "Messages",
      intro: "Keep conversations with designers next to the detailed brief and the references you sent.",
      allConversations: "All conversations",
      unread: "Unread",
      loadError: "Could not load messages",
      defaultProfessional: "Interior designer",
      studio: "Design studio",
      newMessages: "new",
      you: "You",
      openingMessage: "Your opening message",
      openToSeeBrief: "Open the conversation to see the full brief.",
      readMessage: "Read message",
      openConversation: "Open conversation",
      viewStudio: "View studio profile",
      viewProfessional: "View designer profile",
      allReadTitle: "Everything is read",
      noMessagesTitle: "You do not have any messages yet",
      allReadBody: "New replies will appear here and in the Messages counter.",
      noMessagesBody: "Send a saved brief to a designer and the conversation will appear here.",
      allConversationsCta: "View all conversations",
      browseProfessionalsCta: "Browse designers",
    },
    clientBriefs: {
      dateLocale: "en-GB",
      eyebrow: "AI Project Compass library",
      title: "Saved briefs",
      intro: "Your saved briefs stay here with the scope, budget, timing, and reference photos.",
      createAnother: "Create another brief",
      loadError: "Could not load briefs",
      defaultType: "Project brief",
      untitled: "Untitled brief",
      savedOn: "Saved",
      photoLabel: (count) => `${count} ${count === 1 ? "photo" : "photos"}`,
      fields: ["Goal", "Style", "Support", "Budget", "Timing", "Area", "Rooms", "Property", "3D", "Supervision", "Location"],
      notSpecified: "Not specified",
      manageCta: "Send or manage brief",
      findMatchesCta: "Find matching designers",
      emptyTitle: "You do not have any saved briefs yet",
      emptyBody: "AI Project Compass turns reference photos and practical needs into a brief you can reuse.",
      emptyCta: "Create a project brief",
    },
    clientFavorites: {
      eyebrow: "Your shortlist",
      title: "Favorites",
      intro: "Compare designers, studios, projects, and inspiration without losing what truly suits your space.",
      loadError: "Could not load favorites",
      designersEyebrow: "Professionals worth considering",
      designersTitle: "Saved designers",
      findMore: "Find more",
      defaultProfessional: "Interior designer",
      studio: "Design studio",
      designerBioFallback: "Open the profile to learn about this designer's approach and work.",
      openProfile: "Open profile",
      designersEmpty: "Save designers from the directory to build your shortlist here.",
      studiosEyebrow: "Teams worth considering",
      studiosTitle: "Saved studios",
      studioBioFallback: "Open the studio profile to see its team and shared portfolio.",
      openStudio: "Open studio",
      studiosEmpty: "Save studio profiles while comparing teams.",
      projectsEyebrow: "Interiors and ideas",
      projectsTitle: "Saved projects",
      openProject: "Open project",
      untitledProject: "Untitled project",
      portfolio: "Portfolio",
      projectDescriptionFallback: "Open the project to see the gallery and author profile.",
      projectsEmpty: "Save portfolio projects while comparing visual directions.",
      inspirationEyebrow: "Ideas to return to",
      inspirationTitle: "Saved inspiration",
      discoverInspiration: "Explore Inspiration Hub",
      articlesEmpty: "Save articles from Inspiration Hub to keep useful ideas here.",
    },
    studioOverview: {
      dateLocale: "en-GB",
      statuses: { accepted: "Accepted", declined: "Declined", reviewing: "In review", sent: "New" },
      stats: ["Profile views", "New enquiries", "Unread messages", "Accepted"],
      details: ["Last 30 days", "Waiting to be reviewed", "Across all active enquiries", (accepted, total) => `${accepted} of ${total} enquiries`],
      eyebrow: "Professional dashboard",
      title: "Designer dashboard",
      intro: "Review relevant briefs, respond to clients, develop your portfolio, and follow your profile performance.",
      inboxCta: "Open enquiries",
      addProjectCta: "Add a project",
      studioTeamCta: "Studio and team",
      opportunitiesEyebrow: "Latest opportunities",
      receivedBriefs: "Received briefs",
      viewAll: "View all",
      loadError: "Could not load enquiries",
      newClient: "New client",
      emptyTitle: "You do not have any new briefs yet",
      emptyBody: "Complete your public profile and add strong portfolio projects. New client enquiries will appear here automatically.",
      publicProfileCta: "View public profile",
      readinessEyebrow: "Profile readiness",
      readinessBody: "A complete profile gives clients more information before they send a brief.",
      editProfileCta: "Edit profile",
      manageProjectsCta: (count) => `Manage projects (${count})`,
      analyticsCta: "Open analytics",
    },
    studioInbox: {
      dateLocale: "en-GB",
      statuses: { all: "All", accepted: "Accepted", declined: "Declined", reviewing: "In review", sent: "New" },
      pageTitle: "Project enquiries",
      eyebrow: "Client communication",
      title: "Received briefs",
      intro: "Assess project fit, update the status, and keep each conversation next to the original client brief.",
      unread: "Unread",
      loadError: "Could not load enquiries",
      newMessages: "new",
      studioInbox: "Studio inbox",
      personalProfile: "Personal profile",
      newClient: "New client",
      client: "Client",
      youAndStudio: "You / studio team",
      clientMessage: "Client message",
      openToSeeBrief: "Open the brief to see the full project context.",
      replyCta: "Reply to client",
      openConversationCta: "Open conversation",
      allReadTitle: "Everything is read",
      noRequestsTitle: "No enquiries in this view",
      allReadBody: "New client replies will appear here and in the enquiries counter.",
      noRequestsBody: "New AI Project Compass briefs will appear here with inspiration, scope, budget, and the client message.",
      viewAllCta: "View all enquiries",
      improveProfileCta: "Improve public profile",
    },
    studioAnalytics: {
      dateLocale: "en-GB",
      eyebrow: "Profile performance",
      title: "Analytics",
      intro: "See real profile visits, AI Project Compass enquiries, accepted matches, and measured response time.",
      stats: ["Views", "Enquiries", "Accepted", "First reply"],
      last30Days: "Last 30 days",
      acceptedDetail: (count) => `${count} accepted`,
      noData: "No data",
      hours: "hrs",
      days: "days",
      responseDetail: "Based on replies sent on the platform",
      last14Days: "Last 14 days",
      profileViews: "Profile views",
      dailySessionDetail: "One browser session per profile per day",
      chartTitle: (views, inquiries) => `${views} views, ${inquiries} enquiries`,
      funnelEyebrow: "Last 90-day funnel",
      funnelTitle: "From view to collaboration",
      portfolioEyebrow: "Portfolio content",
      projectCount: (count) => `${count} ${count === 1 ? "public project" : "public projects"} available to clients before sending a brief.`,
      manageProjectsCta: "Manage projects",
      publicProfileCta: "Open public profile",
    },
    adminUsers: {
      dateLocale: "en-GB",
      never: "Never",
      professional: "Professional",
      client: "Client",
      noProfile: "No profile",
      needsReview: "Needs review",
      priority: "Priority",
      clear: "Clear",
      hidden: "Hidden",
      visible: "Visible",
      eyebrow: "Users",
      title: "Accounts",
      intro: "Find clients and professionals, review public activity, and keep internal operational notes.",
      searchPlaceholder: "Search by name, email, or location",
      allAccountTypes: "All account types",
      professionals: "Professionals",
      clients: "Clients",
      noProfileOption: "No profile",
      allReviewStatuses: "All review statuses",
      allVisibility: "Any visibility",
      applyFilters: "Apply filters",
      matches: (count) => `${count} matching accounts`,
      clearFilters: "Clear filters",
      table: ["Account", "Type", "Projects", "Briefs", "Enquiries", "Last sign-in", "Status", "Visibility", "Action"],
      unnamedAccount: "Unnamed account",
      noEmail: "No email",
      joined: "Joined",
      open: "Open",
      emptyTitle: "No matching accounts",
      emptyBody: "Clear the filters or try a broader search.",
      previous: "Previous",
      next: "Next",
      page: (page, total) => `Page ${page} of ${total}`,
    },
    adminTeam: {
      dateLocale: "en-GB",
      owner: "owner",
      admin: "admin",
      active: "Active",
      revoked: "Revoked",
      accessControl: "Access control",
      title: "Admin team",
      intro: "Give trusted people access to users, moderation, content, analytics, finance, and administrative activity.",
      accessGranted: "Administrator access has been granted.",
      accessRevoked: "Administrator access has been revoked.",
      loadError: "Could not load team access. Apply the Admin Team migration first.",
      unnamedAccount: "Unnamed account",
      noEmail: "No email",
      added: "Added",
      revokeAccess: "Revoke access",
      restoreAccess: "Restore access",
      noAdmins: "No administrator accounts found.",
      addAdmin: "Add administrator",
      grantAccess: "Grant access",
      instructions: "The person must first create an ArchiCompass account. Choose the access areas to assign to their admin role.",
      emailLabel: "Account email",
      accessScope: "Access scope",
      grantAdminAccess: "Grant administrator access",
      permissions: { users: "Users", moderation: "Moderation", content: "Content", analytics: "Analytics", team: "Admin team", finance: "Finance" },
    },
    adminActivity: {
      dateLocale: "en-GB",
      eyebrow: "Activity log",
      title: "Admin activity",
      intro: "Review sensitive administrative actions together with the actor, target, and time of the operation.",
      loadError: (message) => `Could not load activity: ${message}`,
      actions: { admin_access_granted: "Administrator access granted", admin_access_revoked: "Administrator access revoked", content_visibility_updated: "Content visibility updated", user_review_updated: "User review status updated" },
      status: "Status",
      visibility: "Visibility",
      hidden: "hidden",
      visible: "visible",
      emptyTitle: "No administrative activity yet",
      emptyBody: "Verification and moderation changes will appear here.",
      openUsers: "Open users",
    },
    studioConversation: {
      dateLocale: "en-GB",
      client: "Client",
      professional: "Interior designer",
      attachmentOnly: "Attachments shared",
      attachmentNotice: (names) => `Attachments shared: ${names}`,
      back: "Back to enquiries",
      conversationWith: (name) => `Conversation with: ${name}`,
      new: "New",
      statusLabel: "Enquiry status",
      reviewing: "In review",
      accepted: "Accepted",
      declined: "Declined",
      update: "Update",
      messageSent: "Message sent. The client can see it in the enquiry history.",
      statusUpdated: "Enquiry status updated.",
      messagesEyebrow: "Messages",
      messagesTitle: "Conversation with client",
      refresh: "Refresh",
      openingMessage: "opening message",
      you: "You",
      studioTeam: "Studio team",
      readByClient: "Read by client",
      sent: "Sent",
      emptyMessages: "There are no messages yet. Start with a focused question about the scope, timing, budget, or availability.",
      replyTo: (name) => `Reply to: ${name}`,
      replyPlaceholder: "Ask a question, confirm the fit, or suggest the next step...",
      attachFiles: "Add plans or documents",
      attachmentLimit: "up to 5 files, 20 MB each",
      privacyNotice: "Messages are visible only to this client and the designer or active studio team.",
      sendMessage: "Send message",
      sending: "Sending...",
      matchEyebrow: "Project match",
      briefFields: ["Project", "Goal", "Style", "Support", "Budget", "Area", "Rooms", "Property", "3D", "Supervision", "Location"],
      contactEyebrow: "Client contact",
      email: "Email",
      phone: "Phone",
      notSpecified: "Not specified",
      referencePhotos: "Client reference photos",
      fullBrief: "Open full brief",
      errors: {
        missingMessage: "Write a message or add an attachment before sending.",
        messageTooLong: "A message can contain up to 4,000 characters.",
        unavailable: "This conversation is not available.",
        invalidStatus: "Choose a valid enquiry status.",
        statusPermission: "Only the designer or studio team can change this enquiry status.",
      },
    },
    adminNav: {
      dashboard: "Dashboard",
      users: "Users",
      content: "Content",
      activity: "Activity",
      team: "Team",
      publicSite: "Public site",
      ariaLabel: "Admin panel",
    },
    adminOverview: {
      dateLocale: "en-GB",
      accountLabels: { professional: "Professional", client: "Client", noProfile: "No profile" },
      cards: ["Accounts", "Professionals", "Clients", "Portfolio projects", "Saved briefs", "Enquiries", "Inspiration Hub articles", "Hidden content", "Profile views"],
      details: {
        newIn30: (count) => `${count} new in 30 days`,
        profileSupply: "Profile supply",
        activeAccounts: (count) => `${count} active accounts`,
        publicWork: "Public work",
        aiResult: "AI Project Compass result",
        entirePlatform: "Across the platform",
        published: (count) => `${count} published`,
        hidden: (profiles, projects) => `${profiles} profiles, ${projects} projects`,
        last30Days: "Last 30 days",
      },
      eyebrow: "Platform operations",
      title: "Admin",
      intro: "Monitor the platform, review accounts, and see how users move from inspiration to a designer conversation.",
      openUsersCta: "Open users",
      loadError: "Could not load admin data. Check the database migrations and the active owner/admin role for this account.",
      activityEyebrow: "Latest activity",
      recentAccounts: "Recent accounts",
      viewAll: "View all",
      joined: "Joined",
      noAccounts: "No accounts to display.",
      privacyEyebrow: "Privacy boundary",
      privacyTitle: "Operational data only",
      privacyBody: "This panel shows counters, account data, public profiles, and public projects. Private message content and private reference photos remain outside the admin panel.",
      contentEyebrow: "Content",
      contentTitle: "Inspiration Hub",
      contentBody: "Create drafts, publish articles, and manage featured inspiration from the protected editor.",
      manageContentCta: "Manage content",
    },
  },
};

export function getWorkspaceCopy(locale: SiteLocale = siteLocale) {
  return workspaceCopyByLocale[locale];
}
