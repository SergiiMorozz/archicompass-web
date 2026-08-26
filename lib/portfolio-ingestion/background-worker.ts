import { sendPortfolioImportReadyEmail } from "@/lib/email/portfolio-import-notification";
import { logError, logInfo } from "@/lib/observability";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { advancePortfolioImportJob } from "./advance-job";
import type { PortfolioImportJob, SupabaseServerClient } from "./job-access";

const activeStatuses = ["QUEUED", "FETCHING", "EXTRACTING", "GROUPING", "ANALYZING", "BUILDING_PROFILE"] as const;
const completedStatuses = ["READY_FOR_REVIEW", "PUBLISHED"] as const;
const leaseDurationMs = 65_000;
const emailRetryDelayMs = 15 * 60_000;
const maxCompletionEmailAttempts = 3;

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;
type WorkerSummary = {
  emailSent: number;
  jobId: string | null;
  processedSteps: number;
};

function asJob(value: unknown) {
  return value as PortfolioImportJob;
}

function isActive(job: PortfolioImportJob) {
  return activeStatuses.includes(job.status as (typeof activeStatuses)[number]);
}

function isCompleted(job: PortfolioImportJob) {
  return completedStatuses.includes(job.status as (typeof completedStatuses)[number]);
}

async function claimNextJob(admin: AdminClient) {
  const now = new Date();
  const nowIso = now.toISOString();
  const leaseExpiresAt = new Date(now.getTime() + leaseDurationMs).toISOString();
  const { data, error } = await admin
    .from("portfolio_import_jobs")
    .select("*")
    .in("status", [...activeStatuses])
    .or(`worker_lease_expires_at.is.null,worker_lease_expires_at.lt.${nowIso}`)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) throw error;

  const candidate = data?.[0];
  if (!candidate) return null;
  const { data: claimed, error: claimError } = await admin
    .from("portfolio_import_jobs")
    .update({ worker_lease_expires_at: leaseExpiresAt })
    .eq("id", candidate.id)
    .eq("updated_at", candidate.updated_at)
    .select("*")
    .maybeSingle();
  if (claimError) throw claimError;
  return claimed ? asJob(claimed) : null;
}

async function releaseLease(admin: AdminClient, jobId: string) {
  await admin
    .from("portfolio_import_jobs")
    .update({ worker_lease_expires_at: null })
    .eq("id", jobId);
}

async function releaseForRetry(admin: AdminClient, job: PortfolioImportJob, error: unknown) {
  const message = error instanceof Error ? error.message : "The portfolio import could not be completed.";
  logError("portfolio_import_worker_interrupted", { jobId: job.id, message });

  // The import steps themselves persist expected failures as FAILED. An unexpected
  // worker interruption is retried by the next scheduled run instead of making a
  // recoverable infrastructure problem look permanent to the portfolio owner.
  await admin.from("portfolio_import_jobs").update({ worker_lease_expires_at: null }).eq("id", job.id);
}

