import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { loadOwnedJob, extensionFor, stagingBucket } from "@/lib/portfolio-ingestion/job-access";
import { stagingAssetPreviewUrls } from "@/lib/portfolio-ingestion/asset-previews";
import { allowedAssetContentTypes, maxAssetBytes, maxAssetsDiscoveredPerJob } from "@/lib/portfolio-ingestion/types";
import { publicTextError } from "@/lib/content-moderation";
import { logError } from "@/lib/observability";

type ReviewPatchBody = {
  type?: unknown;
  projectId?: unknown;
  assetId?: unknown;
  status?: unknown;
  isFeatured?: unknown;
  suggestedTitle?: unknown;
  customSummary?: unknown;
  roomTypes?: unknown;
  selected?: unknown;
};

const allowedProjectStatuses = new Set(["pending_review", "kept", "hidden"]);
const maxTagCount = 12;
const maxTagLength = 40;

async function trackEvent(actorId: string, eventType: string, entityId: string) {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("product_events").insert({ event_type: eventType, actor_id: actorId, entity_id: entityId, metadata: {} });
  } catch {
    logError("portfolio_review_metric_write_failed", { eventType, entityId });
  }
}

function cleanTags(input: unknown) {
  if (!Array.isArray(input)) return null;
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of input) {
    if (typeof raw !== "string") continue;
    const tag = raw.trim().slice(0, maxTagLength);
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
    if (tags.length >= maxTagCount) break;
  }
  return tags;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const body = (await request.json()) as ReviewPatchBody;

  if (body.type === "asset") {
    const assetId = typeof body.assetId === "string" ? body.assetId : null;
    if (!assetId) return NextResponse.json({ error: "Missing assetId." }, { status: 400 });
    const { error } = await supabase
      .from("portfolio_assets")
      .update({ selected: Boolean(body.selected) })
      .eq("id", assetId)
      .eq("job_id", jobId);
    if (error) return NextResponse.json({ error: "Could not update the photo." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId : null;
  if (!projectId) return NextResponse.json({ error: "Missing projectId." }, { status: 400 });

  const { data: project, error: lookupError } = await supabase
    .from("portfolio_projects")
    .select("id")
    .eq("id", projectId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (lookupError || !project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (typeof body.status === "string" && allowedProjectStatuses.has(body.status)) {
    patch.status = body.status;
  }
  if (typeof body.isFeatured === "boolean") {
    patch.is_featured = body.isFeatured;
  }
  if (typeof body.suggestedTitle === "string") {
    const title = body.suggestedTitle.trim().slice(0, 120);
    const moderationError = publicTextError([title]);
    if (moderationError) return NextResponse.json({ error: moderationError }, { status: 400 });
    patch.suggested_title = title || null;
  }
  if (typeof body.customSummary === "string") {
    const summary = body.customSummary.trim().slice(0, 1000);
    const moderationError = publicTextError([summary]);
    if (moderationError) return NextResponse.json({ error: moderationError }, { status: 400 });
    patch.custom_summary = summary || null;
  }
  if (Array.isArray(body.roomTypes)) {
    const tags = cleanTags(body.roomTypes);
    if (!tags) return NextResponse.json({ error: "Invalid tags." }, { status: 400 });
    const moderationError = publicTextError(tags);
    if (moderationError) return NextResponse.json({ error: moderationError }, { status: 400 });
    patch.room_types = tags;
  }
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update." }, { status: 400 });

  const { error: updateError } = await supabase.from("portfolio_projects").update(patch).eq("id", projectId);
  if (updateError) return NextResponse.json({ error: "Could not update the project." }, { status: 500 });

  if (patch.status === "hidden") await trackEvent(user.id, "portfolio_autopilot_project_hidden", projectId);
  if (patch.is_featured === true) await trackEvent(user.id, "portfolio_autopilot_project_featured", projectId);

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const formData = await request.formData();
  const projectId = formData.get("projectId");
  const file = formData.get("file");
  if (typeof projectId !== "string" || !projectId) {
    return NextResponse.json({ error: "Missing projectId." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing photo." }, { status: 400 });
  }
  if (!allowedAssetContentTypes.has(file.type)) {
    return NextResponse.json({ error: "This file type isn't supported. Use JPG, PNG, or WebP." }, { status: 400 });
  }
  if (file.size > maxAssetBytes) {
    return NextResponse.json({ error: "This photo is too large." }, { status: 400 });
  }

  const { data: project, error: lookupError } = await supabase
    .from("portfolio_projects")
    .select("id")
    .eq("id", projectId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (lookupError || !project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const { count } = await supabase
    .from("portfolio_assets")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId);
  if ((count ?? 0) >= maxAssetsDiscoveredPerJob) {
    return NextResponse.json({ error: "This import already has the maximum number of photos." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const path = `${user.id}/${jobId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;
  const { error: uploadError } = await supabase.storage
    .from(stagingBucket)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Could not upload the photo." }, { status: 500 });

  const { data: inserted, error: insertError } = await supabase
    .from("portfolio_assets")
    .insert({
      job_id: jobId,
      cluster_project_id: projectId,
      storage_path: path,
      alt_text: file.name.slice(0, 300) || null,
      content_hash: crypto.createHash("sha256").update(bytes).digest("hex"),
      selected: true,
    })
    .select("id, storage_path, alt_text")
    .single();
  if (insertError || !inserted) {
    await supabase.storage.from(stagingBucket).remove([path]);
    return NextResponse.json({ error: "Could not save the photo." }, { status: 500 });
  }

  const previewUrls = await stagingAssetPreviewUrls(supabase, [inserted.storage_path as string]);

  return NextResponse.json({
    ok: true,
    asset: {
      id: inserted.id,
      url: previewUrls.get(inserted.storage_path as string) ?? null,
      selected: true,
      clusterProjectId: projectId,
      altText: inserted.alt_text,
    },
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });

  const job = await loadOwnedJob(supabase, jobId, user.id);
  if (!job) return NextResponse.json({ error: "Import job not found." }, { status: 404 });

  const assetId = new URL(request.url).searchParams.get("assetId");
  if (!assetId) return NextResponse.json({ error: "Missing assetId." }, { status: 400 });

  const { data: asset, error: lookupError } = await supabase
    .from("portfolio_assets")
    .select("id, storage_path")
    .eq("id", assetId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (lookupError || !asset) return NextResponse.json({ error: "Photo not found." }, { status: 404 });

  const { error: deleteError } = await supabase.from("portfolio_assets").delete().eq("id", assetId);
  if (deleteError) return NextResponse.json({ error: "Could not delete the photo." }, { status: 500 });

  if (asset.storage_path) {
    await supabase.storage.from(stagingBucket).remove([asset.storage_path]);
  }

  return NextResponse.json({ ok: true });
}
