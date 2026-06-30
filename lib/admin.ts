import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminRole = "owner" | "admin";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) redirect("/login?next=/admin");

  const { data: role } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("active", true)
    .in("role", ["owner", "admin"])
    .maybeSingle();

  if (!role) redirect("/");

  return {
    role: role.role as AdminRole,
    supabase,
    user,
  };
}
