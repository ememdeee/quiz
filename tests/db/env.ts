// Loads .env.local (if it exists) into process.env, exactly as written. Real environment
// variables win. Never prints values. Plain TypeScript only (also run by `node --experimental-strip-types`).
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

export const DEV_PROJECT_REF = "ubyfseqdzzuixvxmabfe";

export function loadEnv(): void {
  const file = resolve(process.cwd(), ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (!m) continue;
    const value = m[2].trim().replace(/^(['"])(.*)\1$/, "$2");
    if (process.env[m[1]] === undefined || process.env[m[1]] === "") process.env[m[1]] = value;
  }
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}. Fill it in .env.local (see .env.example).`);
  return v;
}

/** Tests create and delete fake people: they must only ever run against the dev project. */
export function assertDevProject(): void {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  if (!url.includes(DEV_PROJECT_REF)) {
    throw new Error("Refusing to run: NEXT_PUBLIC_SUPABASE_URL is not the dev project.");
  }
}
