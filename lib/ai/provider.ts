import type { DesignerProjectAnalysis } from "./designer-analysis-schema";
import type { SubclusterResult } from "./subcluster-schema";
import type { ProfileDraftSuggestion } from "./profile-draft-schema";
import type { DesignerIntelligenceProfile } from "@/lib/portfolio-ingestion/aggregate-profile";

export type AIImageInput = { base64: string; mimeType: string };

export type AIProviderResult =
  | { ok: true; result: DesignerProjectAnalysis }
  | { ok: false; error: string };

export type AISubclusterResult = { ok: true; result: SubclusterResult } | { ok: false; error: string };

export type AIProfileDraftResult = { ok: true; result: ProfileDraftSuggestion } | { ok: false; error: string };

// Small seam so the designer-analysis pipeline isn't hardwired to Gemini -
// swapping providers later means implementing this interface, not touching
// call sites.
export interface AIProvider {
  readonly name: string;
  readonly modelVersion: string;
  analyzeDesignerProject(input: {
    images: AIImageInput[];
    projectTitle: string | null;
    locale: "pl" | "en";
  }): Promise<AIProviderResult>;
  suggestSubclusters(input: { images: AIImageInput[]; locale: "pl" | "en" }): Promise<AISubclusterResult>;
  suggestProfileDraft(input: {
    profile: DesignerIntelligenceProfile;
    projectSummaries: string[];
    allowedServiceCapabilities: readonly string[];
    locale: "pl" | "en";
  }): Promise<AIProfileDraftResult>;
}
