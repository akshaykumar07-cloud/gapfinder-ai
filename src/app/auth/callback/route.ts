import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const requestedNext = request.nextUrl.searchParams.get("next");
  const nextPath = requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
    ? requestedNext
    : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/login?auth_error=missing_code", request.url));
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?auth_error=not_configured", request.url));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[Supabase Auth]", {
      operation: "callback",
      message: error.message,
      code: error.code ?? null,
      status: error.status ?? null,
    });
    return NextResponse.redirect(new URL("/login?auth_error=callback_failed", request.url));
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}