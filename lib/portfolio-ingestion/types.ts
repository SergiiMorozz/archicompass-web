export type PortfolioAssetCandidate = {
  sourcePageUrl: string | null;
  sourceImageUrl: string | null;
  pageTitle: string | null;
  altText: string | null;
  contentHash: string | null;
  bytes: Buffer;
  contentType: string;
};

export type PortfolioSourceAdapter = {
  discover(): AsyncGenerator<PortfolioAssetCandidate>;
};

export const maxAssetsPerPage = 25; // storage cap per crawled page

// A pure storage/crawl safety net, not an AI-cost control - AI spend is
// bounded separately per project (maxImagesPerAnalysis in advance-job.ts).
// This must stay high enough to never be the reason a real portfolio page
// goes unfetched: with maxTotalCrawledPages pages at maxAssetsPerPage each,
// the true ceiling is far below this number for any realistic site.
export const maxAssetsDiscoveredPerJob = 2000;

export const maxAssetBytes = 10 * 1024 * 1024;
export const allowedAssetContentTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
