import crypto from "node:crypto";
import { safeFetch } from "./ssrf-guard";
import { allowedAssetContentTypes, maxAssetBytes, maxAssetsPerPage, type PortfolioAssetCandidate } from "./types";
import { extractContactFacts } from "./contact-extractor";

const maxPageBytes = 5 * 1024 * 1024;

export type ImageRef = { src: string; alt: string | null };

function extractTitle(html: string) {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim().slice(0, 200) || null : null;
}

function largestFromSrcset(srcset: string) {
  let best: { url: string; width: number } | null = null;
  for (const entry of srcset.split(",")) {
    const [url, descriptor] = entry.trim().split(/\s+/);
    if (!url) continue;
    const width = Number(descriptor?.match(/^(\d+)w$/)?.[1] ?? 0);
    if (!best || width > best.width) best = { url, width };
  }
  return best?.url ?? null;
}

function attr(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]+)"`, "i")) || tag.match(new RegExp(`\\b${name}\\s*=\\s*'([^']+)'`, "i"));
  return match ? match[1].trim() : null;
}

function extractImageRefs(html: string) {
  const refs: ImageRef[] = [];
  const seen = new Set<string>();

  const imgPattern = /<img\b[^>]*>/gi;
  for (const tagMatch of html.matchAll(imgPattern)) {
    const tag = tagMatch[0];
    // Lazy-load plugins (this site's djmediatools gallery included) put an
    // inert placeholder (often a data: URI) in `src` and the real photo in
    // `data-src`/`data-lazy-src`/`data-original` - those must be checked
    // FIRST, or every lazy-loaded gallery photo silently vanishes because
    // `src` "wins" and turns out to be a placeholder.
    const rawSrc = attr(tag, "src");
    const lazySrc = attr(tag, "data-src") ?? attr(tag, "data-lazy-src") ?? attr(tag, "data-original");
    const srcsetSrc = largestFromSrcset(attr(tag, "srcset") ?? attr(tag, "data-srcset") ?? "");
    const src = (rawSrc && !rawSrc.startsWith("data:") ? rawSrc : null) ?? lazySrc ?? srcsetSrc;
    if (!src || src.startsWith("data:")) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    const altMatch = tag.match(/\balt\s*=\s*"([^"]*)"/i) || tag.match(/\balt\s*=\s*'([^']*)'/i);
    refs.push({ src, alt: altMatch ? altMatch[1].trim().slice(0, 300) || null : null });
  }

  const ogImagePattern = /<meta\b[^>]*property\s*=\s*"og:image"[^>]*>/gi;
  for (const tagMatch of html.matchAll(ogImagePattern)) {
    const tag = tagMatch[0];
    const contentMatch = tag.match(/\bcontent\s*=\s*"([^"]+)"/i);
    if (!contentMatch) continue;
    const src = contentMatch[1].trim();
    if (!src || seen.has(src)) continue;
    seen.add(src);
    refs.push({ src, alt: null });
  }

  return refs;
}

function looksLikeDecoration(src: string) {
  const lower = src.toLowerCase();
  return (
    lower.includes("icon") ||
    lower.includes("logo") ||
    lower.includes("sprite") ||
    lower.includes("pixel") ||
    lower.includes("avatar") ||
    lower.endsWith(".svg") ||
    lower.endsWith(".gif")
  );
}

const nonContentPathPattern =
  /\/(cart|checkout|login|signin|sign-in|register|account|privacy|terms|cookie|impressum|regulamin|polityka|search|tag|tags|category|kategoria|author|wp-admin|wp-json|feed|rss|sitemap)(\/|$|\?)/i;
// Contact-ish pages have no portfolio images but are the best source of
// deterministic contact facts (phone/email/location/services text) - worth
// spending a couple of crawl slots on even on a large site, so they're
// prioritized rather than left to natural link order.
const contactPagePattern = /\/(kontakt|contact|o-nas|about|about-us|uslugi|services)(\/|$|\?)/i;
// Portfolio/project index pages are the highest-priority crawl target of
// all - matched against both the URL and the link's own anchor text, since
// a real site's "Portfolio" nav link doesn't always have an obvious slug.
const portfolioPagePattern = /portfolio|projekty|realizacj|realizations?|our-work|case-stud|wnetrza|wn[eę]trza|prace\b/i;
const nonContentExtensionPattern = /\.(pdf|zip|jpg|jpeg|png|webp|gif|svg|css|js|xml|json)$/i;
const socialHostPattern = /(facebook|instagram|pinterest|linkedin|twitter|x\.com|youtube|tiktok|behance|houzz|wa\.me|whatsapp)\.com|instagram\./i;

