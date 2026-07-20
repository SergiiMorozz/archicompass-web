import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export const profileProfessionTypes = [
  "Interior architect",
  "Interior designer",
  "Interior design studio",
  "Interior design practice",
  "Interior architecture studio",
] as const;

const professionAliases: Record<string, (typeof profileProfessionTypes)[number]> = {
  "Architekt wnętrz": "Interior architect",
  "Projektant wnętrz": "Interior designer",
  "Pracownia projektowania wnętrz": "Interior design studio",
  "Pracownia architektury wnętrz": "Interior architecture studio",
  Studio: "Interior design studio",
};

const professionLabels = {
  pl: {
    "Interior architect": "Architekt wnętrz",
    "Interior designer": "Projektant wnętrz",
    "Interior design studio": "Pracownia projektowania wnętrz",
    "Interior design practice": "Pracownia projektowania wnętrz",
    "Interior architecture studio": "Pracownia architektury wnętrz",
    professional: "Specjalista",
  },
  en: {
    "Interior architect": "Interior architect",
    "Interior designer": "Interior designer",
    "Interior design studio": "Interior design studio",
    "Interior design practice": "Interior design practice",
    "Interior architecture studio": "Interior architecture studio",
    professional: "Professional",
  },
} as const;

const languageLabels = {
  pl: {
    Polish: "polski",
    English: "angielski",
    German: "niemiecki",
    French: "francuski",
    Spanish: "hiszpański",
    Ukrainian: "ukraiński",
    Russian: "rosyjski",
  },
  en: {
    Polish: "Polish",
    English: "English",
    German: "German",
    French: "French",
    Spanish: "Spanish",
    Ukrainian: "Ukrainian",
    Russian: "Russian",
  },
} as const;

const locationReplacements = {
  pl: [
    ["Warsaw", "Warszawa"],
    ["Krakow", "Kraków"],
    ["Wroclaw", "Wrocław"],
    ["Gdansk", "Gdańsk"],
    ["Poznan", "Poznań"],
    ["Lodz", "Łódź"],
    ["Poland", "Polska"],
  ],
  en: [
    ["Warszawa", "Warsaw"],
    ["Kraków", "Krakow"],
    ["Wrocław", "Wroclaw"],
    ["Gdańsk", "Gdansk"],
    ["Poznań", "Poznan"],
    ["Łódź", "Lodz"],
    ["Polska", "Poland"],
  ],
} as const;

export function profileTypeLabel(value: string | null | undefined, locale: SiteLocale = siteLocale) {
  const fallback = locale === "pl" ? "Specjalista" : "Professional";
  if (!value) return fallback;
  const normalized = profileProfessionTypeValue(value);
  return professionLabels[locale][normalized as keyof typeof professionLabels[typeof locale]] || normalized;
}

export function profileProfessionTypeValue(value: string | null | undefined) {
  if (!value) return "";
  return professionAliases[value] || value;
}

export function profileLocationLabel(value: string | null | undefined, locale: SiteLocale = siteLocale) {
  if (!value) return locale === "pl" ? "Praca zdalna / lokalizacja do uzgodnienia" : "Remote work / location to be agreed";
  return locationReplacements[locale].reduce(
    (result, [from, to]) => result.replace(from, to),
    value
  );
}

export function profileExperienceLabel(value: number | null | undefined, locale: SiteLocale = siteLocale) {
  if (!value) return locale === "pl" ? "Brak danych" : "Not specified";
  if (locale === "en") return `${value}+ ${value === 1 ? "year" : "years"}`;
  return `${value}+ ${value === 1 ? "rok" : value < 5 ? "lata" : "lat"}`;
}

export function profileLanguageLabel(value: string, locale: SiteLocale = siteLocale) {
  return languageLabels[locale][value as keyof typeof languageLabels[typeof locale]] || value;
}

export function profileProjectCountLabel(count: number, locale: SiteLocale = siteLocale) {
  if (locale === "en") return `${count} ${count === 1 ? "public project" : "public projects"}`;
  const lastTwo = Math.abs(count) % 100;
  const last = Math.abs(count) % 10;
  const form = count === 1 ? "publiczny projekt" : last >= 2 && last <= 4 && !(lastTwo >= 12 && lastTwo <= 14) ? "publiczne projekty" : "publicznych projektów";
  return `${count} ${form}`;
}
