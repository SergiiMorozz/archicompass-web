import Link from "next/link";
import { redirect } from "next/navigation";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Intent = "client" | "designer";

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function safePath(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "";
}

function stepHref(intent: Intent, next: string) {
  const params = new URLSearchParams({ intent });
  if (next) params.set("next", next);
  return `/onboarding?${params.toString()}`;
}

async function completeOnboarding(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login?next=/onboarding");

  const existingRole = await getExplicitAccountRole(supabase, user.id);
  if (existingRole) redirect(existingRole === "designer" ? "/studio" : "/client");

  const role = formValue(formData, "role");
  const designerMode = formValue(formData, "designer_mode");
  const next = safePath(formValue(formData, "next"));

  if (role !== "client" && role !== "designer") {
    redirect("/onboarding?error=Choose%20an%20account%20type");
  }
  if (role === "designer" && !["independent", "studio"].includes(designerMode)) {
    redirect("/onboarding?intent=designer&error=Choose%20how%20you%20will%20work");
  }

  const { error } = await supabase.rpc("set_my_account_role", { new_role: role });
  if (error) {
    const params = new URLSearchParams({ intent: role, error: error.message });
    if (next) params.set("next", next);
    redirect(`/onboarding?${params.toString()}`);
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      user_type: role === "designer" ? "professional" : "client",
    },
    { onConflict: "id" }
  );
  if (profileError) {
    const params = new URLSearchParams({ intent: role, error: profileError.message });
    if (next) params.set("next", next);
    redirect(`/onboarding?${params.toString()}`);
  }

  if (role === "client") {
    redirect(next.startsWith("/account/briefs") ? next : "/client");
  }
  redirect(designerMode === "studio" ? "/studio/team?onboarding=1" : "/account/profile?onboarding=1");
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; intent?: string; next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const intent: Intent | null = sp.intent === "client" || sp.intent === "designer" ? sp.intent : null;
  const next = safePath(sp.next ?? "");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    const returnParams = new URLSearchParams();
    if (intent) returnParams.set("intent", intent);
    if (next) returnParams.set("next", next);
    const returnPath = `/onboarding${returnParams.size ? `?${returnParams.toString()}` : ""}`;
    redirect(`/login?next=${encodeURIComponent(returnPath)}`);
  }

  const existingRole = await getExplicitAccountRole(supabase, user.id);
  if (existingRole) redirect(existingRole === "designer" ? "/studio" : "/client");

  return (
    <main className="min-h-[calc(100vh-80px)] bg-background px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="text-sm font-semibold text-primary">Welcome to ArchiCompass</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
            {intent === "designer"
              ? "How will you work?"
              : intent === "client"
                ? "Set up your client workspace"
                : "Choose your account type"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            One account has one role, so briefs and professional requests always stay in
            the correct workspace.
          </p>
        </div>

        {sp.error ? (
          <div className="mx-auto mt-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}

        {!intent ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <Link href={stepHref("client", next)} className="rounded-2xl border border-line bg-card p-7 shadow-sm transition hover:border-primary">
              <div className="text-sm font-semibold text-primary">Client</div>
              <h2 className="mt-2 text-3xl font-bold">I am planning a project</h2>
              <p className="mt-3 leading-7 text-muted">
                Build briefs, save designers and projects, and manage conversations.
              </p>
              <div className="mt-8 text-sm font-semibold text-primary">Choose Client</div>
            </Link>
            <Link href={stepHref("designer", next)} className="rounded-2xl border border-primary bg-primary-soft p-7 shadow-sm transition hover:bg-card">
              <div className="text-sm font-semibold text-primary">Designer</div>
              <h2 className="mt-2 text-3xl font-bold">I provide design services</h2>
              <p className="mt-3 leading-7 text-muted">
                Publish a profile, manage a portfolio, and receive qualified requests.
              </p>
              <div className="mt-8 text-sm font-semibold text-primary">Choose Designer</div>
            </Link>
          </div>
        ) : intent === "client" ? (
          <form action={completeOnboarding} className="mx-auto mt-10 max-w-2xl rounded-2xl border border-line bg-card p-7 shadow-sm">
            <input type="hidden" name="role" value="client" />
            <input type="hidden" name="next" value={next} />
            <div className="text-sm font-semibold text-primary">Client Workspace</div>
            <h2 className="mt-2 text-3xl font-bold">Everything for your project search</h2>
            <p className="mt-3 leading-7 text-muted">
              Your workspace will contain saved briefs, favorite professionals, projects,
              and conversations. It will not receive designer inquiries.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                Create Client Workspace
              </button>
              <Link href={stepHref("designer", next)} className="rounded-xl border border-line bg-background px-5 py-3 text-sm font-semibold">
                Choose Designer instead
              </Link>
            </div>
          </form>
        ) : (
          <form action={completeOnboarding} className="mt-10">
            <input type="hidden" name="role" value="designer" />
            <input type="hidden" name="next" value={next} />
            <div className="grid gap-5 md:grid-cols-2">
              <button name="designer_mode" value="independent" className="rounded-2xl border border-line bg-card p-7 text-left shadow-sm transition hover:border-primary">
                <span className="text-sm font-semibold text-primary">Independent</span>
                <span className="mt-2 block text-3xl font-bold">My own profile</span>
                <span className="mt-3 block leading-7 text-muted">
                  Create a personal professional page, portfolio, pricing, and inbox.
                </span>
                <span className="mt-8 block text-sm font-semibold text-primary">Build my profile</span>
              </button>
              <button name="designer_mode" value="studio" className="rounded-2xl border border-primary bg-primary-soft p-7 text-left shadow-sm transition hover:bg-card">
                <span className="text-sm font-semibold text-primary">Design Studio</span>
                <span className="mt-2 block text-3xl font-bold">Create or join a team</span>
                <span className="mt-3 block leading-7 text-muted">
                  Set up a shared studio profile or continue to an existing team invitation.
                </span>
                <span className="mt-8 block text-sm font-semibold text-primary">Continue with Studio</span>
              </button>
            </div>
            <div className="mt-6 text-center">
              <Link href={stepHref("client", next)} className="text-sm font-semibold text-muted underline">
                Choose Client instead
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
