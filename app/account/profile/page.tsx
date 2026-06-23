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

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href="/account" className="text-sm underline">
          ← Back to account
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-semibold">Edit profile</h1>
          <p className="mt-2 text-zinc-600">
            This information appears on your public ArchiCompass profile.
          </p>
        </div>

        {sp.error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {sp.error}
          </div>
        ) : null}

        <form action={updateProfile} className="mt-8 grid gap-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm">
              <span className="text-zinc-600">Full name / studio name</span>
              <input
                name="full_name"
                defaultValue={p.full_name ?? ""}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Location</span>
              <input
                name="location"
                defaultValue={p.location ?? ""}
                placeholder="Warsaw"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Profession type</span>
              <input
                name="profession_type"
                defaultValue={p.profession_type ?? ""}
                placeholder="Interior designer / architect / studio"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Account type</span>
              <select
                name="user_type"
                defaultValue={p.user_type ?? "professional"}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              >
                <option value="professional">Professional</option>
                <option value="client">Client</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Hourly rate</span>
              <input
                name="hourly_rate"
                defaultValue={p.hourly_rate ?? ""}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Years of experience</span>
              <input
                name="years_experience"
                defaultValue={p.years_experience ?? ""}
                inputMode="numeric"
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Email</span>
              <input
                name="email"
                type="email"
                defaultValue={p.email ?? user.email ?? ""}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>

            <label className="text-sm">
              <span className="text-zinc-600">Phone</span>
              <input
                name="phone"
                defaultValue={p.phone ?? ""}
                className="mt-1 w-full rounded-xl border px-3 py-2"
              />
            </label>
          </div>

          <label className="text-sm">
            <span className="text-zinc-600">Website</span>
            <input
              name="website"
              defaultValue={p.website ?? ""}
              placeholder="https://"
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-600">Specialties, separated by commas</span>
            <input
              name="specialties"
              defaultValue={p.specialties?.join(", ") ?? ""}
              placeholder="modern interiors, small apartments, premium"
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>

          <label className="text-sm">
            <span className="text-zinc-600">Bio</span>
            <textarea
              name="bio"
              defaultValue={p.bio ?? ""}
              rows={6}
              className="mt-1 w-full rounded-xl border px-3 py-2"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-xl bg-black px-5 py-3 text-sm text-white hover:opacity-90"
            >
              Save profile
            </button>
            <Link href={`/designers/${user.id}`} className="rounded-xl border px-5 py-3 text-sm hover:bg-zinc-50">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
