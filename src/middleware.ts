import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

const PROTECTED_PATHS = ["/members", "/course"];

interface RedirectionRule {
  id: string;
  from: string;
  to: string;
  forwardParams: boolean;
}

interface RedirectionsConfig {
  forwardQueryParamsDefault: boolean;
  rules: RedirectionRule[];
}

// Stale-while-revalidate: requests are served from the memo; once it is older
// than the TTL the next request kicks off a background refresh instead of
// blocking on the fetch. Only the very first request per instance blocks —
// with an empty memo there is nothing to serve, and skipping the rules there
// could miss a live ad redirect.
const REDIRECT_CACHE_TTL_MS = 30_000;
let cachedRedirects: { data: RedirectionsConfig | null; fetchedAt: number } | null = null;
let refreshInFlight: Promise<void> | null = null;

async function fetchRedirections(origin: string): Promise<RedirectionsConfig | null> {
  const res = await fetch(`${origin}/data/redirections.json`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as RedirectionsConfig;
}

function refreshRedirections(origin: string): Promise<void> {
  refreshInFlight ??= (async () => {
    try {
      const data = await fetchRedirections(origin);
      // A failed refresh never clobbers known-good rules — stale ad
      // redirects beat broken ad redirects. Removing rules goes through
      // the dashboard, which saves an empty rules array, not a missing file.
      cachedRedirects = { data: data ?? cachedRedirects?.data ?? null, fetchedAt: Date.now() };
    } catch {
      cachedRedirects = { data: cachedRedirects?.data ?? null, fetchedAt: Date.now() };
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

async function getRedirections(origin: string, event: NextFetchEvent): Promise<RedirectionsConfig | null> {
  if (!cachedRedirects) {
    // Cold start: block, exactly like the pre-SWR code.
    try {
      cachedRedirects = { data: await fetchRedirections(origin), fetchedAt: Date.now() };
    } catch {
      cachedRedirects = { data: null, fetchedAt: Date.now() };
    }
    return cachedRedirects.data;
  }
  if (Date.now() - cachedRedirects.fetchedAt > REDIRECT_CACHE_TTL_MS) {
    event.waitUntil(refreshRedirections(origin));
  }
  return cachedRedirects.data;
}

function normalizePath(p: string): string {
  if (!p) return "/";
  const trimmed = p.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

function findRule(rules: RedirectionRule[], pathname: string): RedirectionRule | null {
  const target = normalizePath(pathname);
  for (const rule of rules) {
    if (normalizePath(rule.from) === target) return rule;
  }
  return null;
}

function buildRedirectUrl(rule: RedirectionRule, request: NextRequest, forward: boolean): URL {
  const isAbsolute = /^https?:\/\//i.test(rule.to);
  const target = isAbsolute ? new URL(rule.to) : new URL(rule.to, request.url);
  if (forward) {
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!target.searchParams.has(key)) target.searchParams.set(key, value);
    });
  }
  return target;
}

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip redirection logic for app/admin/static paths
  const skipRedirect =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/data") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

  if (!skipRedirect) {
    const config = await getRedirections(request.nextUrl.origin, event);
    if (config && config.rules && config.rules.length > 0) {
      const match = findRule(config.rules, pathname);
      if (match) {
        const forward =
          typeof match.forwardParams === "boolean"
            ? match.forwardParams
            : config.forwardQueryParamsDefault;
        const target = buildRedirectUrl(match, request, forward);
        return NextResponse.redirect(target, 301);
      }
    }
  }

  // Existing token-protected paths logic
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = searchParams.get("token");
  const validToken = process.env.COURSE_MAGIC_TOKEN;

  if (!validToken) {
    if (process.env.NODE_ENV === "development") return NextResponse.next();
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (token !== validToken) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api/|_next/|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
