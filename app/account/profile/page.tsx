import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getExplicitAccountRole } from "@/lib/studios";
import {
  serviceCapabilities,
  serviceCapabilityLabel,
  serviceCapabilityValues,
} from "@/lib/service-capabilities";
import {
  availabilityLabel,
  availabilityStatuses,
  pricingModelLabel,
  pricingModels,
  workModeLabel,
  workModes,
  workModeValues,
} from "@/lib/profile-pricing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicTextError } from "@/lib/content-moderation";
import { fetchGooglePlaceSummary } from "@/lib/google-places";

export const revalidate = 0;

type Profile = {
  full_name: string | null;
  profile_headline: string | null;
  profile_logo_path: string | null;
  profile_banner_path: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  website: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  behance_url: string | null;
  linkedin_url: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  pricing_model: string | null;
  price_from: number | null;
  price_to: number | null;
  minimum_project_budget: number | null;
  work_modes: string[] | null;
  availability_status: string | null;
  cooperation_terms: string | null;
  years_experience: number | null;
  google_business_url: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_review_count: number | null;
  google_rating_updated_at: string | null;
};

type ProjectImagePaths = {
  image_path: string | null;
  image_paths: string[] | null;
};

const projectImagesBucket = "project-images";
const profileMediaBucket = "profile-media";
const maxProfileMediaSize = 5 * 1024 * 1024;
const allowedProfileMediaTypes = ["image/jpeg", "image/png", "image/webp"];

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const areaClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const fileClass =
  "mt-2 w-full rounded-xl border border-dashed border-line bg-background px-4 py-4 text-sm font-normal text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function urlValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  if (!value) return null;
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

