import { mockProfile, seedQuizzes } from "@/data/mock/seed";
import { getLimits } from "@/lib/plan/limits";
import { defaultFlags, writeFlags } from "./flags";
import { loadQuizzes, resetQuizzes } from "./store";

/** Buttons on /dev that put the dummy data into a known state. Mock only. */

export function resetAll() {
  resetQuizzes(seedQuizzes());
  writeFlags(defaultFlags);
}

export function emptyList() {
  resetQuizzes([]);
}

/** Tops the list up to the plan limit with plain quizzes, so "You've reached 5 quizzes" is one click away. */
export function fillToLimit() {
  const quizzes = loadQuizzes();
  const limit = getLimits(mockProfile).quizzes;
  const extra = Array.from({ length: Math.max(0, limit - quizzes.length) }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Practice quiz ${quizzes.length + i + 1}`,
    slug: `practice-quiz-${quizzes.length + i + 1}`,
    firstPublishedAt: null,
    acceptingResponses: true,
    unpublishedChanges: 0,
    pageCount: 2,
    finishedResponses: 0,
    updatedAt: new Date(Date.now() - (i + 1) * 3_600_000).toISOString(),
  }));
  resetQuizzes([...quizzes, ...extra]);
}
