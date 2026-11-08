/**
 * The only place that reads process.env (rule R2). Values that the browser may see start with NEXT_PUBLIC_ and are written out
 * in full, because the build swaps them in by name. Secrets are read only through the functions below, on the server.
 */
export const isProduction = process.env.NODE_ENV === "production";

/** True when the site runs on Vercel (it sets VERCEL). Visitor counting only exists there. */
export const onVercel = process.env.VERCEL === "1";

/** Where the data comes from: the browser mock (default, for the UI phase) or Supabase. */
export const dataMode: "mock" | "supabase" = process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "mock";

/** Everything shows the maintenance page while this is on (set MAINTENANCE_MODE=on). */
export const maintenanceMode = process.env.MAINTENANCE_MODE === "on";

export const publicEnv = {
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  /** Cloudflare Turnstile (bot check on Register, Forgot password and Contact). Empty: the check is off. */
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
  /** Error monitoring in the browser. Empty: off. */
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN ?? "",
};

function need(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}. See .env.example.`);
  return value;
}

/** Secrets for server code. A missing one stops the request with a clear message instead of failing later in a strange place. */
export const serverEnv = () => ({
  serviceRoleKey: need("SUPABASE_SERVICE_ROLE_KEY"),
  ipHashSalt: need("IP_HASH_SALT"),
});

/** How emails leave: Resend when it has a key, the Mailtrap test inbox in development, nothing otherwise. */
export const emailEnv = () => ({
  resendKey: process.env.RESEND_API_KEY ?? "",
  from: process.env.EMAIL_FROM ?? "Quiz <hello@quiz.basrh.com>",
  mailtrapToken: process.env.MAILTRAP_API_TOKEN ?? "",
  mailtrapInbox: process.env.MAILTRAP_INBOX_ID ?? "",
});

/** The Turnstile secret and the server-side error monitoring address. Empty means that feature is off. */
export const optionalServerEnv = () => ({
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
  sentryDsn: process.env.SENTRY_DSN ?? "",
});
