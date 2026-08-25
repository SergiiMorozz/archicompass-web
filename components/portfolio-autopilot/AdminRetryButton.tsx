"use client";

import { useState } from "react";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

export default function AdminRetryButton({ jobId }: { jobId: string }) {
  const copy = getPortfolioAutopilotCopy().admin;
  const [busy, setBusy] = useState(false);

  async function retry() {
    setBusy(true);
    try {
      const response = await fetch(localePublicPath(siteLocale, `/api/portfolio-import/${jobId}/retry`), {
        method: "POST",
      });
      if (response.ok) window.location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={retry}
      disabled={busy}
      className="rounded-lg border border-line px-3 py-2 text-xs font-semibold text-foreground hover:border-primary disabled:opacity-60"
    >
      {copy.retryCta}
    </button>
  );
}
