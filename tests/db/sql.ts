// Runs SQL on the dev project through the Supabase Management API (needs SUPABASE_ACCESS_TOKEN).
// Used for checks that the data API cannot do (catalog queries, role simulation). No Docker needed.
import { DEV_PROJECT_REF, assertDevProject, loadEnv, requireEnv } from "./env.ts";

export async function runSql<T = Record<string, unknown>>(query: string): Promise<T[]> {
  loadEnv();
  assertDevProject();
  const res = await fetch(`https://api.supabase.com/v1/projects/${DEV_PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("SUPABASE_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const body = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const message = (body as { message?: string } | null)?.message ?? `HTTP ${res.status}`;
    throw new Error(message);
  }
  return body as T[];
}
