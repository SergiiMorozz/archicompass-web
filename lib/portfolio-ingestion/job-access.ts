import { createSupabaseServerClient } from "@/lib/supabase/server";
import { consumeActionQuota } from "@/lib/action-quota";
import { logError } from "@/lib/observability";

export type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type PortfolioImportJob = {
  id: string;
  user_id: string;
  source_type: "website" | "upload";
  source_url: string | null;
  status:
    | "QUEUED"
    | "FETCHING"
    | "EXTRACTING"
    | "GROUPING"
    | "ANALYZING"
    | "BUILDING_PROFILE"
    | "READY_FOR_REVIEW"
    | "FAILED"
    | "PUBLISHED";
  error: string | null;
  locale: "pl" | "en" | null;
  images_found: number;
  projects_found: number;
  rights_confirmed_at: string | null;
  discovered_social_links: { instagram?: string; facebook?: string; behance?: string; linkedin?: string };
  discovered_contact_facts: {
    fullName?: string;
    phone?: string;
    email?: string;
    location?: string;
    languages?: string[];
    workModes?: string[];
    explicitServiceCapabilities?: string[];
  };
  worker_lease_expires_at: string | null;
  completion_email_status: "pending" | "sending" | "sent" | "failed" | "skipped" | null;
  completion_email_attempts: number;
  completion_email_last_attempt_at: string | null;
  completion_email_sent_at: string | null;
  completion_email_error: string | null;
  created_at: string;
  updated_at: string;
};

export async function loadOwnedJob(supabase: SupabaseServerClient, jobId: string, userId: string) {
  const { data, error } = await supabase
    .from("portfolio_import_jobs")
    .select("*")
    .eq("id", jobId)
    .maybeSingle();
  if (error || !data || data.user_id !== userId) return null;
  return data as PortfolioImportJob;
}

export function extensionFor(contentType: string) {
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  return "jpg";
}

export const stagingBucket = "portfolio-import-staging";
export const publicProjectImagesBucket = "project-images";

/**
 * consumeActionQuota() throws synchronously if SUPABASE_SERVICE_ROLE_KEY is
 * missing (createSupabaseAdminClient()'s guard) rather than returning an
 * error - a misconfigured environment must not crash the request with a raw
 * 500, so callers use this wrapper instead of calling it directly.
 */
export async function safeConsumeActionQuota(actorId: string, actionKey: string, dailyLimit: number) {
  try {
    return await consumeActionQuota(actorId, actionKey, dailyLimit);
  } catch (reason) {
    logError("action_quota_unavailable", { actionKey, message: reason instanceof Error ? reason.message : String(reason) });
    return { error: reason instanceof Error ? reason : new Error(String(reason)), allowed: null as boolean | null };
  }
}
