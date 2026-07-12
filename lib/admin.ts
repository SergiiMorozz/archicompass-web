import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "admin";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getActiveAdminRole(supabase: SupabaseServerClient, userId: string) {
  const { data } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("active", true)
    .in("role", ["owner", "admin"])
    .maybeSingle();

  return data?.role ? (data.role as AdminRole) : null;
}

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login?next=/admin");

  const role = await getActiveAdminRole(supabase, user.id);

  if (!role) redirect("/");

  return {
    role,
    supabase,
    user,
  };
}
