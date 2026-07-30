"use client";

import { useState } from "react";

export default function BillingPortalButton({
  accountId,
  errorLabel,
  label,
}: {
  accountId: string;
  errorLabel: string;
  label: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function openPortal() {
    setPending(true);
    setError(null);
    try {
      const endpoint = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/")
        ? "/en/api/billing/portal"
        : "/api/billing/portal";
      const response = await fetch(endpoint, {
        body: JSON.stringify({ accountId }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string; url?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error || errorLabel);
    } catch {
      setError(errorLabel);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={openPortal}
        className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-bold text-primary transition hover:border-primary disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "…" : label}
      </button>
      {error ? <p className="text-xs leading-5 text-red-700">{error}</p> : null}
    </div>
  );
}
