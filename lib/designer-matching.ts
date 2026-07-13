import { requiredServiceCapabilities } from "@/lib/service-capabilities";
import { distanceBetweenLocations } from "@/lib/location-distance";

export type MatchBrief = {
  projectType: string;
  goal: string;
  style: string;
  support: string;
  budget: string;
  timeline: string;
  area: string;
  roomCount: string;
  rooms: string[];
  propertyStatus: string;
  visualization: string;
  supervision: string;
  location: string;
  cues: string[];
  searchSpecialty: string;
};

export type MatchableProfessional = {
  bio: string | null;
  location: string | null;
  profession_type?: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
};

export type PortfolioSignal = {
  title: string | null;
  category: string | null;
  description: string | null;
};

export type MatchReason = {
  label: string;
  value: string;
  status: "strong" | "partial" | "check";
};

export type ProfessionalMatch = {
  percent: number;
  label: "Bardzo dobre dopasowanie" | "Obiecujące dopasowanie" | "Warto sprawdzić";
  reasons: MatchReason[];
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function contains(text: string, value: string) {
  const normalized = normalize(value).trim();
  return Boolean(normalized) && text.includes(normalized);
}

const matchingTerms: Record<string, string[]> = {
  apartment: ["apartment", "mieszkan", "apartament", "penthouse", "studio"],
  house: ["house", "dom", "willa", "rezydenc"],
  "single room": ["single room", "salon", "kuchnia", "sypial", "lazien", "gabinet"],
  office: ["office", "biuro", "gabinet", "pracownia"],
  "clarify direction": ["koncepc", "moodboard", "kierunek", "uklad funkcjonal"],
  "plan renovation": ["remont", "renow", "wykonczen", "adaptac"],
  "full design project": ["kompleks", "koordynac", "dokumentac", "pelny projekt"],
  "find the right pro": [],
  "new build / developer condition": ["new build", "deweloper", "nowy dom", "nowe mieszkanie", "wykonczen"],
  "existing property": ["remont", "renow", "kamienic", "istniejac"],
  "renovation in progress": ["remont", "renow", "adaptac"],
  "not purchased yet": [],
  "living room": ["living room", "salon", "strefa dzienna"],
  kitchen: ["kitchen", "kuchnia"],
  bedroom: ["bedroom", "sypial"],
  bathroom: ["bathroom", "lazien"],
  "home office": ["home office", "gabinet"],
  "children's room": ["children's room", "pokoj dzieci", "dzieci"],
  "hall / storage": ["hall", "hol", "przechowy", "zabudow"],
  other: [],
  "warm minimalism": ["warm minimalism", "cieply minimalizm", "soft minimalism", "minimalist", "minimalizm"],
  scandinavian: ["scandinavian", "skandynaw", "nordic"],
  "modern classic": ["modern classic", "nowoczesna klasyka", "contemporary", "wspolczesn"],
  industrial: ["industrial", "industrialn", "loft"],
  japandi: ["japandi", "japonsk"],
  contemporary: ["contemporary", "wspolczesn", "nowoczesn", "modern"],
  "mid-century modern": ["mid-century", "mid century", "vintage", "modernizm"],
  "art deco": ["art deco", "geometrycz", "mosiadz"],
  mediterranean: ["mediterranean", "srodziemnomorsk", "terakot", "trawertyn"],
  bohemian: ["bohemian", "boho", "warstwowe tekstyl", "rattan"],
  eclectic: ["eclectic", "eklektycz", "mieszanie epok"],
  "rustic / organic": ["rustic", "organic", "rustykal", "organicz", "recznie"],
  traditional: ["traditional", "tradycyjn", "klasyczn"],
  "luxury contemporary": ["luxury", "luksus", "quiet luxury", "minimaluxe", "premium"],
  "not sure yet": [],
  "natural wood": ["naturalne drewno", "naturalnych material", "drew", "fornir"],
  "naturalne drewno": ["naturalne drewno", "naturalnych material", "drew", "fornir"],
  "bright neutral palette": ["jasna neutralna paleta", "spokojna paleta", "jasn", "biel", "bez", "greige"],
  "jasna neutralna paleta": ["jasna neutralna paleta", "spokojna paleta", "jasn", "biel", "bez", "greige"],
  "hidden storage": ["hidden storage", "ukryte przechowywanie", "przechowy", "zabudow"],
  "ukryte przechowywanie": ["hidden storage", "ukryte przechowywanie", "przechowy", "zabudow"],
  "bold color accents": ["bold color", "wyraziste akcenty", "kolor", "kobalt", "terakot"],
  "wyraziste akcenty kolorystyczne": ["bold color", "wyraziste akcenty", "kolor", "kobalt", "terakot"],
  "dark contrast": ["dark contrast", "ciemny kontrast", "czarn", "stal", "kontrast"],
  "ciemny kontrast": ["dark contrast", "ciemny kontrast", "czarn", "stal", "kontrast"],
  "luxury details": ["luxury details", "luksusowe detale", "kamien", "mosiadz", "stolarka na wymiar"],
  "luksusowe detale": ["luxury details", "luksusowe detale", "kamien", "mosiadz", "stolarka na wymiar"],
  "eco materials": ["eco materials", "materialy ekologiczne", "ekologic", "niskoemis", "certyfikow", "naturalnych material"],
  "materiały ekologiczne": ["eco materials", "materialy ekologiczne", "ekologic", "niskoemis", "certyfikow", "naturalnych material"],
  "smart home": ["smart home", "automatyka", "integracja swiatla", "rolety", "sterowanie"],
  "compact solutions": ["compact solutions", "rozwiazania do malych przestrzeni", "kompakt", "mikro", "small spaces", "przechowy"],
  "rozwiązania do małych przestrzeni": ["compact solutions", "rozwiazania do malych przestrzeni", "kompakt", "mikro", "small spaces", "przechowy"],
  "soft curves": ["soft curves", "miekkie linie", "zaokragl", "lagodne linie"],
  "miękkie linie": ["soft curves", "miekkie linie", "zaokragl", "lagodne linie"],
  consultation: ["konsult", "site consultations"],
  "concept package": ["koncepc", "moodboard", "uklad funkcjonal"],
};

function termsFor(value: string) {
  const normalized = normalize(value).trim();
  if (!normalized) return [];
  return matchingTerms[normalized] ?? [normalized];
}

function matchesTerms(text: string, terms: string[]) {
  return terms.some((term) => contains(text, term));
}

function splitStyleValues(value: string) {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

function budgetRange(value: string) {
  if (value === "Under 50k PLN total project budget") return { min: 0, max: 50_000 };
  if (value === "50k-100k PLN total project budget") return { min: 50_000, max: 100_000 };
  if (value === "100k-200k PLN total project budget") return { min: 100_000, max: 200_000 };
  if (value === "200k-400k PLN total project budget") return { min: 200_000, max: 400_000 };
  if (value === "400k-800k PLN total project budget") return { min: 400_000, max: 800_000 };
  if (value === "800k+ PLN total project budget") return { min: 800_000, max: Number.POSITIVE_INFINITY };
  if (value === "Under 10k PLN") return { min: 0, max: 10_000 };
  if (value === "10k-30k PLN") return { min: 10_000, max: 30_000 };
  if (value === "30k-80k PLN") return { min: 30_000, max: 80_000 };
  if (value === "80k+ PLN") return { min: 80_000, max: Number.POSITIVE_INFINITY };
  return null;
}

function formatAmount(value: number) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);
}

