"use client";

import { FormEvent, useId, useState } from "react";
import { getContentReportCopy, type ReportTargetType } from "@/content/content-report-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

type SubmissionState = "idle" | "sending" | "sent" | "error" | "rate_limited";

export default function ContentReportButton({
  targetType,
  targetId,
}: {
  targetType: ReportTargetType;
  targetId: string;
}) {
  const copy = getContentReportCopy();
  const detailsId = useId();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<SubmissionState>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");

    try {
      const response = await fetch(localePublicPath(siteLocale, "/api/content-reports"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          category: String(data.get("category") || ""),
          details: String(data.get("details") || ""),
        }),
      });
      if (response.status === 429) {
        setState("rate_limited");
        return;
      }
      if (!response.ok) throw new Error("report_failed");
      form.reset();
      setState("sent");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mt-5 border-t border-line pt-4">
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          if (state !== "sent") setState("idle");
        }}
        aria-expanded={open}
        className="text-left text-xs font-semibold text-muted underline decoration-dotted underline-offset-4 transition hover:text-primary"
      >
        {copy.action[targetType]}
      </button>

      {open ? (
        <form onSubmit={submit} className="mt-3 grid gap-3 rounded-xl border border-line bg-background p-4 text-sm">
          <div>
            <div className="font-semibold">{copy.title[targetType]}</div>
            <p className="mt-1 text-xs leading-5 text-muted">{copy.intro}</p>
          </div>
          <label className="grid gap-1.5 text-xs font-semibold text-foreground">
            {copy.category}
            <select name="category" required defaultValue="" className="rounded-lg border border-line bg-card px-3 py-2 text-sm font-normal text-foreground">
              <option value="" disabled>—</option>
              {copy.categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
          <label htmlFor={detailsId} className="grid gap-1.5 text-xs font-semibold text-foreground">
            {copy.details}
            <textarea id={detailsId} name="details" maxLength={2000} rows={3} className="resize-y rounded-lg border border-line bg-card px-3 py-2 text-sm font-normal text-foreground" />
            <span className="font-normal text-muted">{copy.detailsHint}</span>
          </label>
          {state === "sent" ? <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">{copy.success}</p> : null}
          {state === "error" ? <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700">{copy.error}</p> : null}
          {state === "rate_limited" ? <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{copy.rateLimited}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={state === "sending" || state === "sent"} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white disabled:opacity-60">
              {state === "sending" ? copy.sending : copy.submit}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-line bg-card px-3 py-2 text-xs font-bold text-muted">
              {copy.close}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
