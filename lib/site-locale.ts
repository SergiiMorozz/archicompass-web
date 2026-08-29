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
  if (normalizedPath === "/en" || normalizedPath === "/index" || normalizedPath === "/en/index") return "/";
  if (normalizedPath.startsWith("/en/")) return normalizedPath.slice(3) || "/";
  return normalizedPath;
}

export function alternateLocalePath(targetLocale: SiteLocale, path = "/") {
  const normalizedPath = normalizedRoutePath(path);
  const polishCity = normalizedPath.match(/^\/projektanci-wnetrz\/([^/]+)$/);
  if (targetLocale === "en" && polishCity) {
    return `/interior-designers/poland/${polishCity[1]}`;
  }

  const englishPolishCity = normalizedPath.match(/^\/interior-designers\/poland\/([^/]+)$/);
  if (targetLocale === "pl" && englishPolishCity) {
    return `/projektanci-wnetrz/${englishPolishCity[1]}`;
  }

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

// Files from /public do not receive Next.js' basePath automatically. Keep
// English asset URLs under /en so the two deployments render the same brand.
export function localeAssetPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteLocale === "en" ? "/en" : ""}${normalizedPath}`;
}

export function localePublicUrl(locale: SiteLocale, path = "/") {
  const publicPath = localePublicPath(locale, path);
  return publicPath === "/" ? localeSiteUrl("pl") : `${localeSiteUrl("pl")}${publicPath}`;
}

export function otherLocale(locale: SiteLocale = siteLocale): SiteLocale {
  return locale === "pl" ? "en" : "pl";
}