function specialtiesValue(formData: FormData) {
  const value = formData.get("specialties");
  if (typeof value !== "string") return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function completionScore(profile: Partial<Profile>, isProfessional: boolean) {
  const fields = isProfessional
    ? [
        profile.full_name,
        profile.location,
        profile.profession_type,
        profile.email,
        profile.bio,
        profile.profile_headline,
        profile.specialties?.length ? "specialties" : null,
        profile.service_capabilities?.length ? "services" : null,
        profile.pricing_model,
        profile.price_from || profile.price_to,
        profile.work_modes?.length ? "work modes" : null,
        profile.availability_status,
        profile.years_experience,
      ]
    : [profile.full_name, profile.location, profile.email, profile.phone];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function fileValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function mediaExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

async function uploadProfileMedia(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  kind: "logo" | "banner",
  file: File | null
) {
  if (!file) return { path: null, error: null };
  if (!allowedProfileMediaTypes.includes(file.type)) {
    return { path: null, error: `${kind === "logo" ? "Logo" : "Baner"} musi być plikiem JPEG, PNG lub WebP.` };
  }
  if (file.size > maxProfileMediaSize) {
    return { path: null, error: `${kind === "logo" ? "Logo" : "Baner"} musi mieć mniej niż 5 MB.` };
  }

  const path = `${userId}/${kind}-${crypto.randomUUID()}.${mediaExtension(file)}`;
  const { error } = await supabase.storage.from(profileMediaBucket).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  return { path: error ? null : path, error: error?.message ?? null };
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-semibold">
      <span>{label}</span>
      {hint ? <span className="ml-2 font-normal text-muted">{hint}</span> : null}
      {children}
    </label>
  );
}

async function updateProfile(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const accountRole = await getExplicitAccountRole(supabase, user.id);
  if (!accountRole) redirect("/onboarding?next=%2Faccount%2Fprofile");
  const isProfessional = accountRole === "designer";

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("profile_logo_path, profile_banner_path")
    .eq("id", user.id)
    .maybeSingle();

  const headline = textValue(formData, "profile_headline");
  const bio = textValue(formData, "bio");
  const cooperationTerms = textValue(formData, "cooperation_terms");
  const specialties = specialtiesValue(formData);
  const moderationError = isProfessional
    ? publicTextError([headline, bio, cooperationTerms, ...specialties])
    : null;
  if (moderationError) {
    redirect(`/account/profile?error=${encodeURIComponent(moderationError)}`);
  }

  const logoUpload = isProfessional
    ? await uploadProfileMedia(supabase, user.id, "logo", fileValue(formData, "profile_logo"))
    : { path: null, error: null };
  if (logoUpload.error) redirect(`/account/profile?error=${encodeURIComponent(logoUpload.error)}`);
  const bannerUpload = isProfessional
    ? await uploadProfileMedia(supabase, user.id, "banner", fileValue(formData, "profile_banner"))
    : { path: null, error: null };
  if (bannerUpload.error) redirect(`/account/profile?error=${encodeURIComponent(bannerUpload.error)}`);

  const googleInput = isProfessional ? textValue(formData, "google_place_input") : null;
  const google = googleInput ? await fetchGooglePlaceSummary(googleInput) : { data: null, error: null };

  const commonProfile = {
    id: user.id,
    full_name: textValue(formData, "full_name"),
    location: textValue(formData, "location"),
    phone: textValue(formData, "phone"),
    email: textValue(formData, "email") ?? user.email ?? null,
  };
  const payload = isProfessional
    ? {
        ...commonProfile,
        profile_headline: headline,
        profile_logo_path: logoUpload.path ?? currentProfile?.profile_logo_path ?? null,
        profile_banner_path: bannerUpload.path ?? currentProfile?.profile_banner_path ?? null,
        bio,
        profession_type: textValue(formData, "profession_type"),
        user_type: "professional",
        specialties,
        service_capabilities: serviceCapabilityValues(formData),
        website: urlValue(formData, "website"),
        instagram_url: urlValue(formData, "instagram_url"),
        facebook_url: urlValue(formData, "facebook_url"),
        behance_url: urlValue(formData, "behance_url"),
        linkedin_url: urlValue(formData, "linkedin_url"),
        hourly_rate: null,
        pricing_model: textValue(formData, "pricing_model"),
        price_from: numberValue(formData, "price_from"),
        price_to: numberValue(formData, "price_to"),
        minimum_project_budget: numberValue(formData, "minimum_project_budget"),
        work_modes: workModeValues(formData),
        availability_status: textValue(formData, "availability_status"),
        cooperation_terms: cooperationTerms,
        years_experience: numberValue(formData, "years_experience"),
        google_place_id: google.data?.placeId ?? null,
        google_business_url: google.data?.businessUrl ?? null,
        google_rating: google.data?.rating ?? null,
        google_review_count: google.data?.reviewCount ?? null,
        google_rating_updated_at: google.data ? new Date().toISOString() : null,
      }
    : { ...commonProfile, user_type: "client" };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  revalidatePath("/client");
  revalidatePath("/designers");
  revalidatePath(`/designers/${user.id}`);
  if (isProfessional && google.error) {
    redirect(`/account/profile?notice=${encodeURIComponent(google.error)}`);
  }
  redirect(isProfessional ? `/designers/${user.id}` : "/client?profileUpdated=1");
}

async function deleteProfessionalProfile(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/login");

  if (textValue(formData, "confirm_delete") !== "DELETE") {
    redirect("/account/profile?error=Type%20DELETE%20to%20confirm%20profile%20deletion.");
  }

  const { data: projectData } = await supabase
    .from("projects")
    .select("image_path, image_paths")
    .eq("profile_id", user.id);
  const { data: profileMedia } = await supabase
    .from("profiles")
    .select("profile_logo_path, profile_banner_path")
    .eq("id", user.id)
    .maybeSingle();
  const paths = Array.from(
    new Set(
      ((projectData ?? []) as ProjectImagePaths[]).flatMap((project) =>
        project.image_paths?.length
          ? project.image_paths.filter(Boolean)
          : project.image_path
            ? [project.image_path]
            : []
      )
    )
  );

  const { error } = await supabase.rpc("delete_my_professional_profile");
  if (error) redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);

  if (paths.length) {
    await supabase.storage.from(projectImagesBucket).remove(paths);
  }
  const mediaPaths = [profileMedia?.profile_logo_path, profileMedia?.profile_banner_path].filter(
    (path): path is string => Boolean(path)
  );
  if (mediaPaths.length) {
    await supabase.storage.from(profileMediaBucket).remove(mediaPaths);
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  revalidatePath("/account/projects");
  revalidatePath("/designers");
  revalidatePath(`/designers/${user.id}`);
  redirect("/account?profileDeleted=1");
}

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; notice?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, profile_headline, profile_logo_path, profile_banner_path, bio, location, profession_type, user_type, specialties, service_capabilities, website, instagram_url, facebook_url, behance_url, linkedin_url, phone, email, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, cooperation_terms, years_experience, google_business_url, google_place_id, google_rating, google_review_count, google_rating_updated_at"
    )
    .eq("id", user.id)
    .maybeSingle();

  const p = (profile ?? {}) as Partial<Profile>;
  const accountRole = await getExplicitAccountRole(supabase, user.id);
  if (!accountRole) redirect("/onboarding?next=%2Faccount%2Fprofile");
  const isProfessional = accountRole === "designer";
  const hasProfile = Boolean(profile);
  const score = completionScore(p, isProfessional);
  const specialtyCount = p.specialties?.length ?? 0;
  const backHref = isProfessional ? "/account" : "/client";

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href={backHref}
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            {isProfessional ? "Wróć do konta" : "Wróć do strefy klienta"}
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">Edycja profilu</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                {isProfessional ? "Edytuj profil publiczny" : "Ustawienia konta"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {isProfessional
                  ? "Uzupełnij informacje, które klienci widzą przed kontaktem. Na ich podstawie powstaje Twój profil w katalogu."
                  : "Dbaj o aktualność danych osobowych i kontaktowych używanych w briefach i rozmowach."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-muted">Kompletność profilu</div>
                  <div className="mt-1 text-3xl font-bold text-primary">{score}%</div>
                </div>
                {isProfessional && hasProfile ? (
                  <Link
                    href={`/designers/${user.id}`}
                    className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                  >
                    View profile
                  </Link>
                ) : null}
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-soft">
                <div className="h-full rounded-full bg-primary" style={{ width: `${score}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <form action={updateProfile} className="grid gap-7">
          {sp.error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              {sp.error}
            </div>
          ) : sp.notice ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
              {sp.notice}
            </div>
          ) : null}

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Tożsamość</div>
              <h2 className="mt-1 text-2xl font-bold">Kogo poznają klienci</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Profil projektanta i profil pracowni są oddzielne. Jeżeli kilka osób pracuje razem, utwórz pracownię w Studio projektanta."
                  : "Te dane identyfikują Cię w zapisanych briefach i rozmowach z profesjonalistami."}
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label={isProfessional ? "Imię i nazwisko / nazwa" : "Imię i nazwisko"}>
                <input name="full_name" defaultValue={p.full_name ?? ""} className={fieldClass} />
              </Field>

              <Field label="Lokalizacja" hint="miasto lub obszar działania">
                <input
                  name="location"
                  defaultValue={p.location ?? ""}
                  placeholder="Warszawa"
                  className={fieldClass}
                />
              </Field>

              {isProfessional ? (
                <>
                  <Field label="Specjalizacja zawodowa">
                    <input
                      name="profession_type"
                      defaultValue={p.profession_type ?? ""}
                      placeholder="Projektant wnętrz / architekt"
                      className={fieldClass}
                    />
                  </Field>
                  <div className="sm:col-span-2 grid gap-5 sm:grid-cols-2">
                    <Field label="Logo profilu" hint="kwadratowy obraz, maks. 5 MB">
                      <input name="profile_logo" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} />
                    </Field>
                    <Field label="Baner profilu" hint="szeroki obraz, maks. 5 MB">
                      <input name="profile_banner" type="file" accept="image/jpeg,image/png,image/webp" className={fileClass} />
                    </Field>
                  </div>
                </>
              ) : (
                <>
                  <Field label="Email">
                    <input
                      name="email"
                      type="email"
                      defaultValue={p.email ?? user.email ?? ""}
                      className={fieldClass}
                    />
                  </Field>
                  <Field label="Telefon" hint="opcjonalnie">
                    <input name="phone" defaultValue={p.phone ?? ""} className={fieldClass} />
                  </Field>
                </>
              )}
            </div>
          </section>

          {isProfessional ? <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Informacje w katalogu</div>
              <h2 className="mt-1 text-2xl font-bold">Ceny, doświadczenie i kontakt</h2>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Lata doświadczenia">
                <input
                  name="years_experience"
                  defaultValue={p.years_experience ?? ""}
                  inputMode="numeric"
                  placeholder="5"
                  className={fieldClass}
                />
              </Field>

              <Field label="Model rozliczenia">
                <select name="pricing_model" defaultValue={p.pricing_model ?? "Custom quote"} className={fieldClass}>
                  {pricingModels.map((model) => <option key={model} value={model}>{pricingModelLabel(model)}</option>)}
                </select>
              </Field>

              <Field label="Dostępność">
                <select name="availability_status" defaultValue={p.availability_status ?? "Waitlist / ask"} className={fieldClass}>
                  {availabilityStatuses.map((status) => <option key={status} value={status}>{availabilityLabel(status)}</option>)}
                </select>
              </Field>

              <Field label="Cena od" hint="PLN w wybranym modelu rozliczenia">
                <input name="price_from" defaultValue={p.price_from ?? ""} inputMode="numeric" placeholder="5000" className={fieldClass} />
              </Field>

              <Field label="Cena do" hint="PLN w wybranym modelu rozliczenia">
                <input name="price_to" defaultValue={p.price_to ?? ""} inputMode="numeric" placeholder="15000" className={fieldClass} />
              </Field>

              <Field label="Minimalny budżet inwestycji" hint="PLN, opcjonalnie">
                <input name="minimum_project_budget" defaultValue={p.minimum_project_budget ?? ""} inputMode="numeric" placeholder="30000" className={fieldClass} />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  defaultValue={p.email ?? user.email ?? ""}
                  className={fieldClass}
                />
              </Field>

              <Field label="Telefon">
                <input name="phone" defaultValue={p.phone ?? ""} className={fieldClass} />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Strona internetowa">
                  <input
                    name="website"
                    defaultValue={p.website ?? ""}
                    placeholder="https://"
                    className={fieldClass}
                  />
                </Field>
              </div>

              <div className="sm:col-span-2">
                <div className="text-sm font-bold text-foreground">Profile społecznościowe</div>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Linki pojawią się jako ikony na profilu publicznym. Dodaj tylko aktywne profile zawodowe.
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <Field label="Instagram">
                    <input name="instagram_url" defaultValue={p.instagram_url ?? ""} placeholder="https://instagram.com/..." className={fieldClass} />
                  </Field>
                  <Field label="Facebook">
                    <input name="facebook_url" defaultValue={p.facebook_url ?? ""} placeholder="https://facebook.com/..." className={fieldClass} />
                  </Field>
                  <Field label="Behance">
                    <input name="behance_url" defaultValue={p.behance_url ?? ""} placeholder="https://behance.net/..." className={fieldClass} />
                  </Field>
                  <Field label="LinkedIn">
                    <input name="linkedin_url" defaultValue={p.linkedin_url ?? ""} placeholder="https://linkedin.com/in/..." className={fieldClass} />
                  </Field>
                </div>
              </div>

              <div className="sm:col-span-2 rounded-lg border border-[#eadbb5] bg-[#fff8e5] p-5">
                <div className="text-sm font-bold text-foreground">Ocena Google Business</div>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Dodaj link do profilu Google Maps / Google Business albo Place ID. ArchiCompass weryfikuje ocenę bezpośrednio w Google; nie można wpisać jej ręcznie.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Google Maps / Business link albo Place ID">
                      <input
                        name="google_place_input"
                        defaultValue={p.google_business_url ?? p.google_place_id ?? ""}
                        placeholder="https://maps.google.com/... albo ChIJ..."
                        className={fieldClass}
                      />
                    </Field>
                  </div>
                  <div className="sm:col-span-2 rounded-xl border border-line bg-card p-4 text-sm text-muted">
                    {p.google_rating !== null && p.google_rating !== undefined
                      ? `Zweryfikowano przez Google: ${p.google_rating.toFixed(1)} na podstawie ${p.google_review_count ?? 0} opinii.`
                      : p.google_place_id || p.google_business_url
                        ? "Profil Google jest zapisany, ale nie ma jeszcze zweryfikowanej oceny."
                        : "Brak zweryfikowanej oceny Google."}
                  </div>
                </div>
              </div>

              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold">Formy współpracy</legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {workModes.map((mode) => (
                    <label key={mode} className="flex items-center gap-3 rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold">
                      <input type="checkbox" name="work_modes" value={mode} defaultChecked={p.work_modes?.includes(mode)} className="h-4 w-4 accent-primary" />
                      {workModeLabel(mode)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <Field label="Warunki współpracy" hint="krótkie podsumowanie publiczne">
                  <textarea
                    name="cooperation_terms"
                    defaultValue={p.cooperation_terms ?? ""}
                    rows={4}
                    placeholder="Np. zakres pierwszej konsultacji, etapy płatności, liczba poprawek i elementy wyceniane osobno."
                    className={areaClass}
                  />
                </Field>
              </div>
            </div>
          </section> : null}

          {isProfessional ? <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Pozycjonowanie profilu</div>
              <h2 className="mt-1 text-2xl font-bold">Styl, specjalizacje i historia</h2>
            </div>

            <div className="mt-6 grid gap-5">
              <Field label="Nagłówek profilu" hint="krótki tekst na banerze, maks. 140 znaków">
                <input
                  name="profile_headline"
                  maxLength={140}
                  defaultValue={p.profile_headline ?? ""}
                  placeholder="Ciepłe, funkcjonalne wnętrza do współczesnego życia"
                  className={fieldClass}
                />
              </Field>

              <Field label="Specjalizacje" hint="oddziel przecinkami">
                <input
                  name="specialties"
                  defaultValue={p.specialties?.join(", ") ?? ""}
                  placeholder="modern interiors, small apartments, premium"
                  className={fieldClass}
                />
              </Field>

              <fieldset>
                <legend className="text-sm font-semibold">Dostępne usługi</legend>
                <p className="mt-1 text-sm leading-6 text-muted">
                  These are used when Project Compass explains why a brief may fit.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {serviceCapabilities.map((capability) => (
                    <label
                      key={capability}
                      className="flex items-center gap-3 rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold"
                    >
                      <input
                        type="checkbox"
                        name="service_capabilities"
                        value={capability}
                        defaultChecked={p.service_capabilities?.includes(capability)}
                        className="h-4 w-4 accent-primary"
                      />
                      {serviceCapabilityLabel(capability)}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="O mnie / podejście projektowe">
                <textarea
                  name="bio"
                  defaultValue={p.bio ?? ""}
                  rows={7}
                  placeholder="Opisz swoje podejście, typowe projekty i sposób prowadzenia współpracy."
                  className={areaClass}
                />
              </Field>
            </div>
          </section> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              {isProfessional ? "Zapisz profil" : "Zapisz dane konta"}
            </button>
            <Link
              href={hasProfile && isProfessional ? `/designers/${user.id}` : backHref}
              className="rounded-xl border border-line bg-card px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">
            {isProfessional ? "Podgląd profilu" : "Konto klienta"}
          </div>
          <h2 className="mt-2 text-2xl font-bold">
            {isProfessional ? "Gdzie pojawią się te dane" : "Gdzie pojawią się dane"}
          </h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">{isProfessional ? "Karta w katalogu" : "Briefy projektowe"}</div>
              <p className="mt-2 leading-6 text-muted">
                {isProfessional
                  ? "Nazwa, lokalizacja, specjalizacje, ceny i opis decydują o prezentacji w katalogu."
                  : "Imię i lokalizacja pomagają projektantom zrozumieć, kto wysyła brief."}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">{isProfessional ? "Profil publiczny" : "Rozmowy"}</div>
              <p className="mt-2 leading-6 text-muted">
                {isProfessional
                  ? "Dane kontaktowe i doświadczenie pojawiają się w nagłówku oraz panelu kontaktowym."
                  : "Dane kontaktowe pozostają w koncie i wspierają aktywne rozmowy z projektantami."}
              </p>
            </div>
            {isProfessional ? <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">Specjalizacje</div>
              <p className="mt-2 leading-6 text-muted">
                {specialtyCount
                  ? `${specialtyCount} specialties are ready to show.`
                  : "Dodaj kilka specjalizacji, aby klienci szybko ocenili dopasowanie."}
              </p>
            </div> : null}
          </div>

          {isProfessional ? <Link
            href="/account/projects"
            className="mt-6 flex rounded-xl bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            <span className="w-full">Zarządzaj projektami portfolio</span>
          </Link> : null}

          {isProfessional && hasProfile ? (
            <details className="mt-6 overflow-hidden rounded-xl border border-red-200 bg-red-50">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-red-700">
                Delete professional profile
              </summary>
              <div className="border-t border-red-200 p-4">
                <p className="text-sm leading-6 text-red-700">
                  This permanently removes your public designer profile, all portfolio
                  projects, project images, favorites pointing to them, and profile
                  analytics. Your login, saved conversations, and studio memberships stay
                  active.
                </p>
                <form action={deleteProfessionalProfile} className="mt-4 grid gap-3">
                  <label className="text-sm font-semibold text-red-800">
                    Type DELETE to confirm
                    <input
                      name="confirm_delete"
                      required
                      pattern="DELETE"
                      autoComplete="off"
                      className="mt-2 w-full rounded-xl border border-red-300 bg-white px-4 py-3 font-normal text-foreground outline-none focus:border-red-600"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Permanently delete profile
                  </button>
                </form>
              </div>
            </details>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
