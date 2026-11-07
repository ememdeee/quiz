import "server-only";
import { cookies } from "next/headers";
import { dataMode } from "@/lib/env";
import { createClient } from "@/server/supabase/server";

/**
 * Who is logged in. In mock mode a cookie says who (the UI phase); in supabase mode it is the real Supabase session and the
 * person's profile. Callers do not know the difference.
 */
export type SessionUser = { name: string; email: string; isAdmin: boolean };

export const SESSION_COOKIE = "mock_session";

const people = {
  user: { name: "Sarah Miller", email: "demo@quiz.test", isAdmin: false },
  admin: { name: "Muhammad Basurah", email: "admin@quiz.test", isAdmin: true },
} satisfies Record<string, SessionUser>;

export type MockSessionKind = keyof typeof people;

export async function getSessionUser(): Promise<SessionUser | null> {
  if (dataMode === "supabase") return getSupabaseUser();
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value && value in people ? people[value as MockSessionKind] : null;
}

/** The real person: nobody if there is no session, or if the account is suspended. */
async function getSupabaseUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile } = await supabase.from("profiles").select("name, role, status").eq("id", data.user.id).single();
  if (!profile || profile.status === "suspended") return null;
  const email = data.user.email ?? "";
  return { name: profile.name || email.split("@")[0], email, isAdmin: profile.role === "admin" };
}

export async function startSession(kind: MockSessionKind) {
  (await cookies()).set(SESSION_COOKIE, kind, { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function endSession() {
  if (dataMode === "supabase") {
    await (await createClient()).auth.signOut();
    return;
  }
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The address a person just typed on a sign-in screen, so the next screen can show it
 * ("We sent a link to ..."). Kept in a short cookie, never in the URL.
 */
const PENDING_EMAIL_COOKIE = "pending_email";

export async function setPendingEmail(email: string) {
  (await cookies()).set(PENDING_EMAIL_COOKIE, email.trim(), { path: "/", httpOnly: true, sameSite: "lax", maxAge: 60 * 60 });
}

export async function getPendingEmail(): Promise<string | null> {
  return (await cookies()).get(PENDING_EMAIL_COOKIE)?.value ?? null;
}
