import { createSupabaseServerClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function HealthPage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .limit(1);

  return (
    <pre style={{ padding: 24 }}>
      {JSON.stringify({ ok: !error, error: error?.message ?? null, sample: data ?? [] }, null, 2)}
    </pre>
  );
}