export type InternalLink = { href: string; text: string };

function extractInternalLinks(html: string, baseUrl: string, maxLinks: number): InternalLink[] {
  const origin = new URL(baseUrl).origin;
  const links: InternalLink[] = [];
  const seen = new Set<string>();

  const linkPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(linkPattern)) {
    if (links.length >= maxLinks) break;
    const href = match[1].trim();
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;

    let absolute: URL;
    try {
      absolute = new URL(href, baseUrl);
    } catch {
      continue;
    }
    if (absolute.origin !== origin) continue;
    if (socialHostPattern.test(absolute.href)) continue;

    absolute.hash = "";
    const normalized = absolute.toString();
    if (normalized === baseUrl || normalized === `${baseUrl}/`) continue;
    if (nonContentPathPattern.test(absolute.pathname)) continue;
    if (nonContentExtensionPattern.test(absolute.pathname)) continue;
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const text = match[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
    links.push({ href: normalized, text });
  }

  return links;
}

/** Portfolio-index candidates first (highest value, checked by URL and anchor text), then contact-ish pages, then everything else in original order. */
function prioritizeLinks(links: InternalLink[]) {
  const rank = (link: InternalLink) => {
    if (portfolioPagePattern.test(link.href) || portfolioPagePattern.test(link.text)) return 0;
    if (contactPagePattern.test(link.href)) return 1;
    return 2;
  };
  return [...links].sort((a, b) => rank(a) - rank(b));
}

const maxLinksPerPage = 40;

export type DiscoveredPageType = "homepage" | "portfolio_index" | "about" | "generic";

/**
 * A page's discovered type is the primary signal for whether it's allowed to
 * become a project on its own (see stepGrouping in advance-job.ts): a
 * dedicated portfolio/project page is strong boundary evidence, while an
 * about/services/contact page showing interior photos incidentally is not.
 * This only produces a best guess from the URL at discovery time - a page
 * guessed here as "generic" or "portfolio_index" gets promoted to the much
 * stronger `portfolio_project_detail` the moment it's found to be a
 * structural child of an already-crawled index page (see galleryChildLinks).
 */
export function classifyDiscoveredPageType(url: string, isEntry: boolean): DiscoveredPageType {
  if (isEntry) return "homepage";
  if (portfolioPagePattern.test(url)) return "portfolio_index";
  if (contactPagePattern.test(url)) return "about";
  return "generic";
}

export type DiscoveredSocialLinks = {
  instagram?: string;
  facebook?: string;
  behance?: string;
  linkedin?: string;
};

const socialLinkPatterns: { key: keyof DiscoveredSocialLinks; host: RegExp }[] = [
  { key: "instagram", host: /(^|\.)instagram\.com$/i },
  { key: "facebook", host: /(^|\.)facebook\.com$/i },
  { key: "behance", host: /(^|\.)behance\.net$/i },
  { key: "linkedin", host: /(^|\.)linkedin\.com$/i },
];

/** Scans every link on the page (not just same-origin ones) for known social profile URLs - a deterministic, non-AI signal auto-fillable straight from the designer's own site. */
function extractSocialLinks(html: string, baseUrl: string): DiscoveredSocialLinks {
  const found: DiscoveredSocialLinks = {};
  const linkPattern = /<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi;
  for (const match of html.matchAll(linkPattern)) {
    const href = match[1].trim();
    if (!href || href.startsWith("#")) continue;
    let absolute: URL;
    try {
      absolute = new URL(href, baseUrl);
    } catch {
      continue;
    }
    for (const { key, host } of socialLinkPatterns) {
      if (found[key]) continue;
      if (host.test(absolute.hostname)) {
        const path = absolute.pathname.replace(/\/$/, "");
        // Skip generic share/embed links (e.g. facebook.com/sharer.php) - only
        // keep what looks like an actual profile/page URL.
        if (!path || /\/(sharer|share|dialog|embed|plugins)/i.test(path)) continue;
        found[key] = absolute.toString();
      }
    }
  }
  return found;
}

/**
 * A dedicated project page's own body copy - the designer's actual words
 * about this specific project, not an AI guess - is a source fact worth
 * keeping distinct from AI-generated description text. Real `<p>` content is
 * preferred over `og:description`, which on many sites just concatenates the
 * page title with the same text and is noisier.
 */
