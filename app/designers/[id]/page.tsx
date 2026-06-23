import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Profile = {
  id: string;
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

type Project = {
  id: string;
  profile_id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
};

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

export default async function DesignerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || !isUuid(id)) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold">Invalid profile</h1>
          <p className="mt-2 text-zinc-600">Invalid id format.</p>
          <Link className="mt-6 inline-block underline" href="/designers">
            ← Back to Designers
          </Link>
        </div>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const isOwner = userData.user?.id === id;

  const { data: profileData, error: pErr } = await supabase
    .from("profiles")
    .select(
      "id, full_name, bio, location, profession_type, user_type, specialties, website, phone, email, hourly_rate, years_experience"
    )
    .eq("id", id)
    .single();

  if (pErr || !profileData) {
    return (
      <main className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <h1 className="text-2xl font-semibold">Profile not found</h1>
          <p className="mt-2 text-zinc-600">{pErr?.message ?? "No data"}</p>
          <Link className="mt-6 inline-block underline" href="/designers">
            ← Back to Designers
          </Link>
        </div>
      </main>
    );
  }

  const profile = profileData as Profile;

  const { data: projects, error: prErr } = await supabase
    .from("projects")
    .select("id, profile_id, title, category, description, image_url, image_path, created_at")
    .eq("profile_id", id)
    .order("created_at", { ascending: false })
    .limit(24);

  const title = profile.full_name || "Unnamed professional";
  const type = profile.profession_type || profile.user_type || "Professional";
  const subtitle = profile.location ? `${type} · ${profile.location}` : type;

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <Link className="text-sm underline" href="/designers">
          ← Back to Designers
        </Link>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-4xl font-semibold">{title}</h1>
            <p className="mt-2 text-zinc-600">{subtitle}</p>

            {profile.specialties?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.specialties.slice(0, 10).map((s) => (
                  <span key={s} className="rounded-full border px-3 py-1 text-xs text-zinc-700">
                    {s}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="w-full max-w-md rounded-2xl border p-5">
            <div className="text-sm font-semibold">Quick info</div>

            <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-zinc-600">Hourly rate</div>
              <div className="text-right">{profile.hourly_rate ?? "n/a"}</div>

              <div className="text-zinc-600">Experience</div>
              <div className="text-right">{profile.years_experience ?? "n/a"}</div>

              <div className="text-zinc-600">Contact</div>
              <div className="text-right">{profile.email || profile.phone || "n/a"}</div>
            </div>

            {isOwner ? (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link
                  href="/account/profile"
                  className="rounded-xl border px-4 py-3 text-center text-sm hover:bg-zinc-50"
                >
                  Edit profile
                </Link>
                <Link
                  href="/account/projects"
                  className="rounded-xl bg-black px-4 py-3 text-center text-sm text-white hover:opacity-90"
                >
                  Manage projects
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a
                  href="#portfolio"
                  className="rounded-xl border px-4 py-3 text-center text-sm hover:bg-zinc-50"
                >
                  View Portfolio
                </a>
                <button className="rounded-xl bg-black px-4 py-3 text-sm text-white hover:opacity-90">
                  Request Estimate
                </button>
              </div>
            )}
          </div>
        </div>

        {isOwner ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
            <div className="font-semibold">Owner mode</div>
            <p className="mt-1">
              You are viewing your own profile. Use the profile and project tools to keep
              your public page up to date.
            </p>
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-zinc-700">{profile.bio || "No bio yet."}</p>
          </div>

          <div className="rounded-2xl border p-6">
            <h2 className="text-lg font-semibold">Contacts</h2>
            <div className="mt-2 text-sm text-zinc-700 space-y-1">
              {profile.email ? <div>Email: {profile.email}</div> : null}
              {profile.phone ? <div>Phone: {profile.phone}</div> : null}
              {profile.website ? <div>Website: {profile.website}</div> : null}
              {!profile.email && !profile.phone && !profile.website ? <div>n/a</div> : null}
            </div>
          </div>
        </div>

        <div id="portfolio" className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Portfolio</h2>
            <div className="text-sm text-zinc-500">{projects?.length ?? 0} projects</div>
          </div>

          {prErr ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              <div className="font-medium">Error loading projects</div>
              <div className="text-sm mt-1">{prErr.message}</div>
            </div>
          ) : !projects?.length ? (
            <div className="mt-4 rounded-2xl border p-6">
              <div className="font-medium">No projects yet</div>
              <div className="mt-2 text-sm text-zinc-600">
                Add rows to <code>projects</code> with this <code>profile_id</code> and refresh.
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(projects as Project[]).map((pr) => (
                <div key={pr.id} className="rounded-2xl border overflow-hidden">
                  <div className="aspect-[4/3] bg-zinc-100">
                    {pr.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pr.image_url} alt={pr.title ?? "Project"} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold">{pr.title || "Untitled project"}</div>
                    <div className="mt-1 text-sm text-zinc-600">{pr.category || "Uncategorized"}</div>
                    {pr.description ? (
                      <p className="mt-2 text-sm text-zinc-700 line-clamp-3">{pr.description}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
