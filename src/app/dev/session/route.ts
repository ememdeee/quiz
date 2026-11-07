import { NextResponse, type NextRequest } from "next/server";
import { isProduction } from "@/lib/env";
import { routes } from "@/lib/routes";
import { endSession, startSession } from "@/server/session";

/** Dev only: switch who is "logged in" (user, admin or nobody), then go back. */
export async function GET(request: NextRequest) {
  if (isProduction) return new NextResponse(null, { status: 404 });

  const params = request.nextUrl.searchParams;
  const as = params.get("as");
  if (as === "user" || as === "admin") await startSession(as);
  else await endSession();

  // Only ever go to a page on this site
  const next = params.get("next") ?? routes.dev;
  const target = next.startsWith("/") && !next.startsWith("//") ? next : routes.dev;
  return NextResponse.redirect(new URL(target, request.url));
}
