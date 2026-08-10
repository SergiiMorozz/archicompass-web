const aliases: Record<string, string> = {
  all: "All",
  wszystkie: "All",
  inspiration: "Inspiration",
  inspiracje: "Inspiration",
  trends: "Trends",
  trendy: "Trends",
  guide: "Guides",
  guides: "Guides",
  poradnik: "Guides",
  poradniki: "Guides",
  materials: "Materials",
  materialy: "Materials",
  materiały: "Materials",
  rooms: "Rooms",
  pomieszczenia: "Rooms",
  sustainability: "Sustainability",
  "sustainable interiors": "Sustainability",
  "zrownowazone wnetrza": "Sustainability",
  "zrównoważone wnętrza": "Sustainability",
};

function normalized(value: string) {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function inspirationCategoryKey(value: string | null | undefined) {
  const source = value?.trim() || "";
  return aliases[normalized(source)] || source || "All";
}

export function inspirationCategoryMatches(articleCategory: string, selectedCategory: string) {
  const selected = inspirationCategoryKey(selectedCategory);
  return selected === "All" || inspirationCategoryKey(articleCategory) === selected;
}

export function inspirationCategoryValues(categories: Array<string | null | undefined>) {
  return ["All", ...Array.from(new Set(categories.map(inspirationCategoryKey).filter((value) => value !== "All"))).sort()];
}
