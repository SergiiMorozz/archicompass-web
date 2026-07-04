"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";
type Intent = "client" | "designer";
type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

function intentFromNext(next: string): Intent {
  if (next.includes("intent=designer") || next.startsWith("/studio")) return "designer";
  return "client";
}

function LoginContent() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const searchParams = useSearchParams();
  const requestedValue = searchParams.get("next") || "/account";
  const requestedNext = requestedValue.startsWith("/") && !requestedValue.startsWith("//")
    ? requestedValue
    : "/account";
  const initialMode: Mode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [intent, setIntent] = useState<Intent>(() => intentFromNext(requestedNext));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function destinationAfterSignIn() {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return "/login";
    const { data: roleData } = await supabase
      .from("account_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    if (!roleData?.role) {
      const metadataIntent = userData.user?.user_metadata?.account_intent;
      const onboardingIntent = metadataIntent === "designer" || metadataIntent === "client"
        ? metadataIntent
        : intent;
      return `/onboarding?intent=${onboardingIntent}`;
    }
    if (requestedNext.startsWith("/onboarding") || requestedNext === "/account") {
      return roleData.role === "designer" ? "/studio" : "/client";
    }
    return requestedNext;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setStatus({ type: "error", message: "Enter your email address." });
      return;
    }
    if (password.length < 8) {
      setStatus({ type: "error", message: "Use at least 8 characters for the password." });
      return;
    }

    setStatus({ type: "loading" });
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) {
        setStatus({
          type: "error",
          message: error.message === "Invalid login credentials"
            ? "Email or password is incorrect. You can reset the password below."
            : error.message,
        });
        return;
      }
      window.location.assign(await destinationAfterSignIn());
      return;
    }

    const next = `/onboarding?intent=${intent}`;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { account_intent: intent },
      },
    });
    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }
    if (data.session) {
      window.location.assign(next);
      return;
    }
    setStatus({
      type: "success",
      message: "Account created. Open the confirmation email once, then sign in with this email and password.",
    });
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setStatus({ type: "idle" });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_480px] lg:items-center">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            Secure email and password
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
            {mode === "signup" ? "Create your ArchiCompass account" : "Welcome back to ArchiCompass"}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            {mode === "signup"
              ? "Choose one account role now. Client and Designer workspaces stay separate after registration."
              : "Sign in directly with the password you created. No new email link is required."}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-line bg-card p-5">
              <div className="font-bold">For clients</div>
              <p className="mt-2 text-sm leading-6 text-muted">Save briefs, compare designers, and manage conversations.</p>
            </div>
            <div className="rounded-lg border border-line bg-card p-5">
              <div className="font-bold">For designers</div>
              <p className="mt-2 text-sm leading-6 text-muted">Publish a portfolio and receive client project requests.</p>
            </div>
          </div>
          <Link href="/" className="mt-7 inline-flex text-sm font-bold text-primary hover:underline">Explore the public site</Link>
        </section>

        <section className="rounded-lg border border-line bg-card p-6 shadow-[0_18px_50px_rgba(54,31,73,0.10)] sm:p-8">
          <div className="grid grid-cols-2 rounded-lg bg-background p-1">
            <button type="button" onClick={() => switchMode("signin")} className={`rounded-md px-4 py-3 text-sm font-bold ${mode === "signin" ? "bg-primary text-white" : "text-muted"}`}>Sign in</button>
            <button type="button" onClick={() => switchMode("signup")} className={`rounded-md px-4 py-3 text-sm font-bold ${mode === "signup" ? "bg-primary text-white" : "text-muted"}`}>Create account</button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-5">
            {mode === "signup" ? (
              <fieldset>
                <legend className="text-sm font-bold">I am joining as</legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["client", "designer"] as Intent[]).map((role) => (
                    <button key={role} type="button" aria-pressed={intent === role} onClick={() => setIntent(role)} className={`rounded-lg border px-4 py-4 text-left text-sm font-bold capitalize ${intent === role ? "border-primary bg-primary-soft text-primary" : "border-line bg-background"}`}>
                      {role}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">One email has one role. Designer accounts receive briefs; client accounts send them.</p>
              </fieldset>
            ) : null}

            <label className="text-sm font-bold">
              Email
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <label className="text-sm font-bold">
              Password
              <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>

            <button type="submit" disabled={status.type === "loading"} className="rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">
              {status.type === "loading" ? "Please wait..." : mode === "signup" ? `Create ${intent} account` : "Sign in"}
            </button>

            {status.type === "success" ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{status.message}</div> : null}
            {status.type === "error" ? <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{status.message}</div> : null}
          </form>

          {mode === "signin" ? (
            <Link href="/forgot-password" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">Forgot password?</Link>
          ) : (
            <p className="mt-5 text-xs leading-5 text-muted">By creating an account you agree to the <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background" />}><LoginContent /></Suspense>;
}
