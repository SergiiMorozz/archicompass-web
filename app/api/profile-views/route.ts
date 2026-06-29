import { NextResponse } from "next/server";
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

  const viewDate = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("profile_views").insert({
    profile_id: profileId,
    session_key: sessionKey,
    source_path: sourcePath,
    view_date: viewDate,
  });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Profile view was not recorded." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
