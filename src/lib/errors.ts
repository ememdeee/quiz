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
  "wrong_password",
  "invalid_email",
  "password_short",
  /** The person's quiz was closed (or filled up) while they were answering */
  "quiz_closed",
  /** The admin tried to suspend or delete their own account */
  "own_account",
  /** The email typed to confirm a delete is not the person's email */
  "confirm_mismatch",
  /** A limit that is not a whole number of 1 or more */
  "invalid_limit",
] as const;
export type ErrorCode = (typeof errorCodes)[number];

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: ErrorCode };

export const ok = <T>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: ErrorCode): ActionResult<never> => ({ ok: false, error });

/** Codes the whole dashboard answers with a dialog (see DashEventsProvider); screens do not show their own message for them. */
export const isSessionError = (code: ErrorCode) => code === "logged_out" || code === "suspended";
