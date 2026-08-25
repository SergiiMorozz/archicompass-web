import type { SupabaseServerClient } from "./job-access";
import { stagingBucket } from "./job-access";

const signedUrlLifetimeSeconds = 60 * 30;

export async function stagingAssetPreviewUrls(supabase: SupabaseServerClient, paths: string[]) {
  const cleanPaths = paths.filter(Boolean);
  if (!cleanPaths.length) return new Map<string, string>();

  const { data, error } = await supabase.storage.from(stagingBucket).createSignedUrls(cleanPaths, signedUrlLifetimeSeconds);
  if (error || !data) return new Map<string, string>();

  const map = new Map<string, string>();
  data.forEach((item, index) => {
    if (item.signedUrl) map.set(cleanPaths[index], item.signedUrl);
  });
  return map;
}
