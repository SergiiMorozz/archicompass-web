// Structured output contract for analyzing one designer portfolio project
// (a cluster of images). Deliberately uses free-text style tags rather than
// the client-side style enums (app/api/style-analysis/route.ts,
// lib/professional-options.ts) - reconciling those three divergent
// taxonomies into one shared vocabulary is Phase 2 work, not this phase.
export const designerAnalysisPromptVersion = "v3";

export type DesignerProjectAnalysis = {
  isInteriorProject: boolean;
  irrelevanceReason: string;
  suggestedTitle: string;
  styles: { name: string; confidence: number }[];
  rooms: string[];
  materials: string[];
  colors: string[];
  attributes: {
    minimalism: number;
    warmth: number;
    colorfulness: number;
    ornamentation: number;
    luxury: number;
  };
  summary: string;
};

export const designerAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "isInteriorProject",
    "irrelevanceReason",
    "suggestedTitle",
    "styles",
    "rooms",
    "materials",
    "colors",
    "attributes",
    "summary",
  ],
  properties: {
    isInteriorProject: { type: "boolean" },
    irrelevanceReason: { type: "string" },
    suggestedTitle: { type: "string" },
    styles: {
      type: "array",
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "confidence"],
        properties: {
          name: { type: "string" },
          confidence: { type: "number" },
        },
      },
    },
    rooms: { type: "array", maxItems: 8, items: { type: "string" } },
    materials: { type: "array", maxItems: 8, items: { type: "string" } },
    colors: { type: "array", maxItems: 6, items: { type: "string" } },
    attributes: {
      type: "object",
      additionalProperties: false,
      required: ["minimalism", "warmth", "colorfulness", "ornamentation", "luxury"],
      properties: {
        minimalism: { type: "number" },
        warmth: { type: "number" },
        colorfulness: { type: "number" },
        ornamentation: { type: "number" },
        luxury: { type: "number" },
      },
    },
    summary: { type: "string" },
  },
} as const;

function clamp01(value: unknown) {
  const num = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.min(1, Math.max(0, num));
}

function stringArray(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, max);
}

/** Re-validates a raw parsed AI response into the strict shape, tolerating a malformed model output rather than trusting it blindly. */
export function cleanDesignerAnalysis(raw: unknown): DesignerProjectAnalysis {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawStyles = Array.isArray(record.styles) ? record.styles : [];
  const rawAttributes = record.attributes && typeof record.attributes === "object" ? (record.attributes as Record<string, unknown>) : {};

  return {
    // Default true when the model omits the field - an occasional schema
    // hiccup should not silently hide a legitimate project; human review in
    // the review screen is the backstop either way.
    isInteriorProject: typeof record.isInteriorProject === "boolean" ? record.isInteriorProject : true,
    irrelevanceReason: typeof record.irrelevanceReason === "string" ? record.irrelevanceReason.trim().slice(0, 200) : "",
    suggestedTitle: typeof record.suggestedTitle === "string" ? record.suggestedTitle.trim().slice(0, 120) : "",
    styles: rawStyles
      .filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object")
      .map((entry) => ({
        name: typeof entry.name === "string" ? entry.name.slice(0, 60) : "",
        confidence: clamp01(entry.confidence),
      }))
      .filter((entry) => entry.name.length > 0)
      .slice(0, 5),
    rooms: stringArray(record.rooms, 8),
    materials: stringArray(record.materials, 8),
    colors: stringArray(record.colors, 6),
    attributes: {
      minimalism: clamp01(rawAttributes.minimalism),
      warmth: clamp01(rawAttributes.warmth),
      colorfulness: clamp01(rawAttributes.colorfulness),
      ornamentation: clamp01(rawAttributes.ornamentation),
      luxury: clamp01(rawAttributes.luxury),
    },
    summary: typeof record.summary === "string" ? record.summary.slice(0, 600) : "",
  };
}
