"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { localePublicPath, siteLocale } from "@/lib/site-locale";

type SignOutButtonProps = {
  className?: string;
  redirectTo?: string;
  label?: string;
  loadingLabel?: string;
};

export default function SignOutButton({
  className = "",
  redirectTo,
  label,
  loadingLabel,
}: SignOutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const defaultLabels =
    siteLocale === "en"
      ? { idle: "Sign out", loading: "Signing out..." }
      : { idle: "Wyloguj się", loading: "Wylogowywanie..." };
  const labels = {
    idle: label ?? defaultLabels.idle,
    loading: loadingLabel ?? defaultLabels.loading,
  };

  async function onSignOut() {
    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push(redirectTo ?? localePublicPath(siteLocale, "/login"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onSignOut}
      disabled={loading}
      className={
        className ||
        "rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
      }
    >
      {loading ? labels.loading : labels.idle}
    </button>
  );
}
