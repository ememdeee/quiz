import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth-rules";
import { routes } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";

/**
 * The link inside the verify-email and reset-password emails (handover 7.2). It trades the one-time code for a session,
 * so opening the link also logs the person in, then sends them on: a new account to "Email verified", a reset to the new
 * password screen. An old or used link goes to the matching "This link has expired" screen.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get("type") as EmailOtpType | null;
  const tokenHash = params.get("token_hash");
  const recovery = type === "recovery";
  const next = safeNext(params.get("next"), "");
  const expired = new URL(recovery || next === routes.resetPassword ? routes.resetPasswordExpired : routes.verifyEmailExpired, request.url);
  const supabase = await createClient();

  // The standard Supabase email link comes back with a one-time `code`; our own template comes with a `token_hash` and a type. Both work.
  const code = params.get("code");
  if (code && !tokenHash) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return NextResponse.redirect(error ? expired : new URL(next || routes.verifyEmailDone, request.url));
  }

  if (!type || !tokenHash) return NextResponse.redirect(expired);
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
  if (error) return NextResponse.redirect(expired);

  const target = recovery ? routes.resetPassword : next || routes.verifyEmailDone;
  return NextResponse.redirect(new URL(target, request.url));
}
