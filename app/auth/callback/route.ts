import { NextResponse } from "next/server";
import { getExplicitAccountRole } from "@/lib/studios";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") || "/account";
  const next = requestedNext.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/account";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    const user = data.user;

    if (user) {
      const role = await getExplicitAccountRole(supabase, user.id);
      if (!role && !next.startsWith("/onboarding")) {
        const onboarding = new URL("/onboarding", origin);
        const metadataIntent = user.user_metadata?.account_intent;
        if (metadataIntent === "client" || metadataIntent === "designer") {
          onboarding.searchParams.set("intent", metadataIntent);
        }
        onboarding.searchParams.set("next", next);
        return NextResponse.redirect(onboarding);
      }
      if (role && next.startsWith("/onboarding")) {
        return NextResponse.redirect(`${origin}${role === "designer" ? "/studio" : "/client"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
