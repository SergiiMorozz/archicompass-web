import { siteLocale, type SiteLocale } from "@/lib/site-locale";

type DirectoryCopy = {
  metadata: { title: string; description: string };
  trends: string[];
  hero: {
    badge: string;
    title: string;
    body: string;
    cta: string;
    searchPlaceholder: string;
    search: string;
    popular: string;
    imageAlt: string;
    imageTitle: string;
    imageBody: string;
  };
  brief: {
    eyebrow: string;
    title: string;
    body: string;
    edit: string;
    rooms: string;
  };
  mobileFilters: { title: string; show: string; hide: string };
  filters: {
    title: string;
    clear: string;
    location: string;
    locationPlaceholder: string;
    profileType: string;
    allProfiles: string;
    independent: string;
    studios: string;
    collaboration: string;
    availabilityAndMode: string;
    anyAvailability: string;
    anyMode: string;
    publishedPrice: string;
    priceHelp: string;
    anyPricingModel: string;
    maximum: string;
    styleAndProject: string;
    interiorStyles: string;
    chooseStyles: string;
    projectType: string;
    servicesAndExperience: string;
    services: string;
    focus: string;
    experienceAndThreshold: string;
    minimumExperience: string;
    anyExperience: string;
    minimumYears: (years: number) => string;
    maximumBudget: string;
    budgetPlaceholder: string;
    apply: string;
  };
  cards: {
    untitled: string;
    studio: string;
    remoteStudio: string;
    sharedStudioBio: string;
    serviceMatch: string;
    allServices: string;
    someServices: (available: number, requested: number) => string;
    availabilityUnknown: string;
    viewStudio: string;
    sendBrief: string;
    profilePhoto: string;
    demoProfile: string;
    professionalProfile: string;
    professional: string;
    noBio: string;
    whyItFits: string;
    primaryMatch: string;
    samplePortfolio: string;
    portfolioProfile: string;
    viewPortfolio: string;
    high: string;
    compare: string;
    styleMatch: string;
    styleOrSpecialty: string;
    projectType: string;
    location: string;
    support: string;
    visualisations: string;
    supervision: string;
    budget: string;
    portfolio: string;
    checkPortfolio: string;
    localMatch: (location: string) => string;
    remoteCheck: (location: string) => string;
    checkServices: string;
    confirmationNeeded: (value: string) => string;
    available: string;
    quoteAfterBrief: string;
    budgetQuote: (value: string) => string;
  };
  results: {
    nearbyFallback: (location: string) => string;
    studiosTitle: string;
    studiosBody: string;
    briefRecommended: string;
    recommended: string;
    sortRecommended: string;
    sortNewest: string;
    sortExperience: string;
    list: string;
    grid: string;
    loadingError: string;
    emptyTitle: string;
    emptyBrief: string;
    emptySearch: string;
    showAll: string;
  };
  locations: { eyebrow: string; title: string; body: string };
  counts: {
    results: (count: number) => string;
    studios: (count: number) => string;
    designers: (count: number) => string;
    members: (count: number) => string;
    projects: (count: number) => string;
  };
};

function polishForm(count: number, one: string, few: string, many: string) {
  const absolute = Math.abs(count);
  const lastTwo = absolute % 100;
  const last = absolute % 10;
  const form = absolute === 1 ? one : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? few : many;
  return `${count} ${form}`;
}

