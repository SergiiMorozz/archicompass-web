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

export function workModeValues(formData: FormData) {
  const allowed = new Set<string>(workModes);
  return formData
    .getAll("work_modes")
    .filter((value): value is string => typeof value === "string" && allowed.has(value));
}

function amount(value: number) {
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(value);
}

export function pricingLabel(details: PricingDetails) {
  const model = details.pricing_model;
  const from = details.price_from;
  const to = details.price_to;
  const unit =
    model === "Hourly"
      ? "/hour"
      : model === "Per m2"
        ? "/m2"
        : model === "Fixed package"
          ? "/package"
          : "";

  if (from && to) return `${amount(from)}-${amount(to)} PLN${unit}`;
  if (from) return `From ${amount(from)} PLN${unit}`;
  if (to) return `Up to ${amount(to)} PLN${unit}`;
  if (details.hourly_rate) return `${amount(details.hourly_rate)} PLN/hour`;
  return model === "Custom quote" ? "Custom quote" : "Pricing after brief review";
}
