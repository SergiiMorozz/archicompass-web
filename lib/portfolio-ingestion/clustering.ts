import { polishCities } from "./contact-extractor";

export type ClusterableAsset = {
  id: string;
  source_page_url: string | null;
  page_title: string | null;
};

export type ProposedCluster = {
  assetIds: string[];
  suggestedTitle: string;
  // The page's own <title>, before any URL-slug fallback - kept distinct
  // from suggestedTitle (which the designer can edit, and which older code
  // let the AI overwrite) so downstream code can tell "genuine source title"
  // from "we had to make something up".
  originalTitle: string | null;
  confidence: number;
};

/**
 * V1 heuristic clustering: images discovered on the same source page become
 * one candidate project (a portfolio "project page" almost always shows one
 * project). Manually uploaded batches (no source page) become a single
 * low-confidence cluster, since we have no reliable signal to split them -
 * the designer reviews and corrects titles/selection by hand rather than us
 * silently guessing project boundaries.
 */
export function clusterAssets(assets: ClusterableAsset[]): ProposedCluster[] {
  const byPage = new Map<string, ClusterableAsset[]>();
  const noPage: ClusterableAsset[] = [];

  for (const asset of assets) {
    if (asset.source_page_url) {
      const bucket = byPage.get(asset.source_page_url) ?? [];
      bucket.push(asset);
      byPage.set(asset.source_page_url, bucket);
    } else {
      noPage.push(asset);
    }
  }

  const clusters: ProposedCluster[] = [];

  for (const [pageUrl, pageAssets] of byPage) {
    const originalTitle = pageAssets.find((asset) => asset.page_title)?.page_title ?? null;
    clusters.push({
      assetIds: pageAssets.map((asset) => asset.id),
      suggestedTitle: originalTitle ?? titleFromUrl(pageUrl),
      originalTitle,
      confidence: pageConfidence(pageAssets.length),
    });
  }

  if (noPage.length) {
    clusters.push({
      assetIds: noPage.map((asset) => asset.id),
      suggestedTitle: "Uploaded project",
      originalTitle: null,
      confidence: 0.3,
    });
  }

  return clusters;
}

/**
 * A page's image count is itself a signal about how trustworthy "these are
 * all one project" is. A handful of photos on one page is almost certainly
 * a single project page. A page with dozens of images is more likely a flat
 * gallery grid quietly containing several unrelated projects that we have no
 * structural way to tell apart (no sub-links, no per-image captions) -
 * confidence should drop accordingly so the review UI flags it for a closer
 * look instead of presenting false certainty.
 */
function pageConfidence(imageCount: number) {
  // A single surviving image is at least as likely to be an extraction
  // shortfall (lazy-loaded gallery, thumbnail-only page) as a real
  // one-photo project - never worth the same confidence as a page that
  // clearly yielded its whole gallery.
  if (imageCount <= 1) return 0.3;
  if (imageCount === 2) return 0.5;
  if (imageCount <= 8) return 0.7;
  if (imageCount <= 15) return 0.5;
  return 0.3;
}

function titleFromUrl(pageUrl: string) {
  try {
    const url = new URL(pageUrl);
    const lastSegment = url.pathname.split("/").filter(Boolean).pop();
    if (!lastSegment) return "Portfolio project";
    return lastSegment
      .replace(/[-_]+/g, " ")
      .replace(/\.\w+$/, "")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .slice(0, 120);
  } catch {
    return "Portfolio project";
  }
}

export type ProjectTitleFacts = {
  objectType: string | null;
  areaM2: number | null;
  location: string | null;
  projectStage: "realized" | "concept" | null;
};

const stageWords: Record<string, "realized" | "concept"> = {
  realizacja: "realized",
  zrealizowano: "realized",
  projekt: "concept",
  koncepcja: "concept",
};

const objectTypeWords: Record<string, string> = {
  mieszkanie: "apartment",
  apartament: "apartment",
  dom: "house",
  poddasze: "attic",
  kamienica: "townhouse",
  willa: "villa",
  loft: "loft",
  biuro: "office",
  lokal: "commercial",
};

const areaPattern = /(\d+(?:[.,]\d+)?)\s*(?:mkw|m2|m²)/i;

/**
 * Structured facts (object type, area, location, project stage) parsed
 * directly from a dedicated project page's own `|`-delimited title, e.g.
 * "REALIZACJA | MIESZKANIE | 66 mkw | Łódź". Deterministic only, same
 * principle as contact-extractor.ts - never guessed by AI, and left null
 * rather than inferred when the title doesn't follow this pattern.
 */
export function parseProjectTitleFacts(title: string | null): ProjectTitleFacts {
  const empty: ProjectTitleFacts = { objectType: null, areaM2: null, location: null, projectStage: null };
  if (!title || !title.includes("|")) return empty;

  let segments = title.split("|").map((segment) => segment.trim()).filter(Boolean);
  const facts = { ...empty };

  const first = segments[0]?.toLowerCase();
  if (first && stageWords[first]) {
    facts.projectStage = stageWords[first];
    segments = segments.slice(1);
  }

  const typeWord = segments[0]?.toLowerCase();
  if (typeWord && objectTypeWords[typeWord]) facts.objectType = objectTypeWords[typeWord];

  for (const segment of segments) {
    const match = segment.match(areaPattern);
    if (match && facts.areaM2 === null) facts.areaM2 = Number(match[1].replace(",", "."));
  }

  const lastSegment = segments[segments.length - 1];
  if (lastSegment) {
    const knownCity = polishCities.find((city) => city.toLowerCase() === lastSegment.toLowerCase());
    if (knownCity) facts.location = knownCity;
    else if (!areaPattern.test(lastSegment) && lastSegment.toLowerCase() !== typeWord) facts.location = lastSegment;
  }

  return facts;
}
