import type { Profile, QuizSummary } from "@/lib/quizzes/types";
import { NO_OVERRIDES } from "@/lib/plan/limits";

/** The owner on the Free plan with 3 of 5 quizzes, as in the Quizzes board. */
export const mockProfile: Profile = { name: "Sarah Miller", email: "demo@quiz.test", plan: "free", overrides: NO_OVERRIDES };

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

/** Seed quizzes. Times are "ago" so the list always reads like the design, whenever it is opened. */
export function seedQuizzes(now: number = Date.now()): QuizSummary[] {
  const ago = (ms: number) => new Date(now - ms).toISOString();
  return [
    {
      id: "quiz-body-reset",
      name: "Body Reset",
      slug: "body-reset",
      firstPublishedAt: ago(40 * DAY),
      acceptingResponses: true,
      unpublishedChanges: 3,
      pageCount: 7,
      finishedResponses: 128,
      updatedAt: ago(2 * DAY),
    },
    {
      id: "quiz-debug",
      name: "Debug quiz",
      slug: "debug-quiz",
      firstPublishedAt: ago(60 * DAY),
      acceptingResponses: false,
      unpublishedChanges: 0,
      pageCount: 4,
      finishedResponses: 12,
      updatedAt: ago(21 * DAY),
    },
    {
      id: "quiz-customer-feedback",
      name: "Customer feedback",
      slug: "customer-feedback",
      firstPublishedAt: null,
      acceptingResponses: true,
      unpublishedChanges: 0,
      pageCount: 5,
      finishedResponses: 0,
      updatedAt: ago(10 * 1000),
    },
  ];
}