const pl: DirectoryCopy = {
  metadata: {
    title: "Projektanci wnętrz i pracownie projektowe",
    description: "Znajdź projektantów wnętrz i pracownie według miasta, stylu, usług, budżetu, dostępności, portfolio i opinii Google. Porównaj profile i wyślij brief.",
  },
  trends: ["Ekologiczne wnętrza", "Smart home", "Quiet luxury", "Minimalizm", "Warszawa"],
  hero: {
    badge: "Katalog Projektantów",
    title: "Projektanci wnętrz i pracownie",
    body: "Porównuj profile według stylu, lokalizacji, usług i dopasowania do Twojej inwestycji.",
    cta: "Stwórz brief z AI Project Compass →",
    searchPlaceholder: "Szukaj według nazwy, stylu lub specjalizacji...",
    search: "Szukaj",
    popular: "Popularne",
    imageAlt: "Jasne, nowoczesne wnętrze",
    imageTitle: "Dopasowanie do inwestycji",
    imageBody: "Styl, zakres, budżet i lokalizacja w jednym miejscu.",
  },
  brief: {
    eyebrow: "Dopasowanie na podstawie AI Project Compass",
    title: "Specjaliści dopasowani do Twojego briefu",
    body: "Wyniki uwzględniają styl, zakres, pomieszczenia, usługi, budżet, lokalizację, termin i portfolio. Brakujące informacje są oznaczane jako wymagające potwierdzenia.",
    edit: "Edytuj brief",
    rooms: "pom.",
  },
  mobileFilters: { title: "Filtry", show: "Pokaż", hide: "Ukryj" },
  filters: {
    title: "Filtry", clear: "Wyczyść", location: "Lokalizacja", locationPlaceholder: "Wpisz miasto lub kod pocztowy", profileType: "Typ profilu", allProfiles: "Projektanci i pracownie", independent: "Niezależni projektanci", studios: "Pracownie projektowe", collaboration: "Współpraca i cena", availabilityAndMode: "Dostępność i forma współpracy", anyAvailability: "Dowolna dostępność", anyMode: "Dowolna forma współpracy", publishedPrice: "Opublikowana cena projektu", priceHelp: "Cena w PLN według wybranego modelu rozliczeń, nie całkowity budżet remontu.", anyPricingModel: "Dowolny model rozliczeń", maximum: "Maks.", styleAndProject: "Styl i typ projektu", interiorStyles: "Style wnętrz", chooseStyles: "Wybierz jeden lub kilka stylów.", projectType: "Typ projektu", servicesAndExperience: "Usługi i doświadczenie", services: "Usługi", focus: "Doświadczenie w szczególnych projektach", experienceAndThreshold: "Doświadczenie i próg projektu", minimumExperience: "Minimalne doświadczenie", anyExperience: "Dowolne doświadczenie", minimumYears: (years) => `Minimum ${years} ${years === 3 ? "lata" : "lat"}`, maximumBudget: "Maksymalny całkowity budżet projektu (PLN)", budgetPlaceholder: "np. 100 000", apply: "Zastosuj filtry",
  },
  cards: {
    untitled: "Profil bez nazwy", studio: "Pracownia projektowa", remoteStudio: "Pracownia pracująca zdalnie", sharedStudioBio: "Wspólny profil pracowni z zespołową skrzynką odbiorczą i projektami powiązanych projektantów.", serviceMatch: "Dopasowanie usług", allServices: "Wszystkie wymagane usługi są dostępne", someServices: (available, requested) => `${available}/${requested} wymaganych usług jest dostępnych`, availabilityUnknown: "Dostępność do potwierdzenia", viewStudio: "Zobacz pracownię", sendBrief: "Wyślij brief", profilePhoto: "zdjęcie profilowe", demoProfile: "Profil demonstracyjny", professionalProfile: "Profil specjalisty", professional: "Specjalista", noBio: "Ten specjalista nie dodał jeszcze opisu publicznego.", whyItFits: "Dlaczego ten profil może pasować", primaryMatch: "Najważniejszy sygnał dopasowania", samplePortfolio: "Przykładowe portfolio", portfolioProfile: "Profil z portfolio", viewPortfolio: "Zobacz portfolio", high: "Wysokie", compare: "Porównaj", styleMatch: "Dopasowanie stylu", styleOrSpecialty: "Styl / specjalizacja", projectType: "Typ projektu", location: "Lokalizacja", support: "Zakres wsparcia", visualisations: "Wizualizacje 3D", supervision: "Nadzór", budget: "Budżet", portfolio: "Portfolio", checkPortfolio: "Sprawdź w portfolio podobne pomieszczenia i typy projektów", localMatch: (location) => `Dopasowanie lokalne · ${location}`, remoteCheck: (location) => `Sprawdź możliwość współpracy zdalnej · ${location}`, checkServices: "Sprawdź dostępne usługi", confirmationNeeded: (value) => `Do potwierdzenia · ${value}`, available: "Dostępne", quoteAfterBrief: "Wycena po analizie briefu", budgetQuote: (value) => `${value} · wycena po analizie briefu`,
  },
  results: {
    nearbyFallback: (location) => `Nie znaleziono profili dokładnie w lokalizacji ${location}. Pokazujemy specjalistów z najbliższych dostępnych miejscowości, uporządkowanych według odległości.`,
    studiosTitle: "Pracownie projektowe", studiosBody: "Skontaktuj się z całym zespołem i zobacz projekty powiązanych projektantów.", briefRecommended: "Rekomendowani do Twojego briefu", recommended: "Polecani specjaliści", sortRecommended: "Polecane", sortNewest: "Najnowsze", sortExperience: "Doświadczenie", list: "Lista", grid: "Siatka", loadingError: "Nie udało się wczytać profili", emptyTitle: "Żaden projektant nie spełnia wybranych kryteriów", emptyBrief: "Nie znaleziono jeszcze dokładnego dopasowania. Poszerz lokalizację lub wybór stylów albo zapisz brief i wróć, gdy dołączą kolejni specjaliści.", emptySearch: "Usuń część filtrów lub wyszukaj inne miasto.", showAll: "Pokaż cały katalog",
  },
  locations: { eyebrow: "Szukaj według lokalizacji", title: "Projektanci wnętrz w pobliżu inwestycji", body: "Przeglądaj katalogi miejskie i porównuj specjalistów według portfolio, usług, dopasowania do projektu, dostępności oraz połączonych opinii Google." },
  counts: {
    results: (count) => polishForm(count, "wynik", "wyniki", "wyników"),
    studios: (count) => polishForm(count, "znaleziona pracownia", "znalezione pracownie", "znalezionych pracowni"),
    designers: (count) => polishForm(count, "znaleziony projektant", "znalezieni projektanci", "znalezionych projektantów"),
    members: (count) => polishForm(count, "powiązany projektant", "powiązanych projektantów", "powiązanych projektantów"),
    projects: (count) => polishForm(count, "publiczny projekt", "publiczne projekty", "publicznych projektów"),
  },
};

