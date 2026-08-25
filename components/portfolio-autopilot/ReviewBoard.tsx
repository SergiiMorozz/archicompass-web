"use client";

import { useMemo, useState } from "react";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";
import type { DesignerIntelligenceProfile } from "@/lib/portfolio-ingestion/aggregate-profile";

export type ReviewAsset = {
  id: string;
  url: string | null;
  selected: boolean;
  clusterProjectId: string | null;
  altText: string | null;
};

export type ReviewProject = {
  id: string;
  suggestedTitle: string | null;
  originalTitle: string | null;
  aiTitle: string | null;
  objectType: string | null;
  areaM2: number | null;
  location: string | null;
  projectStage: string | null;
  originalDescription: string | null;
  customSummary: string | null;
  confidence: number | null;
  roomTypes: string[];
  status: "pending_review" | "kept" | "hidden" | "published";
  isFeatured: boolean;
  coverAssetId: string | null;
  analysis: {
    isInteriorProject: boolean;
    irrelevanceReason: string;
    styles: { name: string; confidence: number }[];
    rooms: string[];
    materials: string[];
    colors: string[];
    summary: string;
  } | null;
};

const attributeKeys = ["minimalism", "warmth", "colorfulness", "ornamentation", "luxury"] as const;
const collapsedThumbnailCount = 4;

