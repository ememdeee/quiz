import type { LoginState } from "@/lib/routes";
import type { MockSessionKind } from "@/server/session";

/**
 * Made-up people for the UI phase. Each one triggers a different screen, so every
 * sign-in state can be clicked through. Removed with the mock layer in Phase 15.
 */
export const MOCK_PASSWORD = "password123";

type MockAccount = { email: string; outcome: MockSessionKind | Extract<LoginState, "unverified" | "suspended" | "too-many"> };

export const mockAccounts: readonly MockAccount[] = [
  { email: "demo@quiz.test", outcome: "user" },
  { email: "admin@quiz.test", outcome: "admin" },
  { email: "unverified@quiz.test", outcome: "unverified" },
  { email: "suspended@quiz.test", outcome: "suspended" },
  { email: "locked@quiz.test", outcome: "too-many" },
];

export type MockLoginResult = MockSessionKind | LoginState;

export function checkMockLogin(email: string, password: string): MockLoginResult {
  const account = mockAccounts.find((a) => a.email === email.trim().toLowerCase());
  if (!account) return "error";
  if (account.outcome === "too-many") return "too-many";
  if (password !== MOCK_PASSWORD) return "error";
  return account.outcome;
}
