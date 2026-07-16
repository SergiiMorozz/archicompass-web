import { createPublicSupabaseClient } from "@/lib/supabase/public";

// Public catalogue content must never inherit the permissions of a signed-in
// administrator. This client intentionally has no session, so Supabase RLS is
// the single source of truth for visibility on public pages.
export function createPublicContentClient() {
  return createPublicSupabaseClient();
}
