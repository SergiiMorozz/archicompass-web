import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAccountRole } from "@/lib/studios";
import { publicTextError } from "@/lib/content-moderation";
import { getWorkspaceCopy } from "@/content/workspace-copy";

type CreateProjectBody = {
  title?: unknown;
  category?: unknown;
  description?: unknown;
  projectUrl?: unknown;
  imagePaths?: unknown;
  imageUrls?: unknown;
};

function text(value: unknown, max: number) {
  return typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;
}

export async function POST(request: Request) {
  const copy = getWorkspaceCopy().accountPortfolio;
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return NextResponse.json({ error: copy.create.unauthenticated }, { status: 401 });
  if ((await getAccountRole(supabase, user.id)) !== "designer") {
    return NextResponse.json({ error: copy.errors.clientOnly }, { status: 403 });
  }

  const body = (await request.json()) as CreateProjectBody;
  const title = text(body.title, 120);
  const category = text(body.category, 80);
  const description = text(body.description, 3000);
  if (!title) return NextResponse.json({ error: copy.errors.titleRequired }, { status: 400 });
  const moderationError = publicTextError([title, category, description]);
  if (moderationError) return NextResponse.json({ error: moderationError }, { status: 400 });

  const imagePaths = Array.isArray(body.imagePaths)
    ? body.imagePaths.filter((value): value is string => typeof value === "string" && value.startsWith(`${user.id}/`)).slice(0, 30)
    : [];
  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((value): value is string => typeof value === "string" && value.startsWith("https://")).slice(0, imagePaths.length)
    : [];
  if (imagePaths.length !== imageUrls.length) {
    return NextResponse.json({ error: copy.errors.imageSelectionInvalid }, { status: 400 });
  }

  const rawUrl = text(body.projectUrl, 500);
  const projectUrl = rawUrl
    ? rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`
    : null;
  const { error } = await supabase.from("projects").insert({
    id: crypto.randomUUID(),
    profile_id: user.id,
    title,
    category,
    description,
    project_url: projectUrl,
    image_url: imageUrls[0] ?? null,
    image_path: imagePaths[0] ?? null,
    image_urls: imageUrls,
    image_paths: imagePaths,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
