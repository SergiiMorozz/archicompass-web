import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

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

const termsSource = readSource("terms-pl-source.txt");
const privacySource = readSource("privacy-pl-source.txt");
const cookiesSource = readSource("cookies-pl-source.txt");
const aiTransparencySource = readSource("ai-transparency-pl-source.txt");

export function getFullPolishLegalText(key: FullLegalDocumentKey) {
  switch (key) {
    case "terms":
      return fromMarker(termsSource, "§ 1. Postanowienia ogólne");
    case "privacy":
      return fromMarker(privacySource, "Niniejsza Polityka Prywatności");
    case "cookies":
      return fromMarker(cookiesSource, "1. Informacje ogólne");
    case "aiTransparency":
      return fromMarker(aiTransparencySource, "1. Dlaczego publikujemy tę informację");
  }
}
