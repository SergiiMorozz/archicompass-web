// Structured output for asking the AI to re-split one large, low-confidence
// page cluster (e.g. a flat WordPress lightbox gallery with 25 unrelated
// photos and no links/captions to structurally separate them) into groups
// that look like the same physical space. This is a deliberately narrow,
// bounded use of vision reasoning as a fallback signal - it only runs for
// clusters that already failed the cheap structural signals, and its output
// is still just a suggestion surfaced with medium confidence, not treated as
// ground truth.
export const subclusterPromptVersion = "v2";

// A room-level fragment (1-2 photos) is not a credible standalone project on
// its own - it almost always means the model split by room instead of by
// project. Groups smaller than this get folded back into a larger sibling
// rather than becoming their own portfolio_project.
export const minSubclusterGroupSize = 3;

export type SubclusterGroup = { label: string; imageIndexes: number[] };
export type SubclusterResult = { groups: SubclusterGroup[] };

export const subclusterSchema = {
  type: "object",
  additionalProperties: false,
  required: ["groups"],
  properties: {
    groups: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "imageIndexes"],
        properties: {
          label: { type: "string" },
          imageIndexes: { type: "array", maxItems: 30, items: { type: "number" } },
        },
      },
    },
  },
} as const;

/**
 * Validates raw model output into a partition of [0, totalImages): every
 * index appears in at most one group, out-of-range/duplicate indexes are
 * dropped, empty groups are dropped, and any group smaller than
 * minSubclusterGroupSize is merged into the largest remaining group instead
 * of standing alone (a project boundary shouldn't come down to 1-2 photos).
 */
export function cleanSubclusterResult(raw: unknown, totalImages: number): SubclusterResult {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const rawGroups = Array.isArray(record.groups) ? record.groups : [];
  const seen = new Set<number>();
  const groups: SubclusterGroup[] = [];

  for (const entry of rawGroups) {
    if (!entry || typeof entry !== "object") continue;
    const record2 = entry as Record<string, unknown>;
    const label = typeof record2.label === "string" ? record2.label.trim().slice(0, 120) : "";
    const rawIndexes = Array.isArray(record2.imageIndexes) ? record2.imageIndexes : [];
    const indexes = rawIndexes
      .filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value < totalImages)
      .filter((index) => {
        if (seen.has(index)) return false;
        seen.add(index);
        return true;
      });
    if (indexes.length && label) groups.push({ label, imageIndexes: indexes });
  }

  if (groups.length <= 1) return { groups };

  const bySize = [...groups].sort((a, b) => b.imageIndexes.length - a.imageIndexes.length);
  const kept = bySize.filter((group) => group.imageIndexes.length >= minSubclusterGroupSize);
  const tooSmall = bySize.filter((group) => group.imageIndexes.length < minSubclusterGroupSize);
  if (!kept.length) return { groups: [{ label: groups[0].label, imageIndexes: groups.flatMap((g) => g.imageIndexes) }] };
  for (const small of tooSmall) kept[0].imageIndexes.push(...small.imageIndexes);

  return { groups: kept };
}
