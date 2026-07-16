import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type StudioProfileCopy = {
  metadata: {
    missingTitle: string;
    missingDescription: string;
    title: (name: string, location: string | null) => string;
    description: (name: string) => string;
    home: string;
    directory: string;
  };
  labels: {
    back: string;
    studioType: string;
    profile: string;
    teamHeading: (count: number) => string;
    remoteLocation: string;
    manageStudio: string;
    team: string;
    projects: string;
    experience: string;
    onRequest: string;
    sharedInbox: string;
    contactHeading: (name: string) => string;
    contactBody: string;
    price: string;
    availability: string;
    workMode: string;
    minimumBudget: string;
    contact: string;
    throughBrief: string;
    terms: string;
    openInbox: string;
    sendBrief: string;
    designerNotice: string;
    openWebsite: string;
    about: string;
    designApproach: string;
    studioTeam: string;
    connectedDesigners: string;
    memberBioFallback: string;
    openDesigner: string;
    teamEmpty: string;
    sharedPortfolio: string;
    teamProjects: string;
    projectCount: (count: number) => string;
    untitledProject: string;
    author: (name: string) => string;
    memberProjectAuthor: string;
    viewProject: string;
    projectsEmpty: string;
    interiorDesigner: string;
    designer: string;
  };
};

const studioProfileCopy: Record<SiteLocale, StudioProfileCopy> = {
  pl: {
    metadata: {
      missingTitle: "Nie znaleziono pracowni",
      missingDescription: "Ten profil pracowni projektowej nie jest dostępny.",
      title: (name, location) => `${name} – pracownia projektowania wnętrz${location ? ` · ${location}` : ""}`,
      description: (name) => `Zobacz zespół, portfolio, specjalizacje, usługi i dostępność pracowni ${name} w ArchiCompass.`,
      home: "Strona główna",
      directory: "Katalog Projektantów",
    },
    labels: {
      back: "Wróć do katalogu projektantów", studioType: "Pracownia projektowa", profile: "Profil pracowni",
      teamHeading: (count) => `Jedna pracownia, ${count} ${count === 1 ? "powiązany projektant" : "powiązanych projektantów"}`,
      remoteLocation: "Zdalnie / lokalizacja do uzgodnienia", manageStudio: "Zarządzaj pracownią", team: "Zespół", projects: "Projekty", experience: "Doświadczenie", onRequest: "Na zapytanie",
      sharedInbox: "Wspólna skrzynka pracowni", contactHeading: (name) => `Skontaktuj się z ${name}`, contactBody: "Brief trafia do zespołu pracowni. Każdy aktywny członek może zobaczyć kontekst i kontynuować tę samą rozmowę.",
      price: "Cena", availability: "Dostępność", workMode: "Forma współpracy", minimumBudget: "Minimalny budżet", contact: "Kontakt", throughBrief: "Przez brief", terms: "Warunki współpracy", openInbox: "Otwórz skrzynkę zespołu", sendBrief: "Wyślij brief do pracowni", designerNotice: "Konta projektantów otrzymują briefy i nie mogą wysyłać zapytań jako klienci.", openWebsite: "Otwórz stronę internetową",
      about: "O pracowni", designApproach: "Podejście do projektowania", studioTeam: "Zespół pracowni", connectedDesigners: "Powiązani projektanci", memberBioFallback: "Otwórz indywidualny profil, aby zobaczyć portfolio i sposób pracy tego projektanta.", openDesigner: "Otwórz profil projektanta", teamEmpty: "Zespół pracowni przygotowuje publiczne profile projektantów.", sharedPortfolio: "Wspólne portfolio", teamProjects: "Projekty zespołu pracowni", projectCount: (count) => `${count} ${count === 1 ? "projekt" : count < 5 ? "projekty" : "projektów"}`, untitledProject: "Projekt bez tytułu", author: (name) => `Autor: ${name}`, memberProjectAuthor: "Projektant z pracowni", viewProject: "Zobacz projekt", projectsEmpty: "Projekty aktywnych członków zespołu pojawią się tutaj automatycznie.", interiorDesigner: "Projektant wnętrz", designer: "Projektant",
    },
  },
  en: {
    metadata: {
      missingTitle: "Studio not found",
      missingDescription: "This design studio profile is unavailable.",
      title: (name, location) => `${name} – interior design studio${location ? ` · ${location}` : ""}`,
      description: (name) => `Explore ${name}'s team, portfolio, specialties, services, and availability on ArchiCompass.`,
      home: "Home",
      directory: "Designer directory",
    },
    labels: {
      back: "Back to designer directory", studioType: "Design studio", profile: "Studio profile",
      teamHeading: (count) => `One studio, ${count} connected ${count === 1 ? "designer" : "designers"}`,
      remoteLocation: "Remote / location to be agreed", manageStudio: "Manage studio", team: "Team", projects: "Projects", experience: "Experience", onRequest: "On request",
      sharedInbox: "Shared studio inbox", contactHeading: (name) => `Contact ${name}`, contactBody: "Your brief reaches the studio team. Every active member can see the context and continue the same conversation.",
      price: "Price", availability: "Availability", workMode: "Working mode", minimumBudget: "Minimum budget", contact: "Contact", throughBrief: "Through a brief", terms: "Terms of cooperation", openInbox: "Open team inbox", sendBrief: "Send brief to studio", designerNotice: "Designer accounts receive briefs and cannot send enquiries as clients.", openWebsite: "Open website",
      about: "About the studio", designApproach: "Design approach", studioTeam: "Studio team", connectedDesigners: "Connected designers", memberBioFallback: "Open the individual profile to see this designer's portfolio and way of working.", openDesigner: "Open designer profile", teamEmpty: "The studio team is preparing public designer profiles.", sharedPortfolio: "Shared portfolio", teamProjects: "Studio team projects", projectCount: (count) => `${count} ${count === 1 ? "project" : "projects"}`, untitledProject: "Untitled project", author: (name) => `Author: ${name}`, memberProjectAuthor: "Studio designer", viewProject: "View project", projectsEmpty: "Projects from active team members will appear here automatically.", interiorDesigner: "Interior designer", designer: "Designer",
    },
  },
};

export function getStudioProfileCopy(locale: SiteLocale = siteLocale) {
  return studioProfileCopy[locale];
}
