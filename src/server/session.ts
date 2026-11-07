import "server-only";
import { cookies } from "next/headers";

/**
 * Mock session for the UI phase (DATA_MODE=mock). A cookie says who is "logged in".
 * Phase 4 replaces the inside of these functions with Supabase Auth; callers do not change.
 */
export type SessionUser = { name: string; email: string; isAdmin: boolean };

export const SESSION_COOKIE = "mock_session";

const people = {
  user: { name: "Sarah Miller", email: "demo@quiz.test", isAdmin: false },
  admin: { name: "Muhammad Basurah", email: "admin@quiz.test", isAdmin: true },
} satisfies Record<string, SessionUser>;

export type MockSessionKind = keyof typeof people;

export async function getSessionUser(): Promise<SessionUser | null> {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value && value in people ? people[value as MockSessionKind] : null;
}

export async function startSession(kind: MockSessionKind) {
  (await cookies()).set(SESSION_COOKIE, kind, { path: "/", httpOnly: true, sameSite: "lax" });
}

export async function endSession() {
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
