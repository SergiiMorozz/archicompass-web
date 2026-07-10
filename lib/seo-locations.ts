import { polishCityGrammar } from "@/content/pl/locations";

export type SeoLocation = {
  adjective?: string;
  country: string;
  countryCode: string;
  countrySlug: string;
  city: string;
  citySlug: string;
  genitive?: string;
  locative?: string;
  marketNote: string;
  planningNote: string;
  styleNote: string;
};

export const seoLocations: SeoLocation[] = [
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.warsaw,
    marketNote: "Warszawski rynek obejmuje zarówno kompaktowe mieszkania w historycznych dzielnicach, jak i nowe domy oraz wnętrza komercyjne w całej aglomeracji.",
    planningNote: "Przed wysłaniem briefu porównaj doświadczenie w projektowaniu układów mieszkań, koordynacji remontów, pracy z zabytkami, nowymi inwestycjami i współpracy zdalnej.",
    styleNote: "Popularne kierunki to ciepły minimalizm, współczesne polskie wzornictwo, japandi, modern classic oraz starannie odrestaurowane detale historyczne.",
  },
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.krakow,
    marketNote: "Kraków łączy zabytkowe mieszkania, powojenną zabudowę, nowe inwestycje, obiekty hotelarskie i domy w całej aglomeracji. To rynek, na którym szczególnie liczą się wyczucie kontekstu, doświadczenie remontowe i umiejętność pracy z istniejącą tkanką budynku.",
    planningNote: "Zwróć uwagę na doświadczenie w remontach, zakres dokumentacji, znajomość lokalnych wykonawców oraz sposób pracy z ograniczeniami starszych budynków.",
    styleNote: "W krakowskich realizacjach często spotyka się połączenie współczesnego komfortu z naturalnymi materiałami, stonowaną kolorystyką, stolarką na wymiar i szacunkiem dla historycznego charakteru wnętrza.",
  },
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.wroclaw,
    marketNote: "Wrocław łączy mieszkania w kamienicach, nowe osiedla, domy rodzinne, biura i elastyczne przestrzenie miejskie.",
    planningNote: "Wykorzystaj brief, aby porównać doświadczenie w planowaniu układów funkcjonalnych, zakres dokumentacji, jakość wizualizacji 3D, wsparcie przy zakupach oraz możliwość nadzoru na budowie.",
    styleNote: "We wrocławskich realizacjach często pojawiają się wnętrza nowoczesne, skandynawskie, industrialne, eklektyczne i w duchu soft minimalizmu.",
  },
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.gdansk,
    marketNote: "Rynek Gdańska i Trójmiasta obejmuje apartamenty nad morzem, zabytkowe nieruchomości, domy rodzinne, lokale inwestycyjne i wnętrza hotelarskie.",
    planningNote: "Sprawdź, czy projektant realizuje projekty w Gdańsku, Gdyni i Sopocie oraz czy zakres współpracy obejmuje zakupy, kontakt z wykonawcami i wsparcie na etapie realizacji.",
    styleNote: "W Trójmieście często sprawdzają się jasne, zmysłowe wnętrza, nadmorska prostota, ciepłe drewno, modern classic oraz trwałe rozwiązania dla mieszkań na wynajem.",
  },
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.poznan,
    marketNote: "Poznańskie projekty obejmują mieszkania, remontowane domy, nowe inwestycje, biura, lokale handlowe i wnętrza hotelarskie.",
    planningNote: "Porównaj portfolio według typu projektu i zapytaj, jak wyceniane są koncepcja, dokumentacja wykonawcza, zakupy i nadzór.",
    styleNote: "Dobrze reprezentowane są funkcjonalne wnętrza współczesne, ciepły minimalizm, mocne akcenty kolorystyczne, meble na wymiar i rodzinne układy.",
  },
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.lodz,
    marketNote: "Łódź oferuje charakterystyczne przestrzenie poprzemysłowe, mieszkania w kamienicach, domy rodzinne, nowe inwestycje i kreatywne lokale komercyjne.",
    planningNote: "Przy złożonym remoncie wybieraj specjalistów, którzy wcześnie wyjaśniają zakres inwentaryzacji, koordynację techniczną, materiały i ryzyka realizacyjne.",
    styleNote: "Industrialne odniesienia, sztuka współczesna, oryginalna cegła, modern classic i łagodny minimalizm pasują do różnorodnej zabudowy miasta.",
  },
  {
    country: "Polska",
    countryCode: "PL",
    countrySlug: "poland",
    ...polishCityGrammar.katowice,
    marketNote: "Katowice i cały Śląsk łączą mieszkania, domy jednorodzinne, adaptacje, biura i wymagające technicznie remonty.",
    planningNote: "Potwierdź obszar działania projektanta, jego obecność na budowie, zakres dokumentacji i doświadczenie w koordynacji wykonawców w regionie.",
    styleNote: "Współczesne, industrialne, modernistyczne, ciepło minimalistyczne i kontrastowe wnętrza dobrze odzwierciedlają architektoniczną tożsamość regionu.",
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

export function locationPath(location: SeoLocation) {
  return `/interior-designers/${location.countrySlug}/${location.citySlug}`;
}

export function normalizeLocation(value: string | null | undefined) {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function matchesSeoLocation(value: string | null | undefined, location: SeoLocation) {
  const normalized = normalizeLocation(value);
  return normalized.includes(normalizeLocation(location.city)) || normalized.includes(location.citySlug);
}
