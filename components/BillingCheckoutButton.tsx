"use client";

import { useState } from "react";

export default function BillingCheckoutButton({
  accountId,
  errorLabel,
  label,
  planCode,
  unavailableLabel,
}: {
  accountId: string;
  errorLabel: string;
  label: string;
  planCode: string;
  unavailableLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function beginCheckout() {
    setPending(true);
    setError(null);
    try {
      const endpoint = window.location.pathname === "/en" || window.location.pathname.startsWith("/en/")
        ? "/en/api/billing/checkout"
        : "/api/billing/checkout";
      const response = await fetch(endpoint, {
        body: JSON.stringify({ accountId, planCode }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json().catch(() => ({}))) as { code?: string; error?: string; url?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.code === "BILLING_NOT_CONFIGURED" ? unavailableLabel : data.error || errorLabel);
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
        onClick={beginCheckout}
        className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "…" : label}
      </button>
      {error ? <p className="text-xs leading-5 text-red-700">{error}</p> : null}
    </div>
  );
}
