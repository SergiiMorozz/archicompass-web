import { NextResponse } from "next/server";
import { fetchGooglePlaceSummary } from "@/lib/google-places";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type GoogleEntity = {
  id: string;
  google_place_id: string;
};

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret && request.headers.get("authorization") === `Bearer ${secret}`);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return NextResponse.json({ error: "Google Places is not configured" }, { status: 503 });
  }

  let supabase;
  try {
    supabase = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ error: "Rating sync is not configured" }, { status: 503 });
  }

  const [profileResult, studioResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, google_place_id")
      .not("google_place_id", "is", null)
      .limit(100),
    supabase
      .from("studios")
      .select("id, google_place_id")
      .not("google_place_id", "is", null)
      .limit(100),
  ]);
  if (profileResult.error || studioResult.error) {
    return NextResponse.json({ error: "Could not load Google-linked profiles" }, { status: 500 });
  }

  let updated = 0;
  const failures: Array<{ id: string; type: "profile" | "studio"; error: string }> = [];
  const sync = async (entity: GoogleEntity, table: "profiles" | "studios", type: "profile" | "studio") => {
    const result = await fetchGooglePlaceSummary(entity.google_place_id);
    if (!result.data) {
      failures.push({ id: entity.id, type, error: result.error || "Google sync failed" });
      return;
    }
    const { error } = await supabase
      .from(table)
      .update({
        google_place_id: result.data.placeId,
        google_business_url: result.data.businessUrl,
        google_rating: result.data.rating,
        google_review_count: result.data.reviewCount,
        google_rating_updated_at: new Date().toISOString(),
      })
      .eq("id", entity.id);
    if (error) failures.push({ id: entity.id, type, error: error.message });
    else updated += 1;
  };

  for (const profile of (profileResult.data ?? []) as GoogleEntity[]) {
    await sync(profile, "profiles", "profile");
  }
  for (const studio of (studioResult.data ?? []) as GoogleEntity[]) {
    await sync(studio, "studios", "studio");
  }

  return NextResponse.json({
    ok: failures.length === 0,
    checked: (profileResult.data?.length ?? 0) + (studioResult.data?.length ?? 0),
    updated,
    failures,
  });
}
