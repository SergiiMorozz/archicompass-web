import { serviceCapabilities } from "@/lib/service-capabilities";
import { workModes } from "@/lib/profile-pricing";

export type ContactFacts = {
  fullName?: string;
  phone?: string;
  email?: string;
  location?: string;
  languages?: string[];
  workModes?: string[];
  explicitServiceCapabilities?: string[];
};

// Deterministic extraction only - never used to invent data, only to find
// what a site's own text/markup already states. AI is not involved here by
// design (spec: "AI should not invent missing contact data").

export const polishCities = [
  "Warszawa", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin",
  "Lublin", "Bydgoszcz", "Białystok", "Katowice", "Gdynia", "Sopot",
  "Rzeszów", "Toruń", "Kielce", "Olsztyn", "Opole", "Zielona Góra",
  "Piaseczno", "Pruszków", "Legionowo", "Konstancin-Jeziorna",
];

const phonePattern = /(\+?48[\s-]?)?(\d{3}[\s-]?\d{3}[\s-]?\d{3})\b/;
const telNearbyLabel = /(tel\.?|telefon|phone|zadzwo[nń])/i;

// Bare word-stem matching here was a confirmed false-positive source (e.g.
// "niemiecka jakość materiałów" matching as "speaks German", or "cała
// Polska" in an unrelated sentence matching as "works remotely"). These
// patterns require an actual declarative phrase - a language or work mode
// word appearing near a verb/label that's actually asserting the fact, not
// just appearing somewhere on the page. If nothing matches, the field stays
// empty rather than guessing.
const languagePhrases: { pattern: RegExp; label: string }[] = [
  { pattern: /obsługuj\w*[^.?!]{0,25}\bangielsk\w*/i, label: "English" },
  { pattern: /m[oó]wi[mę][^.?!]{0,12}po\s+angielsku/i, label: "English" },
  { pattern: /j[eę]zyk\w*\s+obs[łl]ug\w*[^.?!]{0,30}angielsk/i, label: "English" },
  { pattern: /\bwe\s+speak\s+english\b/i, label: "English" },
  { pattern: /\bconsultations?\s+(?:available\s+)?in\s+english\b/i, label: "English" },
  { pattern: /\blanguages?\s*:\s*[^.?!]*\benglish\b/i, label: "English" },
  { pattern: /obsługuj\w*[^.?!]{0,25}\bniemieck\w*/i, label: "German" },
  { pattern: /m[oó]wi[mę][^.?!]{0,12}po\s+niemiecku/i, label: "German" },
  { pattern: /\bwe\s+speak\s+german\b/i, label: "German" },
  { pattern: /obsługuj\w*[^.?!]{0,25}\bukraińsk\w*/i, label: "Ukrainian" },
  { pattern: /m[oó]wi[mę][^.?!]{0,12}po\s+ukraińsku/i, label: "Ukrainian" },
];

const workModePhrases: { pattern: RegExp; mode: (typeof workModes)[number] }[] = [
  { pattern: /pracuj\w*[^.?!]{0,15}zdalnie/i, mode: "Remote" },
  { pattern: /współpracuj\w*[^.?!]{0,20}zdalnie/i, mode: "Remote" },
  { pattern: /konsultacj\w*\s+online/i, mode: "Remote" },
  { pattern: /projekt\w*\s+online/i, mode: "Remote" },
  { pattern: /obsługuj\w*\s+klient\w*\s+z\s+cał\w*\s+polsk\w*/i, mode: "Remote" },
  { pattern: /\bwe\s+work\s+remotely\b/i, mode: "Remote" },
  { pattern: /\bremote\s+consultations?\b/i, mode: "Remote" },
  { pattern: /prac\w*\s+stacjonarn\w*/i, mode: "On-site" },
  { pattern: /wizyt\w*\s+(?:na\s+miejscu|stacjonarn\w*)/i, mode: "On-site" },
  { pattern: /\bon-?site\s+(?:visits?|consultations?|meetings?)\b/i, mode: "On-site" },
  { pattern: /prac\w*\s+hybrydow\w*/i, mode: "Hybrid" },
  { pattern: /\bhybrid\s+(?:work|model|cooperation)\b/i, mode: "Hybrid" },
];

