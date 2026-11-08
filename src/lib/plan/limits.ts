/** Plan limits, in one place. The UI uses them to be friendly; the server enforces the same numbers. */
export type Plan = "free" | "custom";

export type Limits = { quizzes: number; pagesPerQuiz: number; responsesPerQuiz: number };

export const FREE_LIMITS: Limits = { quizzes: 5, pagesPerQuiz: 15, responsesPerQuiz: 500 };

/** Per-person overrides set by the admin. null means "use the plan default". */
export type LimitOverrides = { maxQuizzes: number | null; maxPages: number | null; maxResponses: number | null };

export const NO_OVERRIDES: LimitOverrides = { maxQuizzes: null, maxPages: null, maxResponses: null };

/** Plan defaults, replaced by the person's own numbers where the admin set them. */
export function getLimits(profile: { overrides: LimitOverrides }): Limits {
  const { maxQuizzes, maxPages, maxResponses } = profile.overrides;
  return {
    quizzes: maxQuizzes ?? FREE_LIMITS.quizzes,
    pagesPerQuiz: maxPages ?? FREE_LIMITS.pagesPerQuiz,
    responsesPerQuiz: maxResponses ?? FREE_LIMITS.responsesPerQuiz,
  };
}

export const hasReachedQuizLimit = (quizCount: number, limits: Limits) => quizCount >= limits.quizzes;

export const planName = (plan: Plan) => (plan === "free" ? "Free" : "Custom");
