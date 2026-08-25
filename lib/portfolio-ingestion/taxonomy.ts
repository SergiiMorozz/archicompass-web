// Normalizes free-text tags returned by the AI analysis (styles, materials,
// colors, rooms) so simple case/inflection variants collapse into one entry
// instead of fragmenting the Designer DNA (e.g. "Drewno"/"drewno" or
// "minimalizm"/"minimalistyczny" showing up as separate tags). This is a
// lightweight normalization layer, not the full shared client/designer
// taxonomy reconciliation (that's still Phase 2) - it does not translate
// between Polish and English, only merges variants within the same word.

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizeKey(raw: string) {
  return stripDiacritics(raw.trim().toLowerCase()).replace(/\s+/g, " ");
}

function titleCase(raw: string) {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\p{L}+/gu, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

// key (normalizeKey output) -> canonical display form. Only variants that are
// genuinely the same concept are merged; distinct concepts (e.g. "modern
// organic" vs "modern rustic") are deliberately left alone.
const styleSynonyms: Record<string, string> = {
  minimalizm: "Minimalizm",
  minimalistyczny: "Minimalizm",
  minimalistyczna: "Minimalizm",
  minimalist: "Minimalist",
  minimalism: "Minimalist",
  skandynawski: "Skandynawski",
  skandynawska: "Skandynawski",
  scandinavian: "Scandinavian",
  japandi: "Japandi",
  nowoczesny: "Nowoczesny",
  nowoczesna: "Nowoczesny",
  modern: "Modern",
  kontemporalny: "Kontemporalny",
  contemporary: "Contemporary",
  industrialny: "Industrialny",
  industrialna: "Industrialny",
  industrial: "Industrial",
  rustykalny: "Rustykalny",
  rustykalna: "Rustykalny",
  rustic: "Rustic",
  klasyczny: "Klasyczny",
  klasyczna: "Klasyczny",
  classic: "Classic",
  boho: "Boho",
  bohemian: "Bohemian",
  eklektyczny: "Eklektyczny",
  eclectic: "Eclectic",
  glamour: "Glamour",
  luksusowy: "Luksusowy",
  luxury: "Luxury",
};

const materialSynonyms: Record<string, string> = {
  drewno: "Drewno",
  wood: "Wood",
  drewniany: "Drewno",
  kamien: "Kamień",
  stone: "Stone",
  marmur: "Marmur",
  marble: "Marble",
  beton: "Beton",
  concrete: "Concrete",
  metal: "Metal",
  szklo: "Szkło",
  glass: "Glass",
  tkanina: "Tkanina",
  fabric: "Fabric",
  welna: "Wełna",
  wool: "Wool",
  rattan: "Rattan",
  skora: "Skóra",
  leather: "Leather",
};

const roomSynonyms: Record<string, string> = {
  kuchnia: "Kuchnia",
  kitchen: "Kitchen",
  jadalnia: "Jadalnia",
  "dining room": "Jadalnia",
  "dining area": "Jadalnia",
  "kuchnia z jadalnia": "Kuchnia z jadalnią",
  salon: "Salon",
  "living room": "Living room",
  sypialnia: "Sypialnia",
  bedroom: "Bedroom",
  lazienka: "Łazienka",
  bathroom: "Bathroom",
  "pokoj dzieciecy": "Pokój dziecięcy",
  "children's room": "Children's room",
  gabinet: "Gabinet",
  "home office": "Home office",
  office: "Home office",
  przedpokoj: "Przedpokój",
  hallway: "Hallway",
  hall: "Hallway",
  garderoba: "Garderoba",
  "walk-in closet": "Garderoba",
};

function normalizeWithMap(raw: string, synonyms: Record<string, string>) {
  const key = normalizeKey(raw);
  if (!key) return null;
  return { key, display: synonyms[key] ?? titleCase(raw) };
}

export function normalizeStyle(raw: string) {
  return normalizeWithMap(raw, styleSynonyms);
}

export function normalizeMaterial(raw: string) {
  return normalizeWithMap(raw, materialSynonyms);
}

export function normalizeRoom(raw: string) {
  return normalizeWithMap(raw, roomSynonyms);
}

export function normalizeColor(raw: string) {
  // Colors have far fewer real synonyms across the corpus we've seen so far;
  // case/whitespace normalization covers the actual duplicates without
  // maintaining a bespoke color-name dictionary.
  return normalizeWithMap(raw, {});
}
