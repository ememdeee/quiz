/** One list of error codes, shared by the mock repositories and (later) the real server actions. */
export const errorCodes = [
  "logged_out",
  "suspended",
  "load_failed",
  "not_found",
  "limit_quizzes",
  "name_required",
  "slug_taken",
  "slug_invalid",
  "publish_blocked",
  "picture_rejected",
] as const;
export type ErrorCode = (typeof errorCodes)[number];

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ErrorCode };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: ErrorCode): ActionResult<never> => ({ ok: false, error });

/** Codes the whole dashboard answers with a dialog (see DashEventsProvider); screens do not show their own message for them. */
export const isSessionError = (code: ErrorCode) => code === "logged_out" || code === "suspended";
