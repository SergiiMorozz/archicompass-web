"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSiteCopy } from "@/content/site-copy";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function ForgotPasswordContent() {
  const copy = getSiteCopy().auth.passwordRecovery;
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    const redirectTo = `${window.location.origin}/auth/callback?next=%2Freset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
    if (resetError) setError(resetError.message);
    else setMessage(copy.sent);
    setBusy(false);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6">
      <section className="mx-auto max-w-lg rounded-lg border border-line bg-card p-7 shadow-sm">
        <div className="text-sm font-bold text-primary">{copy.badge}</div>
        <h1 className="mt-2 text-4xl font-bold">{copy.forgotTitle}</h1>
        <p className="mt-3 leading-7 text-muted">{copy.forgotDescription}</p>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <label className="text-sm font-bold">{copy.emailLabel}<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" /></label>
          <button disabled={busy} className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{busy ? copy.sending : copy.sendCta}</button>
        </form>
        {message ? <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{message}</div> : null}
        {error ? <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        <Link href="/login" className="mt-6 inline-flex text-sm font-bold text-primary hover:underline">{copy.backToLogin}</Link>
      </section>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background" />}><ForgotPasswordContent /></Suspense>;
}
