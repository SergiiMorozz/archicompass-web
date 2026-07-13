import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "admin";
export const adminPermissions = [
  "users",
  "moderation",
  "content",
  "analytics",
  "team",
  "finance",
] as const;
export type AdminPermission = (typeof adminPermissions)[number];

export type AdminAccess = {
  role: AdminRole;
  permissions: AdminPermission[];
};

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getActiveAdminAccess(
  supabase: SupabaseServerClient,
  userId: string
): Promise<AdminAccess | null> {
  const { data } = await supabase
    .from("admin_roles")
    .select("role, permissions")
    .eq("user_id", userId)
    .eq("active", true)
    .in("role", ["owner", "admin"])
    .maybeSingle();

  if (!data?.role) return null;

  const role = data.role as AdminRole;
  const persistedPermissions: unknown[] = Array.isArray(data.permissions) ? data.permissions : [];
  const permissions = role === "owner"
    ? [...adminPermissions]
    : persistedPermissions.filter(
        (permission: unknown): permission is AdminPermission =>
          typeof permission === "string" && adminPermissions.includes(permission as AdminPermission)
      );
  return { role, permissions };
}

export async function getActiveAdminRole(supabase: SupabaseServerClient, userId: string) {
  return (await getActiveAdminAccess(supabase, userId))?.role ?? null;
}

export function hasAdminPermission(access: AdminAccess, permission: AdminPermission) {
  return access.role === "owner" || access.permissions.includes(permission);
}

export async function requireAdmin(required?: AdminPermission | AdminPermission[]) {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login?next=/admin");

  const access = await getActiveAdminAccess(supabase, user.id);

  if (!access) redirect("/");
  const requiredPermissions = required ? (Array.isArray(required) ? required : [required]) : [];
  if (requiredPermissions.length && !requiredPermissions.some((permission) => hasAdminPermission(access, permission))) {
    redirect("/admin?error=Brak%20wymaganego%20zakresu%20dost%C4%99pu");
  }

  return {
    ...access,
    supabase,
    user,
  };
}
