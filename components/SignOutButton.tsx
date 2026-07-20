"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { siteLocale } from "@/lib/site-locale";

export default function SignOutButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const labels =
    siteLocale === "en"
      ? { idle: "Sign out", loading: "Signing out..." }
      : { idle: "Wyloguj się", loading: "Wylogowywanie..." };

  async function onSignOut() {
    try {
      setLoading(true);
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
      router.refresh();
      router.push("/login");
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
