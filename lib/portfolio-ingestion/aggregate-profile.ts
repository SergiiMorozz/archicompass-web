import type { DesignerProjectAnalysis } from "@/lib/ai/designer-analysis-schema";
import { normalizeColor, normalizeMaterial, normalizeRoom, normalizeStyle } from "./taxonomy";

export type DesignerIntelligenceProfile = {
  dominant_styles: { name: string; confidence: number }[];
  secondary_styles: { name: string; confidence: number }[];
  materials: string[];
  colors: string[];
  room_experience: string[];
  property_types: string[];
  attributes: {
    minimalism: number;
    warmth: number;
    colorfulness: number;
    ornamentation: number;
    luxury: number;
  };
  project_count: number;
  evidence_strength: number;
  confidence_scores: Record<string, number>;
};

function topByFrequency(values: string[], max: number, normalize: (raw: string) => { key: string; display: string } | null) {
  const counts = new Map<string, { display: string; count: number }>();
  for (const value of values) {
    const normalized = normalize(value);
    if (!normalized) continue;
    const entry = counts.get(normalized.key) ?? { display: normalized.display, count: 0 };
    entry.count += 1;
    counts.set(normalized.key, entry);
  }
  return Array.from(counts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, max)
    .map((entry) => entry.display);
}

/**
 * Deterministic aggregation of per-project structured analyses into one
 * designer-level profile. No LLM call here by design (spec section 8/9):
 * matching needs stable, cheap, re-derivable numbers, not another prompt.
 */
export function aggregateDesignerProfile(analyses: DesignerProjectAnalysis[]): DesignerIntelligenceProfile {
  if (!analyses.length) {
    return {
      dominant_styles: [],
      secondary_styles: [],
      materials: [],
      colors: [],
      room_experience: [],
      property_types: [],
      attributes: { minimalism: 0, warmth: 0, colorfulness: 0, ornamentation: 0, luxury: 0 },
      project_count: 0,
      evidence_strength: 0,
      confidence_scores: {},
    };
  }

  const styleTotals = new Map<string, { display: string; sum: number; count: number }>();
  for (const analysis of analyses) {
    for (const style of analysis.styles) {
      const normalized = normalizeStyle(style.name);
      if (!normalized) continue;
      const entry = styleTotals.get(normalized.key) ?? { display: normalized.display, sum: 0, count: 0 };
      entry.sum += style.confidence;
      entry.count += 1;
      styleTotals.set(normalized.key, entry);
    }
  }
  const rankedStyles = Array.from(styleTotals.values())
    .map(({ display, sum, count }) => ({ name: display, confidence: sum / count }))
    .sort((a, b) => b.confidence - a.confidence);

  const attributeKeys = ["minimalism", "warmth", "colorfulness", "ornamentation", "luxury"] as const;
  const attributes = attributeKeys.reduce(
    (acc, key) => {
      acc[key] = analyses.reduce((sum, analysis) => sum + analysis.attributes[key], 0) / analyses.length;
      return acc;
    },
    {} as DesignerIntelligenceProfile["attributes"]
  );

  const evidenceStrength = Math.min(1, analyses.length / 8);

  return {
    dominant_styles: rankedStyles.slice(0, 3),
    secondary_styles: rankedStyles.slice(3, 6),
    materials: topByFrequency(analyses.flatMap((analysis) => analysis.materials), 12, normalizeMaterial),
    colors: topByFrequency(analyses.flatMap((analysis) => analysis.colors), 8, normalizeColor),
    room_experience: topByFrequency(analyses.flatMap((analysis) => analysis.rooms), 10, normalizeRoom),
    property_types: [],
    attributes,
    project_count: analyses.length,
    evidence_strength: evidenceStrength,
    confidence_scores: {
      styles: rankedStyles[0]?.confidence ?? 0,
      overall: evidenceStrength,
    },
  };
}
