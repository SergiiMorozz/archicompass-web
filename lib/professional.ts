export type ProfessionalProfile = {
  profession_type?: string | null;
  user_type?: string | null;
};

export function isProfessionalProfile(profile: ProfessionalProfile | null | undefined) {
  return profile?.user_type === "professional" || Boolean(profile?.profession_type?.trim());
}
