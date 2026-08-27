"use client";

import { useEffect, useState } from "react";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

type JobStatus =
  | "QUEUED"
  | "FETCHING"
  | "EXTRACTING"
  | "GROUPING"
  | "ANALYZING"
  | "BUILDING_PROFILE"
  | "READY_FOR_REVIEW"
  | "FAILED"
  | "PUBLISHED";

type Job = {
  id: string;
  status: JobStatus;
  error: string | null;
  images_found: number;
  projects_found: number;
  created_at: string;
  updated_at: string;
};

type Preview = {
  id: string;
  url: string;
  altText: string | null;
};

type StatusResponse = {
  job?: Job;
  previews?: Preview[];
};

const terminalStatuses = new Set<JobStatus>(["READY_FOR_REVIEW", "FAILED", "PUBLISHED"]);
const importStages = ["QUEUED", "FETCHING", "EXTRACTING", "GROUPING", "ANALYZING", "BUILDING_PROFILE", "READY_FOR_REVIEW"] as const;
// Processing is owned by the server. The page only observes progress, so an
// import keeps running after this tab is closed or the device is locked.
const statusPollMs = 4_000;
const stalledAfterMs = 8 * 60_000;
const progressByStatus: Record<JobStatus, number> = {
  QUEUED: 8,
  FETCHING: 22,
  EXTRACTING: 42,
  GROUPING: 58,
  ANALYZING: 76,
  BUILDING_PROFILE: 90,
  READY_FOR_REVIEW: 100,
  FAILED: 100,
  PUBLISHED: 100,
};

function jobSignature(job: Job) {
  return [job.status, job.updated_at, job.images_found, job.projects_found].join(":");
}

function elapsedSince(createdAt: string, now: number) {
  const seconds = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function ImportProgress({ jobId }: { jobId: string }) {
  const copy = getPortfolioAutopilotCopy().importing;
  const [job, setJob] = useState<Job | null>(null);
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [error, setError] = useState("");
  const [stalled, setStalled] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let lastSignature = "";
    let lastProgressAt = Date.now();

    function observe(nextJob: Job, nextPreviews?: Preview[]) {
      const signature = jobSignature(nextJob);
      if (signature !== lastSignature) {
        lastSignature = signature;
        lastProgressAt = Date.now();
      }
      setJob(nextJob);
      if (nextPreviews) setPreviews(nextPreviews);
    }

    async function refresh() {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/status`), {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => ({}))) as StatusResponse;
      if (!response.ok || !result.job) throw new Error(copy.connectionError);
      if (cancelled) return;
      observe(result.job, result.previews ?? []);
      setStalled(!terminalStatuses.has(result.job.status) && Date.now() - lastProgressAt > stalledAfterMs);
    }

    async function poll() {
      try {
        await refresh();
      } catch {
        if (!cancelled) setError(copy.connectionError);
      }
    }

    void poll();
    const interval = window.setInterval(() => void poll(), statusPollMs);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [copy.connectionError, jobId]);

  async function retry() {
    setRetrying(true);
    setError("");
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/retry`), {
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as StatusResponse;
      if (!response.ok || !result.job) throw new Error(copy.connectionError);
      setJob(result.job);
      window.location.reload();
    } catch {
      setError(copy.connectionError);
      setRetrying(false);
    }
  }

  const status = job?.status ?? "QUEUED";
  const isFailed = status === "FAILED";
  const isReady = status === "READY_FOR_REVIEW" || status === "PUBLISHED";
  const progress = progressByStatus[status];
  const activeStatus = isReady ? "READY_FOR_REVIEW" : status === "FAILED" ? "QUEUED" : status;
  const activeIndex = importStages.indexOf(activeStatus as (typeof importStages)[number]);

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-6 sm:p-8">
      {isFailed ? (
        <>
          <h2 className="text-xl font-semibold text-red-700">{copy.failedTitle}</h2>
          <p className="mt-2 text-sm text-muted">{copy.failedHelp}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={retry}
              disabled={retrying}
              className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {copy.retryCta}
            </button>
            <a href={localePublicPath(siteLocale, "/studio/portfolio-assistant")} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground">
              {copy.backCta}
            </a>
          </div>
        </>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(220px,0.75fr)]">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-foreground">{stalled ? copy.stalledTitle : copy.statusLabels[status]}</h2>
                <p className="mt-1 text-sm text-muted">{copy.estimatedTime}</p>
              </div>
              {job ? <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-foreground">{copy.elapsedTime(elapsedSince(job.created_at, now))}</span> : null}
            </div>

            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-line">
              <div className={isReady ? "h-full bg-primary" : "h-full bg-primary transition-[width] duration-500"} style={{ width: `${progress}%` }} />
            </div>

            <ol className="mt-6 grid gap-2 sm:grid-cols-2" aria-label={copy.title}>
              {importStages.map((stage, index) => {
                const current = stage === activeStatus;
                const complete = isReady || index < activeIndex;
                return (
                  <li key={stage} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${current ? "bg-primary-soft font-semibold text-primary" : complete ? "text-foreground" : "text-muted"}`}>
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${current ? "bg-primary text-white" : complete ? "bg-foreground text-white" : "border border-line bg-background"}`}>
                      {complete ? "✓" : index + 1}
                    </span>
                    <span>{copy.stageLabels[stage]}</span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
              {job && job.images_found > 0 ? <span>{copy.imagesFound(job.images_found)}</span> : null}
              {job && job.projects_found > 0 ? <span>{copy.projectsFound(job.projects_found)}</span> : null}
            </div>
            {!isReady && !stalled ? <p className="mt-3 text-xs text-muted">{copy.keepOpenHint}</p> : null}

            {stalled ? (
              <>
                <p className="mt-4 max-w-2xl text-sm text-muted">{copy.stalledHelp}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button onClick={() => window.location.reload()} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                    {copy.resumeCta}
                  </button>
                  <a href={localePublicPath(siteLocale, "/studio/portfolio-assistant")} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:border-primary">
                    {copy.backCta}
                  </a>
                </div>
              </>
            ) : null}
            {isReady ? (
              <a href={localePublicPath(siteLocale, `/studio/portfolio-assistant/${jobId}/review`)} className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90">
                {copy.continueCta}
              </a>
            ) : null}
            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          </div>

          <section className="rounded-2xl border border-line bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{copy.previewTitle}</p>
            {previews.length ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {previews.map((preview) => (
                  <div key={preview.id} className="aspect-square overflow-hidden rounded-xl bg-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview.url} alt={preview.altText ?? ""} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden="true">
                {[0, 1, 2, 3].map((item) => (
                  <div key={item} className="aspect-square animate-pulse rounded-xl bg-line" />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
