"use client";

import Link from "next/link";
import { getLegalCopy } from "@/content/legal-copy";
import { localeAppPath } from "@/lib/site-locale";
import { useEffect, useState } from "react";

const storageKey = "archicompass-cookie-information-v1";

export default function CookieNotice() {
  const copy = getLegalCopy().cookieNotice;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(storageKey) !== "dismissed");
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(storageKey, "dismissed");
    } finally {
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <aside
      aria-label={copy.ariaLabel}
      className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-xl rounded-2xl border border-line bg-card p-4 shadow-2xl sm:inset-x-6 sm:p-5"
    >
      <p className="text-base font-bold text-foreground">{copy.title}</p>
      <p className="mt-1.5 text-sm leading-6 text-muted">{copy.body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={dismiss} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95">
          {copy.dismiss}
        </button>
        <Link href={localeAppPath("/cookies")} className="text-sm font-semibold text-primary hover:underline">
          {copy.learnMore}
        </Link>
      </div>
    </aside>
  );
}