function extractOriginalDescription(html: string) {
  const paragraphs: string[] = [];
  const paragraphPattern = /<p\b[^>]*>([\s\S]*?)<\/p>/gi;
  for (const match of html.matchAll(paragraphPattern)) {
    const text = match[1].replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
    if (text.length >= 40) paragraphs.push(text);
  }
  // Only the first qualifying paragraph - a second one is more often a
  // nearby contact-form label or unrelated boilerplate than more of the
  // actual project description.
  if (paragraphs.length) return paragraphs[0].slice(0, 600);

  const ogDescription = attr(html.match(/<meta\b[^>]*property\s*=\s*"og:description"[^>]*>/i)?.[0] ?? "", "content");
  return ogDescription ? ogDescription.slice(0, 600) : null;
}

export async function fetchAndExtractImageRefs(pageUrl: string) {
  const page = await safeFetch(pageUrl, maxPageBytes);
  if (!page.contentType.includes("text/html")) {
    throw new Error("This URL does not look like a webpage.");
  }
  const html = page.bytes.toString("utf-8");
  const pageTitle = extractTitle(html);
  const originalDescription = extractOriginalDescription(html);
  const refs = extractImageRefs(html)
    .filter((ref) => !looksLikeDecoration(ref.src))
    .slice(0, maxAssetsPerPage)
    .map((ref) => {
      try {
        return { src: new URL(ref.src, page.finalUrl).toString(), alt: ref.alt };
      } catch {
        return null;
      }
    })
    .filter((ref): ref is ImageRef => Boolean(ref));
  const links = extractInternalLinks(html, page.finalUrl, maxLinksPerPage);
  const contactFacts = extractContactFacts(html);

  return { finalUrl: page.finalUrl, pageTitle, originalDescription, refs, links, contactFacts };
}

/**
 * A "gallery index" page (portfolio/realizacje/projects listing) links to
 * several deeper pages under its own path, each of which is a real project.
 * When that pattern is detected, the individual project pages should be
 * crawled instead of treating the whole gallery grid as one project.
 */
export function galleryChildLinks(pageUrl: string, links: InternalLink[]) {
  const currentPath = new URL(pageUrl).pathname.replace(/\/$/, "");
  return links
    .filter((link) => {
      const path = new URL(link.href).pathname.replace(/\/$/, "");
      return path !== currentPath && path.startsWith(`${currentPath}/`);
    })
    .map((link) => link.href);
}

const maxCrawledPages = 12;

/**
 * Discovers the set of pages worth crawling for a portfolio site: the entry
 * URL itself plus same-origin internal links that don't look like nav/legal
 * boilerplate, with portfolio-index candidates promoted to the front so
 * they're reached within the crawl budget instead of possibly being crowded
 * out by nav/offer/process pages. This is what turns "download every image
 * on one URL" into "find the individual project pages" - clustering-by-
 * source-page downstream then naturally produces one project per real
 * project page.
 */
export async function discoverPortfolioPages(entryUrl: string) {
  const page = await safeFetch(entryUrl, maxPageBytes);
  if (!page.contentType.includes("text/html")) {
    throw new Error("This URL does not look like a webpage.");
  }
  const html = page.bytes.toString("utf-8");
  const links = extractInternalLinks(html, page.finalUrl, maxLinksPerPage);
  const prioritized = prioritizeLinks(links).map((link) => link.href);
  const socialLinks = extractSocialLinks(html, page.finalUrl);
  const contactFacts = extractContactFacts(html);
  return {
    finalUrl: page.finalUrl,
    pages: [page.finalUrl, ...prioritized].slice(0, maxCrawledPages),
    socialLinks,
    contactFacts,
  };
}

export async function downloadPortfolioImage(
  ref: ImageRef,
  sourcePageUrl: string,
  pageTitle: string | null
): Promise<PortfolioAssetCandidate | null> {
  let downloaded;
  try {
    downloaded = await safeFetch(ref.src, maxAssetBytes);
  } catch {
    return null; // unreachable/oversized image - skip it, keep the import going
  }
  const contentType = downloaded.contentType.split(";")[0].trim();
  if (!allowedAssetContentTypes.has(contentType)) return null;

  return {
    sourcePageUrl,
    sourceImageUrl: ref.src,
    pageTitle,
    altText: ref.alt,
    contentHash: crypto.createHash("sha256").update(downloaded.bytes).digest("hex"),
    bytes: downloaded.bytes,
    contentType,
  };
}
