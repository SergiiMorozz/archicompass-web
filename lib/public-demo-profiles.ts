export type DemoProfilePresentation = {
  bestFor: string;
  budgetFit: string;
  projectFit: string;
  profile: {
    bio: string;
    email: null;
    full_name: string;
    hourly_rate: null;
    location: string;
    phone: null;
    profession_type: string;
    specialties: string[];
    website: null;
    years_experience: number;
  };
};

const demoProfiles: Record<string, DemoProfilePresentation> = {};

const demoProjectCopy: Record<
  string,
  Array<{ category: string; description: string; title: string }>
> = {};

export function getDemoProfilePresentation(profileId: string) {
  return demoProfiles[profileId] ?? null;
}

export function applyDemoProfilePresentation<T extends { id: string }>(profile: T): T {
  const demo = getDemoProfilePresentation(profile.id);
  return demo ? ({ ...profile, ...demo.profile } as T) : profile;
}

export function getDemoProjectPresentation(profileId: string, seed: string) {
  const options = demoProjectCopy[profileId];
  if (!options?.length) return null;
  const index = seed.split("").reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return options[index % options.length];
}