function attributeBar(label: string, value: number, key: string) {
  return (
    <div key={key} className="mt-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-muted">{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
        <div className="h-full bg-primary" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}

function tagList(items: string[]) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span key={item} className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ReviewBoard({
  jobId,
  userId,
  alreadyPublished,
  assets: initialAssets,
  projects: initialProjects,
  profile,
}: {
  jobId: string;
  userId: string;
  alreadyPublished: boolean;
  assets: ReviewAsset[];
  projects: ReviewProject[];
  profile: DesignerIntelligenceProfile | null;
}) {
  const copy = getPortfolioAutopilotCopy().review;
  const [assets, setAssets] = useState(initialAssets);
  const [projects, setProjects] = useState(initialProjects);
  const [published, setPublished] = useState(alreadyPublished);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [savingTitle, setSavingTitle] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [tagDrafts, setTagDrafts] = useState<Record<string, string>>({});
  const [uploadingProjectId, setUploadingProjectId] = useState<string | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<Record<string, string>>({});

  const assetsByProject = useMemo(() => {
    const map = new Map<string, ReviewAsset[]>();
    for (const asset of assets) {
      if (!asset.clusterProjectId) continue;
      const bucket = map.get(asset.clusterProjectId) ?? [];
      bucket.push(asset);
      map.set(asset.clusterProjectId, bucket);
    }
    return map;
  }, [assets]);

  async function patchProject(projectId: string, patch: Record<string, unknown>) {
    const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/review`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "project", projectId, ...patch }),
    });
    if (!response.ok) throw new Error(copy.saveFailed);
  }

  function updateProjectLocal(projectId: string, patch: Partial<ReviewProject>) {
    setProjects((current) => current.map((project) => (project.id === projectId ? { ...project, ...patch } : project)));
  }

  async function persistProject(project: ReviewProject, patch: Partial<ReviewProject>) {
    setError("");
    updateProjectLocal(project.id, patch);
    try {
      await patchProject(project.id, patch);
    } catch {
      setProjects((current) => current.map((item) => (item.id === project.id ? project : item)));
      setError(copy.saveFailed);
    }
  }

  async function toggleKeep(project: ReviewProject) {
    const nextStatus = project.status === "kept" ? "pending_review" : "kept";
    await persistProject(project, { status: nextStatus });
  }

  async function toggleHide(project: ReviewProject) {
    const nextStatus = project.status === "hidden" ? "pending_review" : "hidden";
    await persistProject(project, { status: nextStatus });
  }

  async function toggleFeatured(project: ReviewProject) {
    const next = !project.isFeatured;
    await persistProject(project, { isFeatured: next });
  }

  async function saveTitle(project: ReviewProject, title: string) {
    setSavingTitle(project.id);
    try {
      await persistProject(project, { suggestedTitle: title });
    } finally {
      setSavingTitle(null);
    }
  }

  async function saveSummary(project: ReviewProject, customSummary: string) {
    await persistProject(project, { customSummary });
  }

  async function addTag(project: ReviewProject, rawTag: string) {
    const tag = rawTag.trim();
    if (!tag) return;
    if (project.roomTypes.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setTagDrafts((current) => ({ ...current, [project.id]: "" }));
      return;
    }
    const nextTags = [...project.roomTypes, tag];
    setTagDrafts((current) => ({ ...current, [project.id]: "" }));
    await persistProject(project, { roomTypes: nextTags });
  }

  async function removeTag(project: ReviewProject, tag: string) {
    const nextTags = project.roomTypes.filter((existing) => existing !== tag);
    await persistProject(project, { roomTypes: nextTags });
  }

  async function deleteAsset(asset: ReviewAsset) {
    setDeletingAssetId(asset.id);
    try {
      const response = await fetch(
        localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/review?assetId=${asset.id}`),
        { method: "DELETE" }
      );
      if (!response.ok) throw new Error();
      setAssets((current) => current.filter((item) => item.id !== asset.id));
    } catch {
      if (asset.clusterProjectId) {
        setPhotoError((current) => ({ ...current, [asset.clusterProjectId as string]: copy.deletePhotoError }));
      }
    } finally {
      setDeletingAssetId(null);
    }
  }

  async function uploadPhoto(project: ReviewProject, file: File) {
    setUploadingProjectId(project.id);
    setPhotoError((current) => ({ ...current, [project.id]: "" }));
    try {
      const formData = new FormData();
      formData.append("projectId", project.id);
      formData.append("file", file);
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/review`), {
        method: "POST",
        body: formData,
      });
      const result = (await response.json().catch(() => ({}))) as { asset?: ReviewAsset };
      if (!response.ok || !result.asset) throw new Error(copy.addPhotoError);
      setAssets((current) => [...current, result.asset as ReviewAsset]);
    } catch {
      setPhotoError((current) => ({
        ...current,
        [project.id]: copy.addPhotoError,
      }));
    } finally {
      setUploadingProjectId(null);
    }
  }

  async function toggleAsset(asset: ReviewAsset) {
    const nextSelected = !asset.selected;
    setAssets((current) => current.map((item) => (item.id === asset.id ? { ...item, selected: nextSelected } : item)));
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/review`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "asset", assetId: asset.id, selected: nextSelected }),
      });
      if (!response.ok) throw new Error(copy.saveFailed);
    } catch {
      setAssets((current) => current.map((item) => (item.id === asset.id ? asset : item)));
      setError(copy.saveFailed);
    }
  }

  function toggleExpanded(projectId: string) {
    setExpandedProjects((current) => {
      const next = new Set(current);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }

  async function publish() {
    setError("");
    if (!projects.some((project) => project.status === "kept")) {
      setError(copy.noKeptProjects);
      return;
    }
    setPublishing(true);
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/publish`), {
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as { allPublished?: boolean };
      if (!response.ok) throw new Error(copy.publishFailed);
      if (result.allPublished) setPublished(true);
      else setError(copy.publishFailed);
    } catch {
      setError(copy.publishFailed);
    } finally {
      setPublishing(false);
    }
  }

  if (published) {
    return (
      <div className="mt-10 rounded-2xl border border-line bg-card p-10 text-center">
        <h2 className="text-2xl font-bold text-foreground">{copy.publishedTitle}</h2>
        <p className="mt-2 text-base text-muted">{copy.publishedBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href={localePublicPath(siteLocale, `/designers/${userId}`)}
            className="inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            {copy.viewProfileCta}
          </a>
        </div>
      </div>
    );
  }

  const [leadStyle, ...otherStyles] = profile
    ? [...profile.dominant_styles, ...profile.secondary_styles]
    : [];

  return (
    <div className="mt-8 grid gap-8">
      {profile && leadStyle ? (
        <section className="rounded-2xl border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground">{copy.dna.title}</h2>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-bold text-foreground">{leadStyle.name}</span>
            <span className="text-sm text-muted">— {copy.dna.primaryStyleLabel}</span>
          </div>
          {otherStyles.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {otherStyles.slice(0, 4).map((style) => (
                <span key={style.name} className="rounded-full border border-line px-2.5 py-1 text-xs font-medium text-foreground">
                  {style.name} · {copy.dna.secondaryStyleLabel}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              {profile.attributes && attributeKeys.some((key) => profile.attributes[key] > 0) ? (
                <div>
                  {attributeKeys.map((key) => attributeBar(copy.dna.attributeLabels[key], profile.attributes[key], key))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-3">
              {profile.materials.length ? (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{copy.dna.materialsLabel}</p>
                  {tagList(profile.materials.slice(0, 8))}
                </div>
              ) : null}
              {profile.colors.length ? (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{copy.dna.colorsLabel}</p>
                  {tagList(profile.colors.slice(0, 6))}
                </div>
              ) : null}
              {profile.room_experience.length ? (
                <div>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{copy.dna.roomsLabel}</p>
                  {tagList(profile.room_experience.slice(0, 8))}
                </div>
              ) : null}
            </div>
          </div>

          {profile.project_count > 0 ? (
            <p className="mt-4 text-xs text-muted">{copy.dna.evidenceLabel(profile.project_count)}</p>
          ) : null}
        </section>
      ) : profile === null ? (
        <p className="text-sm text-muted">{copy.dna.empty}</p>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-foreground">{copy.portfolioTitle}</h2>
        <div className="mt-4 grid gap-6">
          {projects.map((project) => {
            const projectAssets = assetsByProject.get(project.id) ?? [];
            const coverAsset =
              projectAssets.find((asset) => asset.id === project.coverAssetId && asset.url) ??
              projectAssets.find((asset) => asset.selected && asset.url) ??
              projectAssets.find((asset) => asset.url);
            const otherAssets = projectAssets.filter((asset) => asset.id !== coverAsset?.id);
            const expanded = expandedProjects.has(project.id);
            const visibleOtherAssets = expanded ? otherAssets : otherAssets.slice(0, collapsedThumbnailCount);
            const hiddenCount = otherAssets.length - visibleOtherAssets.length;
            // The stored confidence reflects how many photos clustering found
            // at grouping time - it doesn't update if photos are deleted
            // afterward, so a project's live photo count always caps how
            // confident the label is allowed to claim to be.
            const assetCountCap = projectAssets.length === 0 ? 0 : projectAssets.length === 1 ? 0.3 : 1;
            const confidence = Math.min(project.confidence ?? 1, assetCountCap);
            const confidenceLabel =
              confidence >= 0.7 ? copy.confidenceHigh : confidence >= 0.5 ? copy.confidenceMedium : copy.confidenceLow;
            const roomTypes = project.roomTypes.length ? project.roomTypes : project.analysis?.rooms ?? [];
            const summaryValue = project.customSummary ?? project.analysis?.summary ?? "";
            // Facts parsed straight from the source page (object type, area,
            // location, stage) - deterministic, never AI-generated, and
            // never overwritten by it. Shown as the first line on the card,
            // ahead of the AI's own interpretation.
            const factChips = [
              project.objectType ? copy.objectTypeLabels[project.objectType] ?? project.objectType : null,
              project.areaM2 ? copy.areaLabel(project.areaM2) : null,
              project.location,
              project.projectStage ? copy.projectStageLabels[project.projectStage] ?? project.projectStage : null,
            ].filter((chip): chip is string => Boolean(chip));

            return (
              <div key={project.id} className="rounded-2xl border border-line bg-card p-6">
                <div className="flex flex-wrap gap-5">
                  {coverAsset?.url ? (
                    <div className="relative h-40 w-56 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={coverAsset.url}
                        alt={coverAsset.altText ?? ""}
                        className="h-full w-full rounded-xl object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => deleteAsset(coverAsset)}
                        disabled={deletingAssetId === coverAsset.id}
                        aria-label={copy.deletePhotoLabel}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white shadow disabled:opacity-50"
                      >
                        ×
                      </button>
                    </div>
                  ) : null}

                  <div className="min-w-[220px] flex-1">
                    {factChips.length ? (
                      <div className="mb-1.5 flex flex-wrap gap-1.5">
                        {factChips.map((chip) => (
                          <span key={chip} className="rounded-md border border-line px-2 py-0.5 text-xs font-medium text-foreground">
                            {chip}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <input
                      defaultValue={project.suggestedTitle ?? ""}
                      placeholder={copy.editTitlePlaceholder}
                      onBlur={(event) => saveTitle(project, event.target.value)}
                      disabled={savingTitle === project.id}
                      className="w-full rounded-lg border border-line bg-background px-3 py-2 text-base font-semibold text-foreground outline-none focus:border-primary"
                    />
                    {project.aiTitle && project.aiTitle !== project.suggestedTitle ? (
                      <p className="mt-1 text-xs text-muted">
                        {copy.aiTitlePrefix} {project.aiTitle}
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted">{copy.photoCount(projectAssets.length)}</p>
                    {projectAssets.length === 0 ? (
                      <p className="mt-1 text-xs font-medium text-red-700">{copy.noPhotosWarning}</p>
                    ) : (
                      <p className={`mt-1 text-xs font-medium ${confidence < 0.5 ? "text-amber-700" : "text-muted"}`}>{confidenceLabel}</p>
                    )}
                    {project.analysis && project.analysis.isInteriorProject === false ? (
                      <p className="mt-1 text-xs font-medium text-red-700">
                        {copy.notInteriorProject}
                        {project.analysis.irrelevanceReason ? ` — ${project.analysis.irrelevanceReason}` : ""}
                      </p>
                    ) : null}

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {roomTypes.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(project, tag)}
                            aria-label={copy.removeTagLabel(tag)}
                            className="text-primary hover:opacity-70"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        value={tagDrafts[project.id] ?? ""}
                        onChange={(event) => setTagDrafts((current) => ({ ...current, [project.id]: event.target.value }))}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter") return;
                          event.preventDefault();
                          addTag(project, tagDrafts[project.id] ?? "");
                        }}
                        placeholder={copy.addTagPlaceholder}
                        className="w-36 rounded-full border border-dashed border-line bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                      />
                    </div>

                    {project.originalDescription ? (
                      <p className="mt-3 text-xs italic text-muted">
                        <span className="font-semibold not-italic">{copy.originalDescriptionLabel}:</span> {project.originalDescription}
                      </p>
                    ) : null}

                    <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-muted">
                      {copy.descriptionLabel}
                    </label>
                    <textarea
                      defaultValue={summaryValue}
                      placeholder={copy.descriptionPlaceholder}
                      rows={3}
                      onBlur={(event) => saveSummary(project, event.target.value)}
                      className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => toggleKeep(project)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          project.status === "kept" ? "bg-primary text-white" : "border border-line text-foreground"
                        }`}
                      >
                        {copy.keep}
                      </button>
                      <button
                        onClick={() => toggleHide(project)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          project.status === "hidden" ? "bg-foreground text-white" : "border border-line text-foreground"
                        }`}
                      >
                        {copy.hide}
                      </button>
                      <button
                        onClick={() => toggleFeatured(project)}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                          project.isFeatured ? "bg-amber-500 text-white" : "border border-line text-foreground"
                        }`}
                      >
                        {project.isFeatured ? copy.unfeature : copy.featured}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {visibleOtherAssets.map((asset) =>
                      asset.url ? (
                        <div key={asset.id} className="relative aspect-square">
                          <button
                            type="button"
                            onClick={() => toggleAsset(asset)}
                            className={`h-full w-full overflow-hidden rounded-lg border-2 ${
                              asset.selected ? "border-primary" : "border-transparent opacity-40"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset.url} alt={asset.altText ?? ""} className="h-full w-full object-cover" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteAsset(asset)}
                            disabled={deletingAssetId === asset.id}
                            aria-label={copy.deletePhotoLabel}
                            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white shadow disabled:opacity-50"
                          >
                            ×
                          </button>
                        </div>
                      ) : null
                    )}
                    <label
                      className={`flex aspect-square cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-line text-xs font-semibold text-muted hover:border-primary hover:text-primary ${
                        uploadingProjectId === project.id ? "pointer-events-none opacity-50" : ""
                      }`}
                    >
                      {uploadingProjectId === project.id ? copy.uploadingPhoto : `+ ${copy.addPhotoLabel}`}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (file) uploadPhoto(project, file);
                        }}
                      />
                    </label>
                  </div>
                  {otherAssets.length > collapsedThumbnailCount ? (
                    <button
                      type="button"
                      onClick={() => toggleExpanded(project.id)}
                      className="mt-2 text-xs font-semibold text-primary hover:underline"
                    >
                      {expanded ? copy.collapsePhotos : `${copy.showAllPhotos} (+${hiddenCount})`}
                    </button>
                  ) : null}
                  {photoError[project.id] ? <p className="mt-2 text-xs text-red-700">{photoError[project.id]}</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {!projects.some((project) => project.analysis) ? <p className="text-sm text-muted">{copy.analyzingNote}</p> : null}
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
