import type { SupabaseServerClient } from "./job-access";
import type { ProfileDraft } from "@/components/portfolio-autopilot/ProfileDraftBoard";

const liveProfileSelect =
  "full_name, location, phone, email, languages, work_modes, profile_headline_pl, profile_headline_en, profile_headline, bio_pl, bio_en, bio, custom_specialties_pl, custom_specialties_en, specialties, service_capabilities, instagram_url, facebook_url, behance_url, linkedin_url";

export type ExistingProfileValues = {
  full_name: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  languages: string[] | null;
  work_modes: string[] | null;
  profile_headline_pl: string | null;
  profile_headline_en: string | null;
  profile_headline: string | null;
  bio_pl: string | null;
  bio_en: string | null;
  bio: string | null;
  custom_specialties_pl: string[] | null;
  custom_specialties_en: string[] | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  instagram_url: string | null;
  facebook_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
};

/** Shared by the unified review page and the legacy standalone profile-draft page so their "already set" logic can't drift apart. */
export async function loadProfileDraftViewData(supabase: SupabaseServerClient, jobId: string, userId: string) {
  const [{ data: draft }, { data: liveProfile }] = await Promise.all([
    supabase.from("portfolio_profile_drafts").select("*").eq("job_id", jobId).maybeSingle(),
    supabase.from("profiles").select(liveProfileSelect).eq("id", userId).maybeSingle(),
  ]);

  const alreadySet = {
    full_name: Boolean(liveProfile?.full_name),
    location: Boolean(liveProfile?.location),
    phone: Boolean(liveProfile?.phone),
    email: Boolean(liveProfile?.email),
    languages: Boolean(liveProfile?.languages?.length),
    work_modes: Boolean(liveProfile?.work_modes?.length),
    headline: Boolean(liveProfile?.profile_headline_pl || liveProfile?.profile_headline_en || liveProfile?.profile_headline),
    about: Boolean(liveProfile?.bio_pl || liveProfile?.bio_en || liveProfile?.bio),
    specialties: Boolean(
      liveProfile?.custom_specialties_pl?.length || liveProfile?.custom_specialties_en?.length || liveProfile?.specialties?.length
    ),
    services: Boolean(liveProfile?.service_capabilities?.length),
    instagram: Boolean(liveProfile?.instagram_url),
    facebook: Boolean(liveProfile?.facebook_url),
    behance: Boolean(liveProfile?.behance_url),
    linkedin: Boolean(liveProfile?.linkedin_url),
  };

  return {
    draft: draft as ProfileDraft | null,
    draftStatus: draft?.status as string | undefined,
    alreadySet,
    liveProfile: liveProfile as ExistingProfileValues | null,
  };
}
