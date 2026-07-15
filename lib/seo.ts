import type { Metadata } from "next";
import { localeMetadata, localePublicUrl, siteLocale } from "@/lib/site-locale";

export const SITE_NAME = "ArchiCompass";
export const DEFAULT_SITE_URL = "https://archicompass.pl";

export function siteUrl() {
  return localePublicUrl(siteLocale).replace(/\/$/, "");
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function englishUrl(path = "/") {
  return localePublicUrl("en", path);
}

export function polishUrl(path = "/") {
  return localePublicUrl("pl", path);
}

export function truncateDescription(value: string, maxLength = 160) {
  const clean = value.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}…`;
}

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  noIndex?: boolean;
  type?: "website" | "article" | "profile";
  alternates?: Metadata["alternates"];
  locale?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  image,
  noIndex = false,
  type = "website",
  alternates,
  locale = localeMetadata[siteLocale].openGraph,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(path);
  const brandedTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const socialImage = absoluteUrl(
    image ||
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1600&q=85"
  );
  const cleanDescription = truncateDescription(description);

  return {
    title: { absolute: brandedTitle },
    description: cleanDescription,
    alternates: alternates || {
      canonical,
      languages: {
        pl: polishUrl(path),
        en: englishUrl(path),
        "x-default": polishUrl(path),
      },
    },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale,
      title: brandedTitle,
      description: cleanDescription,
      images: [{ url: socialImage, width: 1600, height: 900, alt: brandedTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: brandedTitle,
      description: cleanDescription,
      images: [socialImage],
    },
    robots: noIndex
      ? { index: false, follow: false, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
