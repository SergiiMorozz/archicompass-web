"use client";

import { useState } from "react";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";
import { serviceCapabilities, serviceCapabilityLabel } from "@/lib/service-capabilities";
import { workModes, workModeLabel } from "@/lib/profile-pricing";
import { profileLanguages } from "@/lib/professional-profile-details";
import type { ExistingProfileValues } from "@/lib/portfolio-ingestion/profile-draft-view";

export type ProfileDraft = {
  headline: string | null;
  about: string | null;
  specialties: string[];
  suggested_service_capabilities: string[];
  explicit_service_capabilities: string[];
  instagram_url: string | null;
  facebook_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
  full_name: string | null;
  location: string | null;
  phone: string | null;
  email: string | null;
  languages: string[];
  work_modes: string[];
};

type AlreadySet = {
  headline: boolean;
  about: boolean;
  specialties: boolean;
  services: boolean;
  instagram: boolean;
  facebook: boolean;
  behance: boolean;
  linkedin: boolean;
  full_name: boolean;
  location: boolean;
  phone: boolean;
  email: boolean;
  languages: boolean;
  work_modes: boolean;
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const savedFieldClass = `${fieldClass} cursor-not-allowed border-slate-200 bg-slate-50 text-slate-600 focus:border-slate-200`;
const aiSuggestedFieldClass = `${fieldClass} border-primary/25 bg-primary-soft/20`;

function SourceBadge({ label, kind = "site" }: { label: string; kind?: "saved" | "ai" | "site" }) {
  const styles =
    kind === "saved"
      ? "border-slate-200 bg-slate-100 text-slate-600"
      : kind === "ai"
        ? "border-primary/20 bg-primary-soft text-primary"
        : "border-accent/20 bg-accent-soft text-accent";
  const marker = kind === "saved" ? "R" : kind === "ai" ? "AI" : "S";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}>
      <span aria-hidden className="inline-flex h-3.5 min-w-3.5 items-center justify-center rounded-sm border border-current/25 text-[8px] font-bold leading-none">
        {marker}
      </span>
      {label}
    </span>
  );
}

function savedLocalizedValue(profile: ExistingProfileValues | null, polish: keyof ExistingProfileValues, english: keyof ExistingProfileValues, legacy: keyof ExistingProfileValues) {
  const pl = profile?.[polish];
  const en = profile?.[english];
  const fallback = profile?.[legacy];
  return (siteLocale === "en" ? en || pl || fallback : pl || en || fallback) as string | null | undefined;
}

