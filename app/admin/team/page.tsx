import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";

export const revalidate = 0;

type StaffMember = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "admin";
  active: boolean;
  created_at: string;
};

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function teamError(message: string): never {
  redirect(`/admin/team?error=${encodeURIComponent(message)}`);
}

async function setStaffAccess(formData: FormData) {
  "use server";

  const { supabase, role } = await requireAdmin();
  if (role !== "owner") redirect("/admin");
  const email = textValue(formData, "email").toLowerCase();
  const action = textValue(formData, "access_action");
  if (!email || !email.includes("@")) teamError("Enter a valid ArchiCompass account email.");
  if (action !== "grant" && action !== "revoke") teamError("Choose a valid access action.");

  const { error } = await supabase.rpc("admin_set_staff_access", {
    target_active: action === "grant",
    target_email: email,
  });
  if (error) teamError(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/admin/activity");
  redirect(`/admin/team?${action === "grant" ? "granted" : "revoked"}=1`);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; granted?: string; revoked?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const { supabase, role } = await requireAdmin();
  if (role !== "owner") redirect("/admin");
  const { data, error } = await supabase.rpc("admin_staff_directory");
  const staff = (data ?? []) as StaffMember[];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">Access control</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Admin team</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Grant trusted employees access to users, moderation, content, statistics, and
            administrative activity.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {sp.granted || sp.revoked ? (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {sp.granted ? "Administrator access granted." : "Administrator access revoked."}
            </div>
          ) : null}
          {sp.error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {sp.error}
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Team access could not be loaded. Apply the Admin Team database migration first.
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
            {staff.length ? staff.map((member) => (
              <article key={member.user_id} className="flex flex-col gap-4 border-b border-line p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{member.full_name || member.email || "Unnamed account"}</span>
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                      {member.role}
                    </span>
                    <span className={[
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      member.active ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
                    ].join(" ")}>
                      {member.active ? "Active" : "Revoked"}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {member.email || "No email"} | Added {formatDate(member.created_at)}
                  </div>
                </div>
                {member.role === "admin" && member.active && member.email ? (
                  <form action={setStaffAccess}>
                    <input type="hidden" name="email" value={member.email} />
                    <input type="hidden" name="access_action" value="revoke" />
                    <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                      Revoke access
                    </button>
                  </form>
                ) : member.role === "admin" && member.email ? (
                  <form action={setStaffAccess}>
                    <input type="hidden" name="email" value={member.email} />
                    <input type="hidden" name="access_action" value="grant" />
                    <button className="rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-semibold text-primary">
                      Restore access
                    </button>
                  </form>
                ) : null}
              </article>
            )) : (
              <div className="p-6 text-sm text-muted">No administrative accounts found.</div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">Add administrator</div>
          <h2 className="mt-1 text-2xl font-bold">Grant full access</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The employee must first create an ArchiCompass account. Full administrators can
            access user records, moderation, content tools, statistics, and the activity log.
          </p>
          <form action={setStaffAccess} className="mt-5 grid gap-4">
            <input type="hidden" name="access_action" value="grant" />
            <label className="text-sm font-semibold">
              Account email
              <input
                name="email"
                type="email"
                required
                placeholder="employee@company.com"
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary"
              />
            </label>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Grant administrator access
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
