import { after, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveAdminRole } from "@/lib/admin";
import { inferResumeStatus } from "@/lib/portfolio-ingestion/resume-status";
import type { PortfolioImportJob } from "@/lib/portfolio-ingestion/job-access";
import { runPortfolioImportWorker } from "@/lib/portfolio-ingestion/background-worker";

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const { data: job } = await supabase.from("portfolio_import_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const isOwner = job.user_id === user.id;
  const isAdmin = isOwner ? false : Boolean(await getActiveAdminRole(supabase, user.id));
  if (!isOwner && !isAdmin) return NextResponse.json({ error: "Import job not found." }, { status: 404 });
  if (job.status !== "FAILED") return NextResponse.json({ error: "Only a failed import can be retried." }, { status: 400 });

  const resumeStatus = await inferResumeStatus(supabase, job as PortfolioImportJob);
  if (!resumeStatus) {
    return NextResponse.json({ error: "This import has no recoverable progress. Start a new import instead." }, { status: 400 });
  }

  // Admin retries write through the service-role client: the owner-only RLS
  // update policy intentionally does not grant admins write access, only read.
  let writer = supabase;
  if (isAdmin) {
    try {
      writer = createSupabaseAdminClient();
    } catch {
      return NextResponse.json({ error: "Admin write access is not configured." }, { status: 500 });
    }
  }
  const { data: updated, error } = await writer
    .from("portfolio_import_jobs")
    .update({
      status: resumeStatus,
      error: null,
      worker_lease_expires_at: null,
      completion_email_status: "pending",
      completion_email_attempts: 0,
      completion_email_error: null,
      completion_email_last_attempt_at: null,
      completion_email_sent_at: null,
    })
    .eq("id", jobId)
    .select("*")
    .single();
  if (error || !updated) return NextResponse.json({ error: "Could not retry the import." }, { status: 500 });

  after(async () => {
    try {
      await runPortfolioImportWorker({ maxDurationMs: 50_000 });
    } catch {
      // The scheduled worker will retry this durable job even if this nudge fails.
    }
  });

  return NextResponse.json({ job: updated });
}
