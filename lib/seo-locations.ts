export type SeoLocation = {
  country: string;
  countryCode: string;
  countrySlug: string;
  city: string;
  citySlug: string;
  marketNote: string;
  planningNote: string;
  styleNote: string;
};

export const seoLocations: SeoLocation[] = [
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Warsaw",
    citySlug: "warsaw",
    marketNote: "Warsaw projects range from compact apartments in historic districts to new-build homes and commercial interiors across the metropolitan area.",
    planningNote: "Compare experience with apartment layouts, renovation coordination, listed buildings, new developments, and remote collaboration before sending a brief.",
    styleNote: "Popular directions include warm minimalism, contemporary Polish design, Japandi, modern classic interiors, and carefully restored period details.",
  },
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Krakow",
    citySlug: "krakow",
    marketNote: "Krakow combines protected historic apartments, post-war housing, modern developments, hospitality spaces, and homes around the wider metropolitan area.",
    planningNote: "Look for relevant renovation experience, realistic documentation scope, local contractor coordination, and a clear approach to older building constraints.",
    styleNote: "Krakow portfolios often combine contemporary comfort with natural materials, restrained colour, crafted joinery, and respect for historic character.",
  },
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Wroclaw",
    citySlug: "wroclaw",
    marketNote: "Wroclaw offers a mix of tenement apartments, modern residential estates, family homes, offices, and adaptable urban spaces.",
    planningNote: "Use the brief to compare space-planning ability, technical documentation, 3D visualisation, procurement support, and site supervision.",
    styleNote: "Clients frequently search for modern, Scandinavian, industrial, eclectic, and soft minimalist interiors suited to bright urban apartments.",
  },
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Gdansk",
    citySlug: "gdansk",
    marketNote: "Gdansk and the Tricity market includes coastal apartments, historic properties, family homes, investment units, and hospitality interiors.",
    planningNote: "Check whether a professional works across Gdansk, Gdynia, and Sopot and whether the proposed service includes sourcing and implementation support.",
    styleNote: "Light, tactile interiors, coastal restraint, warm timber, modern classic details, and durable rental-focused design are common local directions.",
  },
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Poznan",
    citySlug: "poznan",
    marketNote: "Poznan projects include city apartments, renovated houses, new residential developments, offices, retail, and hospitality spaces.",
    planningNote: "Compare portfolios by project type and ask how concept design, construction drawings, purchasing, and supervision are priced and delivered.",
    styleNote: "Functional contemporary interiors, warm minimalism, bold colour accents, custom furniture, and practical family layouts are well represented.",
  },
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Lodz",
    citySlug: "lodz",
    marketNote: "Lodz offers distinctive post-industrial spaces alongside tenement apartments, family homes, new developments, and creative commercial projects.",
    planningNote: "For complex renovations, prioritise professionals who can explain surveys, technical coordination, material decisions, and implementation risks early.",
    styleNote: "Industrial references, contemporary art, original brick, modern classic composition, and softer minimalist schemes all suit the city's varied building stock.",
  },
  {
    country: "Poland",
    countryCode: "PL",
    countrySlug: "poland",
    city: "Katowice",
    citySlug: "katowice",
    marketNote: "Katowice and the wider Silesian region combine apartments, detached houses, adaptive reuse, offices, and technically ambitious renovations.",
    planningNote: "Confirm the designer's travel area, site involvement, documentation package, and experience coordinating contractors across the region.",
    styleNote: "Contemporary, industrial, modernist, warm minimalist, and high-contrast interiors reflect the region's architectural identity.",
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
  return normalized.includes(normalizeLocation(location.city));
}
