import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http") &&
    !supabaseUrl.includes("placeholder")
);

// Routes that require an authenticated session
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/materials",
  "/subjects",
  "/diagnostic",
  "/tests",
  "/gaps",
  "/planner",
  "/practice",
  "/tutor",
  "/progress",
  "/settings",
];

// Auth routes that authenticated users should not revisit
const AUTH_ROUTES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // If Supabase is not configured, allow all navigation freely.
  // The app runs in demo mode via localStorage — no real sessions exist.
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  // Build a mutable response so we can forward updated session cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) {
        // Write cookies onto the outgoing request so downstream RSCs see them.
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        // Re-build the response to carry the new cookies to the browser.
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options ?? {})
        );
      },
    },
  });

  // Refresh the session token if it is close to expiry.
  // IMPORTANT: do NOT use getSession() here — it reads an unvalidated JWT.
  // getUser() makes a server-side call to validate the session properly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !user) {
    // Unauthenticated access to a protected route → redirect to login.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirected_from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    // Already signed-in user hitting /login or /signup → send to dashboard.
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - /auth/callback (PKCE code exchange must not be interrupted)
     *   - API routes (/api/*)
     *   - Public assets (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|api/).*)",
  ],
};
