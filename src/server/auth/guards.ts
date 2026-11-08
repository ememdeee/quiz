import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { fail, ok, type ActionResult } from "@/lib/errors";
import type { LimitOverrides } from "@/lib/plan/limits";
import { createClient } from "@/server/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Authed = { supabase: SupabaseClient<Database>; userId: string; email: string; profile: Profile };

/**
 * The first line of every action for logged-in people: who is this, and may they act at all? Nobody logged in is
 * `logged_out`; a suspended person is `suspended`. Everything after this runs with the person's own database rights.
 */
export async function requireUser(): Promise<ActionResult<Authed>> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return fail("logged_out");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
  if (!profile) return fail("logged_out");
  if (profile.status === "suspended") return fail("suspended");
  return ok({ supabase, userId: data.user.id, email: data.user.email ?? "", profile });
}

/** Admins only. Anyone else gets `not_found`, so the answer says nothing about what exists. */
export async function requireAdmin(): Promise<ActionResult<Authed>> {
  const result = await requireUser();
  if (!result.ok) return result;
  return result.data.profile.role === "admin" ? result : fail("not_found");
}

/** The person's own limits (empty = the plan's number), as `getLimits` wants them. */
export const overridesOf = (profile: Profile): LimitOverrides => ({ maxQuizzes: profile.max_quizzes, maxPages: profile.max_pages, maxResponses: profile.max_responses });
