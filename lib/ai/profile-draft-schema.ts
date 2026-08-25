// Structured output for drafting text/identity public-profile fields from a
// designer's aggregated portfolio DNA. This never touches commercial fields
// (pricing, budget, availability) - those cannot be reliably inferred and
// must always come from the designer directly.
export const profileDraftPromptVersion = "v2";

// Of the app's service_capabilities vocabulary, only these are things a
// finished-space photo can actually show evidence of. "Author's
// supervision", "Full project coordination" and "Sourcing and procurement"
// are workflow/process facts, not visual ones - the model should never
// suggest them, no matter how the portfolio looks. Callers pass this list
// (not the full vocabulary) as `allowedServiceCapabilities` so the schema
// physically cannot return anything else.
export function visuallyInferableServiceCapabilities(allServiceCapabilities: readonly string[]) {
  const inferable = new Set(["3D visualization", "Technical documentation"]);
  return allServiceCapabilities.filter((capability) => inferable.has(capability));
}

export type ProfileDraftSuggestion = {
  headline: string;
  about: string;
  specialties: string[];
  suggestedServiceCapabilities: string[];
};

export function profileDraftSchema(allowedServiceCapabilities: readonly string[]) {
  return {
    type: "object",
    additionalProperties: false,
    required: ["headline", "about", "specialties", "suggestedServiceCapabilities"],
    properties: {
      headline: { type: "string" },
      about: { type: "string" },
      specialties: { type: "array", maxItems: 6, items: { type: "string" } },
      suggestedServiceCapabilities: {
        type: "array",
        maxItems: allowedServiceCapabilities.length,
        items: { type: "string", enum: allowedServiceCapabilities as unknown as string[] },
      },
    },
  } as const;
}

function stringArray(value: unknown, max: number) {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).slice(0, max);
}

export function cleanProfileDraft(raw: unknown, allowedServiceCapabilities: readonly string[]): ProfileDraftSuggestion {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const allowed = new Set(allowedServiceCapabilities);
  return {
    headline: typeof record.headline === "string" ? record.headline.trim().slice(0, 140) : "",
    about: typeof record.about === "string" ? record.about.trim().slice(0, 1200) : "",
    specialties: stringArray(record.specialties, 6),
    suggestedServiceCapabilities: stringArray(record.suggestedServiceCapabilities, allowedServiceCapabilities.length).filter((value) =>
      allowed.has(value)
    ),
  };
}
