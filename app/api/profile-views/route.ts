import { NextResponse } from "next/server";
import { logError } from "@/lib/observability";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPublicSupabaseClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid analytics request." }, { status: 400 });
  }

  const data = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  const profileId = typeof data.profileId === "string" ? data.profileId : "";
  const sessionKey = typeof data.sessionKey === "string" ? data.sessionKey : "";
  const sourcePath = typeof data.sourcePath === "string" ? data.sourcePath.slice(0, 500) : "";

  if (!isUuid(profileId) || sessionKey.length < 20 || sessionKey.length > 100) {
    return NextResponse.json({ error: "Invalid analytics request." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user?.id === profileId) {
    return NextResponse.json({ ok: true, skipped: "owner" });
  }

  const publicClient = createPublicSupabaseClient();
  const { data: publicProfile } = await publicClient
    .from("profiles")
    .select("id")
    .eq("id", profileId)
    .maybeSingle();
  if (!publicProfile) return NextResponse.json({ ok: true, skipped: "not_public" });

  const viewDate = new Date().toISOString().slice(0, 10);
  let error: { code: string } | null = null;
  try {
    const admin = createSupabaseAdminClient();
    ({ error } = await admin.from("profile_views").insert({
      profile_id: profileId,
      session_key: sessionKey,
      source_path: sourcePath,
      view_date: viewDate,
    }));
  } catch {
    logError("profile_view_recording_unavailable", { profileId });
    return NextResponse.json({ ok: true, skipped: "unavailable" });
  }

  if (error && error.code !== "23505") {
    logError("profile_view_recording_failed", { profileId, code: error.code });
    return NextResponse.json({ ok: true, skipped: "unavailable" });
  }

  return NextResponse.json({ ok: true });
}