export function scoreProfessionalMatch(
  professional: MatchableProfessional,
  brief: MatchBrief,
  portfolio: PortfolioSignal[] = []
): ProfessionalMatch {
  const professionalText = normalize(
    [
      professional.bio,
      professional.location,
      professional.profession_type,
      ...(professional.specialties ?? []),
      ...(professional.service_capabilities ?? []),
      ...portfolio.flatMap((project) => [project.title, project.category, project.description]),
    ]
      .filter(Boolean)
      .join(" ")
  );
  const reasons: MatchReason[] = [];
  let points = 0;
  let possible = 0;

  if (brief.style || brief.cues.length) {
    possible += 22;
    const styleValues = (brief.style ? splitStyleValues(brief.style) : []).filter(
      (style) => style !== "Not sure yet"
    );
    const matchedStyles = styleValues.filter((style) => matchesTerms(professionalText, termsFor(style)));
    const specialtyMatch = Boolean(
      brief.searchSpecialty && matchesTerms(professionalText, termsFor(brief.searchSpecialty))
    );
    const styleMatch = matchedStyles.length > 0 || specialtyMatch;
    const cueMatches = brief.cues.filter((cue) => matchesTerms(professionalText, termsFor(cue)));
    points +=
      (matchedStyles.length ? Math.min(14, matchedStyles.length * 7) : specialtyMatch ? 10 : 0) +
      Math.min(8, cueMatches.length * 2);
    reasons.push({
      label: "Styl",
      value: styleMatch
        ? `${matchedStyles.length ? matchedStyles.join(" / ") : brief.searchSpecialty} pojawia się w profilu lub portfolio`
        : cueMatches.length
          ? `Dopasowano ${cueMatches.length} ${cueMatches.length === 1 ? "cechę wizualną" : "cechy wizualne"}`
          : `${styleValues.join(" / ") || "Kierunek wizualny"} wymaga sprawdzenia portfolio`,
      status: styleMatch ? "strong" : cueMatches.length ? "partial" : "check",
    });
  }

  const projectSignals = [brief.projectType, brief.goal, brief.propertyStatus, ...brief.rooms]
    .map((signal) => ({ signal, terms: termsFor(signal) }))
    .filter(({ terms }) => terms.length);
  if (projectSignals.length) {
    possible += 15;
    const matchedSignals = projectSignals.filter(({ terms }) => matchesTerms(professionalText, terms));
    points += Math.round((matchedSignals.length / projectSignals.length) * 15);
    const size = brief.area ? ` · ${brief.area} m²` : "";
    reasons.push({
      label: "Zakres projektu",
      value: matchedSignals.length
        ? `Znaleziono ${matchedSignals.length}/${projectSignals.length} sygnałów z briefu${size}`
        : `${brief.projectType || "Projekt"}${size} · potwierdź podobne doświadczenie`,
      status:
        matchedSignals.length >= Math.ceil(projectSignals.length / 2)
          ? "strong"
          : matchedSignals.length
            ? "partial"
            : "check",
    });
  }

  const area = Number(brief.area);
  const roomCount = Number(brief.roomCount);
  const compactProject =
    (Number.isFinite(area) && area > 0 && area <= 55) || (roomCount > 0 && roomCount <= 2);
  const largeProject = (Number.isFinite(area) && area >= 120) || roomCount >= 5;
  if (compactProject || largeProject) {
    possible += 8;
    const scaleTerms = compactProject
      ? ["small spaces", "kompakt", "mikro", "przechowy", "zabudow"]
      : ["large homes", "duzy dom", "dom rodzinny", "willa", "rezydenc"];
    const scaleMatch = matchesTerms(professionalText, scaleTerms);
    points += scaleMatch ? 8 : 2;
    reasons.push({
      label: "Skala projektu",
      value: scaleMatch
        ? compactProject
          ? "Profil lub portfolio potwierdza doświadczenie w małych przestrzeniach"
          : "Profil lub portfolio potwierdza doświadczenie w większych domach"
        : `${brief.area ? `${brief.area} m²` : `${brief.roomCount} pomieszczeń`} · potwierdź podobną skalę realizacji`,
      status: scaleMatch ? "strong" : "check",
    });
  }

  const requiredCapabilities = requiredServiceCapabilities(
    brief.visualization,
    brief.supervision,
    brief.support
  );
  if (requiredCapabilities.length) {
    possible += 20;
    const available = professional.service_capabilities ?? [];
    const confirmed = requiredCapabilities.filter((capability) => available.includes(capability));
    points += Math.round((confirmed.length / requiredCapabilities.length) * 20);
    reasons.push({
      label: "Usługi",
      value:
        confirmed.length === requiredCapabilities.length
          ? `Potwierdzono wszystkie wymagane usługi (${requiredCapabilities.length})`
          : `Potwierdzono ${confirmed.length}/${requiredCapabilities.length} wymaganych usług`,
      status:
        confirmed.length === requiredCapabilities.length
          ? "strong"
          : confirmed.length
            ? "partial"
            : "check",
    });
  } else if (brief.support) {
    possible += 8;
    const supportMatch = matchesTerms(professionalText, termsFor(brief.support));
    points += supportMatch ? 8 : 2;
    reasons.push({
      label: "Wsparcie",
      value: supportMatch ? `W profilu widać doświadczenie: ${brief.support}` : `Do potwierdzenia: ${brief.support}`,
      status: supportMatch ? "strong" : "check",
    });
  }

  if (brief.location) {
    possible += 12;
    const professionalLocation = professional.location ?? "";
    const distance = professionalLocation
      ? distanceBetweenLocations(brief.location, professionalLocation)
      : null;
    const local =
      contains(normalize(professionalLocation), brief.location) ||
      contains(normalize(brief.location), professionalLocation) ||
      distance !== null && distance <= 25;
    const nearby = !local && distance !== null && distance <= 80;
    const remote = (professional.work_modes ?? []).some((mode) => mode === "Remote" || mode === "Hybrid");
    points += local ? 12 : nearby ? 10 : remote ? 7 : 2;
    reasons.push({
      label: "Lokalizacja",
      value: local
        ? `Dopasowanie lokalne · ${professional.location}`
        : nearby
          ? `Bliska lokalizacja · ${professional.location} (${distance} km)`
        : remote
          ? `Możliwa współpraca zdalna lub hybrydowa · ${professional.location || "lokalizacja do ustalenia"}`
          : `Sprawdź obszar działania · ${professional.location || "nie podano"}`,
      status: local || nearby ? "strong" : remote ? "partial" : "check",
    });
  }

  const clientBudget = budgetRange(brief.budget);
  if (clientBudget) {
    possible += 18;
    const minimum = professional.minimum_project_budget ?? professional.price_from;
    if (minimum === null) {
      points += 6;
      reasons.push({
        label: "Budżet",
        value: `${brief.budget} · wycena wymaga potwierdzenia`,
        status: "check",
      });
    } else if (minimum <= clientBudget.max) {
      const partlyAbove = professional.price_to !== null && professional.price_to > clientBudget.max;
      points += partlyAbove ? 14 : 18;
      reasons.push({
        label: "Budżet",
        value: partlyAbove
          ? `Zakres cen częściowo pokrywa się z budżetem: ${brief.budget}`
          : `Poziom startowy mieści się w budżecie: ${brief.budget}`,
        status: partlyAbove ? "partial" : "strong",
      });
    } else {
      reasons.push({
        label: "Budżet",
        value: `Minimalny budżet projektu: ${formatAmount(minimum)} PLN`,
        status: "check",
      });
    }
  }

  if (brief.timeline && brief.timeline !== "Just exploring") {
    possible += 8;
    const availability = professional.availability_status ?? "";
    const urgent = brief.timeline === "As soon as possible";
    const planned = brief.timeline === "In 1-3 months";
    const flexible = brief.timeline === "In 3-6 months";
    const availabilityPoints = availability === "Available now"
      ? 8
      : availability === "Within 1 month"
        ? urgent ? 6 : 8
        : availability === "Within 1-3 months"
          ? urgent ? 3 : planned ? 8 : 7
          : availability === "Waitlist / ask"
            ? flexible ? 6 : 1
            : 3;
    points += availabilityPoints;
    reasons.push({
      label: "Termin",
      value: `${brief.timeline} · ${availability || "dostępność do potwierdzenia"}`,
      status: availabilityPoints >= 7 ? "strong" : availabilityPoints >= 3 ? "partial" : "check",
    });
  }

  if (portfolio.length) {
    possible += 5;
    points += 5;
    reasons.push({
      label: "Portfolio",
      value: `${portfolio.length} ${portfolio.length === 1 ? "publiczny projekt" : "publicznych projektów"}`,
      status: "strong",
    });
  }

  const percent = possible ? Math.round((points / possible) * 100) : 0;
  return {
    percent,
    label: percent >= 75 ? "Bardzo dobre dopasowanie" : percent >= 50 ? "Obiecujące dopasowanie" : "Warto sprawdzić",
    reasons,
  };
}
