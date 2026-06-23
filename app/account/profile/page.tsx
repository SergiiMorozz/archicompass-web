import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Profile = {
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  hourly_rate: number | null;
  years_experience: number | null;
};

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

function completionScore(profile: Partial<Profile>) {
  const fields = [
    profile.full_name,
    profile.location,
    profile.profession_type,
    profile.email,
    profile.bio,
    profile.specialties?.length ? "specialties" : null,
    profile.hourly_rate,
    profile.years_experience,
  ];
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

  const payload = {
    id: user.id,
    full_name: textValue(formData, "full_name"),
    bio: textValue(formData, "bio"),
    location: textValue(formData, "location"),
    profession_type: textValue(formData, "profession_type"),
    user_type: textValue(formData, "user_type") ?? "professional",
    specialties: specialtiesValue(formData),
    website: textValue(formData, "website"),
    phone: textValue(formData, "phone"),
    email: textValue(formData, "email") ?? user.email ?? null,
    hourly_rate: numberValue(formData, "hourly_rate"),
    years_experience: numberValue(formData, "years_experience"),
  };

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });

  if (error) redirect(`/account/profile?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account");
  revalidatePath("/designers");
  revalidatePath(`/designers/${user.id}`);
  redirect(`/designers/${user.id}`);
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
      "full_name, bio, location, profession_type, user_type, specialties, website, phone, email, hourly_rate, years_experience"
    )
    .eq("id", user.id)
    .maybeSingle();

  const p = (profile ?? {}) as Partial<Profile>;
  const score = completionScore(p);
  const specialtyCount = p.specialties?.length ?? 0;

  return (
    <main className="bg-background">
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/account"
            className="inline-flex rounded-full border border-line bg-background px-4 py-2 text-sm font-semibold text-muted hover:border-primary hover:text-primary"
          >
            Back to account
          </Link>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <div className="text-sm font-semibold text-primary">Profile Builder</div>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-6xl">
                Edit public profile
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
                Shape the information clients see before they decide to contact you.
                These details power your marketplace profile.
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-background p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-muted">Profile readiness</div>
                  <div className="mt-1 text-3xl font-bold text-primary">{score}%</div>
                </div>
                <Link
                  href={`/designers/${user.id}`}
                  className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white"
                >
                  View profile
                </Link>
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
                Use a studio name if clients should see the studio first.
              </p>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name / studio name">
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

              <Field label="Profession type">
                <input
                  name="profession_type"
                  defaultValue={p.profession_type ?? ""}
                  placeholder="Interior designer / architect / studio"
                  className={fieldClass}
                />
              </Field>

              <Field label="Account type">
                <select
                  name="user_type"
                  defaultValue={p.user_type ?? "professional"}
                  className={fieldClass}
                >
                  <option value="professional">Professional</option>
                  <option value="client">Client</option>
                </select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
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
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-card p-6 shadow-sm">
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
          </section>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Save profile
            </button>
            <Link
              href={`/designers/${user.id}`}
              className="rounded-xl border border-line bg-card px-6 py-3 text-sm font-semibold hover:border-primary hover:text-primary"
            >
              Cancel
            </Link>
          </div>
        </form>

        <aside className="h-fit rounded-2xl border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Profile preview notes</div>
          <h2 className="mt-2 text-2xl font-bold">What this affects</h2>
          <div className="mt-5 grid gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">Catalog card</div>
              <p className="mt-2 leading-6 text-muted">
                Name, location, specialties, rate, and bio shape how you appear in
                Find Designer.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">Public profile</div>
              <p className="mt-2 leading-6 text-muted">
                Contact details and experience feed the profile header and contact panel.
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-background p-4">
              <div className="font-semibold">Specialties</div>
              <p className="mt-2 leading-6 text-muted">
                {specialtyCount
                  ? `${specialtyCount} specialties are ready to show.`
                  : "Add a few specialties so clients can understand your fit quickly."}
              </p>
            </div>
          </div>

          <Link
            href="/account/projects"
            className="mt-6 flex rounded-xl bg-primary-soft px-4 py-3 text-center text-sm font-semibold text-primary hover:bg-primary hover:text-white"
          >
            <span className="w-full">Manage portfolio projects</span>
          </Link>
        </aside>
      </section>
    </main>
  );
}
