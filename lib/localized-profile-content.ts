import { siteLocale, type SiteLocale } from "@/lib/site-locale";

export type LocalizedProfileContent = {
  profile_headline?: string | null;
  profile_headline_pl?: string | null;
  profile_headline_en?: string | null;
  bio?: string | null;
  bio_pl?: string | null;
  bio_en?: string | null;
  cooperation_terms?: string | null;
  cooperation_terms_pl?: string | null;
  cooperation_terms_en?: string | null;
};

type LocalizedField = "profile_headline" | "bio" | "cooperation_terms";

function clean(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized || null;
}

export function localizedProfileText(
  profile: LocalizedProfileContent,
  field: LocalizedField,
  locale: SiteLocale = siteLocale
) {
  const polish = clean(profile[`${field}_pl`]);
  const english = clean(profile[`${field}_en`]);
  const legacy = clean(profile[field]);

  return locale === "en"
    ? english || polish || legacy
    : polish || english || legacy;
}

export function localizeProfileContent<T extends LocalizedProfileContent>(
  profile: T,
  locale: SiteLocale = siteLocale
): T {
  return {
    ...profile,
    profile_headline: localizedProfileText(profile, "profile_headline", locale),
    bio: localizedProfileText(profile, "bio", locale),
    cooperation_terms: localizedProfileText(profile, "cooperation_terms", locale),
  };
}
