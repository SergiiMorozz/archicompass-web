import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  loadOwnedJob,
  extensionFor,
  publicProjectImagesBucket,
  safeConsumeActionQuota,
  stagingBucket,
} from "@/lib/portfolio-ingestion/job-access";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { logError } from "@/lib/observability";

const dailyAssistantPublishLimit = 20;

type TransferableAsset = {
  id: string;
  storage_path: string | null;
};

function errorKind(error: unknown) {
  if (!error || typeof error !== "object") return "unknown";
  const details = error as { code?: unknown; statusCode?: unknown; name?: unknown };
  if (typeof details.code === "string") return details.code;
  if (typeof details.statusCode === "string" || typeof details.statusCode === "number") return String(details.statusCode);
  if (typeof details.name === "string") return details.name;
  return "unknown";
}

async function removeUploadedImages(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  imagePaths: string[],
  jobId: string,
  projectId: string
) {
  if (!imagePaths.length) return;
  const { error } = await supabase.storage.from(publicProjectImagesBucket).remove(imagePaths);
  if (error) {
    logError("portfolio_autopilot_publish_cleanup_failed", {
      jobId,
      projectId,
      errorKind: errorKind(error),
    });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const copy = getPortfolioAutopilotCopy().review;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });
  if (job.status !== "READY_FOR_REVIEW") {
    return NextResponse.json({ error: "This import is not ready to publish yet." }, { status: 400 });
  }

  const { data: keptProjects, error: keptError } = await supabase
    .from("portfolio_projects")
    .select("id, suggested_title, custom_summary, published_project_id, project_ai_analysis(result)")
    .eq("job_id", jobId)
    .eq("status", "kept");
  if (keptError) {
    logError("portfolio_autopilot_publish_projects_read_failed", { jobId, errorKind: errorKind(keptError) });
    return NextResponse.json({ error: copy.publishFailed }, { status: 500 });
  }
  if (!keptProjects?.length) return NextResponse.json({ error: copy.noKeptProjects }, { status: 400 });

  const toPublish = keptProjects.filter((project) => !project.published_project_id);
  let publishedCount = keptProjects.length - toPublish.length;
  let quotaExhausted = false;
  let publishFailed = false;

  for (const project of toPublish) {
    const { data: assets, error: assetsError } = await supabase
      .from("portfolio_assets")
      .select("id, storage_path")
      .eq("cluster_project_id", project.id)
      .eq("selected", true)
      .not("storage_path", "is", null);
    if (assetsError) {
      publishFailed = true;
      logError("portfolio_autopilot_publish_assets_read_failed", {
        jobId,
        projectId: project.id,
        errorKind: errorKind(assetsError),
      });
      continue;
    }
    if (!assets?.length) {
      publishFailed = true;
      logError("portfolio_autopilot_publish_project_without_assets", { jobId, projectId: project.id });
      continue;
    }

    const preparedAssets: { contentType: string; file: Blob }[] = [];
    for (const asset of assets as TransferableAsset[]) {
      if (!asset.storage_path) continue;
      const { data: file, error: downloadError } = await supabase.storage.from(stagingBucket).download(asset.storage_path);
      if (!file || downloadError) {
        publishFailed = true;
        logError("portfolio_autopilot_publish_asset_download_failed", {
          jobId,
          projectId: project.id,
          errorKind: errorKind(downloadError),
        });
        continue;
      }
      preparedAssets.push({ contentType: file.type || "image/jpeg", file });
    }
    if (!preparedAssets.length) continue;

    // This is a distinct, owner-approved bulk flow. It must not inherit a
    // previously exhausted manual-project quota, and it runs only after the
    // selected files proved readable so a failed read cannot consume a slot.
    const { allowed } = await safeConsumeActionQuota(user.id, "portfolio_autopilot_publish", dailyAssistantPublishLimit);
    if (!allowed) {
      quotaExhausted = true;
      break;
    }

    const imagePaths: string[] = [];
    const imageUrls: string[] = [];
    for (const asset of preparedAssets) {
      const publicPath = `${user.id}/${crypto.randomUUID()}.${extensionFor(asset.contentType)}`;
      const { error: uploadError } = await supabase.storage
        .from(publicProjectImagesBucket)
        .upload(publicPath, asset.file, { contentType: asset.contentType, upsert: false });
      if (uploadError) {
        publishFailed = true;
        logError("portfolio_autopilot_publish_asset_upload_failed", {
          jobId,
          projectId: project.id,
          errorKind: errorKind(uploadError),
        });
        continue;
      }
      imagePaths.push(publicPath);
      imageUrls.push(supabase.storage.from(publicProjectImagesBucket).getPublicUrl(publicPath).data.publicUrl);
    }
    if (!imagePaths.length) continue;

    const analysis = Array.isArray(project.project_ai_analysis) ? project.project_ai_analysis[0] : project.project_ai_analysis;
    const aiSummary = (analysis?.result as { summary?: string } | null)?.summary ?? null;
    const description = project.custom_summary?.trim() || aiSummary?.trim() || null;

    const { data: inserted, error: insertError } = await supabase
      .from("projects")
      .insert({
        id: crypto.randomUUID(),
        profile_id: user.id,
        title: project.suggested_title?.trim() || "Untitled project",
        description,
        image_url: imageUrls[0],
        image_path: imagePaths[0],
        image_urls: imageUrls,
        image_paths: imagePaths,
    })
      .select("id")
      .single();
    if (insertError || !inserted) {
      publishFailed = true;
      logError("portfolio_autopilot_publish_project_insert_failed", {
        jobId,
        projectId: project.id,
        errorKind: errorKind(insertError),
      });
      await removeUploadedImages(supabase, imagePaths, jobId, project.id);
      continue;
    }

    const { error: linkError } = await supabase
      .from("portfolio_projects")
      .update({ published_project_id: inserted.id, status: "published" })
      .eq("id", project.id)
      .eq("job_id", jobId);
    if (linkError) {
      publishFailed = true;
      logError("portfolio_autopilot_publish_project_link_failed", {
        jobId,
        projectId: project.id,
        errorKind: errorKind(linkError),
      });
      const { error: rollbackError } = await supabase.from("projects").delete().eq("id", inserted.id).eq("profile_id", user.id);
      if (rollbackError) {
        logError("portfolio_autopilot_publish_project_rollback_failed", {
          jobId,
          projectId: project.id,
          errorKind: errorKind(rollbackError),
        });
      } else {
        await removeUploadedImages(supabase, imagePaths, jobId, project.id);
      }
      continue;
    }
    publishedCount += 1;
  }

  const allPublished = !quotaExhausted && !publishFailed && publishedCount >= keptProjects.length;
  if (allPublished) {
    await supabase.from("portfolio_import_jobs").update({ status: "PUBLISHED" }).eq("id", jobId);
    try {
      const admin = createSupabaseAdminClient();
      await admin.from("product_events").insert({
        event_type: "portfolio_autopilot_profile_published",
        actor_id: user.id,
        entity_id: jobId,
        metadata: { published_count: publishedCount },
      });
    } catch {
      logError("portfolio_autopilot_publish_metric_write_failed", { jobId });
    }
  }

  const error = quotaExhausted
    ? copy.publishQuotaReached
    : !allPublished
      ? publishedCount > 0
        ? copy.publishPartial(publishedCount, keptProjects.length)
        : copy.publishFailed
      : undefined;

  return NextResponse.json(
    {
      publishedCount,
      totalKept: keptProjects.length,
      allPublished,
      quotaExhausted,
      error,
    },
    { status: allPublished ? 200 : quotaExhausted ? 429 : 500 }
  );
}
