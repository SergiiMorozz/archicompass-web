import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import {
  getAccountRole,
  getStudioMemberships,
  inquiryRecipientFilter,
} from "@/lib/studios";
import { profileReadinessScore } from "@/lib/profile-readiness";

export const revalidate = 0;

type Profile = {
  full_name: string | null;
  profile_headline: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  service_capabilities: string[] | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  years_experience: number | null;
};

type Project = {
  id: string;
};

type ProjectBrief = {
  id: string;
};

type DesignerInquiry = {
  id: string;
};

function profileName(profile: Partial<Profile>, email?: string) {
  const name = profile.full_name?.trim();
  if (!name || name.toLowerCase() === email?.toLowerCase()) return "Twoje konto ArchiCompass";
  return name;
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams?: Promise<{ profileDeleted?: string; profileUpdated?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const myProfileId = user.id;

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name, profile_headline, location, profession_type, user_type, specialties, bio, email, phone, service_capabilities, pricing_model, price_from, price_to, work_modes, availability_status, years_experience")
    .eq("id", user.id)
    .maybeSingle();

  const { data: projectsData } = await supabase
    .from("projects")
    .select("id")
    .eq("profile_id", user.id);

  const { data: briefsData } = await supabase
    .from("project_briefs")
    .select("id")
    .eq("user_id", user.id);

  const { data: sentInquiriesData } = await supabase
    .from("designer_inquiries")
    .select("id")
    .eq("client_id", user.id);

  const accountRole = await getAccountRole(supabase, user.id);
  const { data: activeMemberships } = await getStudioMemberships(
    supabase,
    user.id,
    "active"
  );
  const studioIds = activeMemberships.map((membership) => membership.studio_id);

  const { data: incomingInquiriesData } = await supabase
    .from("designer_inquiries")
    .select("id")
    .or(inquiryRecipientFilter(user.id, studioIds));

  const profile = (profileData ?? {}) as Partial<Profile>;
  const projects = (projectsData ?? []) as Project[];
  const briefs = (briefsData ?? []) as ProjectBrief[];
  const sentInquiries = (sentInquiriesData ?? []) as DesignerInquiry[];
  const incomingInquiries = (incomingInquiriesData ?? []) as DesignerInquiry[];
  const isProfessional = accountRole === "designer";
  const score = profileReadinessScore(profile, isProfessional);
  const hasPublicProfile = isProfessional && Boolean(profileData);
  const compassHref = isProfessional ? "/project-compass" : "/client/briefs";
  const compassTitle = isProfessional ? "Analizuj inspiracje" : "Zapisane briefy";
  const compassDescription = isProfessional
    ? "Uruchom analizę AI zdjęć referencyjnych, aby rozpoznać styl, materiały i język projektu. Projektanci mogą korzystać z narzędzia, ale nie wysyłają briefów jako klienci."
    : "Przejrzyj briefy z inspiracjami, budżetem i zakresem przed kontaktem z projektantem lub pracownią.";
  const nextActionHref = isProfessional ? "/studio" : "/designers";
  const nextActionLabel = isProfessional
    ? "Otwórz Studio projektanta"
    : "Przeglądaj projektantów";

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <div className="text-sm font-semibold text-primary">Ustawienia konta</div>
              <h1 className="mt-2 break-words text-4xl font-bold tracking-tight sm:text-6xl">
                {profileName(profile, user.email ?? undefined)}
              </h1>
              <div className="mt-3 break-all text-sm font-semibold text-muted">
                {user.email}
              </div>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {isProfessional
                  ? "Tutaj aktualizujesz dane konta i profil publiczny. Codzienna praca z briefami, portfolio i zespołem jest w Studio projektanta."
                  : "Tutaj aktualizujesz dane konta. Briefy, ulubione i rozmowy znajdziesz w Strefie klienta."}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary-soft px-3 py-1 text-sm font-semibold text-primary">
                  {isProfessional ? "Projektant" : "Klient"}
                </span>
                {profile.location ? (
                  <span className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted">
                    {profile.location}
                  </span>
                ) : null}
                {profile.profession_type ? (
                  <span className="rounded-full border border-line bg-background px-3 py-1 text-sm font-semibold text-muted">
                    {profile.profession_type}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              {isProfessional ? (
                <Link
                  href="/studio"
                  className="rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-white"
                >
                  Przejdź do Studio
                </Link>
              ) : null}
              {hasPublicProfile ? (
                <Link
                  href={`/designers/${myProfileId}`}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  Zobacz profil publiczny
                </Link>
              ) : null}
              <SignOutButton className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary disabled:opacity-60" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-7">
          {sp.profileDeleted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-6 text-emerald-900">
              <div className="font-semibold">Profil profesjonalisty został usunięty</div>
              <p className="mt-1">
                Publiczny profil i portfolio zostały usunięte. Konto projektanta,
                rozmowy i członkostwa w pracowniach pozostają aktywne.
              </p>
            </div>
          ) : null}
          {sp.profileUpdated ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
              Dane profilu zostały zaktualizowane.
            </div>
          ) : null}
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Link
              href="/account/profile"
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">Dane i widoczność</div>
              <h2 className="mt-2 text-2xl font-bold">
                {isProfessional ? "Profil publiczny" : "Dane kontaktowe"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Aktualizuj dane, specjalizacje, ceny, kontakt i podejście projektowe."
                  : "Imię, telefon i lokalizacja pojawią się przy briefach i pomogą projektantom sprawnie odpowiedzieć."}
              </p>
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-primary-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
              </div>
              <div className="mt-3 text-sm font-semibold text-muted">
                {score}% kompletności profilu
              </div>
            </Link>

            {isProfessional ? (
              <Link
                href="/account/projects"
                className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
              >
                <div className="text-sm font-semibold text-primary">Zarządzanie portfolio</div>
                <h2 className="mt-2 text-2xl font-bold">Zarządzaj projektami</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Dodawaj karty projektów, które budują wiarygodność profilu publicznego
                  i mogą pojawiać się również w powiązanych pracowniach.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-background p-3">
                    <div className="text-sm text-muted">Projekty</div>
                    <div className="mt-1 text-xl font-bold">{projects.length}</div>
                  </div>
                  <div className="rounded-xl border border-line bg-background p-3">
                    <div className="text-sm text-muted">Specjalizacje</div>
                    <div className="mt-1 text-xl font-bold">
                      {profile.specialties?.length ?? 0}
                    </div>
                  </div>
                </div>
              </Link>
            ) : null}

            {isProfessional ? (
              <Link
                href="/studio/team"
                className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
              >
                <div className="text-sm font-semibold text-primary">Profil pracowni</div>
                <h2 className="mt-2 text-2xl font-bold">Pracownia i zespół</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Utwórz pracownię, zaproś projektantów i korzystaj ze wspólnej skrzynki
                  zapytań oraz połączonego portfolio zespołu.
                </p>
                <div className="mt-6 rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">Aktywne pracownie</div>
                  <div className="mt-1 text-xl font-bold">{studioIds.length}</div>
                </div>
              </Link>
            ) : null}

            <Link
              href={compassHref}
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">
                {isProfessional ? "AI Project Compass" : "Project Compass"}
              </div>
              <h2 className="mt-2 text-2xl font-bold">{compassTitle}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {compassDescription}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? "Analizy w historii" : "Briefy"}
                  </div>
                  <div className="mt-1 text-xl font-bold">{briefs.length}</div>
                </div>
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">Narzędzie</div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? "Analiza AI" : "Aktywne"}
                  </div>
                </div>
              </div>
            </Link>

            <Link
              href={isProfessional ? "/studio/inbox" : "/account/inquiries"}
              className="rounded-2xl border border-line bg-card p-6 shadow-sm transition hover:border-primary"
            >
              <div className="text-sm font-semibold text-primary">Zapytania projektowe</div>
              <h2 className="mt-2 text-2xl font-bold">Zapytania z briefem</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Przeglądaj zapytania kierowane do Twojego profilu i pracowni, do których należysz."
                  : "Śledź briefy wysłane do projektantów i pracowni oraz kontynuuj rozmowy."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? "Otrzymane" : "Wysłane"}
                  </div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? incomingInquiries.length : sentInquiries.length}
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-background p-3">
                  <div className="text-sm text-muted">
                    {isProfessional ? "Pracownie" : "Rola"}
                  </div>
                  <div className="mt-1 text-xl font-bold">
                    {isProfessional ? studioIds.length : "Klient"}
                  </div>
                </div>
              </div>
            </Link>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-primary">Najlepsze kolejne działania</div>
                <h2 className="mt-1 text-3xl font-bold">
                  {isProfessional ? "Przygotuj profil dla klientów" : "Poprowadź projekt dalej"}
                </h2>
              </div>
              <Link
                href={nextActionHref}
                className="rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {nextActionLabel}
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {isProfessional ? "1. Uzupełnij podstawy" : "1. Stwórz jasny brief"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isProfessional
                    ? "Dodaj lokalizację, specjalizację, ceny i kontakt, aby klienci szybko ocenili dopasowanie."
                    : "Określ typ inwestycji, budżet, termin, styl i dodaj zdjęcia referencyjne."}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {isProfessional ? "2. Dodaj pierwszy projekt" : "2. Porównaj specjalistów"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isProfessional
                    ? "Już jedna mocna karta portfolio sprawia, że publiczny profil wygląda znacznie bardziej wiarygodnie."
                    : "Porównaj niezależnych projektantów i pracownie, zanim wyślesz brief."}
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-background p-5">
                <div className="font-bold">
                  {isProfessional ? "3. Sprawdź widok publiczny" : "3. Kontynuuj w wiadomościach"}
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {isProfessional
                    ? "Otwórz profil jak klient i sprawdź, czy opowieść jest jasna."
                    : "Przechowuj odpowiedzi, decyzje i kontekst projektu razem w strefie klienta."}
                </p>
              </div>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Twoje konto</div>
          <h2 className="mt-2 text-2xl font-bold">Dostęp i dane</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div>
              <div className="text-muted">E-mail</div>
              <div className="mt-1 break-words font-semibold">{user.email}</div>
            </div>
            <div>
              <div className="text-muted">Typ konta</div>
              <div className="mt-1 font-semibold">{isProfessional ? "Projektant" : "Klient"}</div>
            </div>
          </div>

          <Link
            href={isProfessional ? "/studio" : "/client"}
            className="mt-6 flex rounded-xl border border-line bg-background px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <span className="w-full">{isProfessional ? "Otwórz Studio projektanta" : "Otwórz Strefę klienta"}</span>
          </Link>

          {hasPublicProfile ? (
            <div className="mt-6 border-t border-line pt-6">
              <div className="font-bold">Link do profilu publicznego</div>
              <Link
                href={`/designers/${myProfileId}`}
                className="mt-3 flex rounded-xl bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-white"
              >
                <span className="w-full">Otwórz profil</span>
              </Link>
            </div>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
