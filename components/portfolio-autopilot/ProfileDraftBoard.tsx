"use client";

import { useState } from "react";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";
import { serviceCapabilities, serviceCapabilityLabel } from "@/lib/service-capabilities";
import { workModes, workModeLabel } from "@/lib/profile-pricing";
import { profileLanguages } from "@/lib/professional-profile-details";

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

function SourceBadge({ label }: { label: string }) {
  return <span className="inline-block rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">{label}</span>;
}

export default function ProfileDraftBoard({
  jobId,
  draft: initialDraft,
  alreadyPublished,
  alreadySet,
}: {
  jobId: string;
  draft: ProfileDraft;
  alreadyPublished: boolean;
  alreadySet: AlreadySet;
}) {
  const copy = getPortfolioAutopilotCopy().profileDraft;
  const [draft, setDraft] = useState(initialDraft);
  const [selectedServices, setSelectedServices] = useState(new Set(initialDraft.suggested_service_capabilities));
  const [selectedLanguages, setSelectedLanguages] = useState(new Set(initialDraft.languages));
  const [selectedWorkModes, setSelectedWorkModes] = useState(new Set(initialDraft.work_modes));
  // Frozen at load time - toggling a checkbox shouldn't relabel it after the
  // fact, and unchecking one shouldn't erase the badge showing how it was
  // originally found.
  const [aiSuggestedServices] = useState(new Set(initialDraft.suggested_service_capabilities));
  const [explicitServices] = useState(new Set(initialDraft.explicit_service_capabilities));
  const [published, setPublished] = useState(alreadyPublished);
  const [publishSummary, setPublishSummary] = useState<{ applied: number; skipped: number } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

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
    { key: "instagram" as const, url: draft.instagram_url, label: "Instagram" },
    { key: "facebook" as const, url: draft.facebook_url, label: "Facebook" },
    { key: "behance" as const, url: draft.behance_url, label: "Behance" },
    { key: "linkedin" as const, url: draft.linkedin_url, label: "LinkedIn" },
  ].filter((social) => social.url);

  if (published) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <p className="text-base font-semibold text-foreground">
          {publishSummary ? copy.publishedSummary(publishSummary.applied, publishSummary.skipped) : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href={localePublicPath(siteLocale, `/studio/portfolio-autopilot/${jobId}/profile-draft/next-steps`)}
            className="inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {copy.nextStepsCta}
          </a>
          <a
            href={localePublicPath(siteLocale, "/account/profile")}
            className="inline-block rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:border-primary"
          >
            {copy.viewProfileEditCta}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6">
      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">{copy.basicInfoTitle}</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-foreground">{copy.fullNameLabel}</label>
              {draft.full_name ? <SourceBadge label={copy.sourceFoundOnSite} /> : null}
            </div>
            <input
              defaultValue={draft.full_name ?? ""}
              onBlur={(event) => {
                setDraft((current) => ({ ...current, full_name: event.target.value }));
                void patchField({ fullName: event.target.value });
              }}
              className={fieldClass}
            />
            {alreadySet.full_name ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-foreground">{copy.locationLabel}</label>
              {draft.location ? <SourceBadge label={copy.sourceFoundOnSite} /> : null}
            </div>
            <input
              defaultValue={draft.location ?? ""}
              onBlur={(event) => {
                setDraft((current) => ({ ...current, location: event.target.value }));
                void patchField({ location: event.target.value });
              }}
              className={fieldClass}
            />
            {alreadySet.location ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-foreground">{copy.emailLabel}</label>
              {draft.email ? <SourceBadge label={copy.sourceFoundOnSite} /> : null}
            </div>
            <input
              defaultValue={draft.email ?? ""}
              onBlur={(event) => {
                setDraft((current) => ({ ...current, email: event.target.value }));
                void patchField({ email: event.target.value });
              }}
              className={fieldClass}
            />
            {alreadySet.email ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold text-foreground">{copy.phoneLabel}</label>
              {draft.phone ? <SourceBadge label={copy.sourceFoundOnSite} /> : null}
            </div>
            <input
              defaultValue={draft.phone ?? ""}
              onBlur={(event) => {
                setDraft((current) => ({ ...current, phone: event.target.value }));
                void patchField({ phone: event.target.value });
              }}
              className={fieldClass}
            />
            {alreadySet.phone ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
          </div>
        </div>

        {socials.length ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">{copy.socialsLabel}</span>
              <SourceBadge label={copy.sourceFoundOnSite} />
            </div>
            <ul className="mt-3 grid gap-1 text-sm text-primary">
              {socials.map((social) => (
                <li key={social.key}>
                  <span className="font-medium text-foreground">{social.label}: </span>
                  <a href={social.url ?? undefined} target="_blank" rel="noreferrer" className="underline">
                    {social.url}
                  </a>
                  {alreadySet[social.key] ? <span className="ml-2 text-xs text-muted">({copy.alreadySetNote})</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {copy.languagesLabel} {draft.languages.length ? <SourceBadge label={copy.sourceFoundOnSite} /> : null}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {profileLanguages.map((language) => (
                <label
                  key={language}
                  className="flex items-center gap-2 rounded-lg border border-line bg-background px-3 py-2 text-xs font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.has(language)}
                    onChange={() => toggleLanguage(language)}
                    className="h-3.5 w-3.5 rounded border-line"
                  />
                  {language}
                </label>
              ))}
            </div>
            {alreadySet.languages ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {copy.workModesLabel} {draft.work_modes.length ? <SourceBadge label={copy.sourceFoundOnSite} /> : null}
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {workModes.map((mode) => (
                <label
                  key={mode}
                  className="flex items-center gap-2 rounded-lg border border-line bg-background px-3 py-2 text-xs font-semibold"
                >
                  <input
                    type="checkbox"
                    checked={selectedWorkModes.has(mode)}
                    onChange={() => toggleWorkMode(mode)}
                    className="h-3.5 w-3.5 rounded border-line"
                  />
                  {workModeLabel(mode)}
                </label>
              ))}
            </div>
            {alreadySet.work_modes ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
          </fieldset>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground">{copy.aboutYouTitle}</h2>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-foreground">{copy.headlineLabel}</label>
            <SourceBadge label={copy.sourceAiSuggestion} />
          </div>
          <input
            defaultValue={draft.headline ?? ""}
            onBlur={(event) => {
              setDraft((current) => ({ ...current, headline: event.target.value }));
              void patchField({ headline: event.target.value });
            }}
            className={fieldClass}
          />
          {alreadySet.headline ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-foreground">{copy.aboutLabel}</label>
            <SourceBadge label={copy.sourceAiSuggestion} />
          </div>
          <textarea
            defaultValue={draft.about ?? ""}
            rows={5}
            onBlur={(event) => {
              setDraft((current) => ({ ...current, about: event.target.value }));
              void patchField({ about: event.target.value });
            }}
            className={fieldClass}
          />
          {alreadySet.about ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-semibold text-foreground">{copy.specialtiesLabel}</label>
            <SourceBadge label={copy.sourceAiSuggestion} />
          </div>
          <input
            defaultValue={draft.specialties.join(", ")}
            onBlur={(event) => {
              const values = event.target.value.split(",").map((v) => v.trim()).filter(Boolean);
              setDraft((current) => ({ ...current, specialties: values }));
              void patchField({ specialties: values });
            }}
            className={fieldClass}
          />
          {alreadySet.specialties ? <p className="mt-1 text-xs text-muted">{copy.alreadySetNote}</p> : null}
        </div>

        <div className="mt-4">
          <span className="text-sm font-semibold text-foreground">{copy.servicesLabel}</span>
          <div className="mt-3 grid gap-2.5">
            {serviceCapabilities.map((capability) => {
              const isExplicit = explicitServices.has(capability);
              const isAiSuggested = aiSuggestedServices.has(capability);
              const evidenceLabel = isExplicit ? copy.servicesFoundOnSite : isAiSuggested ? copy.servicesAiSuggested : copy.servicesConfirmYourself;
              return (
                <div key={capability} className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedServices.has(capability)}
                      onChange={() => toggleService(capability)}
                      className="h-4 w-4 rounded border-line"
                    />
                    <span className="text-foreground">{serviceCapabilityLabel(capability)}</span>
                  </label>
                  <span className={`text-xs ${isExplicit || isAiSuggested ? "font-medium text-primary" : "text-muted"}`}>
                    {evidenceLabel}
                  </span>
                </div>
              );
            })}
          </div>
          {alreadySet.services ? <p className="mt-2 text-xs text-muted">{copy.alreadySetNote}</p> : null}
        </div>
      </section>

      <p className="text-xs text-muted">{copy.editHint}</p>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <button
        onClick={publish}
        disabled={publishing}
        className="justify-self-start rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {publishing ? copy.publishBusy : copy.publishCta}
      </button>
    </div>
  );
}
