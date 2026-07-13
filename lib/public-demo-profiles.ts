export type DemoProfilePresentation = {
  bestFor: string;
  budgetFit: string;
  projectFit: string;
  profile: {
    bio: string;
    email: null;
    full_name: string;
    hourly_rate: null;
    location: string;
    phone: null;
    profession_type: string;
    specialties: string[];
    website: null;
    years_experience: number;
  };
};

const demoProfiles: Record<string, DemoProfilePresentation> = {
  "d0000000-0000-4000-8000-000000000001": {
    bestFor: "Ciepły minimalizm, mieszkania rodzinne i naturalne materiały",
    budgetFit: "Najlepsze dopasowanie dla projektów od 60 000 zł",
    projectFit: "Mieszkania i domy rodzinne",
    profile: {
      bio: "Marta tworzy spokojne wnętrza mieszkalne z naturalnych materiałów, z zabudowami na wymiar i starannie zaplanowanym światłem. Warszawska pracownia prowadzi projekty mieszkań i domów od układu funkcjonalnego przez dokumentację, zakupy i koordynację na budowie.",
      email: null,
      full_name: "Marta Wysocka Interiors",
      hourly_rate: null,
      location: "Warszawa, Polska",
      phone: null,
      profession_type: "Architekt wnętrz",
      specialties: ["Japandi", "Soft minimalism", "Scandinavian", "Families with children", "Large homes", "Sustainable design"],
      website: null,
      years_experience: 11,
    },
  },
  "d0000000-0000-4000-8000-000000000002": {
    bestFor: "Kolor, wnętrza z charakterem i remonty kamienic",
    budgetFit: "Najlepsze dopasowanie dla projektów od 80 000 zł",
    projectFit: "Mieszkania, apartamenty i wnętrza komercyjne",
    profile: {
      bio: "Jasna Forma łączy kolor, elementy vintage i współczesne polskie wzornictwo bez rezygnowania z funkcji. Krakowska pracownia ma doświadczenie w kamienicach, wnętrzach hotelarskich i domach klientów, którzy szukają osobistego, niepowtarzalnego efektu.",
      email: null,
      full_name: "Studio Jasna Forma",
      hourly_rate: null,
      location: "Kraków, Polska",
      phone: null,
      profession_type: "Pracownia projektowania wnętrz",
      specialties: ["Eclectic", "Art Deco", "Dopamine decor", "Vintage", "Short-term rentals", "Accessible interiors"],
      website: null,
      years_experience: 9,
    },
  },
  "d0000000-0000-4000-8000-000000000003": {
    bestFor: "Spokojne nadmorskie wnętrza, światło dzienne i trwałe materiały",
    budgetFit: "Najlepsze dopasowanie dla projektów od 50 000 zł",
    projectFit: "Domy i mieszkania w Trójmieście",
    profile: {
      bio: "Piotr projektuje swobodne i trwałe domy w całym Trójmieście. Jego realizacje wyróżniają się czytelną komunikacją, oszczędnym detalem i paletą inspirowaną Bałtykiem, z dużą uwagą dla światła dziennego i łatwego utrzymania.",
      email: null,
      full_name: "Piotr Zieliński Studio",
      hourly_rate: null,
      location: "Gdańsk, Polska",
      phone: null,
      profession_type: "Projektant wnętrz",
      specialties: ["Contemporary", "Scandinavian", "Minimalist", "Large homes", "Sustainable design", "Smart homes"],
      website: null,
      years_experience: 13,
    },
  },
  "d0000000-0000-4000-8000-000000000004": {
    bestFor: "Małe mieszkania, sprytne przechowywanie i projekty inwestycyjne",
    budgetFit: "Najlepsze dopasowanie dla projektów od 30 000 zł",
    projectFit: "Mikromieszkania, najem i kompaktowe wnętrza",
    profile: {
      bio: "Nook specjalizuje się w kompaktowych mieszkaniach, w których każdy metr musi pracować. Wrocławski zespół przygotowuje funkcjonalne układy, zabudowy i trwałe zestawienia materiałów dla domów, najmu i remontów inwestycyjnych.",
      email: null,
      full_name: "Pracownia Nook",
      hourly_rate: null,
      location: "Wrocław, Polska",
      phone: null,
      profession_type: "Pracownia projektowania wnętrz",
      specialties: ["Modern", "Minimalist", "Industrial", "Small spaces", "Short-term rentals", "Budget-conscious projects", "Smart homes"],
      website: null,
      years_experience: 7,
    },
  },
  "d0000000-0000-4000-8000-000000000005": {
    bestFor: "Quiet luxury, stolarka na wymiar i ponadczasowe wnętrza",
    budgetFit: "Najlepsze dopasowanie dla projektów od 120 000 zł",
    projectFit: "Apartamenty premium i domy prywatne",
    profile: {
      bio: "Natalia tworzy dopracowane wnętrza mieszkalne ze stolarką na wymiar, naturalnym kamieniem i starannie dobranym oświetleniem. Jej poznańska pracownia pracuje dla klientów ceniących uporządkowany proces, dokładną dokumentację i ponadczasowy rezultat.",
      email: null,
      full_name: "Natalia Kaczmarek Design",
      hourly_rate: null,
      location: "Poznań, Polska",
      phone: null,
      profession_type: "Architekt wnętrz",
      specialties: ["Quiet luxury", "Minimaluxe", "Contemporary", "Art Deco", "Large homes"],
      website: null,
      years_experience: 12,
    },
  },
  "d0000000-0000-4000-8000-000000000006": {
    bestFor: "Remonty z historią, lofty i wnętrza industrialne",
    budgetFit: "Najlepsze dopasowanie dla projektów od 45 000 zł",
    projectFit: "Kamienice, lofty i przestrzenie z charakterem",
    profile: {
      bio: "Studio Wątek pracuje z tym, co już obecne w budynku: oryginalną cegłą, starym drewnem, lastryko i śladami wcześniejszych funkcji. Łódzka pracownia łączy szacunek dla historii ze współczesnym komfortem i precyzyjnymi rozwiązaniami technicznymi.",
      email: null,
      full_name: "Studio Wątek",
      hourly_rate: null,
      location: "Łódź, Polska",
      phone: null,
      profession_type: "Pracownia architektury wnętrz",
      specialties: ["Industrial", "Vintage", "Eclectic", "Contemporary", "Accessible interiors", "Sustainable design"],
      website: null,
      years_experience: 10,
    },
  },
  "d0000000-0000-4000-8000-000000000007": {
    bestFor: "Zdrowe domy rodzinne, elastyczne pomieszczenia i naturalne wykończenia",
    budgetFit: "Najlepsze dopasowanie dla projektów od 50 000 zł",
    projectFit: "Domy rodzinne i mieszkania dla rozwijających się rodzin",
    profile: {
      bio: "Karolina projektuje przyjazne wnętrza dla rozwijających się rodzin, wykorzystując trwałe materiały, elastyczne pomieszczenia i dużo ukrytego przechowywania. Proces obejmuje praktyczne warsztaty oraz nacisk na zdrowe wykończenia, światło i kontakt z naturą.",
      email: null,
      full_name: "Karolina Maj Interiors",
      hourly_rate: null,
      location: "Warszawa, Polska",
      phone: null,
      profession_type: "Projektant wnętrz",
      specialties: ["Scandinavian", "Japandi", "Bohemian", "Families with children", "Small spaces", "Sustainable design", "Budget-conscious projects"],
      website: null,
      years_experience: 8,
    },
  },
};

