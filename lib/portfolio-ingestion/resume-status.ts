import type { PortfolioImportJob, SupabaseServerClient } from "./job-access";

/** Infers where a FAILED job can safely resume from from what's already in the database, so a retry doesn't redo finished work. */
export async function inferResumeStatus(
  supabase: SupabaseServerClient,
  job: PortfolioImportJob
): Promise<PortfolioImportJob["status"] | null> {
  if (job.source_type === "website") {
    const { count: pageCount } = await supabase
      .from("portfolio_import_pages")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id);
    if (!pageCount) return job.source_url ? "QUEUED" : null;

    const { count: pendingPages } = await supabase
      .from("portfolio_import_pages")
      .select("id", { count: "exact", head: true })
      .eq("job_id", job.id)
      .eq("status", "pending");
    if (pendingPages && pendingPages > 0) return "FETCHING";
  }

  const { count: totalAssets } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id);

  if (!totalAssets) {
    return null;
  }

  const { count: downloadedAssets } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id)
    .not("storage_path", "is", null);
  if ((downloadedAssets ?? 0) < totalAssets) return "EXTRACTING";

  const { count: projectCount } = await supabase
    .from("portfolio_projects")
    .select("id", { count: "exact", head: true })
    .eq("job_id", job.id);
  if (!projectCount) return "GROUPING";

  const { count: analyzedCount } = await supabase
    .from("project_ai_analysis")
    .select("id, portfolio_projects!inner(job_id)", { count: "exact", head: true })
    .eq("status", "done")
    .eq("portfolio_projects.job_id", job.id);
  if ((analyzedCount ?? 0) < projectCount) return "ANALYZING";

  const { data: profile } = await supabase
    .from("designer_intelligence_profiles")
    .select("user_id")
    .eq("user_id", job.user_id)
    .maybeSingle();
  if (!profile) return "BUILDING_PROFILE";

  return "READY_FOR_REVIEW";
}
