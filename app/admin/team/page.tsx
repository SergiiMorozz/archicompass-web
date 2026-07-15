import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { getWorkspaceCopy } from "@/content/workspace-copy";

export const revalidate = 0;

type StaffMember = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  role: "owner" | "admin";
  active: boolean;
  permissions: string[] | null;
  created_at: string;
};

const permissionOptions = [
  "users",
  "moderation",
  "content",
  "analytics",
  "team",
  "finance",
] as const;

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
  const permissions = formData
    .getAll("permissions")
    .filter((value): value is string => typeof value === "string");
  if (!email || !email.includes("@")) teamError("Wpisz prawidłowy e-mail konta ArchiCompass.");
  if (action !== "grant" && action !== "revoke") teamError("Wybierz prawidłową akcję dostępu.");

  const { error } = await supabase.rpc("admin_set_staff_access", {
    target_active: action === "grant",
    target_email: email,
    target_permissions: action === "grant" ? permissions : [],
  });
  if (error) teamError(error.message);

  revalidatePath("/admin/team");
  revalidatePath("/admin/activity");
  redirect(`/admin/team?${action === "grant" ? "granted" : "revoked"}=1`);
}

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
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
  const copy = getWorkspaceCopy().adminTeam;
  const { supabase, role } = await requireAdmin();
  if (role !== "owner") redirect("/admin");
  const { data, error } = await supabase.rpc("admin_staff_directory");
  const staff = (data ?? []) as StaffMember[];

  return (
    <main>
      <section className="border-b border-line bg-card px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-sm font-semibold text-primary">{copy.accessControl}</div>
          <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{copy.title}</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            {copy.intro}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-7 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {sp.granted || sp.revoked ? (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              {sp.granted ? copy.accessGranted : copy.accessRevoked}
            </div>
          ) : null}
          {sp.error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {sp.error}
            </div>
          ) : null}
          {error ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {copy.loadError}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-line bg-card shadow-sm">
            {staff.length ? staff.map((member) => (
              <article key={member.user_id} className="flex flex-col gap-4 border-b border-line p-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{member.full_name || member.email || copy.unnamedAccount}</span>
                    <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                      {member.role === "owner" ? copy.owner : copy.admin}
                    </span>
                    <span className={[
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      member.active ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
                    ].join(" ")}>
                      {member.active ? copy.active : copy.revoked}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-muted">
                    {member.email || copy.noEmail} | {copy.added} {formatDate(member.created_at, copy.dateLocale)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(member.permissions?.length ? member.permissions : permissionOptions).map((permission) => (
                      <span key={permission} className="rounded-full border border-line bg-background px-2.5 py-1 text-xs font-semibold text-muted">
                        {copy.permissions[permission] ?? permission}
                      </span>
                    ))}
                  </div>
                </div>
                {member.role === "admin" && member.active && member.email ? (
                  <form action={setStaffAccess}>
                    <input type="hidden" name="email" value={member.email} />
                    <input type="hidden" name="access_action" value="revoke" />
                    <button className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                      {copy.revokeAccess}
                    </button>
                  </form>
                ) : member.role === "admin" && member.email ? (
                  <form action={setStaffAccess}>
                    <input type="hidden" name="email" value={member.email} />
                    <input type="hidden" name="access_action" value="grant" />
                    <button className="rounded-xl border border-line bg-background px-4 py-2.5 text-sm font-semibold text-primary">
                      {copy.restoreAccess}
                    </button>
                  </form>
                ) : null}
              </article>
            )) : (
              <div className="p-6 text-sm text-muted">{copy.noAdmins}</div>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <div className="text-sm font-semibold text-primary">{copy.addAdmin}</div>
          <h2 className="mt-1 text-2xl font-bold">{copy.grantAccess}</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            {copy.instructions}
          </p>
          <form action={setStaffAccess} className="mt-5 grid gap-4">
            <input type="hidden" name="access_action" value="grant" />
            <label className="text-sm font-semibold">
              {copy.emailLabel}
              <input
                name="email"
                type="email"
                required
                placeholder="admin@archicompass.pl"
                className="mt-2 w-full rounded-xl border border-line bg-background px-4 py-3 font-normal outline-none focus:border-primary"
              />
            </label>
            <fieldset>
              <legend className="text-sm font-semibold">{copy.accessScope}</legend>
              <div className="mt-3 grid gap-2">
                {permissionOptions.map((value) => (
                  <label key={value} className="flex items-center gap-3 rounded-xl border border-line bg-background px-3 py-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      name="permissions"
                      value={value}
                      defaultChecked
                      className="h-4 w-4 accent-primary"
                    />
                    {copy.permissions[value]}
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              {copy.grantAdminAccess}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
