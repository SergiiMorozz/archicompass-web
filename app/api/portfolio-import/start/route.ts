import { after, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAccountRole } from "@/lib/studios";
import { UploadAdapter } from "@/lib/portfolio-ingestion/upload-adapter";
import { allowedAssetContentTypes, maxAssetBytes } from "@/lib/portfolio-ingestion/types";
import { extensionFor, safeConsumeActionQuota, stagingBucket } from "@/lib/portfolio-ingestion/job-access";
import { getPortfolioAutopilotCopy } from "@/content/portfolio-autopilot-copy";
import { logError, logInfo } from "@/lib/observability";
import { siteLocale } from "@/lib/site-locale";
import { runPortfolioImportWorker } from "@/lib/portfolio-ingestion/background-worker";

const dailyImportStartLimit = 20;
const maxUploadFiles = 40;

export const maxDuration = 60;

function continueInBackground(jobId: string) {
  after(async () => {
    try {
      await runPortfolioImportWorker({ maxDurationMs: 50_000 });
    } catch (error) {
      logError("portfolio_import_background_start_failed", {
        jobId,
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });
}

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function fileValues(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => typeof value !== "string" && value.size > 0);
}

function normalizedWebsiteUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProtocol).toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const copy = getPortfolioAutopilotCopy().start;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: copy.errors.unauthenticated }, { status: 401 });
  if ((await getAccountRole(supabase, user.id)) !== "designer") {
    return NextResponse.json({ error: copy.errors.unauthenticated }, { status: 403 });
  }

  const formData = await request.formData();
  const sourceType = textValue(formData, "source_type");
  if (sourceType !== "website" && sourceType !== "upload") {
    return NextResponse.json({ error: copy.errors.sourceRequired }, { status: 400 });
  }
  if (textValue(formData, "rights_confirmed") !== "true") {
    return NextResponse.json({ error: copy.errors.rightsRequired }, { status: 400 });
  }

  const websiteUrl = sourceType === "website" ? normalizedWebsiteUrl(textValue(formData, "source_url") ?? "") : null;
  const files = sourceType === "upload" ? fileValues(formData, "portfolio_files") : [];

  if (sourceType === "website" && !websiteUrl) {
    return NextResponse.json({ error: copy.errors.invalidUrl }, { status: 400 });
  }
  if (sourceType === "upload" && !files.length) {
    return NextResponse.json({ error: copy.errors.sourceRequired }, { status: 400 });
  }
  if (files.length > maxUploadFiles) {
    return NextResponse.json({ error: copy.errors.tooManyFiles(maxUploadFiles) }, { status: 400 });
  }
  if (files.some((file) => !allowedAssetContentTypes.has(file.type) || file.size > maxAssetBytes)) {
    return NextResponse.json({ error: copy.errors.unsupportedFiles }, { status: 400 });
  }

  const { error: quotaError, allowed } = await safeConsumeActionQuota(
    user.id,
    "portfolio_import_start",
    dailyImportStartLimit
  );
  if (quotaError || !allowed) {
    return NextResponse.json({ error: copy.errors.genericFailure }, { status: 429 });
  }

  const nowIso = new Date().toISOString();

  if (sourceType === "website") {
    const { data: job, error } = await supabase
      .from("portfolio_import_jobs")
      .insert({
        user_id: user.id,
        source_type: "website",
        source_url: websiteUrl,
        status: "QUEUED",
        locale: siteLocale,
        rights_confirmed_at: nowIso,
      })
      .select("id")
      .single();
    if (error || !job) return NextResponse.json({ error: copy.errors.genericFailure }, { status: 500 });

    await trackImportStarted(user.id, job.id, "website");
    continueInBackground(job.id);
    return NextResponse.json({ jobId: job.id });
  }

  const { data: job, error: jobError } = await supabase
    .from("portfolio_import_jobs")
    .insert({
      user_id: user.id,
      source_type: "upload",
      status: "GROUPING",
      locale: siteLocale,
      rights_confirmed_at: nowIso,
    })
    .select("id")
    .single();
  if (jobError || !job) return NextResponse.json({ error: copy.errors.genericFailure }, { status: 500 });

  let storedCount = 0;
  const adapter = new UploadAdapter(files);
  for await (const candidate of adapter.discover()) {
    const path = `${user.id}/${job.id}/${crypto.randomUUID()}.${extensionFor(candidate.contentType)}`;
    const { error: uploadError } = await supabase.storage
      .from(stagingBucket)
      .upload(path, candidate.bytes, { contentType: candidate.contentType, upsert: false });
    if (uploadError) continue;

    const { error: insertError } = await supabase.from("portfolio_assets").insert({
      job_id: job.id,
      storage_path: path,
      alt_text: candidate.altText,
      content_hash: candidate.contentHash,
    });
    if (insertError) continue;
    storedCount += 1;
  }

  if (!storedCount) {
    await supabase
      .from("portfolio_import_jobs")
      .update({ status: "FAILED", error: copy.errors.sourceRequired })
      .eq("id", job.id);
    return NextResponse.json({ error: copy.errors.sourceRequired }, { status: 400 });
  }

  await supabase.from("portfolio_import_jobs").update({ images_found: storedCount }).eq("id", job.id);
  await trackImportStarted(user.id, job.id, "upload", storedCount);
  continueInBackground(job.id);
  return NextResponse.json({ jobId: job.id });
}

async function trackImportStarted(userId: string, jobId: string, sourceType: string, imagesFound?: number) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("product_events").insert({
      event_type: "portfolio_import_started",
      actor_id: userId,
      entity_id: jobId,
      metadata: { source_type: sourceType, images_found: imagesFound ?? null },
    });
    logInfo("portfolio_import_started", { userId, jobId, sourceType });
  } catch {
    logError("portfolio_import_started_metric_write_failed", { jobId });
  }
}
