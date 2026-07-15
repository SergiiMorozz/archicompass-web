export type SiteLocale = "pl" | "en";

const localeFromEnvironment = process.env.NEXT_PUBLIC_SITE_LOCALE;

export const siteLocale: SiteLocale = localeFromEnvironment === "en" ? "en" : "pl";

export const isEnglishSite = siteLocale === "en";

export const localeMetadata = {
  pl: {
    html: "pl",
    openGraph: "pl_PL",
    number: "pl-PL",
  },
  en: {
    html: "en",
    openGraph: "en_US",
    number: "en-US",
  },
} as const;

function normalizedUrl(value: string) {
  return value.replace(/\/$/, "");
}

export function localeSiteUrl(locale: SiteLocale) {
  if (locale === "en") {
    return normalizedUrl(
      process.env.NEXT_PUBLIC_ENGLISH_SITE_URL || "https://archicompass-web-en.vercel.app"
    );
  }

  return normalizedUrl(process.env.NEXT_PUBLIC_POLISH_SITE_URL || "https://archicompass.pl");
}

export function otherLocale(locale: SiteLocale = siteLocale): SiteLocale {
  return locale === "pl" ? "en" : "pl";
}
