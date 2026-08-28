import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { logError, logInfo } from "@/lib/observability";
import { createPublicContentClient } from "@/lib/public-content-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const allowedTargetTypes = new Set(["profile", "project"]);
const allowedCategories = new Set(["copyright", "impersonation", "misleading", "privacy", "illegal", "spam", "other"]);
const anonymousDailyLimit = 3;
const accountDailyLimit = 6;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function requestFingerprint(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const userAgent = request.headers.get("user-agent")?.slice(0, 160) || "unknown";
  return createHash("sha256").update(`archicompass-content-report:${ip}:${userAgent}`).digest("hex");
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;
  try {
    const body = await request.json();
    payload = body && typeof body === "object" ? body as Record<string, unknown> : {};
  } catch {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  const targetType = typeof payload.targetType === "string" ? payload.targetType : "";
  const targetId = typeof payload.targetId === "string" ? payload.targetId : "";
  const category = typeof payload.category === "string" ? payload.category : "";
  const details = typeof payload.details === "string" ? payload.details.trim().slice(0, 2000) : "";
  if (!allowedTargetTypes.has(targetType) || !isUuid(targetId) || !allowedCategories.has(category)) {
    return NextResponse.json({ error: "Invalid report." }, { status: 400 });
  }

  const publicClient = createPublicContentClient();
  const target = targetType === "profile"
    ? await publicClient.from("profiles").select("id").eq("id", targetId).eq("user_type", "professional").maybeSingle()
    : await publicClient.from("projects").select("id, profile_id").eq("id", targetId).maybeSingle();
  if (!target.data) return NextResponse.json({ error: "Content not found." }, { status: 404 });

  const profileId = targetType === "profile"
    ? targetId
    : (target.data as { profile_id?: string }).profile_id ?? null;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const reporterUserId = userData.user?.id ?? null;
  if (reporterUserId && reporterUserId === profileId) {
    return NextResponse.json({ error: "You cannot report your own content." }, { status: 400 });
  }

  const fingerprint = requestFingerprint(request);
  const admin = createSupabaseAdminClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const quotaQuery = reporterUserId
    ? admin.from("content_reports").select("id", { count: "exact", head: true }).eq("reporter_user_id", reporterUserId).gte("created_at", since)
    : admin.from("content_reports").select("id", { count: "exact", head: true }).eq("reporter_fingerprint", fingerprint).gte("created_at", since);
  const { count, error: quotaError } = await quotaQuery;
  if (quotaError) {
    logError("content_report_quota_read_failed", { code: quotaError.code ?? null });
    return NextResponse.json({ error: "Reporting is temporarily unavailable." }, { status: 503 });
  }
  if ((count ?? 0) >= (reporterUserId ? accountDailyLimit : anonymousDailyLimit)) {
    return NextResponse.json({ error: "Rate limit reached." }, { status: 429 });
  }

  const { error: insertError } = await admin.from("content_reports").insert({
    target_type: targetType,
    target_profile_id: profileId,
    target_project_id: targetType === "project" ? targetId : null,
    category,
    details: details || null,
    reporter_user_id: reporterUserId,
    reporter_fingerprint: fingerprint,
    source_path: targetType === "profile" ? `/designers/${targetId}` : `/projects/${targetId}`,
  });
  if (insertError) {
    logError("content_report_insert_failed", { code: insertError.code ?? null, targetType });
    return NextResponse.json({ error: "Reporting is temporarily unavailable." }, { status: 503 });
  }

  logInfo("content_report_created", { authenticated: Boolean(reporterUserId), targetType });
  return NextResponse.json({ ok: true }, { status: 201 });
}
