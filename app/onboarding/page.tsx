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
  if (existingRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, location")
      .eq("id", user.id)
      .maybeSingle();
    const needsProfileSetup = !profile?.full_name || !profile?.phone || !profile?.location;
    redirect(needsProfileSetup ? "/account/profile?onboarding=1" : existingRole === "designer" ? "/studio" : "/client");
  }

  const role = formValue(formData, "role");
  const designerMode = formValue(formData, "designer_mode");
  const next = safePath(formValue(formData, "next"));

  if (role !== "client" && role !== "designer") {
    redirect("/onboarding?error=Wybierz%20typ%20konta");
  }
  if (role === "designer" && !["independent", "studio"].includes(designerMode)) {
    redirect("/onboarding?intent=designer&error=Wybierz%20sposób%20pracy");
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

  redirect("/account/profile?onboarding=1");
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
  if (existingRole) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, location")
      .eq("id", user.id)
      .maybeSingle();
    const needsProfileSetup = !profile?.full_name || !profile?.phone || !profile?.location;
    redirect(needsProfileSetup ? "/account/profile?onboarding=1" : existingRole === "designer" ? "/studio" : "/client");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-background px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="text-sm font-semibold text-primary">Witamy w ArchiCompass</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
            {intent === "designer"
              ? "W jaki sposób pracujesz?"
              : intent === "client"
                ? "Skonfiguruj strefę klienta"
                : "Wybierz typ konta"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            Najpierw wybierz rolę, a potem uzupełnij dane kontaktowe. Dzięki temu od razu
            trafisz do właściwej strefy platformy.
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
              <div className="text-sm font-semibold text-primary">Klient</div>
              <h2 className="mt-2 text-3xl font-bold">Planuję projekt wnętrza</h2>
              <p className="mt-3 leading-7 text-muted">
                Twórz briefy, zapisuj projektantów i realizacje oraz prowadź rozmowy.
              </p>
              <div className="mt-8 text-sm font-semibold text-primary">Wybierz konto klienta</div>
            </Link>
            <Link href={stepHref("designer", next)} className="rounded-2xl border border-primary bg-primary-soft p-7 shadow-sm transition hover:bg-card">
              <div className="text-sm font-semibold text-primary">Projektant</div>
              <h2 className="mt-2 text-3xl font-bold">Świadczę usługi projektowe</h2>
              <p className="mt-3 leading-7 text-muted">
                Opublikuj profil, zarządzaj portfolio i otrzymuj dopasowane zapytania.
              </p>
              <div className="mt-8 text-sm font-semibold text-primary">Wybierz konto projektanta</div>
            </Link>
          </div>
        ) : intent === "client" ? (
          <form action={completeOnboarding} className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm">
            <input type="hidden" name="role" value="client" />
            <input type="hidden" name="next" value={next} />
            <div className="bg-primary-soft p-7">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-semibold text-primary shadow-sm">
                Strefa klienta
              </div>
              <h2 className="mt-4 text-3xl font-bold">Wszystko, czego potrzebujesz do wyboru projektanta</h2>
              <p className="mt-3 leading-7 text-muted">
                W tej strefie znajdziesz zapisane briefy, ulubionych projektantów, projekty
                i rozmowy. Konto klienta nie otrzymuje zapytań przeznaczonych dla projektantów.
              </p>
            </div>
            <div className="p-7">
              <p className="rounded-xl border border-line bg-background p-4 text-sm leading-6 text-muted">
                Następny krok: uzupełnienie imienia, telefonu i lokalizacji, żeby projektanci
                mogli odpowiadać na briefy bez zgadywania podstawowych informacji.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 px-7 pb-7">
              <button type="submit" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
                Przejdź do uzupełnienia profilu
              </button>
              <Link href={stepHref("designer", next)} className="px-2 py-3 text-sm font-semibold text-muted underline">
                Zamiast tego wybierz projektanta
              </Link>
            </div>
          </form>
        ) : (
          <form action={completeOnboarding} className="mt-10">
            <input type="hidden" name="role" value="designer" />
            <input type="hidden" name="next" value={next} />
            <div className="grid gap-5 md:grid-cols-2">
              <button name="designer_mode" value="independent" className="rounded-2xl border border-line bg-card p-7 text-left shadow-sm transition hover:border-primary">
                <span className="text-sm font-semibold text-primary">Niezależny projektant</span>
                <span className="mt-2 block text-3xl font-bold">Mój własny profil</span>
                <span className="mt-3 block leading-7 text-muted">
                  Utwórz publiczny profil, portfolio, cennik i skrzynkę zapytań.
                </span>
                <span className="mt-8 block text-sm font-semibold text-primary">Utwórz mój profil</span>
              </button>
              <button name="designer_mode" value="studio" className="rounded-2xl border border-primary bg-primary-soft p-7 text-left shadow-sm transition hover:bg-card">
                <span className="text-sm font-semibold text-primary">Pracownia projektowa</span>
                <span className="mt-2 block text-3xl font-bold">Utwórz zespół lub dołącz do niego</span>
                <span className="mt-3 block leading-7 text-muted">
                  Skonfiguruj wspólny profil pracowni albo przyjmij istniejące zaproszenie do zespołu.
                </span>
                <span className="mt-8 block text-sm font-semibold text-primary">Kontynuuj jako pracownia</span>
              </button>
            </div>
            <div className="mt-6 text-center">
              <Link href={stepHref("client", next)} className="text-sm font-semibold text-muted underline">
                Zamiast tego wybierz klienta
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
