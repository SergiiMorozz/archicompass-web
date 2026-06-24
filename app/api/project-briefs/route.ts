import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const briefPhotosBucket = "brief-reference-photos";
const maxReferencePhotos = 10;
const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function stringArrayValue(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value.trim()) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
      : [];
  } catch {
    return [];
  }
}

function fileValues(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .filter((value): value is File => typeof value !== "string" && value.size > 0);
}

function extensionFor(file: File) {
  const fromName = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (fromName && ["jpg", "jpeg", "png", "webp"].includes(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return NextResponse.json(
      { error: "Please sign in to save this brief.", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  const formData = await request.formData();
  const briefText = textValue(formData, "brief_text");

  if (!briefText) {
    return NextResponse.json({ error: "Brief text is required." }, { status: 400 });
  }

  const referencePhotos = fileValues(formData, "reference_photos");
  if (referencePhotos.length > maxReferencePhotos) {
    return NextResponse.json(
      { error: `Please upload up to ${maxReferencePhotos} reference photos.` },
      { status: 400 }
    );
  }

  for (const photo of referencePhotos) {
    if (!allowedImageTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Reference photos must be JPEG, PNG, or WebP files." },
        { status: 400 }
      );
    }

    if (photo.size > maxImageSize) {
      return NextResponse.json(
        { error: "Each reference photo must be smaller than 10 MB." },
        { status: 400 }
      );
    }
  }

  const briefId = crypto.randomUUID();
  const uploadedPaths: string[] = [];
  const uploadedNames: string[] = [];

  for (const photo of referencePhotos) {
    const path = `${user.id}/${briefId}/${crypto.randomUUID()}.${extensionFor(photo)}`;
    const { error } = await supabase.storage.from(briefPhotosBucket).upload(path, photo, {
      contentType: photo.type,
      upsert: false,
    });

    if (error) {
      if (uploadedPaths.length) {
        await supabase.storage.from(briefPhotosBucket).remove(uploadedPaths);
      }

      return NextResponse.json(
        { error: `Reference photo upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    uploadedPaths.push(path);
    uploadedNames.push(photo.name);
  }

  const titleParts = [
    textValue(formData, "project_type") ?? "Project",
    textValue(formData, "location") ?? null,
  ].filter(Boolean);

  const { error } = await supabase.from("project_briefs").insert({
    id: briefId,
    user_id: user.id,
    title: titleParts.join(" in "),
    project_type: textValue(formData, "project_type"),
    goal: textValue(formData, "goal"),
    style_direction: textValue(formData, "style_direction"),
    support_scope: textValue(formData, "support_scope"),
    budget_signal: textValue(formData, "budget_signal"),
    location: textValue(formData, "location"),
    notes: textValue(formData, "notes"),
    visual_cues: stringArrayValue(formData, "visual_cues"),
    reference_photo_names: uploadedNames,
    reference_photo_paths: uploadedPaths,
    brief_text: briefText,
    designer_search_href: textValue(formData, "designer_search_href"),
  });

  if (error) {
    if (uploadedPaths.length) {
      await supabase.storage.from(briefPhotosBucket).remove(uploadedPaths);
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: briefId,
    referencePhotoCount: uploadedPaths.length,
  });
}
