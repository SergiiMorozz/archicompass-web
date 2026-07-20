import { NextResponse } from "next/server";
import { briefTitle } from "@/lib/brief-labels";
import { getExplicitAccountRole } from "@/lib/studios";
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

function numberValue(formData: FormData, key: string, integer = false) {
  const value = textValue(formData, key);
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return integer ? Math.round(parsed) : parsed;
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
      { error: "Zaloguj się, aby zapisać brief.", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  const accountRole = await getExplicitAccountRole(supabase, user.id);
  if (!accountRole) {
    return NextResponse.json(
      {
        error: "Wybierz typ konta przed zapisaniem briefu projektowego.",
        code: "ONBOARDING_REQUIRED",
      },
      { status: 403 }
    );
  }

  if (accountRole !== "client") {
    return NextResponse.json(
      {
        error: "Konta projektantów otrzymują briefy i nie mogą zapisywać zapytań jako klient.",
        code: "CLIENT_ROLE_REQUIRED",
      },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const briefText = textValue(formData, "brief_text");

  if (!briefText) {
    return NextResponse.json({ error: "Treść briefu jest wymagana." }, { status: 400 });
  }

  const referencePhotos = fileValues(formData, "reference_photos");
  if (referencePhotos.length > maxReferencePhotos) {
    return NextResponse.json(
      { error: `Możesz przesłać maksymalnie ${maxReferencePhotos} zdjęć referencyjnych.` },
      { status: 400 }
    );
  }

  for (const photo of referencePhotos) {
    if (!allowedImageTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Zdjęcia referencyjne muszą być plikami JPEG, PNG lub WebP." },
        { status: 400 }
      );
    }

    if (photo.size > maxImageSize) {
      return NextResponse.json(
        { error: "Każde zdjęcie referencyjne musi mieć mniej niż 10 MB." },
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
        { error: `Nie udało się przesłać zdjęcia referencyjnego: ${error.message}` },
        { status: 500 }
      );
    }

    uploadedPaths.push(path);
    uploadedNames.push(photo.name);
  }

  const projectType = textValue(formData, "project_type");
  const location = textValue(formData, "location");

  const { error } = await supabase.from("project_briefs").insert({
    id: briefId,
    user_id: user.id,
    title: briefTitle({ project_type: projectType, location }),
    project_type: projectType,
    goal: textValue(formData, "goal"),
    style_direction: textValue(formData, "style_direction"),
    support_scope: textValue(formData, "support_scope"),
    budget_signal: textValue(formData, "budget_signal"),
    timeline: textValue(formData, "timeline"),
    area_m2: numberValue(formData, "area_m2"),
    room_count: numberValue(formData, "room_count", true),
    room_types: stringArrayValue(formData, "room_types"),
    property_status: textValue(formData, "property_status"),
    visualization_need: textValue(formData, "visualization_need"),
    supervision_need: textValue(formData, "supervision_need"),
    location,
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
