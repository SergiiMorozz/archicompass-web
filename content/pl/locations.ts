export type PolishCityGrammar = {
  adjective: string;
  city: string;
  citySlug: string;
  genitive: string;
  locative: string;
};

export const polishCityGrammar: Record<string, PolishCityGrammar> = {
  warsaw: {
    adjective: "warszawski",
    city: "Warszawa",
    citySlug: "warsaw",
    genitive: "z Warszawy",
    locative: "w Warszawie",
  },
  krakow: {
    adjective: "krakowski",
    city: "Kraków",
    citySlug: "krakow",
    genitive: "z Krakowa",
    locative: "w Krakowie",
  },
  wroclaw: {
    adjective: "wrocławski",
    city: "Wrocław",
    citySlug: "wroclaw",
    genitive: "z Wrocławia",
    locative: "we Wrocławiu",
  },
  gdansk: {
    adjective: "gdański",
    city: "Gdańsk",
    citySlug: "gdansk",
    genitive: "z Gdańska",
    locative: "w Gdańsku",
  },
  poznan: {
    adjective: "poznański",
    city: "Poznań",
    citySlug: "poznan",
    genitive: "z Poznania",
    locative: "w Poznaniu",
  },
  lodz: {
    adjective: "łódzki",
    city: "Łódź",
    citySlug: "lodz",
    genitive: "z Łodzi",
    locative: "w Łodzi",
  },
  katowice: {
    adjective: "katowicki",
    city: "Katowice",
    citySlug: "katowice",
    genitive: "z Katowic",
    locative: "w Katowicach",
  },
};

export const cityDirectoryCopy = {
  beforeContact: {
    eyebrow: "Zanim skontaktujesz się z projektantem",
    title: "Dobry brief pomaga otrzymać trafniejsze odpowiedzi.",
    bodyLeft:
      "Podaj typ i status nieruchomości, metraż, pomieszczenia objęte projektem, lokalizację, budżet, planowany termin oraz informację o wizualizacjach 3D i nadzorze.",
    bodyRight:
      "Dodaj kilka zdjęć inspiracji i krótko wyjaśnij, co dokładnie Ci się w nich podoba. ArchiCompass rozpozna powtarzające się cechy i zapisze wynik w tym samym briefie.",
    cta: "Uruchom Project Compass",
  },
  heroLeadSuffix:
    "Sprawdź portfolio, zakres usług, specjalizacje i dostępność, zanim wyślesz dobrze przygotowany brief.",
  localDirectoryEyebrow: "Lokalny katalog",
  moreLocationsTitle: "Więcej projektantów w Polsce",
};

