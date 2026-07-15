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

const pricingModelLabels = {
  pl: { Hourly: "za godzinę", "Per m2": "za m²", "Fixed package": "pakiet stały", "Custom quote": "wycena indywidualna" },
  en: { Hourly: "per hour", "Per m2": "per m²", "Fixed package": "fixed package", "Custom quote": "custom quote" },
} as const;

const workModeLabels = {
  pl: { "On-site": "stacjonarnie", Remote: "zdalnie", Hybrid: "hybrydowo" },
  en: { "On-site": "on-site", Remote: "remote", Hybrid: "hybrid" },
} as const;

const availabilityLabels = {
  pl: { "Available now": "dostępny od zaraz", "Within 1 month": "dostępny w ciągu miesiąca", "Within 1-3 months": "dostępny w ciągu 1–3 miesięcy", "Waitlist / ask": "lista oczekujących / zapytaj" },
  en: { "Available now": "available now", "Within 1 month": "available within 1 month", "Within 1-3 months": "available within 1-3 months", "Waitlist / ask": "waitlist / ask" },
} as const;

export function pricingModelLabel(value: string, locale: SiteLocale = siteLocale) {
  return pricingModelLabels[locale][value as keyof typeof pricingModelLabels[typeof locale]] || value;
}

export function workModeLabel(value: string, locale: SiteLocale = siteLocale) {
  return workModeLabels[locale][value as keyof typeof workModeLabels[typeof locale]] || value;
}

export function availabilityLabel(value: string, locale: SiteLocale = siteLocale) {
  return availabilityLabels[locale][value as keyof typeof availabilityLabels[typeof locale]] || value;
}

export function workModeValues(formData: FormData) {
  const allowed = new Set<string>(workModes);
  return formData
    .getAll("work_modes")
    .filter((value): value is string => typeof value === "string" && allowed.has(value));
}

function amount(value: number, locale: SiteLocale) {
  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", { maximumFractionDigits: 0 }).format(value);
}

export function pricingLabel(details: PricingDetails, locale: SiteLocale = siteLocale) {
  const model = details.pricing_model;
  const from = details.price_from;
  const to = details.price_to;
  const unit = locale === "pl"
    ? model === "Hourly" ? " zł/h" : model === "Per m2" ? " zł/m²" : model === "Fixed package" ? " zł/pakiet" : ""
    : model === "Hourly" ? " PLN/h" : model === "Per m2" ? " PLN/m²" : model === "Fixed package" ? " PLN/package" : "";

  if (from && to) return `${amount(from, locale)}-${amount(to, locale)}${unit}`;
  if (from) return `${locale === "pl" ? "Od" : "From"} ${amount(from, locale)}${unit}`;
  if (to) return `${locale === "pl" ? "Do" : "Up to"} ${amount(to, locale)}${unit}`;
  if (details.hourly_rate) return `${amount(details.hourly_rate, locale)}${locale === "pl" ? " zł/h" : " PLN/h"}`;
  return model === "Custom quote"
    ? locale === "pl" ? "Wycena indywidualna" : "Custom quote"
    : locale === "pl" ? "Wycena po zapoznaniu się z briefem" : "Quote after reviewing the brief";
}
import { siteLocale, type SiteLocale } from "@/lib/site-locale";
