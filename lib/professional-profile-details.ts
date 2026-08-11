import { siteLocale, type SiteLocale } from "@/lib/site-locale";
import { pricingModels } from "@/lib/profile-pricing";
import { pricingLabel } from "@/lib/profile-pricing";

export type PricingModel = (typeof pricingModels)[number];

export const profileLanguages = [
  "Polish",
  "English",
  "German",
  "French",
  "Spanish",
  "Ukrainian",
  "Russian",
] as const;

export const careerStages = [
  "student",
  "recent_graduate",
  "early_career",
  "established",
] as const;

export type CareerStage = (typeof careerStages)[number];

export type ServiceOffering = {
  title_pl?: string;
  title_en?: string;
  description_pl?: string;
  description_en?: string;
  pricing_model?: PricingModel;
  price_from?: number | null;
  price_to?: number | null;
};

const labels = {
  pl: {
    languages: "Języki obsługi klienta",
    languagesHint: "Wybierz języki, w których możesz prowadzić współpracę.",
    careerStage: "Etap kariery",
    careerStageHint: "Opcjonalna, przejrzysta informacja widoczna w profilu.",
    specialtiesPl: "Specjalizacje po polsku",
    specialtiesEn: "Specialties in English",
    bilingualHintPl: "Jeśli wersja angielska będzie pusta, ta treść pojawi się również po angielsku.",
    bilingualHintEn: "Jeśli wersja polska będzie pusta, ta treść pojawi się również po polsku.",
    availabilityNotePl: "Godziny pracy i dostępność po polsku",
    availabilityNoteEn: "Working hours and availability in English",
    availabilityNoteHint: "Np. dni dostępności, preferowane godziny kontaktu lub termin najbliższego startu.",
    offers: "Usługi i pakiety",
    offersHint: "Dodaj tyle usług, ile oferujesz. Każda może mieć własną nazwę, opis i sposób rozliczenia.",
  },
  en: {
    languages: "Client languages",
    languagesHint: "Choose the languages in which you can work with clients.",
    careerStage: "Career stage",
    careerStageHint: "An optional, transparent detail shown on the public profile.",
    specialtiesPl: "Specialties in Polish",
    specialtiesEn: "Specialties in English",
    bilingualHintPl: "If English is left empty, this text will also be shown in English.",
    bilingualHintEn: "If Polish is left empty, this text will also be shown in Polish.",
    availabilityNotePl: "Working hours and availability in Polish",
    availabilityNoteEn: "Working hours and availability in English",
    availabilityNoteHint: "For example, available days, preferred contact hours, or the next possible start date.",
    offers: "Services and packages",
    offersHint: "Add as many services as you offer. Each can have its own name, description, and pricing model.",
  },
} as const;

const careerStageLabels = {
  pl: {
    student: "Student / studentka",
    recent_graduate: "Niedawny absolwent / niedawna absolwentka",
    early_career: "Początkujący specjalista / specjalistka",
    established: "Doświadczony specjalista / pracownia",
  },
  en: {
    student: "Student",
    recent_graduate: "Recent graduate",
    early_career: "Early-career professional",
    established: "Established professional or studio",
  },
} as const;

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function finiteNonNegative(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }
  return null;
}

export function stringListValue(formData: FormData, key: string, maxItems = 16, maxLength = 80) {
  const value = formData.get(key);
  if (typeof value !== "string") return [];
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => cleanText(item, maxLength))
        .filter((item): item is string => Boolean(item))
    )
  ).slice(0, maxItems);
}

export function checkboxValues(formData: FormData, key: string, allowed: readonly string[]) {
  return Array.from(new Set(formData.getAll(key).filter((value): value is string => typeof value === "string")))
    .filter((value) => allowed.includes(value))
    .slice(0, allowed.length);
}

export function serviceOfferingsValue(formData: FormData): ServiceOffering[] {
  const raw = formData.get("service_offerings");
  if (typeof raw !== "string" || !raw.trim()) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, 8)
      .map((entry): ServiceOffering | null => {
        if (!entry || typeof entry !== "object") return null;
        const record = entry as Record<string, unknown>;
        const pricingModel = cleanText(record.pricing_model, 40);
        const priceFrom = finiteNonNegative(record.price_from);
        const priceTo = finiteNonNegative(record.price_to);
        const titlePl = cleanText(record.title_pl, 120);
        const titleEn = cleanText(record.title_en, 120);
        const descriptionPl = cleanText(record.description_pl, 700);
        const descriptionEn = cleanText(record.description_en, 700);
        if (!titlePl && !titleEn && !descriptionPl && !descriptionEn) return null;
        return {
          title_pl: titlePl ?? undefined,
          title_en: titleEn ?? undefined,
          description_pl: descriptionPl ?? undefined,
          description_en: descriptionEn ?? undefined,
          pricing_model: pricingModels.includes(pricingModel as PricingModel)
            ? (pricingModel as PricingModel)
            : undefined,
          price_from: priceFrom,
          price_to: priceTo,
        };
      })
      .filter((value): value is ServiceOffering => Boolean(value));
  } catch {
    return [];
  }
}

export function careerStageValue(value: string | null) {
  return careerStages.includes(value as CareerStage) ? (value as CareerStage) : null;
}

export function careerStageLabel(value: string | null | undefined, locale: SiteLocale = siteLocale) {
  const stage = careerStageValue(value ?? null);
  return stage ? careerStageLabels[locale][stage] : null;
}

export function professionalDetailsCopy(locale: SiteLocale = siteLocale) {
  return labels[locale];
}

export function localizedProfileList(
  polish: string[] | null | undefined,
  english: string[] | null | undefined,
  fallback: string[] | null | undefined,
  locale: SiteLocale = siteLocale
) {
  const pl = (polish ?? []).filter(Boolean);
  const en = (english ?? []).filter(Boolean);
  const legacy = (fallback ?? []).filter(Boolean);
  return locale === "en" ? (en.length ? en : pl.length ? pl : legacy) : (pl.length ? pl : en.length ? en : legacy);
}

export function localizedServiceOffering(offer: ServiceOffering, locale: SiteLocale = siteLocale) {
  const isEnglish = locale === "en";
  return {
    title: isEnglish ? offer.title_en || offer.title_pl : offer.title_pl || offer.title_en,
    description: isEnglish ? offer.description_en || offer.description_pl : offer.description_pl || offer.description_en,
  };
}

export function serviceOfferingPriceLabel(offer: ServiceOffering, locale: SiteLocale = siteLocale) {
  return pricingLabel(
    {
      hourly_rate: null,
      pricing_model: offer.pricing_model ?? null,
      price_from: offer.price_from ?? null,
      price_to: offer.price_to ?? null,
    },
    locale
  );
}
