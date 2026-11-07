import "server-only";
import { ipHash } from "@/server/auth/lockout";
import { createAdminClient } from "@/server/supabase/admin";

/** Lets one caller (by a hash of their address) do `action` at most `limit` times in `seconds`. A database hiccup lets the call through rather than locking everyone out. */
export async function rateAllowed(action: string, limit: number, seconds: number): Promise<boolean> {
  const { data, error } = await createAdminClient().rpc("rate_limit_hit", { p_key: `${action}:${await ipHash()}`, p_limit: limit, p_window_seconds: seconds });
  return error ? true : data === true;
}
