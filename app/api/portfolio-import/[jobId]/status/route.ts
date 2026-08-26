import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnedJob } from "@/lib/portfolio-ingestion/job-access";
import { stagingAssetPreviewUrls } from "@/lib/portfolio-ingestion/asset-previews";

export async function GET(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const { data: assets } = await supabase
    .from("portfolio_assets")
    .select("id, storage_path, alt_text")
    .eq("job_id", jobId)
    .not("storage_path", "is", null)
    .limit(4);
  const paths = (assets ?? []).map((asset) => asset.storage_path).filter((path): path is string => Boolean(path));
  const signedUrls = await stagingAssetPreviewUrls(supabase, paths);
  const previews = (assets ?? [])
    .map((asset) => ({ id: asset.id, url: asset.storage_path ? signedUrls.get(asset.storage_path) ?? null : null, altText: asset.alt_text }))
    .filter((asset): asset is { id: string; url: string; altText: string | null } => Boolean(asset.url));

  return NextResponse.json({ job, previews });
}
