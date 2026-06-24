import { createSupabaseServerClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export type ReferencePhotoPreview = {
  name: string;
  path: string;
  url: string;
};

const briefPhotosBucket = "brief-reference-photos";
const signedUrlLifetimeSeconds = 60 * 30;

export async function referencePhotoPreviews(
  supabase: SupabaseServerClient,
  names: string[] | null | undefined,
  paths: string[] | null | undefined
) {
  const cleanPaths = (paths ?? []).filter(Boolean);
  if (!cleanPaths.length) return [];

  const { data, error } = await supabase.storage
    .from(briefPhotosBucket)
    .createSignedUrls(cleanPaths, signedUrlLifetimeSeconds);

  if (error) return [];

  return (data ?? [])
    .map((item, index) => {
      if (!item.signedUrl) return null;

      return {
        name: names?.[index] || `Reference photo ${index + 1}`,
        path: item.path || cleanPaths[index],
        url: item.signedUrl,
      };
    })
    .filter((item): item is ReferencePhotoPreview => Boolean(item));
}
