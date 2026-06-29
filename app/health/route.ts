import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").select("id", { head: true }).limit(1);

  return NextResponse.json(
    { ok: !error },
    {
      status: error ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
