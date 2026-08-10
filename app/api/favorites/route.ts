import { NextResponse } from "next/server";
import { getInteractiveCopy } from "@/content/interactive-copy";
import { consumeActionQuota } from "@/lib/action-quota";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const dailyFavoriteLimit = 200;

const supportedEntityTypes = ["designer", "studio", "project", "article"] as const;
type SupportedEntityType = (typeof supportedEntityTypes)[number];

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isSupportedEntityType(value: unknown): value is SupportedEntityType {
  return supportedEntityTypes.includes(value as SupportedEntityType);
}

export async function POST(request: Request) {
  const copy = getInteractiveCopy().favorite;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return NextResponse.json(
      { error: copy.authRequired, code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  let body: { entityKey?: unknown; entityType?: unknown; saved?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: copy.invalidRequest }, { status: 400 });
  }

  const entityType = body.entityType;
  const entityKey = typeof body.entityKey === "string" ? body.entityKey : "";
  const shouldSave = body.saved === true;

  if (!isSupportedEntityType(entityType) || !isUuid(entityKey)) {
    return NextResponse.json({ error: copy.invalidFavorite }, { status: 400 });
  }

  if (shouldSave) {
    const { error: quotaError, allowed } = await consumeActionQuota(
      user.id,
      "favorite_save",
      dailyFavoriteLimit
    );
    if (quotaError || !allowed) {
      return NextResponse.json({ error: copy.rateLimited }, { status: 429 });
    }

    const targetTable =
      entityType === "designer"
        ? "profiles"
        : entityType === "studio"
          ? "studios"
          : entityType === "project"
            ? "projects"
            : "inspiration_articles";
    const { data: target } = await supabase
      .from(targetTable)
      .select("id")
      .eq("id", entityKey)
      .maybeSingle();

    if (!target) {
      return NextResponse.json({ error: copy.unavailable }, { status: 404 });
    }

    const { error } = await supabase.from("favorites").insert({
      user_id: user.id,
      entity_type: entityType,
      entity_key: entityKey,
    });

    if (error && error.code !== "23505") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("entity_type", entityType)
      .eq("entity_key", entityKey);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ saved: shouldSave });
}
