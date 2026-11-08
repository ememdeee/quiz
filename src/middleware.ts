import { NextResponse, type NextRequest } from "next/server";
import { dataMode, maintenanceMode } from "@/lib/env";
import { routes } from "@/lib/routes";
import { refreshSession } from "@/server/supabase/middleware";

/** Pages that need a login. The pages themselves check again; this only sends strangers to Log in with a way back. */
const needsLogin = [routes.dashboard, routes.account];

/**
 * Runs before every page: the maintenance switch (everything shows the maintenance page), keeping a real login fresh, and
 * sending logged-out people from a private page to Log in with `next` set, so they come back to it afterwards.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (maintenanceMode && pathname !== routes.maintenance) return NextResponse.rewrite(new URL(routes.maintenance, request.url), { status: 503 });
  if (dataMode !== "supabase") return NextResponse.next();

  const session = await refreshSession(request);
  if (!session.user && needsLogin.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    const login = new URL(routes.login, request.url);
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }
  return session.response();
}

export const config = {
  // Not for the build's own files, pictures and icons
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
