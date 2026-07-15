"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { getSiteCopy } from "@/content/site-copy";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const copy = getSiteCopy().auth.passwordRecovery;
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (password.length < 8) { setError(copy.passwordTooShort); return; }
    if (password !== confirmation) { setError(copy.passwordsMismatch); return; }
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) setError(updateError.message);
    else setMessage(copy.updated);
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-lg rounded-lg border border-line bg-card p-7 shadow-sm">
        <div className="text-sm font-bold text-primary">{copy.badge}</div>
        <h1 className="mt-2 text-4xl font-bold">{copy.resetTitle}</h1>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <label className="text-sm font-bold">{copy.newPasswordLabel}<input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" /></label>
          <label className="text-sm font-bold">{copy.repeatPasswordLabel}<input type="password" required minLength={8} autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" /></label>
          <button disabled={busy} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? copy.saving : copy.saveCta}</button>
        </form>
        {message ? <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}<Link href="/account" className="mt-2 block font-bold underline">{copy.openAccount}</Link></div> : null}
        {error ? <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
      </section>
    </main>
  );
}
