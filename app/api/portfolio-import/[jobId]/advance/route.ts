import { after, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { logError } from "@/lib/observability";
import { runPortfolioImportWorker } from "@/lib/portfolio-ingestion/background-worker";

export const maxDuration = 60;

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  // Kept for existing open tabs. Advancing is no longer performed by the
  // browser: this endpoint only gives the durable server worker an immediate nudge.
  after(async () => {
    try {
      await runPortfolioImportWorker({ maxDurationMs: 50_000 });
    } catch (error) {
      logError("portfolio_import_background_nudge_failed", {
        jobId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return NextResponse.json({ job });
}
