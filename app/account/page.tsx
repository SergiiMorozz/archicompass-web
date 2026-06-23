import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export const revalidate = 0;

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login");

  // Если у тебя profiles.id = auth.users.id (типичный кейс), то профиль = user.id
  const myProfileId = user.id;

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Account</h1>
            <p className="mt-2 text-zinc-600">
              You are signed in as <span className="font-medium">{user.email}</span>
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              User ID: <code>{user.id}</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/designers/${myProfileId}`}
              className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
            >
              View my designer profile
            </Link>
            <SignOutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border p-6">
            <div className="font-semibold">Profile tools</div>
            <p className="mt-2 text-sm text-zinc-600">
              Manage the information and portfolio shown on your public designer page.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/account/profile"
                className="rounded-xl bg-black px-4 py-2 text-sm text-white hover:opacity-90"
              >
                Edit profile
              </Link>
              <Link
                href="/account/projects"
                className="rounded-xl border px-4 py-2 text-sm hover:bg-zinc-50"
              >
                Manage projects
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border p-6">
            <div className="font-semibold">Quick links</div>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link className="underline" href="/designers">
                Browse designers
              </Link>
              <Link className="underline" href={`/designers/${myProfileId}`}>
                Open my profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
