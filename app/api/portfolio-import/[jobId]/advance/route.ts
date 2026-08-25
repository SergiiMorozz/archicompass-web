import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { advancePortfolioImportJob } from "@/lib/portfolio-ingestion/advance-job";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { logError } from "@/lib/observability";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const copy = getPortfolioAutopilotCopy().importing;
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  try {
    const updated = await advancePortfolioImportJob(supabase, job);
    return NextResponse.json({ job: updated });
  } catch (error) {
    logError("portfolio_import_advance_failed", {
      jobId,
      message: error instanceof Error ? error.message : "Unknown error",
    });
    const { data: failedJob } = await supabase
      .from("portfolio_import_jobs")
      .update({ status: "FAILED", error: copy.failedHelp })
      .eq("id", job.id)
      .select("*")
      .maybeSingle();

    return NextResponse.json({ job: failedJob ?? { ...job, status: "FAILED", error: copy.failedHelp } });
  }
}
