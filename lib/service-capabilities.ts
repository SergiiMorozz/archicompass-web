export const serviceCapabilities = [
  "3D visualization",
  "Site consultations",
  "Author's supervision",
  "Full project coordination",
  "Technical documentation",
  "Sourcing and procurement",
] as const;

export function serviceCapabilityValues(formData: FormData) {
  const allowed = new Set<string>(serviceCapabilities);
  return formData
    .getAll("service_capabilities")
    .filter((value): value is string => typeof value === "string" && allowed.has(value));
}

export function requiredServiceCapabilities(
  visualizationNeed: string,
  supervisionNeed: string
) {
  const required: string[] = [];

  if (visualizationNeed === "Selected rooms" || visualizationNeed === "Full project") {
    required.push("3D visualization");
  }

  if (supervisionNeed === "Consultations / site visits") {
    required.push("Site consultations");
  } else if (supervisionNeed === "Author's supervision") {
    required.push("Author's supervision");
  } else if (supervisionNeed === "Full project coordination") {
    required.push("Full project coordination");
  }

  return required;
}
