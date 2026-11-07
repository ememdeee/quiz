/** The sign-in lock (board LoginTooMany): 5 wrong passwords in a row wait 15 minutes. One place for the numbers, used by the server and the tests. */
export const MAX_LOGIN_FAILURES = 5;
export const LOGIN_LOCK_MINUTES = 15;

export const isLockedOut = (failures: number) => failures >= MAX_LOGIN_FAILURES;

/** Only same-site relative paths may be used as "go here after logging in" (stops a login link from sending people to another website). */
export function safeNext(next: string | null | undefined, fallback: string): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  return next;
}
