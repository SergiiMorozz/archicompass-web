import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getExplicitAccountRole } from "@/lib/studios";
import {
  serviceCapabilities,
  serviceCapabilityValues,
} from "@/lib/service-capabilities";
import {
  availabilityStatuses,
  pricingModels,
  workModes,
  workModeValues,
} from "@/lib/profile-pricing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Profile = {
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  service_capabilities: string[] | null;
  website: string | null;
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
};

type ProjectImagePaths = {
  image_path: string | null;
  image_paths: string[] | null;
};

const projectImagesBucket = "project-images";

const fieldClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";
const areaClass =
  "mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal text-foreground outline-none transition focus:border-primary";

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
        profile.specialties?.length ? "specialties" : null,
        profile.service_capabilities?.length ? "services" : null,
        profile.hourly_rate,
        profile.pricing_model,
        profile.price_from || profile.price_to,
        profile.work_modes?.length ? "work modes" : null,
        profile.availability_status,
        profile.years_experience,
      ]
    : [profile.full_name, profile.location, profile.email, profile.phone];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
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
        bio: textValue(formData, "bio"),
        profession_type: textValue(formData, "profession_type"),
        user_type: "professional",
        specialties: specialtiesValue(formData),
        service_capabilities: serviceCapabilityValues(formData),
        website: textValue(formData, "website"),
        hourly_rate: numberValue(formData, "hourly_rate"),
        pricing_model: textValue(formData, "pricing_model"),
        price_from: numberValue(formData, "price_from"),
        price_to: numberValue(formData, "price_to"),
        minimum_project_budget: numberValue(formData, "minimum_project_budget"),
        work_modes: workModeValues(formData),
        availability_status: textValue(formData, "availability_status"),
        cooperation_terms: textValue(formData, "cooperation_terms"),
        years_experience: numberValue(formData, "years_experience"),
      }
    : { ...commonProfile, user_type: "client" };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  revalidatePath("/client");
  revalidatePath("/designers");
  revalidatePath(`/designers/${user.id}`);
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
  searchParams?: Promise<{ error?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, bio, location, profession_type, user_type, specialties, service_capabilities, website, phone, email, hourly_rate, pricing_model, price_from, price_to, minimum_project_budget, work_modes, availability_status, cooperation_terms, years_experience"
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
            {isProfessional ? "Back to account" : "Back to client workspace"}
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">Profile Builder</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                {isProfessional ? "Edit public profile" : "Account settings"}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                {isProfessional
                  ? "Shape the information clients see before they decide to contact you. These details power your marketplace profile."
                  : "Keep your personal and contact details current for briefs and conversations."}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-muted">Profile readiness</div>
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
          ) : null}

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Identity</div>
              <h2 className="mt-1 text-2xl font-bold">Who clients are meeting</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {isProfessional
                  ? "Personal designer profiles and studio profiles are separate. Create a studio from Designer Studio when several people should work together."
                  : "These details identify you in saved briefs and conversations with professionals."}
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label={isProfessional ? "Full name" : "Your name"}>
                <input name="full_name" defaultValue={p.full_name ?? ""} className={fieldClass} />
              </Field>

              <Field label="Location" hint="city or service area">
                <input
                  name="location"
                  defaultValue={p.location ?? ""}
                  placeholder="Warsaw"
                  className={fieldClass}
                />
              </Field>

              {isProfessional ? (
                <Field label="Profession type">
                  <input
                    name="profession_type"
                    defaultValue={p.profession_type ?? ""}
                    placeholder="Interior designer / architect"
                    className={fieldClass}
                  />
                </Field>
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
                  <Field label="Phone" hint="optional">
                    <input name="phone" defaultValue={p.phone ?? ""} className={fieldClass} />
                  </Field>
                </>
              )}
            </div>
          </section>

          {isProfessional ? <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Marketplace Details</div>
              <h2 className="mt-1 text-2xl font-bold">Pricing, experience, and contact</h2>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Hourly rate" hint="PLN">
                <input
                  name="hourly_rate"
                  defaultValue={p.hourly_rate ?? ""}
                  inputMode="numeric"
                  placeholder="150"
                  className={fieldClass}
                />
              </Field>

              <Field label="Years of experience">
                <input
                  name="years_experience"
                  defaultValue={p.years_experience ?? ""}
                  inputMode="numeric"
                  placeholder="5"
                  className={fieldClass}
                />
              </Field>

              <Field label="Pricing model">
                <select name="pricing_model" defaultValue={p.pricing_model ?? "Custom quote"} className={fieldClass}>
                  {pricingModels.map((model) => <option key={model} value={model}>{model}</option>)}
                </select>
              </Field>

              <Field label="Availability">
                <select name="availability_status" defaultValue={p.availability_status ?? "Waitlist / ask"} className={fieldClass}>
                  {availabilityStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </Field>

              <Field label="Typical design fee from" hint="PLN">
                <input name="price_from" defaultValue={p.price_from ?? ""} inputMode="numeric" placeholder="5000" className={fieldClass} />
              </Field>

              <Field label="Typical design fee to" hint="PLN">
                <input name="price_to" defaultValue={p.price_to ?? ""} inputMode="numeric" placeholder="15000" className={fieldClass} />
              </Field>

              <Field label="Minimum project budget" hint="PLN, optional">
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

              <Field label="Phone">
                <input name="phone" defaultValue={p.phone ?? ""} className={fieldClass} />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Website">
                  <input
                    name="website"
                    defaultValue={p.website ?? ""}
                    placeholder="https://"
                    className={fieldClass}
                  />
                </Field>
              </div>

              <fieldset className="sm:col-span-2">
                <legend className="text-sm font-semibold">Work formats</legend>
                <div className="mt-3 flex flex-wrap gap-3">
                  {workModes.map((mode) => (
                    <label key={mode} className="flex items-center gap-3 rounded-xl border border-line bg-background px-4 py-3 text-sm font-semibold">
                      <input type="checkbox" name="work_modes" value={mode} defaultChecked={p.work_modes?.includes(mode)} className="h-4 w-4 accent-primary" />
                      {mode}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="sm:col-span-2">
                <Field label="Cooperation terms" hint="short public summary">
                  <textarea
                    name="cooperation_terms"
                    defaultValue={p.cooperation_terms ?? ""}
                    rows={4}
                    placeholder="For example: what the first call includes, payment stages, revision rounds, and what is quoted separately."
                    className={areaClass}
                  />
                </Field>
              </div>
            </div>
          </section> : null}

          {isProfessional ? <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
            <div>
              <div className="text-sm font-semibold text-primary">Positioning</div>
              <h2 className="mt-1 text-2xl font-bold">Style, specialties, and story</h2>
            </div>

            <div className="mt-6 grid gap-5">
              <Field label="Specialties" hint="separate with commas">
                <input
                  name="specialties"
                  defaultValue={p.specialties?.join(", ") ?? ""}
                  placeholder="modern interiors, small apartments, premium"
                  className={fieldClass}
                />
              </Field>

              <fieldset>
                <legend className="text-sm font-semibold">Services available</legend>
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
                      {capability}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Field label="Bio">
                <textarea
                  name="bio"
                  defaultValue={p.bio ?? ""}
                  rows={7}
                  placeholder="Describe your approach, typical projects, and what makes working with you clear and easy."
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
              {isProfessional ? "Save profile" : "Save account details"}
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
            {isProfessional ? "Profile preview notes" : "Client account"}
          </div>
          <h2 className="mt-2 text-2xl font-bold">
            {isProfessional ? "What this affects" : "Where details appear"}
          </h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">{isProfessional ? "Catalog card" : "Project briefs"}</div>
              <p className="mt-2 leading-6 text-muted">
                {isProfessional
                  ? "Name, location, specialties, rate, and bio shape how you appear in Find Designer."
                  : "Your name and location help professionals understand who is sending a project brief."}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">{isProfessional ? "Public profile" : "Conversations"}</div>
              <p className="mt-2 leading-6 text-muted">
                {isProfessional
                  ? "Contact details and experience feed the profile header and contact panel."
                  : "Contact details stay inside your account and support active designer conversations."}
              </p>
            </div>
            {isProfessional ? <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">Specialties</div>
              <p className="mt-2 leading-6 text-muted">
                {specialtyCount
                  ? `${specialtyCount} specialties are ready to show.`
                  : "Add a few specialties so clients can understand your fit quickly."}
              </p>
            </div> : null}
          </div>

          {isProfessional ? <Link
            href="/account/projects"
            className="mt-6 flex rounded-xl bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            <span className="w-full">Manage portfolio projects</span>
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
