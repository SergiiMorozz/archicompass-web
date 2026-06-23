import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

type Project = {
  id: string;
  title: string | null;
  category: string | null;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function addProject(formData: FormData) {
  "use server";

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const title = textValue(formData, "title");
  if (!title) redirect("/account/projects?error=Project%20title%20is%20required");

  const { error } = await supabase.from("projects").insert({
    id: crypto.randomUUID(),
    profile_id: user.id,
    title,
    category: textValue(formData, "category"),
    description: textValue(formData, "description"),
    image_url: textValue(formData, "image_url"),
  });

  if (error) redirect(`/account/projects?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/account/projects");
  revalidatePath(`/designers/${user.id}`);
  redirect("/account/projects?created=1");
}

export default async function ManageProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; created?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, title, category, description, image_url, created_at")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link href="/account" className="text-sm underline">
          ← Back to account
        </Link>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Manage projects</h1>
            <p className="mt-2 text-zinc-600">
              Add portfolio examples that will appear on your public profile.
            </p>
          </div>
          <Link href={`/designers/${user.id}`} className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50">
            View public profile
          </Link>
        </div>

        {sp.error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {sp.error}
          </div>
        ) : sp.created ? (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            Project added.
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <section>
            <h2 className="text-xl font-semibold">Your projects</h2>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error.message}
              </div>
            ) : !projects?.length ? (
              <div className="mt-4 rounded-2xl border p-6 text-sm text-zinc-600">
                No projects yet. Add your first portfolio example.
              </div>
            ) : (
              <div className="mt-4 grid gap-4">
                {(projects as Project[]).map((project) => (
                  <div key={project.id} className="rounded-2xl border p-5">
                    <div className="font-semibold">{project.title || "Untitled project"}</div>
                    <div className="mt-1 text-sm text-zinc-600">
                      {project.category || "Uncategorized"}
                    </div>
                    {project.description ? (
                      <p className="mt-2 text-sm text-zinc-700">{project.description}</p>
                    ) : null}
                    {project.image_url ? (
                      <a
                        href={project.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm underline"
                      >
                        Open image
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border p-6">
            <h2 className="text-xl font-semibold">Add project</h2>
            <form action={addProject} className="mt-5 grid gap-4">
              <label className="text-sm">
                <span className="text-zinc-600">Title</span>
                <input name="title" className="mt-1 w-full rounded-xl border px-3 py-2" />
              </label>

              <label className="text-sm">
                <span className="text-zinc-600">Category</span>
                <input
                  name="category"
                  placeholder="Apartment, house, office..."
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </label>

              <label className="text-sm">
                <span className="text-zinc-600">Image URL</span>
                <input
                  name="image_url"
                  placeholder="https://"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </label>

              <label className="text-sm">
                <span className="text-zinc-600">Description</span>
                <textarea
                  name="description"
                  rows={5}
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl bg-black px-5 py-3 text-sm text-white hover:opacity-90"
              >
                Add project
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}
