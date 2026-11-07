import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/** Headers every page gets. Search engines are told per page (pages that must stay private set `robots: noindex` themselves). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "";

/**
 * What a page may load and talk to (production only: the dev server needs more). Our own files, our Supabase project for
 * pictures and the sign-in, Cloudflare Turnstile for the bot check, and Sentry for error reports. Inline scripts stay allowed
 * because Next writes its own; the rest is closed, and nothing may put the site in a frame.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${supabaseOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} https://*.ingest.sentry.io https://*.ingest.de.sentry.io https://*.ingest.us.sentry.io`,
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  `form-action 'self' https://accounts.google.com ${supabaseOrigin}`.trim(),
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // The browser checks run a second copy of the app next to the normal one, so each needs its own build folder
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  async headers() {
    const headers = process.env.NODE_ENV === "production" ? [...securityHeaders, { key: "Content-Security-Policy", value: contentSecurityPolicy }] : securityHeaders;
    return [{ source: "/:path*", headers }];
  },
  experimental: {
    // Pictures reach the server as shrunk base64 (at most 5 MB of picture)
    serverActions: { bodySizeLimit: "8mb" },
  },
  images: {
    // Pictures from the owner's Supabase Storage bucket (Phase 6)
    remotePatterns: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? [{ protocol: "https", hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(nextConfig);
