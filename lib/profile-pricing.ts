export const pricingModels = [
  "Hourly",
  "Per m2",
  "Fixed package",
  "Custom quote",
] as const;

export const workModes = ["On-site", "Remote", "Hybrid"] as const;

export const availabilityStatuses = [
  "Available now",
  "Within 1 month",
  "Within 1-3 months",
  "Waitlist / ask",
] as const;

export type PricingDetails = {
  hourly_rate: number | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
};

const pricingModelLabels: Record<string, string> = {
  Hourly: "za godzinę",
  "Per m2": "za m²",
  "Fixed package": "pakiet stały",
  "Custom quote": "wycena indywidualna",
};

const workModeLabels: Record<string, string> = {
  "On-site": "stacjonarnie",
  Remote: "zdalnie",
  Hybrid: "hybrydowo",
};

const availabilityLabels: Record<string, string> = {
  "Available now": "dostępny od zaraz",
  "Within 1 month": "dostępny w ciągu miesiąca",
  "Within 1-3 months": "dostępny w ciągu 1–3 miesięcy",
  "Waitlist / ask": "lista oczekujących / zapytaj",
};

export function pricingModelLabel(value: string) {
  return pricingModelLabels[value] || value;
}

export function workModeLabel(value: string) {
  return workModeLabels[value] || value;
}

export function availabilityLabel(value: string) {
  return availabilityLabels[value] || value;
}

export function workModeValues(formData: FormData) {
  const allowed = new Set<string>(workModes);
  return formData
    .getAll("work_modes")
    .filter((value): value is string => typeof value === "string" && allowed.has(value));
}

function amount(value: number) {
  return new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(value);
}

export function pricingLabel(details: PricingDetails) {
  const model = details.pricing_model;
  const from = details.price_from;
  const to = details.price_to;
  const unit =
    model === "Hourly"
      ? "/godz."
      : model === "Per m2"
        ? "/m²"
        : model === "Fixed package"
          ? "/pakiet"
          : "";

  if (from && to) return `${amount(from)}-${amount(to)} PLN${unit}`;
  if (from) return `Od ${amount(from)} PLN${unit}`;
  if (to) return `Do ${amount(to)} PLN${unit}`;
  if (details.hourly_rate) return `${amount(details.hourly_rate)} PLN/godz.`;
  return model === "Custom quote" ? "Wycena indywidualna" : "Wycena po zapoznaniu się z briefem";
}
