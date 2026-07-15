import { polishVisualCue } from "@/lib/visual-cues";
import { siteLocale, type SiteLocale } from "@/lib/site-locale";

const briefLabels: Record<string, string> = {
  Apartment: "Mieszkanie",
  House: "Dom",
  "Single room": "Jedno pomieszczenie",
  Office: "Biuro",
  "Clarify direction": "Określić kierunek",
  "Plan renovation": "Zaplanować remont",
  "Full design project": "Kompleksowy projekt wnętrza",
  "Find the right pro": "Znaleźć właściwego specjalistę",
  "Warm minimalism": "Ciepły minimalizm",
  Scandinavian: "Skandynawski",
  "Modern classic": "Nowoczesna klasyka",
  Industrial: "Industrialny",
  Japandi: "Japandi",
  Contemporary: "Współczesny",
  "Mid-century modern": "Mid-century modern",
  "Art Deco": "Art deco",
  Mediterranean: "Śródziemnomorski",
  Bohemian: "Boho",
  Eclectic: "Eklektyczny",
  "Rustic / organic": "Rustykalny / organiczny",
  Traditional: "Tradycyjny",
  "Luxury contemporary": "Współczesny luksus",
  "Not sure yet": "Jeszcze nie wiem",
  Consultation: "Konsultacja",
  "Concept package": "Projekt koncepcyjny",
  "Technical design": "Projekt wykonawczy",
  "End-to-end support": "Kompleksowa obsługa",
  "Under 50k PLN total project budget": "Do 50 tys. zł",
  "50k-100k PLN total project budget": "50-100 tys. zł",
  "100k-200k PLN total project budget": "100-200 tys. zł",
  "200k-400k PLN total project budget": "200-400 tys. zł",
  "400k-800k PLN total project budget": "400-800 tys. zł",
  "800k+ PLN total project budget": "Powyżej 800 tys. zł",
  "Total project budget not decided": "Jeszcze nie wiem",
  "Under 10k PLN": "Do 10 tys. zł",
  "10k-30k PLN": "10-30 tys. zł",
  "30k-80k PLN": "30-80 tys. zł",
  "80k+ PLN": "Powyżej 80 tys. zł",
  "As soon as possible": "Jak najszybciej",
  "In 1-3 months": "Za 1-3 miesiące",
  "In 3-6 months": "Za 3-6 miesięcy",
  "Just exploring": "Na razie się rozglądam",
  "New build / developer condition": "Nowe mieszkanie lub dom",
  "Existing property": "Istniejące wnętrze",
  "Renovation in progress": "Remont w toku",
  "Not purchased yet": "Nieruchomość jeszcze niekupiona",
  "Not needed": "Nie potrzebuję",
  "Selected rooms": "Wybrane pomieszczenia",
  "Full project": "Cały projekt",
  "Consultations / site visits": "Konsultacje / wizyty na budowie",
  "Author's supervision": "Nadzór autorski",
  "Full project coordination": "Pełna koordynacja realizacji",
  "Living room": "Salon",
  Kitchen: "Kuchnia",
  Bedroom: "Sypialnia",
  Bathroom: "Łazienka",
  "Home office": "Gabinet domowy",
  "Children's room": "Pokój dziecięcy",
  "Hall / storage": "Hol / przechowywanie",
  Other: "Inne",
  minimalist: "minimalistyczny",
  contemporary: "współczesny",
  "mid-century": "mid-century modern",
  bohemian: "boho",
  mediterranean: "śródziemnomorski",
  rustic: "rustykalny",
  luxury: "luksusowy",
  "sustainable design": "zrównoważone projektowanie",
  "smart homes": "smart home",
  "quiet luxury": "quiet luxury",
};

export function briefLabel(value: string | null | undefined, locale: SiteLocale = siteLocale) {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  if (locale === "en") return trimmed;
  return briefLabels[trimmed] ?? polishVisualCue(trimmed);
}

export function briefStyleLabel(value: string | null | undefined, locale: SiteLocale = siteLocale) {
  return value
    ?.split("|")
    .map((item) => briefLabel(item, locale))
    .filter(Boolean)
    .join(" / ") ?? "";
}

export function briefListLabel(values: string[] | null | undefined, locale: SiteLocale = siteLocale) {
  return values?.map((value) => briefLabel(value, locale)).filter(Boolean).join(", ") ?? "";
}

export function briefSnapshotLabel(snapshot: Record<string, unknown> | null, key: string, locale: SiteLocale = siteLocale) {
  const value = snapshot?.[key];
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const items = value.filter((item): item is string => typeof item === "string");
    return briefListLabel(items, locale) || (locale === "pl" ? "Nie podano" : "Not specified");
  }
  if (typeof value !== "string" || !value.trim()) return locale === "pl" ? "Nie podano" : "Not specified";
  const label = key === "style_direction" ? briefStyleLabel(value, locale) : briefLabel(value, locale);
  return label || (locale === "pl" ? "Nie podano" : "Not specified");
}
