import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { LOGIN_LOCK_MINUTES } from "@/lib/auth-rules";
import { serverEnv } from "@/lib/env";
import { createAdminClient } from "@/server/supabase/admin";

/** Who is asking, without keeping their address: a salted hash, only for the sign-in lock and rate limits (cleaned daily). */
export async function ipHash(): Promise<string> {
  const list = await headers();
  const ip = list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown";
  return createHash("sha256").update(`${serverEnv().ipHashSalt}:${ip}`).digest("hex");
}

const normalize = (email: string) => email.trim().toLowerCase();

/** Wrong passwords for this email in the last 15 minutes. */
export async function recentFailures(email: string): Promise<number> {
  const since = new Date(Date.now() - LOGIN_LOCK_MINUTES * 60_000).toISOString();
  const { count } = await createAdminClient()
    .from("login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("email", normalize(email))
    .eq("success", false)
    .gte("created_at", since);
  return count ?? 0;
}

export async function recordFailure(email: string): Promise<void> {
  await createAdminClient().from("login_attempts").insert({ email: normalize(email), ip_hash: await ipHash(), success: false });
}

/** A good login clears the count: the lock is for wrong passwords in a row. */
export async function clearFailures(email: string): Promise<void> {
  await createAdminClient().from("login_attempts").delete().eq("email", normalize(email));
}
