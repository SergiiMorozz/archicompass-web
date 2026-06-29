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

const demoProfiles: Record<string, DemoProfilePresentation> = {
  "bfd0b136-8bf6-4d49-be53-ef2a6dce7030": {
    bestFor: "Japandi and warm-minimal apartments",
    budgetFit: "Concept and full-room packages",
    projectFit: "Apartments, living spaces, and calm material palettes",
    profile: {
      bio: "Example beta profile focused on calm Japandi interiors, natural materials, and practical apartment layouts.",
      email: null,
      full_name: "Studio Japandi Warsaw",
      hourly_rate: null,
      location: "Warsaw / Remote",
      phone: null,
      profession_type: "Interior design studio",
      specialties: ["Japandi", "Warm minimalism", "Apartment interiors"],
      website: null,
      years_experience: 6,
    },
  },
  "82402c3b-5896-4844-acff-d2eaf3e88ab2": {
    bestFor: "Modern small apartments",
    budgetFit: "Focused concept and layout packages",
    projectFit: "Compact homes, storage planning, and flexible rooms",
    profile: {
      bio: "Example beta profile for small apartments, modern layouts, and space-saving interior concepts.",
      email: null,
      full_name: "Compact Living Studio",
      hourly_rate: null,
      location: "Krakow / Remote",
      phone: null,
      profession_type: "Interior designer",
      specialties: ["Small apartments", "Modern", "Space planning"],
      website: null,
      years_experience: 5,
    },
  },
};

const demoProjectCopy: Record<
  string,
  Array<{ category: string; description: string; title: string }>
> = {
  "bfd0b136-8bf6-4d49-be53-ef2a6dce7030": [
    {
      category: "Apartment concept",
      description:
        "Example portfolio concept combining warm oak, soft neutrals, and a calm Japandi living area.",
      title: "Warm Japandi Living Room",
    },
    {
      category: "Residential concept",
      description:
        "Example material and layout direction for a quiet, light-filled apartment interior.",
      title: "Natural Oak Apartment",
    },
  ],
  "82402c3b-5896-4844-acff-d2eaf3e88ab2": [
    {
      category: "Small apartment",
      description:
        "Example compact-home concept with flexible zoning, integrated storage, and a light modern palette.",
      title: "Compact Apartment Layout",
    },
    {
      category: "Space planning",
      description:
        "Example plan for making one small room work as a living, dining, and occasional work space.",
      title: "Flexible Studio Interior",
    },
  ],
};

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
