import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Fine-grained role checks (client vs designer vs admin) still live in each
// area's layout - this is only the fail-closed baseline: no session, no
// access, enforced centrally so a new page under one of these prefixes
// cannot accidentally ship without an auth check.
const protectedPrefixes = ["/account", "/client", "/studio", "/admin", "/onboarding"];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    "x-archicompass-path",
    `${request.nextUrl.pathname}${request.nextUrl.search}`
  );

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  if (!isProtectedPath(request.nextUrl.pathname)) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/account/:path*",
    "/client/:path*",
    "/studio/:path*",
    "/admin/:path*",
    "/onboarding/:path*",
  ],
};
