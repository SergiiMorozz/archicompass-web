import { polishCityGrammar } from "@/content/pl/locations";
import { distanceBetweenLocations } from "@/lib/location-distance";
import type { SiteLocale } from "@/lib/site-locale";

export type SeoLocation = {
  adjective?: string;
  country: string;
  country_en?: string;
  countryCode: string;
  countrySlug: string;
  city: string;
  city_en?: string;
  citySlug: string;
  /**
   * Metro-area radius for established large-city directories. It only applies
   * to locations with known coordinates, so an unresolvable free-text value
   * can never be guessed into a city directory.
   */
  metroRadiusKm?: number;
  genitive?: string;
  locative?: string;
  marketNote: string;
  marketNote_en?: string;
  planningNote: string;
  planningNote_en?: string;
  styleNote: string;
  styleNote_en?: string;
};

export const seoLocations: SeoLocation[] = [
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.warsaw,
    city_en: "Warsaw",
    metroRadiusKm: 35,
    marketNote: "Warszawski rynek obejmuje zarówno kompaktowe mieszkania w historycznych dzielnicach, jak i nowe domy oraz wnętrza komercyjne w całej aglomeracji.",
    marketNote_en: "Warsaw's market spans compact apartments in historic districts, new homes, and commercial interiors across the wider metropolitan area.",
    planningNote: "Przed wysłaniem briefu porównaj doświadczenie w projektowaniu układów mieszkań, koordynacji remontów, pracy z zabytkami, nowymi inwestycjami i współpracy zdalnej.",
    planningNote_en: "Before sending a brief, compare experience with apartment layouts, renovation coordination, historic buildings, new developments, and remote collaboration.",
    styleNote: "Popularne kierunki to ciepły minimalizm, współczesne polskie wzornictwo, japandi, modern classic oraz starannie odrestaurowane detale historyczne.",
    styleNote_en: "Popular directions include warm minimalism, contemporary Polish design, Japandi, modern classic, and carefully restored historic details.",
  },
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.krakow,
    city_en: "Krakow",
    metroRadiusKm: 30,
    marketNote: "Kraków łączy zabytkowe mieszkania, powojenną zabudowę, nowe inwestycje, obiekty hotelarskie i domy w całej aglomeracji. To rynek, na którym szczególnie liczą się wyczucie kontekstu, doświadczenie remontowe i umiejętność pracy z istniejącą tkanką budynku.",
    marketNote_en: "Krakow brings together historic apartments, post-war buildings, new developments, hospitality spaces, and homes across the metropolitan area. Context, renovation experience, and working sensitively with existing buildings matter here.",
    planningNote: "Zwróć uwagę na doświadczenie w remontach, zakres dokumentacji, znajomość lokalnych wykonawców oraz sposób pracy z ograniczeniami starszych budynków.",
    planningNote_en: "Look at renovation experience, the scope of documentation, knowledge of local contractors, and how the designer approaches the constraints of older buildings.",
    styleNote: "W krakowskich realizacjach często spotyka się połączenie współczesnego komfortu z naturalnymi materiałami, stonowaną kolorystyką, stolarką na wymiar i szacunkiem dla historycznego charakteru wnętrza.",
    styleNote_en: "Krakow projects often combine contemporary comfort with natural materials, restrained colour palettes, bespoke joinery, and respect for the interior's historic character.",
  },
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.wroclaw,
    city_en: "Wroclaw",
    metroRadiusKm: 30,
    marketNote: "Wrocław łączy mieszkania w kamienicach, nowe osiedla, domy rodzinne, biura i elastyczne przestrzenie miejskie.",
    marketNote_en: "Wroclaw combines period apartments, new residential developments, family homes, offices, and flexible urban spaces.",
    planningNote: "Wykorzystaj brief, aby porównać doświadczenie w planowaniu układów funkcjonalnych, zakres dokumentacji, jakość wizualizacji 3D, wsparcie przy zakupach oraz możliwość nadzoru na budowie.",
    planningNote_en: "Use your brief to compare functional planning experience, documentation scope, the quality of 3D visualisations, procurement support, and site supervision availability.",
    styleNote: "We wrocławskich realizacjach często pojawiają się wnętrza nowoczesne, skandynawskie, industrialne, eklektyczne i w duchu soft minimalizmu.",
    styleNote_en: "Wroclaw portfolios often feature contemporary, Scandinavian, industrial, eclectic, and soft-minimalist interiors.",
  },
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.gdansk,
    city_en: "Gdansk",
    metroRadiusKm: 35,
    marketNote: "Rynek Gdańska i Trójmiasta obejmuje apartamenty nad morzem, zabytkowe nieruchomości, domy rodzinne, lokale inwestycyjne i wnętrza hotelarskie.",
    marketNote_en: "The Gdansk and Tri-City market includes coastal apartments, historic properties, family homes, investment units, and hospitality interiors.",
    planningNote: "Sprawdź, czy projektant realizuje projekty w Gdańsku, Gdyni i Sopocie oraz czy zakres współpracy obejmuje zakupy, kontakt z wykonawcami i wsparcie na etapie realizacji.",
    planningNote_en: "Check whether the designer works across Gdansk, Gdynia, and Sopot, and whether the scope includes procurement, contractor communication, and implementation support.",
    styleNote: "W Trójmieście często sprawdzają się jasne, zmysłowe wnętrza, nadmorska prostota, ciepłe drewno, modern classic oraz trwałe rozwiązania dla mieszkań na wynajem.",
    styleNote_en: "Bright, tactile interiors, coastal simplicity, warm timber, modern classic, and durable solutions for rental homes are common Tri-City directions.",
  },
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.poznan,
    city_en: "Poznan",
    metroRadiusKm: 30,
    marketNote: "Poznańskie projekty obejmują mieszkania, remontowane domy, nowe inwestycje, biura, lokale handlowe i wnętrza hotelarskie.",
    marketNote_en: "Poznan projects include apartments, renovated homes, new developments, offices, retail spaces, and hospitality interiors.",
    planningNote: "Porównaj portfolio według typu projektu i zapytaj, jak wyceniane są koncepcja, dokumentacja wykonawcza, zakupy i nadzór.",
    planningNote_en: "Compare portfolios by project type and ask how concept work, detailed documentation, procurement, and supervision are priced.",
    styleNote: "Dobrze reprezentowane są funkcjonalne wnętrza współczesne, ciepły minimalizm, mocne akcenty kolorystyczne, meble na wymiar i rodzinne układy.",
    styleNote_en: "Functional contemporary interiors, warm minimalism, confident colour accents, bespoke furniture, and family-friendly layouts are well represented.",
  },
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.lodz,
    city_en: "Lodz",
    metroRadiusKm: 30,
    marketNote: "Łódź oferuje charakterystyczne przestrzenie poprzemysłowe, mieszkania w kamienicach, domy rodzinne, nowe inwestycje i kreatywne lokale komercyjne.",
    marketNote_en: "Lodz offers distinctive post-industrial spaces, period apartments, family homes, new developments, and creative commercial venues.",
    planningNote: "Przy złożonym remoncie wybieraj specjalistów, którzy wcześnie wyjaśniają zakres inwentaryzacji, koordynację techniczną, materiały i ryzyka realizacyjne.",
    planningNote_en: "For a complex renovation, choose professionals who clarify surveys, technical coordination, materials, and delivery risks early in the process.",
    styleNote: "Industrialne odniesienia, sztuka współczesna, oryginalna cegła, modern classic i łagodny minimalizm pasują do różnorodnej zabudowy miasta.",
    styleNote_en: "Industrial references, contemporary art, exposed brick, modern classic, and gentle minimalism suit the city's varied building stock.",
  },
  {
    country: "Polska",
    country_en: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.katowice,
    city_en: "Katowice",
    metroRadiusKm: 35,
    marketNote: "Katowice i cały Śląsk łączą mieszkania, domy jednorodzinne, adaptacje, biura i wymagające technicznie remonty.",
    marketNote_en: "Katowice and the wider Silesian region bring together apartments, houses, conversions, offices, and technically demanding renovations.",
    planningNote: "Potwierdź obszar działania projektanta, jego obecność na budowie, zakres dokumentacji i doświadczenie w koordynacji wykonawców w regionie.",
    planningNote_en: "Confirm the designer's service area, site presence, documentation scope, and experience coordinating contractors in the region.",
    styleNote: "Współczesne, industrialne, modernistyczne, ciepło minimalistyczne i kontrastowe wnętrza dobrze odzwierciedlają architektoniczną tożsamość regionu.",
    styleNote_en: "Contemporary, industrial, modernist, warm-minimalist, and high-contrast interiors reflect the architectural identity of the region.",
  },
  {
    country: "Germany",
    countryCode: "DE",
    countrySlug: "germany",
    city: "Berlin",
    citySlug: "berlin",
    marketNote: "Berlin's design market spans Altbau apartments, compact rentals, modern developments, creative workplaces, retail, and hospitality projects.",
    planningNote: "Compare language, work mode, renovation experience, contractor coordination, and the exact level of drawings and supervision included.",
    styleNote: "Berlin portfolios range from restrained modernism and adaptive reuse to colourful eclectic, industrial, and highly individual interiors.",
  },
  {
    country: "Czech Republic",
    countryCode: "CZ",
    countrySlug: "czech-republic",
    city: "Prague",
    citySlug: "prague",
    marketNote: "Prague combines historic flats, modern apartments, family houses, boutique hospitality, and commercial interiors with varied technical constraints.",
    planningNote: "A strong brief should clarify property status, language, approvals, budget, visualisation, procurement, and site supervision requirements.",
    styleNote: "Contemporary European design, restored period details, warm minimalism, art-led interiors, and crafted joinery are common portfolio strengths.",
  },
  {
    country: "United Kingdom",
    countryCode: "GB",
    countrySlug: "united-kingdom",
    city: "London",
    citySlug: "london",
    marketNote: "London projects range from compact flats and period conversions to family homes, extensions, luxury residences, and commercial spaces.",
    planningNote: "Compare sector experience, planning and listed-building awareness, procurement model, fee structure, and availability for site coordination.",
    styleNote: "The market supports contemporary, modern classic, heritage-led, colourful eclectic, minimalist, and highly bespoke design approaches.",
  },
  {
    country: "France",
    countryCode: "FR",
    countrySlug: "france",
    city: "Paris",
    citySlug: "paris",
    marketNote: "Paris projects include Haussmann apartments, compact studios, contemporary renovations, retail, hospitality, and second homes.",
    planningNote: "Clarify language, building constraints, contractor relationships, custom joinery, procurement, and whether the designer can supervise locally.",
    styleNote: "Historic proportion, contemporary art, natural stone, crafted details, warm minimalism, and confident colour often meet in Parisian interiors.",
  },
  {
    country: "Portugal",
    countryCode: "PT",
    countrySlug: "portugal",
    city: "Lisbon",
    citySlug: "lisbon",
    marketNote: "Lisbon includes renovated historic apartments, contemporary homes, investment properties, hospitality, and international client projects.",
    planningNote: "Review local sourcing, renovation experience, language, remote collaboration, climate considerations, and implementation support.",
    styleNote: "Natural textures, light colours, local stone and tile, warm woods, Mediterranean modernism, and relaxed contemporary spaces are frequent directions.",
  },
  {
    country: "Spain",
    countryCode: "ES",
    countrySlug: "spain",
    city: "Barcelona",
    citySlug: "barcelona",
    marketNote: "Barcelona projects range from Eixample apartments and compact city homes to coastal residences, hospitality, retail, and creative workplaces.",
    planningNote: "Compare renovation knowledge, local contractor networks, sourcing, climate-responsive choices, language, and site availability.",
    styleNote: "Mediterranean materials, Catalan modernism, bold colour, tactile minimalism, and contemporary craft shape many local portfolios.",
  },
];

