import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function DesignerProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, bio, location, profession_type, user_type, specialties, website, phone")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-semibold">Profile not found</h1>
        <p className="mt-2 text-zinc-600">{error?.message ?? "No data"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold">{data.full_name || "Unnamed"}</h1>
        <p className="mt-2 text-zinc-600">
          {(data.role || "Professional") + (data.city ? ` · ${data.city}` : "")}
        </p>

        <div className="mt-6 rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="mt-2 text-zinc-700">{data.bio || "No bio yet."}</p>
        </div>
      </div>
    </main>
  );
}
