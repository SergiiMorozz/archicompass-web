"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSiteCopy } from "@/content/site-copy";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const authCopy = getSiteCopy().auth;

type Mode = "signin" | "signup";
type Intent = "client" | "designer";
type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string; canResetPassword?: boolean };

function intentFromNext(next: string): Intent {
  if (next.includes("intent=designer") || next.startsWith("/studio")) return "designer";
  return "client";
}

function authErrorMessage(message: string) {
  if (message === "Invalid login credentials") return authCopy.form.errors.invalidCredentials;
  if (message.toLowerCase().includes("email not confirmed")) return authCopy.form.errors.emailNotConfirmed;
  if (message.toLowerCase().includes("email rate limit")) return authCopy.form.errors.emailRateLimit;
  if (message.toLowerCase().includes("already registered")) return authCopy.form.errors.alreadyRegistered;
  return message;
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
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [isResendingConfirmation, setIsResendingConfirmation] = useState(false);
  const [status, setStatus] = useState<Status>({ type: "idle" });

  function confirmationRedirectTo() {
    const next = "/account/profile?onboarding=1";
    return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  }

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
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, phone, location")
      .eq("id", userId)
      .maybeSingle();
    const needsProfileSetup = !profileData?.full_name || !profileData?.phone || !profileData?.location;
    if (needsProfileSetup && (requestedNext === "/account" || requestedNext.startsWith("/onboarding"))) {
      return "/account/profile?onboarding=1";
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
      setStatus({ type: "error", message: authCopy.form.errors.emailRequired });
      return;
    }
    if (password.length < 8) {
      setStatus({ type: "error", message: authCopy.form.errors.passwordTooShort });
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
          message: authErrorMessage(error.message),
          canResetPassword: error.message === "Invalid login credentials",
        });
        return;
      }
      window.location.assign(await destinationAfterSignIn());
      return;
    }

    const next = "/account/profile?onboarding=1";
    const redirectTo = confirmationRedirectTo();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { account_intent: intent },
      },
    });
    if (error) {
      setStatus({ type: "error", message: authErrorMessage(error.message) });
      return;
    }
    if (data.session) {
      await supabase.rpc("set_my_account_role", { new_role: intent });
      await supabase.from("profiles").upsert(
        {
          id: data.session.user.id,
          email: data.session.user.email ?? cleanEmail,
          user_type: intent === "designer" ? "professional" : "client",
        },
        { onConflict: "id" }
      );
      window.location.assign(next);
      return;
    }
    setConfirmationEmail(cleanEmail);
    setStatus({
      type: "success",
      message: authCopy.form.confirmationCreated,
    });
  }

  async function resendConfirmation() {
    const address = confirmationEmail || email.trim().toLowerCase();
    if (!address) return;

    setIsResendingConfirmation(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: address,
      options: { emailRedirectTo: confirmationRedirectTo() },
    });
    setIsResendingConfirmation(false);

    if (error) {
      setStatus({ type: "error", message: authErrorMessage(error.message) });
      return;
    }
    setStatus({
      type: "success",
      message: authCopy.form.confirmationResent,
    });
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setConfirmationEmail(null);
    setStatus({ type: "idle" });
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_480px] lg:items-center">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {authCopy.securityBadge}
          </div>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-6xl">
            {mode === "signup" ? authCopy.signUp.headline : authCopy.signIn.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            {mode === "signup" ? authCopy.signUp.description : authCopy.signIn.description}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {authCopy.audienceCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-line bg-card p-5">
                <div className="font-bold">{card.title}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{card.description}</p>
              </div>
            ))}
          </div>
          <Link href="/" className="mt-7 inline-flex text-sm font-bold text-primary hover:underline">{authCopy.form.homeLink}</Link>
        </section>

        <section className="rounded-lg border border-line bg-card p-6 shadow-[0_18px_50px_rgba(54,31,73,0.10)] sm:p-8">
          <div className="grid grid-cols-2 rounded-lg bg-background p-1">
            <button type="button" onClick={() => switchMode("signin")} className={`rounded-md px-4 py-3 text-sm font-bold ${mode === "signin" ? "bg-primary text-white" : "text-muted"}`}>{authCopy.form.signInTab}</button>
            <button type="button" onClick={() => switchMode("signup")} className={`rounded-md px-4 py-3 text-sm font-bold ${mode === "signup" ? "bg-primary text-white" : "text-muted"}`}>{authCopy.form.signUpTab}</button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-5">
            {mode === "signup" ? (
              <fieldset>
                <legend className="text-sm font-bold">{authCopy.form.joinAs}</legend>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {(["client", "designer"] as Intent[]).map((role) => (
                    <button key={role} type="button" aria-pressed={intent === role} onClick={() => setIntent(role)} className={`rounded-lg border px-4 py-4 text-left text-sm font-bold capitalize ${intent === role ? "border-primary bg-primary-soft text-primary" : "border-line bg-background"}`}>
                      {role === "client" ? authCopy.form.client : authCopy.form.designer}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs leading-5 text-muted">{authCopy.form.roleNotice}</p>
              </fieldset>
            ) : null}

            <label className="text-sm font-bold">
              {authCopy.form.emailLabel}
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>
            <label className="text-sm font-bold">
              {authCopy.form.passwordLabel}
              <input type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authCopy.form.passwordPlaceholder} className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary" />
            </label>

            <button type="submit" disabled={status.type === "loading"} className="rounded-xl bg-primary px-5 py-3.5 text-sm font-bold text-white disabled:opacity-60">
              {status.type === "loading" ? authCopy.form.waiting : mode === "signup" ? intent === "client" ? authCopy.form.submitClient : authCopy.form.submitDesigner : authCopy.form.signInTab}
            </button>

            {status.type === "success" ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                <p>{status.message}</p>
                {mode === "signup" && confirmationEmail ? (
                  <button
                    type="button"
                    onClick={resendConfirmation}
                    disabled={isResendingConfirmation}
                    className="mt-3 inline-flex rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-bold text-emerald-900 disabled:opacity-60"
                  >
                    {isResendingConfirmation ? authCopy.form.resendSending : authCopy.form.resend}
                  </button>
                ) : null}
              </div>
            ) : null}
            {status.type === "error" ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
                <p>{status.message}</p>
                {status.canResetPassword ? (
                  <Link
                    href={`/forgot-password?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                    className="mt-3 inline-flex rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-800"
                  >
                    {authCopy.form.resetPasswordCta}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </form>

          {mode === "signin" ? (
            <Link href="/forgot-password" className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline">{authCopy.form.forgotPassword}</Link>
          ) : (
            <p className="mt-5 text-xs leading-5 text-muted">{authCopy.form.termsPrefix} <Link href="/terms" className="underline">{authCopy.form.terms}</Link> {authCopy.form.and} <Link href="/privacy" className="underline">{authCopy.form.privacy}</Link>.</p>
          )}
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<main className="min-h-screen bg-background" />}><LoginContent /></Suspense>;
}