export default function ProfileDraftBoard({
  jobId,
  draft: initialDraft,
  alreadyPublished,
  alreadySet,
  liveProfile,
}: {
  jobId: string;
  draft: ProfileDraft;
  alreadyPublished: boolean;
  alreadySet: AlreadySet;
  liveProfile: ExistingProfileValues | null;
}) {
  const copy = getPortfolioAutopilotCopy().profileDraft;
  const [draft, setDraft] = useState(initialDraft);
  const [selectedServices, setSelectedServices] = useState(
    new Set(alreadySet.services ? liveProfile?.service_capabilities ?? [] : initialDraft.suggested_service_capabilities)
  );
  const [selectedLanguages, setSelectedLanguages] = useState(
    new Set(alreadySet.languages ? liveProfile?.languages ?? [] : initialDraft.languages)
  );
  const [selectedWorkModes, setSelectedWorkModes] = useState(
    new Set(alreadySet.work_modes ? liveProfile?.work_modes ?? [] : initialDraft.work_modes)
  );
  const [aiSuggestedServices] = useState(new Set(initialDraft.suggested_service_capabilities));
  const [explicitServices] = useState(new Set(initialDraft.explicit_service_capabilities));
  const [published, setPublished] = useState(alreadyPublished);
  const [publishSummary, setPublishSummary] = useState<{ applied: number; skipped: number } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const savedHeadline = savedLocalizedValue(liveProfile, "profile_headline_pl", "profile_headline_en", "profile_headline") ?? "";
  const savedAbout = savedLocalizedValue(liveProfile, "bio_pl", "bio_en", "bio") ?? "";
  const savedSpecialties =
    (siteLocale === "en" ? liveProfile?.custom_specialties_en : liveProfile?.custom_specialties_pl)?.length
      ? (siteLocale === "en" ? liveProfile?.custom_specialties_en : liveProfile?.custom_specialties_pl) ?? []
      : liveProfile?.custom_specialties_pl?.length
        ? liveProfile.custom_specialties_pl
        : liveProfile?.custom_specialties_en?.length
          ? liveProfile.custom_specialties_en
          : liveProfile?.specialties ?? [];
  const hasSavedValues = Object.values(alreadySet).some(Boolean);

  async function patchField(patch: Record<string, unknown>) {
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/profile-draft`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!response.ok) throw new Error(copy.saveFailed);
      setError("");
      return true;
    } catch {
      setError(copy.saveFailed);
      return false;
    }
  }

  async function toggleService(capability: string) {
    const previous = selectedServices;
    const next = new Set(selectedServices);
    if (next.has(capability)) next.delete(capability);
    else next.add(capability);
    setSelectedServices(next);
    if (!(await patchField({ suggestedServiceCapabilities: Array.from(next) }))) setSelectedServices(previous);
  }

  async function toggleLanguage(language: string) {
    const previous = selectedLanguages;
    const next = new Set(selectedLanguages);
    if (next.has(language)) next.delete(language);
    else next.add(language);
    setSelectedLanguages(next);
    if (!(await patchField({ languages: Array.from(next) }))) setSelectedLanguages(previous);
  }

  async function toggleWorkMode(mode: string) {
    const previous = selectedWorkModes;
    const next = new Set(selectedWorkModes);
    if (next.has(mode)) next.delete(mode);
    else next.add(mode);
    setSelectedWorkModes(next);
    if (!(await patchField({ workModes: Array.from(next) }))) setSelectedWorkModes(previous);
  }

  async function publish() {
    setError("");
    setPublishing(true);
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/profile-draft/publish`), {
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as { applied?: string[]; skipped?: string[] };
      if (!response.ok) throw new Error(copy.publishFailed);
      setPublishSummary({ applied: result.applied?.length ?? 0, skipped: result.skipped?.length ?? 0 });
      setPublished(true);
    } catch {
      setError(copy.publishFailed);
    } finally {
      setPublishing(false);
    }
  }

  const socials = [
    { key: "instagram" as const, url: alreadySet.instagram ? liveProfile?.instagram_url : draft.instagram_url, label: "Instagram" },
    { key: "facebook" as const, url: alreadySet.facebook ? liveProfile?.facebook_url : draft.facebook_url, label: "Facebook" },
    { key: "behance" as const, url: alreadySet.behance ? liveProfile?.behance_url : draft.behance_url, label: "Behance" },
    { key: "linkedin" as const, url: alreadySet.linkedin ? liveProfile?.linkedin_url : draft.linkedin_url, label: "LinkedIn" },
  ].filter((social) => social.url);

  if (published) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <p className="text-base font-semibold text-foreground">
          {publishSummary ? copy.publishedSummary(publishSummary.applied, publishSummary.skipped) : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={localePublicPath(siteLocale, `/studio/portfolio-assistant/${jobId}/profile-draft/next-steps`)} className="inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
            {copy.nextStepsCta}
          </a>
          <a href={localePublicPath(siteLocale, "/account/profile")} className="inline-block rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:border-primary">
            {copy.viewProfileEditCta}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6">
      {hasSavedValues ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <SourceBadge label={copy.savedInProfileBadge} kind="saved" />
          <p>
            {copy.existingProfileHint}{" "}
            <a href={localePublicPath(siteLocale, "/account/profile")} className="font-semibold text-primary underline">
              {copy.viewProfileEditCta}
            </a>
          </p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">{copy.basicInfoTitle}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {[
            { key: "full_name" as const, label: copy.fullNameLabel, draftKey: "full_name" as const, patchKey: "fullName", saved: liveProfile?.full_name ?? "" },
            { key: "location" as const, label: copy.locationLabel, draftKey: "location" as const, patchKey: "location", saved: liveProfile?.location ?? "" },
            { key: "email" as const, label: copy.emailLabel, draftKey: "email" as const, patchKey: "email", saved: liveProfile?.email ?? "" },
            { key: "phone" as const, label: copy.phoneLabel, draftKey: "phone" as const, patchKey: "phone", saved: liveProfile?.phone ?? "" },
          ].map((field) => (
            <div key={field.key}>
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-foreground">{field.label}</label>
                <SourceBadge
                  label={alreadySet[field.key] ? copy.savedInProfileBadge : copy.sourceFoundOnSite}
                  kind={alreadySet[field.key] ? "saved" : "site"}
                />
              </div>
              {alreadySet[field.key] ? (
                <input value={field.saved} readOnly className={savedFieldClass} />
              ) : (
                <input
                  defaultValue={draft[field.draftKey] ?? ""}
                  onBlur={(event) => {
                    setDraft((current) => ({ ...current, [field.draftKey]: event.target.value }));
                    void patchField({ [field.patchKey]: event.target.value });
                  }}
                  className={fieldClass}
                />
              )}
            </div>
          ))}
        </div>

        {socials.length ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">{copy.socialsLabel}</span>
              <SourceBadge
                label={socials.some((social) => alreadySet[social.key]) ? copy.savedInProfileBadge : copy.sourceFoundOnSite}
                kind={socials.some((social) => alreadySet[social.key]) ? "saved" : "site"}
              />
            </div>
            <ul className="mt-3 grid gap-1 text-sm text-primary">
              {socials.map((social) => (
                <li key={social.key}>
                  <span className="font-medium text-foreground">{social.label}: </span>
                  <a href={social.url ?? undefined} target="_blank" rel="noreferrer" className="underline">
                    {social.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {copy.languagesLabel}{" "}
              <SourceBadge label={alreadySet.languages ? copy.savedInProfileBadge : copy.sourceFoundOnSite} kind={alreadySet.languages ? "saved" : "site"} />
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileLanguages.map((language) => (
                <label key={language} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${alreadySet.languages ? "border-slate-200 bg-slate-50 text-slate-600" : "border-line bg-background"}`}>
                  <input type="checkbox" checked={selectedLanguages.has(language)} disabled={alreadySet.languages} onChange={() => toggleLanguage(language)} className="h-3.5 w-3.5 rounded border-line" />
                  {language}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-semibold text-foreground">
              {copy.workModesLabel}{" "}
              <SourceBadge label={alreadySet.work_modes ? copy.savedInProfileBadge : copy.sourceFoundOnSite} kind={alreadySet.work_modes ? "saved" : "site"} />
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {workModes.map((mode) => (
                <label key={mode} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${alreadySet.work_modes ? "border-slate-200 bg-slate-50 text-slate-600" : "border-line bg-background"}`}>
                  <input type="checkbox" checked={selectedWorkModes.has(mode)} disabled={alreadySet.work_modes} onChange={() => toggleWorkMode(mode)} className="h-3.5 w-3.5 rounded border-line" />
                  {workModeLabel(mode)}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">{copy.aboutYouTitle}</h2>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-foreground">{copy.headlineLabel}</label>
            <SourceBadge label={alreadySet.headline ? copy.savedInProfileBadge : copy.sourceAiSuggestion} kind={alreadySet.headline ? "saved" : "ai"} />
          </div>
          {alreadySet.headline ? (
            <input value={savedHeadline} readOnly className={savedFieldClass} />
          ) : (
            <input defaultValue={draft.headline ?? ""} onBlur={(event) => { setDraft((current) => ({ ...current, headline: event.target.value })); void patchField({ headline: event.target.value }); }} className={aiSuggestedFieldClass} />
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-foreground">{copy.aboutLabel}</label>
            <SourceBadge label={alreadySet.about ? copy.savedInProfileBadge : copy.sourceAiSuggestion} kind={alreadySet.about ? "saved" : "ai"} />
          </div>
          {alreadySet.about ? (
            <textarea value={savedAbout} readOnly rows={5} className={savedFieldClass} />
          ) : (
            <textarea defaultValue={draft.about ?? ""} rows={5} onBlur={(event) => { setDraft((current) => ({ ...current, about: event.target.value })); void patchField({ about: event.target.value }); }} className={aiSuggestedFieldClass} />
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-foreground">{copy.specialtiesLabel}</label>
            <SourceBadge label={alreadySet.specialties ? copy.savedInProfileBadge : copy.sourceAiSuggestion} kind={alreadySet.specialties ? "saved" : "ai"} />
          </div>
          {alreadySet.specialties ? (
            <input value={savedSpecialties.join(", ")} readOnly className={savedFieldClass} />
          ) : (
            <input defaultValue={draft.specialties.join(", ")} onBlur={(event) => { const values = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); setDraft((current) => ({ ...current, specialties: values })); void patchField({ specialties: values }); }} className={aiSuggestedFieldClass} />
          )}
        </div>

        <div className="mt-4">
          <span className="text-sm font-semibold text-foreground">{copy.servicesLabel}</span>
          <div className="mt-3 grid gap-2.5">
            {serviceCapabilities.map((capability) => {
              const isExplicit = explicitServices.has(capability);
              const isAiSuggested = aiSuggestedServices.has(capability);
              const evidenceLabel = alreadySet.services ? copy.savedInProfileBadge : isExplicit ? copy.servicesFoundOnSite : isAiSuggested ? copy.servicesAiSuggested : copy.servicesConfirmYourself;
              return (
                <div key={capability} className="flex items-center justify-between gap-3">
                  <label className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm ${alreadySet.services ? "bg-slate-50 text-slate-600" : ""}`}>
                    <input type="checkbox" checked={selectedServices.has(capability)} disabled={alreadySet.services} onChange={() => toggleService(capability)} className="h-4 w-4 rounded border-line" />
                    <span className="text-foreground">{serviceCapabilityLabel(capability)}</span>
                  </label>
                  <span className={`text-xs ${alreadySet.services || isExplicit || isAiSuggested ? "font-medium text-primary" : "text-muted"}`}>{evidenceLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <p className="text-xs text-muted">{copy.editHint}</p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button onClick={publish} disabled={publishing} className="justify-self-start rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60">
        {publishing ? copy.publishBusy : copy.publishCta}
      </button>
    </div>
  );
}