const demoProjectCopy: Record<
  string,
  Array<{ category: string; description: string; title: string }>
> = {
  "d0000000-0000-4000-8000-000000000001": [
    { category: "Mieszkanie", title: "Rodzinne mieszkanie na Mokotowie", description: "Mieszkanie 118 m² z dużą kuchnią, elastyczną strefą dzienną, dębową stolarką i spokojną paletą naturalnych materiałów." },
    { category: "Dom", title: "Dom z ogrodem w Wilanowie", description: "Nowy dom z konsekwentną paletą naturalnych materiałów, zabudowami na trzech kondygnacjach i dopracowanym światłem." },
    { category: "Mieszkanie", title: "Soft minimalizm na Żoliborzu", description: "Powściągliwy remont z zachowanym parkietem, cieplejszymi tynkami, lnem i miękkimi przejściami między pomieszczeniami." },
  ],
  "d0000000-0000-4000-8000-000000000002": [
    { category: "Mieszkanie", title: "Kolor na Kazimierzu", description: "Remont kamienicy łączący odrestaurowane drzwi, sztukaterie, kobaltową zabudowę i polską sztukę współczesną." },
    { category: "Mieszkanie", title: "Art déco na Salwatorze", description: "Kompaktowe mieszkanie inspirowane geometrią art déco, orzechem, ryflowanym szkłem i kontrolowaną kolorystyką." },
    { category: "Komercyjne i hotelarskie", title: "Butikowy apartament na Starym Mieście", description: "Gościnne wnętrze z paletą głębokiej zieleni, terakoty i postarzanego mosiądzu." },
  ],
  "d0000000-0000-4000-8000-000000000003": [
    { category: "Mieszkanie", title: "Nadmorskie mieszkanie w Oliwie", description: "Szare drewno, jasny kamień i len tworzą spokojne wnętrze, którego długie osie widokowe nawiązują do otaczającego parku." },
    { category: "Mieszkanie", title: "Spokojny apartament w Sopocie", description: "Weekendowe mieszkanie z zabudowanym siedziskiem, ukrytymi funkcjami i paletą, która pozostaje jasna także zimą." },
    { category: "Dom", title: "Dom nad wodą w Gdyni", description: "Rodzinny dom z trwałym dębem, panelami akustycznymi i zintegrowanym smart home, który nie dominuje wizualnie." },
  ],
  "d0000000-0000-4000-8000-000000000004": [
    { category: "Mieszkanie", title: "Mikromieszkanie na Nadodrzu", description: "Na 29 m² powstały podest do spania, pełna zabudowa i kuchnia znikająca za składanymi frontami." },
    { category: "Nieruchomość inwestycyjna", title: "Mieszkanie na wynajem na Ołbinie", description: "Szybki remont skoncentrowany na świetle, trwałej łazience i spójnym zestawie wyposażenia gotowym do montażu." },
    { category: "Gabinet domowy", title: "Gabinet nad rzeką", description: "Gabinet i pokój gościnny z zasłonami akustycznymi, składanym łóżkiem i biurkiem wykorzystującym widok na rzekę." },
  ],
  "d0000000-0000-4000-8000-000000000005": [
    { category: "Mieszkanie", title: "Quiet luxury na Jeżycach", description: "Wyrafinowane mieszkanie z symetrycznie łączonym kamieniem, przydymionym dębem i miękko odbijającym światło tynkiem." },
    { category: "Dom", title: "Willa na Sołaczu", description: "Willa z lat 30. otrzymała nowe instalacje przy zachowaniu schodów, proporcji i relacji z ogrodem." },
    { category: "Mieszkanie", title: "Penthouse przy Starym Browarze", description: "Penthouse dla sztuki, spotkań i panoramicznych widoków z oświetleniem galeryjnym oraz dyskretną kuchnią pomocniczą." },
  ],
  "d0000000-0000-4000-8000-000000000006": [
    { category: "Mieszkanie", title: "Loft na Księżym Młynie", description: "Dawny loft fabryczny, w którym naprawy cegły, stali i drewna pozostają widoczne obok precyzyjnej kuchni." },
    { category: "Mieszkanie", title: "Mieszkanie vintage przy Piotrkowskiej", description: "Remont rozpoczął się od katalogowania oryginalnych detali, do których dodano współczesne łazienki i elastyczne światło." },
    { category: "Komercyjne i hotelarskie", title: "Kreatywne biuro na Fabrycznej", description: "Kompaktowe biuro wykorzystuje wtórne szklane ścianki, odnowione lampy industrialne i modułowe stoły." },
  ],
  "d0000000-0000-4000-8000-000000000007": [
    { category: "Dom", title: "Rodzinny dom na Sadybie", description: "Ciepły dom z centralną kuchnią, przechowywaniem przy wejściu i elastycznymi strefami zabawy rosnącymi razem z dziećmi." },
    { category: "Mieszkanie", title: "Zrównoważone mieszkanie na Ursynowie", description: "Niskoemisyjny remont z certyfikowanym drewnem, farbami mineralnymi i odnowionymi meblami." },
    { category: "Mieszkanie", title: "Mieszkanie przyjazne dzieciom na Pradze", description: "Zaokrąglone detale, zmywalne powierzchnie i przechowywanie na różnych wysokościach wspierają samodzielność dzieci." },
  ],
};

export function getDemoProfilePresentation(profileId: string) {
  return demoProfiles[profileId] ?? null;
}

export function applyDemoProfilePresentation<T extends { id: string }>(profile: T): T {
  const demo = getDemoProfilePresentation(profile.id);
  return demo ? ({ ...profile, ...demo.profile } as T) : profile;
}

export function getDemoProjectPresentation(profileId: string, seed: string) {
  const options = demoProjectCopy[profileId];
  if (!options?.length) return null;
  const index = seed.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return options[index % options.length];
}
