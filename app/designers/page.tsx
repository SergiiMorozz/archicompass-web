import { supabase } from "@/lib/supabase";

export const revalidate = 0;

type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  profession_type: string | null;
  user_type: string | null;
  specialties: string[] | null;
};

export default async function DesignersPage() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, bio, location, profession_type, user_type, specialties")
    .order("created_at", { ascending: false })
    .limit(50);

  const profiles = (data ?? []) as Profile[];

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold">Designers</h1>
        <p className="mt-2 text-zinc-600">Browse professionals from our database.</p>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="font-medium">Error loading profiles</div>
            <div className="text-sm mt-1">{error.message}</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="mt-6 rounded-xl border p-6">
            <div className="font-medium">No profiles yet</div>
            <div className="mt-2 text-sm text-zinc-600">
              Add at least 1 row in <code>profiles</code> and refresh this page.
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profiles.map((p) => {
              const title = p.full_name || "Unnamed professional";
              const type = p.profession_type || p.user_type || "Professional";
              const subtitle = p.location ? `${type} · ${p.location}` : type;

              return (
                <div key={p.id} className="rounded-2xl border p-5">
                  <div className="text-lg font-semibold">{title}</div>
                  <div className="mt-1 text-sm text-zinc-600">{subtitle}</div>

                  {p.specialties && p.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {p.specialties.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="rounded-full border px-3 py-1 text-xs text-zinc-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="mt-3 text-sm text-zinc-700">
                    {p.bio ? p.bio : <span className="text-zinc-500">No bio yet.</span>}
                  </p>

                  <a className="mt-4 inline-block text-sm underline" href={`/designers/${p.id}`}>
                    View profile →
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
