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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("error", error.message);
      return NextResponse.redirect(loginUrl);
    }
    const user = data.user;

    if (user) {
      let role = await getExplicitAccountRole(supabase, user.id);
      const metadataIntent = user.user_metadata?.account_intent;

      if (!role && (metadataIntent === "client" || metadataIntent === "designer")) {
        const { error: roleError } = await supabase.rpc("set_my_account_role", { new_role: metadataIntent });
        if (roleError) {
          const onboarding = new URL("/onboarding", origin);
          onboarding.searchParams.set("intent", metadataIntent);
          onboarding.searchParams.set("next", next);
          onboarding.searchParams.set("error", roleError.message);
          return NextResponse.redirect(onboarding);
        }
        role = metadataIntent;
        await supabase.from("profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            user_type: role === "designer" ? "professional" : "client",
          },
          { onConflict: "id" }
        );
      }

      if (!role) {
        const onboarding = new URL("/onboarding", origin);
        if (metadataIntent === "client" || metadataIntent === "designer") {
          onboarding.searchParams.set("intent", metadataIntent);
        }
        onboarding.searchParams.set("next", next);
        return NextResponse.redirect(onboarding);
      }

      if (next === "/account" || next.startsWith("/onboarding")) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, phone, location")
          .eq("id", user.id)
          .maybeSingle();
        const needsProfileSetup = !profile?.full_name || !profile?.phone || !profile?.location;
        return NextResponse.redirect(
          `${origin}${needsProfileSetup ? "/account/profile?onboarding=1" : role === "designer" ? "/studio" : "/client"}`
        );
      }

      if (role && next.startsWith("/onboarding")) {
        return NextResponse.redirect(`${origin}${role === "designer" ? "/studio" : "/client"}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
