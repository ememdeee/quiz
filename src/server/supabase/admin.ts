import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * The service-role client: it skips the database rules. Only server code that has already checked who is asking may use it
 * (public quiz answers, the admin area, the sign-in lock). Never import this from a component.
 */
export function createAdminClient() {
  return createClient<Database>(publicEnv.supabaseUrl, serverEnv().serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
