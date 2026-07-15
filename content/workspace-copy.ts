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

type WorkspaceCopy = {
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
};

const workspaceCopyByLocale: Record<SiteLocale, WorkspaceCopy> = {
  pl: {
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
  },
  en: {
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
  },
};

export function getWorkspaceCopy(locale: SiteLocale = siteLocale) {
  return workspaceCopyByLocale[locale];
}