const serviceKeywords: Record<(typeof serviceCapabilities)[number], RegExp[]> = {
  "3D visualization": [/wizualizacj\w*\s*3d/i, /3d\s*visuali[sz]ation/i],
  "Site consultations": [/konsultacj\w*\s*(na miejscu|w domu)/i, /site\s*consultation/i],
  "Author's supervision": [/nadz[oó]r\s*autorski/i, /author.s\s*supervision/i],
  "Full project coordination": [/pełn\w*\s*koordynacj\w*/i, /full\s*project\s*coordination/i, /kompleksow\w*\s*realizacj\w*/i],
  "Technical documentation": [/dokumentacj\w*\s*techniczn\w*/i, /technical\s*documentation/i],
  "Sourcing and procurement": [/dob[oó]r\s*i\s*zamawiani\w*/i, /zakup\w*\s*wyposażeni\w*/i, /sourcing\s*and\s*procurement/i],
};

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractJsonLd(html: string): Record<string, unknown> | null {
  const scriptPattern = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptPattern)) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        const type = candidate?.["@type"];
        const typeStr = Array.isArray(type) ? type.join(" ") : String(type ?? "");
        if (/organization|localbusiness|professionalservice/i.test(typeStr)) {
          return candidate as Record<string, unknown>;
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

export function extractContactFacts(html: string): ContactFacts {
  const facts: ContactFacts = {};

  const jsonLd = extractJsonLd(html);
  if (jsonLd) {
    if (typeof jsonLd.name === "string") facts.fullName = jsonLd.name.trim().slice(0, 160);
    if (typeof jsonLd.telephone === "string") facts.phone = jsonLd.telephone.trim().slice(0, 40);
    if (typeof jsonLd.email === "string") facts.email = jsonLd.email.trim().slice(0, 200);
    const address = jsonLd.address as Record<string, unknown> | undefined;
    if (address && typeof address.addressLocality === "string") facts.location = address.addressLocality.trim().slice(0, 100);
  }

  if (!facts.email) {
    const mailtoMatch = html.match(/href\s*=\s*["']mailto:([^"'?]+)/i);
    if (mailtoMatch) facts.email = decodeURIComponent(mailtoMatch[1]).trim().slice(0, 200);
  }

  if (!facts.phone) {
    const telMatch = html.match(/href\s*=\s*["']tel:([^"']+)/i);
    if (telMatch) facts.phone = decodeURIComponent(telMatch[1]).trim().slice(0, 40);
  }

  const text = stripTags(html);

  if (!facts.phone) {
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch) {
      const context = text.slice(Math.max(0, (phoneMatch.index ?? 0) - 20), phoneMatch.index ?? 0);
      if (phoneMatch[1] || telNearbyLabel.test(context)) {
        facts.phone = phoneMatch[0].trim().slice(0, 40);
      }
    }
  }

  if (!facts.location) {
    for (const city of polishCities) {
      if (new RegExp(`\\b${city}\\b`, "i").test(text)) {
        facts.location = city;
        break;
      }
    }
  }

  const languages = new Set<string>();
  for (const { pattern, label } of languagePhrases) {
    if (pattern.test(text)) languages.add(label);
  }
  if (languages.size) facts.languages = Array.from(languages);

  const modes = new Set<string>();
  for (const { pattern, mode } of workModePhrases) {
    if (pattern.test(text)) modes.add(mode);
  }
  if (modes.size) facts.workModes = Array.from(modes);

  const explicitServices = (Object.keys(serviceKeywords) as (typeof serviceCapabilities)[number][]).filter((capability) =>
    serviceKeywords[capability].some((pattern) => pattern.test(text))
  );
  if (explicitServices.length) facts.explicitServiceCapabilities = explicitServices;

  return facts;
}

/** Merges newly found facts into an accumulator, keeping the first value found per field across a multi-page crawl rather than letting a later, less-relevant page overwrite an earlier good match. */
export function mergeContactFacts(accumulated: ContactFacts, found: ContactFacts): ContactFacts {
  return {
    fullName: accumulated.fullName ?? found.fullName,
    phone: accumulated.phone ?? found.phone,
    email: accumulated.email ?? found.email,
    location: accumulated.location ?? found.location,
    languages: accumulated.languages?.length ? accumulated.languages : found.languages,
    workModes: accumulated.workModes?.length ? accumulated.workModes : found.workModes,
    explicitServiceCapabilities: Array.from(
      new Set([...(accumulated.explicitServiceCapabilities ?? []), ...(found.explicitServiceCapabilities ?? [])])
    ),
  };
}
