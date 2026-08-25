import crypto from "node:crypto";
import { allowedAssetContentTypes, maxAssetBytes, type PortfolioAssetCandidate } from "./types";

export class UploadAdapter {
  constructor(private readonly files: File[]) {}

  async *discover(): AsyncGenerator<PortfolioAssetCandidate> {
    for (const file of this.files) {
      if (!allowedAssetContentTypes.has(file.type) || file.size > maxAssetBytes || file.size === 0) {
        continue;
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      yield {
        sourcePageUrl: null,
        sourceImageUrl: null,
        pageTitle: null,
        altText: file.name.slice(0, 300) || null,
        contentHash: crypto.createHash("sha256").update(bytes).digest("hex"),
        bytes,
        contentType: file.type,
      };
    }
  }
}
