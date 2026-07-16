import { siteLocale, type SiteLocale } from "@/lib/site-locale";

const polishVisualCueLabels: Record<string, string> = {
  "Natural wood": "Naturalne drewno",
  "Bright neutral palette": "Jasna neutralna paleta",
  "Hidden storage": "Ukryte przechowywanie",
  "Bold color accents": "Wyraziste akcenty kolorystyczne",
  "Dark contrast": "Ciemny kontrast",
  "Luxury details": "Luksusowe detale",
  "Eco materials": "Materiały ekologiczne",
  "Smart home": "Smart home",
  "Compact solutions": "Rozwiązania do małych przestrzeni",
  "Soft curves": "Miękkie linie",
};

export function visualCue(value: string, locale: SiteLocale = siteLocale) {
  return locale === "pl" ? polishVisualCueLabels[value] ?? value : value;
}

export function visualCues(values: string[] | null | undefined, locale: SiteLocale = siteLocale) {
  return values?.map((value) => visualCue(value, locale)) ?? [];
}

// Legacy aliases keep existing Polish-only call sites stable while they are migrated.
export function polishVisualCue(value: string) {
  return visualCue(value, "pl");
}

export function polishVisualCues(values: string[] | null | undefined) {
  return visualCues(values, "pl");
}
