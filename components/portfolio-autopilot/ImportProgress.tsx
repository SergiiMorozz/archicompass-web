"use client";

import { useEffect, useRef, useState } from "react";
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
  updated_at: string;
};

const terminalStatuses = new Set<JobStatus>(["READY_FOR_REVIEW", "FAILED", "PUBLISHED"]);
const maxSteps = 600;
const stepDelayMs = 700;
const stalledAfterMs = 90_000;
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

export default function ImportProgress({ jobId }: { jobId: string }) {
  const copy = getPortfolioAutopilotCopy().importing;
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [stalled, setStalled] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    let steps = 0;
    let lastSignature = "";
    let lastProgressAt = Date.now();

    function observe(nextJob: Job) {
      const signature = jobSignature(nextJob);
      if (signature !== lastSignature) {
        lastSignature = signature;
        lastProgressAt = Date.now();
      }
      setJob(nextJob);
    }

    async function getCurrentJob() {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/status`), {
        cache: "no-store",
      });
      const result = (await response.json().catch(() => ({}))) as { job?: Job };
      if (!response.ok || !result.job) throw new Error(copy.connectionError);
      return result.job;
    }

    async function advanceLoop() {
      try {
        const currentJob = await getCurrentJob();
        if (cancelled.current) return;
        observe(currentJob);
        if (terminalStatuses.has(currentJob.status)) return;

        while (!cancelled.current && steps < maxSteps) {
          if (Date.now() - lastProgressAt > stalledAfterMs) {
            setStalled(true);
            return;
          }

          steps += 1;
          const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/advance`), {
            method: "POST",
          });
          const result = (await response.json().catch(() => ({}))) as { job?: Job };
          if (!response.ok || !result.job) throw new Error(copy.connectionError);
          if (cancelled.current) return;
          observe(result.job);
          if (terminalStatuses.has(result.job.status)) return;
          await new Promise((resolve) => setTimeout(resolve, stepDelayMs));
        }

        if (!cancelled.current) setStalled(true);
      } catch {
        if (!cancelled.current) {
          setError(copy.connectionError);
          setStalled(true);
        }
      }
    }

    advanceLoop();
    return () => {
      cancelled.current = true;
    };
  }, [copy.connectionError, jobId]);

  async function retry() {
    setRetrying(true);
    setError("");
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/retry`), {
        method: "POST",
      });
      const result = (await response.json().catch(() => ({}))) as { job?: Job };
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

  return (
    <div className="mt-8 rounded-2xl border border-line bg-card p-8">
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
            <a href={localePublicPath(siteLocale, "/studio/portfolio-autopilot")} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground">
              {copy.backCta}
            </a>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold text-foreground">{stalled ? copy.stalledTitle : copy.statusLabels[status]}</h2>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-line">
            <div className={isReady ? "h-full bg-primary" : "h-full bg-primary transition-[width] duration-500"} style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted">
            {job && job.images_found > 0 ? <span>{copy.imagesFound(job.images_found)}</span> : null}
            {job && job.projects_found > 0 ? <span>{copy.projectsFound(job.projects_found)}</span> : null}
          </div>
          {stalled ? (
            <>
              <p className="mt-4 max-w-2xl text-sm text-muted">{copy.stalledHelp}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                >
                  {copy.resumeCta}
                </button>
                <a href={localePublicPath(siteLocale, "/studio/portfolio-autopilot")} className="rounded-xl border border-line px-5 py-3 text-sm font-semibold text-foreground hover:border-primary">
                  {copy.manualUploadCta}
                </a>
              </div>
            </>
          ) : null}
          {isReady ? (
            <a
              href={localePublicPath(siteLocale, `/studio/portfolio-autopilot/${jobId}/review`)}
              className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {copy.continueCta}
            </a>
          ) : null}
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        </>
      )}
    </div>
  );
}