export function getSeoLocation(countrySlug: string, citySlug: string) {
  return seoLocations.find(
    (location) =>
      location.countrySlug === countrySlug && location.citySlug === citySlug
  );
}

export function locationPath(location: SeoLocation, locale: SiteLocale = "pl") {
  if (locale === "pl" && location.countryCode === "PL") {
    return `/projektanci-wnetrz/${location.citySlug}`;
  }

  return `/interior-designers/${location.countrySlug}/${location.citySlug}`;
}

export function seoLocationCountry(location: SeoLocation, locale: SiteLocale = "pl") {
  return locale === "en" ? location.country_en || location.country : location.country;
}

export function seoLocationName(location: SeoLocation, locale: SiteLocale = "pl") {
  return locale === "en" ? location.city_en || location.city : location.city;
}

export function seoLocationText(
  location: SeoLocation,
  field: "marketNote" | "planningNote" | "styleNote",
  locale: SiteLocale = "pl"
) {
  const englishField = `${field}_en` as "marketNote_en" | "planningNote_en" | "styleNote_en";
  return locale === "en" ? location[englishField] || location[field] : location[field];
}

export function normalizeLocation(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function matchesSeoLocation(value: string | null | undefined, location: SeoLocation) {
  const normalized = normalizeLocation(value);
  if (!normalized) return false;
  if (normalized.includes(normalizeLocation(location.city)) || normalized.includes(location.citySlug)) {
    return true;
  }

  const distance = location.metroRadiusKm
    ? distanceBetweenLocations(value || "", location.city)
    : null;
  return distance !== null && distance <= (location.metroRadiusKm ?? 0);
}
