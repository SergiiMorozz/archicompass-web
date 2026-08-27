"use client";

import { FormEvent, useState } from "react";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

const maxUploadFiles = 40;
const maxUploadBytes = 10 * 1024 * 1024;
const acceptedUploadTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const fileClass =
  "mt-2 w-full rounded-xl border border-dashed border-line bg-background px-4 py-4 text-sm font-normal text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";

export default function PortfolioAutopilotStartForm() {
  const copy = getPortfolioAutopilotCopy().start;
  const [sourceType, setSourceType] = useState<"website" | "upload">("website");
  const [rightsConfirmed, setRightsConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);

    if (!rightsConfirmed) {
      setError(copy.errors.rightsRequired);
      return;
    }

    if (sourceType === "upload") {
      const files = data.getAll("portfolio_files").filter((value): value is File => value instanceof File && value.size > 0);
      if (!files.length) {
        setError(copy.errors.sourceRequired);
        return;
      }
      if (files.length > maxUploadFiles) {
        setError(copy.errors.tooManyFiles(maxUploadFiles));
        return;
      }
      if (files.some((file) => !acceptedUploadTypes.has(file.type) || file.size > maxUploadBytes)) {
        setError(copy.errors.unsupportedFiles);
        return;
      }
    } else if (!String(data.get("source_url") || "").trim()) {
      setError(copy.errors.sourceRequired);
      return;
    }

    const payload = new FormData();
    payload.set("source_type", sourceType);
    payload.set("rights_confirmed", "true");
    if (sourceType === "website") {
      payload.set("source_url", String(data.get("source_url") || "").trim());
    } else {
      for (const file of data.getAll("portfolio_files")) {
        if (file instanceof File && file.size > 0) payload.append("portfolio_files", file);
      }
    }

    setBusy(true);
    try {
      const response = await fetch(localePublicPath(siteLocale, "/api/portfolio-import/start"), {
        method: "POST",
        body: payload,
      });
      const result = (await response.json()) as { jobId?: string; error?: string };
      if (!response.ok || !result.jobId) throw new Error(result.error || copy.errors.genericFailure);
      window.location.assign(localePublicPath(siteLocale, `/studio/portfolio-assistant/${result.jobId}/importing`));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : copy.errors.genericFailure);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 grid gap-5">
      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-2">
        <span className="text-sm font-semibold">{copy.sourceTypeLabel}</span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSourceType("website")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              sourceType === "website" ? "border-primary bg-primary-soft text-primary" : "border-line bg-background text-foreground"
            }`}
          >
            {copy.sourceWebsite}
          </button>
          <button
            type="button"
            onClick={() => setSourceType("upload")}
            className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              sourceType === "upload" ? "border-primary bg-primary-soft text-primary" : "border-line bg-background text-foreground"
            }`}
          >
            {copy.sourceUpload}
          </button>
        </div>
      </div>

      {sourceType === "website" ? (
        <label className="block text-sm font-semibold">
          {copy.websiteUrlLabel} <span className="font-normal text-muted">{copy.websiteUrlHint}</span>
          <input name="source_url" type="text" placeholder={copy.websiteUrlPlaceholder} className={fieldClass} />
        </label>
      ) : (
        <label className="block text-sm font-semibold">
          {copy.uploadLabel} <span className="font-normal text-muted">{copy.uploadHint(maxUploadFiles)}</span>
          <input
            name="portfolio_files"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className={fileClass}
          />
        </label>
      )}

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={rightsConfirmed}
          onChange={(event) => setRightsConfirmed(event.target.checked)}
          className="mt-1 h-4 w-4 rounded border-line"
        />
        <span className="text-foreground">{copy.rightsLabel}</span>
      </label>

      <button
        disabled={busy}
        type="submit"
        className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? copy.submitBusy : copy.submit}
      </button>
    </form>
  );
}
