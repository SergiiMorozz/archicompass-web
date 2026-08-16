import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { SiteLocale } from "@/lib/site-locale";

type FullLegalDocumentKey = "terms" | "privacy" | "cookies" | "aiTransparency";

const sourceDirectory = join(process.cwd(), "content", "legal-source");

function readSource(name: string) {
  return readFileSync(join(sourceDirectory, name), "utf8").trim();
}

function fromMarker(source: string, marker: string) {
  const markerIndex = source.indexOf(marker);

  if (markerIndex === -1) {
    throw new Error(`Legal source marker not found: ${marker}`);
  }

  return source.slice(markerIndex).trim();
}

const legalSources: Record<SiteLocale, Record<FullLegalDocumentKey, string>> = {
  pl: {
    terms: readSource("terms-pl-source.txt"),
    privacy: readSource("privacy-pl-source.txt"),
    cookies: readSource("cookies-pl-source.txt"),
    aiTransparency: readSource("ai-transparency-pl-source.txt"),
  },
  en: {
    terms: readSource("terms-en-source.txt"),
    privacy: readSource("privacy-en-source.txt"),
    cookies: readSource("cookies-en-source.txt"),
    aiTransparency: readSource("ai-transparency-en-source.txt"),
  },
};

const documentStartMarkers: Record<SiteLocale, Record<FullLegalDocumentKey, string>> = {
  pl: {
    terms: "§ 1. Postanowienia ogólne",
    privacy: "Niniejsza Polityka Prywatności",
    cookies: "1. Informacje ogólne",
    aiTransparency: "1. Dlaczego publikujemy tę informację",
  },
  en: {
    terms: "§ 1. General provisions",
    privacy: "This Privacy Policy describes",
    cookies: "1. General information",
    aiTransparency: "1. Why we are publishing this information",
  },
};

export function getFullLegalText(key: FullLegalDocumentKey, locale: SiteLocale) {
  return fromMarker(legalSources[locale][key], documentStartMarkers[locale][key]);
}