async function sendCompletionEmail(admin: AdminClient, rawJob: PortfolioImportJob) {
  if (!isCompleted(rawJob)) return "skipped" as const;
  if (["sent", "skipped", "sending"].includes(rawJob.completion_email_status ?? "pending")) return "skipped" as const;
  if ((rawJob.completion_email_attempts ?? 0) >= maxCompletionEmailAttempts) {
    await admin
      .from("portfolio_import_jobs")
      .update({ completion_email_error: "Maximum delivery attempts reached.", completion_email_status: "skipped" })
      .eq("id", rawJob.id);
    return "skipped" as const;
  }

  const lastAttempt = rawJob.completion_email_last_attempt_at ? new Date(rawJob.completion_email_last_attempt_at).getTime() : 0;
  if (lastAttempt && Date.now() - lastAttempt < emailRetryDelayMs) return "skipped" as const;

  const nowIso = new Date().toISOString();
  const { data: claimed, error: claimError } = await admin
    .from("portfolio_import_jobs")
    .update({
      completion_email_attempts: (rawJob.completion_email_attempts ?? 0) + 1,
      completion_email_error: null,
      completion_email_last_attempt_at: nowIso,
      completion_email_status: "sending",
    })
    .eq("id", rawJob.id)
    .in("completion_email_status", ["pending", "failed"])
    .select("*")
    .maybeSingle();
  if (claimError) throw claimError;
  if (!claimed) return "skipped" as const;

  const [{ data: profile }, { data: authResult }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", rawJob.user_id).maybeSingle(),
    admin.auth.admin.getUserById(rawJob.user_id),
  ]);
  const recipientEmail = authResult?.user?.email;
  if (!recipientEmail) {
    await admin
      .from("portfolio_import_jobs")
      .update({ completion_email_error: "No account email is available.", completion_email_status: "skipped" })
      .eq("id", rawJob.id);
    return "skipped" as const;
  }

  const result = await sendPortfolioImportReadyEmail({
    jobId: rawJob.id,
    locale: rawJob.locale === "en" ? "en" : "pl",
    recipientEmail,
    recipientName: (profile as { full_name?: string | null } | null)?.full_name ?? null,
  });
  const status = result.status === "sent" ? "sent" : result.status === "not_configured" ? "skipped" : "failed";
  await admin
    .from("portfolio_import_jobs")
    .update({
      completion_email_error: result.status === "not_configured" ? "Email delivery is not configured." : result.error,
      completion_email_sent_at: result.status === "sent" ? new Date().toISOString() : null,
      completion_email_status: status,
    })
    .eq("id", rawJob.id);
  if (status === "sent") {
    logInfo("portfolio_import_completion_email_sent", { jobId: rawJob.id });
  } else if (status === "failed") {
    logError("portfolio_import_completion_email_failed", { jobId: rawJob.id, message: result.error ?? "Unknown email error" });
  }
  return status;
}

async function processCompletionEmails(admin: AdminClient) {
  const retryBefore = new Date(Date.now() - emailRetryDelayMs).toISOString();
  const { data, error } = await admin
    .from("portfolio_import_jobs")
    .select("*")
    .in("status", [...completedStatuses])
    .in("completion_email_status", ["pending", "failed"])
    .lt("completion_email_attempts", maxCompletionEmailAttempts)
    .or(`completion_email_last_attempt_at.is.null,completion_email_last_attempt_at.lte.${retryBefore}`)
    .order("updated_at", { ascending: true })
    .limit(10);
  if (error) throw error;

  let sent = 0;
  for (const row of data ?? []) {
    if ((await sendCompletionEmail(admin, asJob(row))) === "sent") sent += 1;
  }
  return sent;
}

export async function runPortfolioImportWorker({ maxDurationMs = 50_000 }: { maxDurationMs?: number } = {}): Promise<WorkerSummary> {
  const admin = createSupabaseAdminClient();
  const summary: WorkerSummary = { emailSent: await processCompletionEmails(admin), jobId: null, processedSteps: 0 };
  const job = await claimNextJob(admin);
  if (!job) return summary;

  summary.jobId = job.id;
  const deadline = Date.now() + Math.max(1_000, maxDurationMs);
  let current = job;
  try {
    while (isActive(current) && Date.now() < deadline) {
      current = await advancePortfolioImportJob(admin as unknown as SupabaseServerClient, current);
      summary.processedSteps += 1;
    }
    if (isCompleted(current) && (await sendCompletionEmail(admin, current)) === "sent") {
      summary.emailSent += 1;
    }
    logInfo("portfolio_import_worker_finished", { jobId: job.id, processedSteps: summary.processedSteps, status: current.status });
  } catch (error) {
    await releaseForRetry(admin, current, error);
  } finally {
    await releaseLease(admin, job.id);
  }
  return summary;
}