const en: DirectoryCopy = {
  metadata: {
    title: "Interior designers and design studios",
    description: "Find interior designers and design studios by city, style, services, budget, availability, portfolio and Google reviews. Compare profiles and send a project brief.",
  },
  trends: ["Sustainable interiors", "Smart home", "Quiet luxury", "Minimalism", "Warsaw"],
  hero: {
    badge: "Designer Directory", title: "Interior designers and studios", body: "Compare profiles by style, location, services, and fit for your investment.", cta: "Create a brief with AI Project Compass →", searchPlaceholder: "Search by name, style, or speciality...", search: "Search", popular: "Popular", imageAlt: "Bright, modern interior", imageTitle: "Fit for your project", imageBody: "Style, scope, budget, and location in one place.",
  },
  brief: {
    eyebrow: "Matched with AI Project Compass", title: "Professionals matched to your brief", body: "Results consider style, scope, rooms, services, budget, location, timing, and portfolio. Missing information is marked for confirmation.", edit: "Edit brief", rooms: "rooms",
  },
  mobileFilters: { title: "Filters", show: "Show", hide: "Hide" },
  filters: {
    title: "Filters", clear: "Clear", location: "Location", locationPlaceholder: "Enter a city or postcode", profileType: "Profile type", allProfiles: "Designers and studios", independent: "Independent designers", studios: "Design studios", collaboration: "Collaboration and price", availabilityAndMode: "Availability and working mode", anyAvailability: "Any availability", anyMode: "Any working mode", publishedPrice: "Published project price", priceHelp: "Price in PLN for the selected billing model, not the total renovation budget.", anyPricingModel: "Any pricing model", maximum: "Max.", styleAndProject: "Style and project type", interiorStyles: "Interior styles", chooseStyles: "Choose one or more styles.", projectType: "Project type", servicesAndExperience: "Services and experience", services: "Services", focus: "Experience in specific projects", experienceAndThreshold: "Experience and project threshold", minimumExperience: "Minimum experience", anyExperience: "Any experience", minimumYears: (years) => `At least ${years} years`, maximumBudget: "Maximum total project budget (PLN)", budgetPlaceholder: "e.g. 100,000", apply: "Apply filters",
  },
  cards: {
    untitled: "Unnamed profile", studio: "Interior design studio", remoteStudio: "Studio working remotely", sharedStudioBio: "A shared studio profile with a team inbox and projects from linked designers.", serviceMatch: "Service fit", allServices: "All requested services are available", someServices: (available, requested) => `${available}/${requested} requested services are available`, availabilityUnknown: "Availability to be confirmed", viewStudio: "View studio", sendBrief: "Send brief", profilePhoto: "profile photo", demoProfile: "Demo profile", professionalProfile: "Professional profile", professional: "Professional", noBio: "This professional has not added a public description yet.", whyItFits: "Why this profile may fit", primaryMatch: "Primary matching signal", samplePortfolio: "Sample portfolio", portfolioProfile: "Portfolio profile", viewPortfolio: "View portfolio", high: "High", compare: "Compare", styleMatch: "Style match", styleOrSpecialty: "Style / speciality", projectType: "Project type", location: "Location", support: "Support scope", visualisations: "3D visualisations", supervision: "Supervision", budget: "Budget", portfolio: "Portfolio", checkPortfolio: "Check the portfolio for similar rooms and project types", localMatch: (location) => `Local match · ${location}`, remoteCheck: (location) => `Check remote collaboration · ${location}`, checkServices: "Check available services", confirmationNeeded: (value) => `To confirm · ${value}`, available: "Available", quoteAfterBrief: "Quote after reviewing the brief", budgetQuote: (value) => `${value} · quote after reviewing the brief`,
  },
  results: {
    nearbyFallback: (location) => `No profiles were found exactly in ${location}. Showing professionals from the nearest available locations, ordered by distance.`, studiosTitle: "Design studios", studiosBody: "Contact the whole team and see projects from linked designers.", briefRecommended: "Recommended for your brief", recommended: "Recommended professionals", sortRecommended: "Recommended", sortNewest: "Newest", sortExperience: "Experience", list: "List", grid: "Grid", loadingError: "Unable to load profiles", emptyTitle: "No designers match the selected criteria", emptyBrief: "There is no exact match yet. Widen the location or style selection, or save the brief and return when more professionals join.", emptySearch: "Remove some filters or search for another city.", showAll: "Show the full directory",
  },
  locations: { eyebrow: "Search by location", title: "Interior designers near your project", body: "Browse city directories and compare professionals by portfolio, services, project fit, availability, and linked Google reviews." },
  counts: {
    results: (count) => `${count} ${count === 1 ? "result" : "results"}`,
    studios: (count) => `${count} ${count === 1 ? "studio found" : "studios found"}`,
    designers: (count) => `${count} ${count === 1 ? "designer found" : "designers found"}`,
    members: (count) => `${count} linked ${count === 1 ? "designer" : "designers"}`,
    projects: (count) => `${count} public ${count === 1 ? "project" : "projects"}`,
  },
};

const directoryCopyByLocale: Record<SiteLocale, DirectoryCopy> = { pl, en };

export function getDirectoryCopy(locale: SiteLocale = siteLocale) {
  return directoryCopyByLocale[locale];
}
