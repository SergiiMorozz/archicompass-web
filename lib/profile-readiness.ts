type ProfileReadinessInput = Partial<Record<string, unknown>> | null | undefined;

function hasValue(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return Boolean(value);
}

function eitherValue(first: unknown, second: unknown) {
  return hasValue(first) || hasValue(second) ? "value" : null;
}

export function profileReadinessScore(profile: ProfileReadinessInput, isProfessional: boolean) {
  if (!profile) return 0;

  const fields = isProfessional
    ? [
        profile.full_name,
        profile.location,
        profile.profession_type,
        profile.email,
        profile.bio,
        profile.profile_headline,
        profile.specialties,
        profile.service_capabilities,
        profile.pricing_model,
        eitherValue(profile.price_from, profile.price_to),
        profile.work_modes,
        profile.availability_status,
        profile.years_experience,
      ]
    : [profile.full_name, profile.location, profile.email, profile.phone];

  return Math.round((fields.filter(hasValue).length / fields.length) * 100);
}
