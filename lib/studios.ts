import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AccountRole = "client" | "designer";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type StudioMembership = {
  studio_id: string;
  user_id: string;
  role: "owner" | "admin" | "designer";
  status: "pending" | "active";
};

export async function getAccountRole(
  supabase: SupabaseServerClient,
  userId: string
): Promise<AccountRole> {
  const { data } = await supabase
    .from("account_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  return data?.role === "designer" ? "designer" : "client";
}

export async function getStudioMemberships(
  supabase: SupabaseServerClient,
  userId: string,
  status?: StudioMembership["status"]
) {
  let query = supabase
    .from("studio_members")
    .select("studio_id, user_id, role, status")
    .eq("user_id", userId);

  if (status) query = query.eq("status", status);

  const { data, error } = await query.order("created_at", { ascending: true });
  return { data: (data ?? []) as StudioMembership[], error };
}

export function inquiryRecipientFilter(userId: string, studioIds: string[]) {
  if (!studioIds.length) return `designer_id.eq.${userId}`;
  return `designer_id.eq.${userId},studio_id.in.(${studioIds.join(",")})`;
}
