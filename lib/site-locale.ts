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

function normalizedRoutePath(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (normalizedPath === "/en") return "/";
  if (normalizedPath.startsWith("/en/")) return normalizedPath.slice(3) || "/";
  return normalizedPath;
}

export function localeSiteUrl(locale: SiteLocale) {
  if (locale === "en") {
    return normalizedUrl(
      process.env.NEXT_PUBLIC_ENGLISH_SITE_URL || "https://archicompass-web-en.vercel.app"
    );
  }

  return normalizedUrl(process.env.NEXT_PUBLIC_POLISH_SITE_URL || "https://archicompass.pl");
}

export function localePublicPath(locale: SiteLocale, path = "/") {
  const normalizedPath = normalizedRoutePath(path);
  if (locale === "en") {
    return normalizedPath === "/" ? "/en" : `/en${normalizedPath}`;
  }
  return normalizedPath;
}

// Next.js adds basePath automatically for links rendered inside the English app.
// Public URLs need /en, while internal Link targets must remain route-relative.
export function localeAppPath(path = "/") {
  return normalizedRoutePath(path);
}

export function localePublicUrl(locale: SiteLocale, path = "/") {
  return `${localeSiteUrl("pl")}${localePublicPath(locale, path)}`;
}

export function otherLocale(locale: SiteLocale = siteLocale): SiteLocale {
  return locale === "pl" ? "en" : "pl";
}
