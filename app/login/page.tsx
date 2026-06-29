"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "loading" }
    | { type: "success"; message: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const clean = email.trim().toLowerCase();
    if (!clean) {
      setStatus({ type: "error", message: "Please enter your email." });
      return;
    }

    setStatus({ type: "loading" });

    const origin = window.location.origin;
    const requestedNext = new URLSearchParams(window.location.search).get("next") || "/account";
    const safeNext = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/account";
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: clean,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setStatus({
      type: "success",
      message:
        "Magic link sent! Check your email inbox (and spam). Open the link to sign in.",
    });
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-zinc-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Secure sign-in via magic link
            </div>

            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Sign in to <span className="underline">ArchiCompass</span>
            </h1>

            <p className="mt-4 max-w-xl text-zinc-600">
              One-click login. No password. We’ll email you a secure link to save
              briefs, contact professionals, or manage your designer profile.
            </p>

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link
                href="/designers"
                className="rounded-full border px-4 py-2 hover:bg-zinc-50"
              >
                Browse Designers
              </Link>
              <Link
                href="/get-started"
                className="rounded-full bg-black px-4 py-2 text-white hover:opacity-90"
              >
                Get Started
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border p-5">
                <div className="text-sm font-medium">For Clients</div>
                <p className="mt-2 text-sm text-zinc-600">
                  Save favorites, contact professionals, and track your project.
                </p>
              </div>
              <div className="rounded-2xl border p-5">
                <div className="text-sm font-medium">For Professionals</div>
                <p className="mt-2 text-sm text-zinc-600">
                  Claim your profile and showcase your work to new clients.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:justify-self-end">
            <div className="w-full max-w-md rounded-3xl border bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Magic link sign-in</h2>
                  <p className="mt-1 text-sm text-zinc-600">
                    Enter your email — we’ll send you a secure login link.
                  </p>
                </div>
                <div className="rounded-2xl border px-3 py-2 text-xs text-zinc-600">
                  No password
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs text-zinc-600">Email</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status.type === "loading"}
                  className="w-full rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  {status.type === "loading" ? "Sending..." : "Send magic link"}
                </button>

                {status.type === "success" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    {status.message}
                  </div>
                ) : status.type === "error" ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {status.message}
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500">
                    By continuing you agree to our{" "}
                    <Link href="/terms" className="underline">Terms</Link> and{" "}
                    <Link href="/privacy" className="underline">Privacy Policy</Link>.
                  </div>
                )}
              </form>

              <div className="mt-6 text-xs text-zinc-600">
                <Link href="/" className="underline">
                  ← Back home
                </Link>
              </div>
            </div>

            <p className="mt-3 max-w-md text-xs text-zinc-500">
              Tip: If you don’t receive the email, check “Spam / Promotions”.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
