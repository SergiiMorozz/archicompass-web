import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type QuotaResult = { allowed: boolean; remaining: number; reset_at: string };

export async function consumeActionQuota(actorId: string, actionKey: string, dailyLimit: number) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("consume_action_quota", {
    target_actor_id: actorId,
    target_action_key: actionKey,
    daily_limit: dailyLimit,
  });

  if (error) return { error, allowed: null as boolean | null };
  const quota = Array.isArray(data) ? (data[0] as QuotaResult | undefined) : undefined;
  return { error: null, allowed: quota?.allowed ?? null };
}
