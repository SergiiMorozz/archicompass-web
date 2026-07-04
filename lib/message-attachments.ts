import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type MessageAttachment = {
  name: string;
  path: string;
  type: string;
  url: string;
};

const bucket = "message-attachments";
const maxFiles = 5;
const maxFileSize = 20 * 1024 * 1024;
const allowedExtensions = new Set([
  "pdf", "jpg", "jpeg", "png", "webp", "doc", "docx", "xls", "xlsx",
  "dwg", "dxf", "zip", "txt",
]);

function extension(file: File) {
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
}

function safeName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-120) || "attachment";
}

export function attachmentFiles(formData: FormData) {
  return formData
    .getAll("attachments")
    .filter((value): value is File => typeof value !== "string" && value.size > 0);
}

export async function uploadMessageAttachments({
  files,
  inquiryId,
  supabase,
  userId,
}: {
  files: File[];
  inquiryId: string;
  supabase: SupabaseServerClient;
  userId: string;
}) {
  if (files.length > maxFiles) {
    return { error: `Attach up to ${maxFiles} files per message.`, names: [], paths: [], types: [] };
  }
  const names: string[] = [];
  const paths: string[] = [];
  const types: string[] = [];

  for (const file of files) {
    if (file.size > maxFileSize) {
      if (paths.length) await supabase.storage.from(bucket).remove(paths);
      return { error: `${file.name} is larger than 20 MB.`, names: [], paths: [], types: [] };
    }
    const ext = extension(file);
    if (!allowedExtensions.has(ext)) {
      if (paths.length) await supabase.storage.from(bucket).remove(paths);
      return { error: `${file.name} has an unsupported file type.`, names: [], paths: [], types: [] };
    }
    const path = `${inquiryId}/${userId}/${crypto.randomUUID()}-${safeName(file.name)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (error) {
      if (paths.length) await supabase.storage.from(bucket).remove(paths);
      return { error: `Attachment upload failed: ${error.message}`, names: [], paths: [], types: [] };
    }
    names.push(file.name.slice(0, 200));
    paths.push(path);
    types.push(file.type || "application/octet-stream");
  }
  return { error: null, names, paths, types };
}

export async function messageAttachmentPreviews(
  supabase: SupabaseServerClient,
  names: string[] | null | undefined,
  paths: string[] | null | undefined,
  types: string[] | null | undefined
) {
  const cleanPaths = (paths ?? []).filter(Boolean);
  if (!cleanPaths.length) return [];
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(cleanPaths, 60 * 30);
  if (error) return [];
  return (data ?? []).flatMap((item, index) => item.signedUrl ? [{
    name: names?.[index] || `Attachment ${index + 1}`,
    path: item.path || cleanPaths[index],
    type: types?.[index] || "application/octet-stream",
    url: item.signedUrl,
  }] : []);
}
