import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth-rules";
import { routes } from "@/lib/routes";
import { createClient } from "@/server/supabase/server";

/** Where Google sends the person back (handover 7.2): trade the code for a session, then open the dashboard. Cancelling lands on the Log in screen with its message. */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const cancelled = new URL(`${routes.login}?state=google-cancelled`, request.url);
  const code = params.get("code");
  if (params.get("error") || !code) return NextResponse.redirect(cancelled);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(cancelled);
  return NextResponse.redirect(new URL(safeNext(params.get("next"), routes.dashboard), request.url));
}
