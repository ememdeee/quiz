import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * The Supabase client of the person who is logged in. It reads and refreshes their session in cookies, and every
 * query runs with THEIR rights, so the database rules (RLS) protect the data even if our own code has a bug.
 */
export async function createClient() {
  const store = await cookies();
  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called while a page is drawn: cookies cannot be written there. The middleware refreshes the session instead.
        }
      },
    },
  });
}
