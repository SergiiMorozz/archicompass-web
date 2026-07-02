"use client";

import { useState } from "react";

export default function FavoriteButton({
  compact = false,
  entityKey,
  entityType,
  initialSaved = false,
}: {
  compact?: boolean;
  entityKey: string;
  entityType: "designer" | "studio" | "project" | "article";
  initialSaved?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleFavorite() {
    if (isBusy) return;
    setIsBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityKey, entityType, saved: !saved }),
      });
      const payload = (await response.json()) as {
        code?: string;
        error?: string;
        saved?: boolean;
      };

      if (response.status === 401 || payload.code === "AUTH_REQUIRED") {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      if (!response.ok || typeof payload.saved !== "boolean") {
        throw new Error(payload.error || "Favorite could not be updated.");
      }

      setSaved(payload.saved);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Favorite could not be updated.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className={compact ? "shrink-0" : ""}>
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={isBusy}
        aria-pressed={saved}
        title={saved ? "Remove from favorites" : "Add to favorites"}
        className={[
          "rounded-xl border text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60",
          compact ? "h-10 px-3" : "px-4 py-3",
          saved
            ? "border-primary bg-primary-soft text-primary"
            : "border-line bg-background text-foreground hover:border-primary hover:text-primary",
        ].join(" ")}
      >
        {isBusy ? "Saving..." : saved ? "Saved" : "Save"}
      </button>
      {error ? <div className="mt-1 max-w-48 text-xs text-red-700">{error}</div> : null}
    </div>
  );
}
