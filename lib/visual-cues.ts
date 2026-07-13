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

export function polishVisualCue(value: string) {
  return polishVisualCueLabels[value] ?? value;
}

export function polishVisualCues(values: string[] | null | undefined) {
  return values?.map(polishVisualCue) ?? [];
}
