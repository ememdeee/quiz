import { mockProfile, seedBundles } from "@/data/mock/seed";
import { getLimits } from "@/lib/plan/limits";
import { blankQuiz } from "@/lib/quiz/templates";
import { documentFacts } from "@/lib/quizzes/summary";
import type { QuizBundle } from "@/lib/quizzes/types";
import { defaultFlags, writeFlags } from "./flags";
import { generateResponses } from "@/data/mock/responses";
import { resetAccount } from "./account";
import { resetAdmin } from "./admin";
import { resetMedia } from "./media";
import { resetResponses, setForQuiz } from "./responses";
import { loadBundles, resetBundles } from "./store";

/** Buttons on /dev that put the dummy data into a known state. Mock only. */

export function resetAll() {
  resetBundles(seedBundles());
  resetMedia();
  resetResponses();
  resetAccount();
  resetAdmin();
  writeFlags(defaultFlags);
}

export function emptyList() {
  resetBundles([]);
}

/** Tops the list up to the plan limit with plain quizzes, so "You've reached 5 quizzes" is one click away. */
export function fillToLimit() {
  const bundles = loadBundles();
  const limit = getLimits(mockProfile).quizzes;
  const extra: QuizBundle[] = Array.from({ length: Math.max(0, limit - bundles.length) }, (_, i) => {
    const number = bundles.length + i + 1;
    const draft = blankQuiz(`Practice quiz ${number}`);
    return {
      draft,
      published: null,
      quiz: {
        id: crypto.randomUUID(),
        name: draft.name,
        slug: `practice-quiz-${number}`,
        firstPublishedAt: null,
        acceptingResponses: true,
        finishedResponses: 0,
        updatedAt: new Date(Date.now() - (i + 1) * 3_600_000).toISOString(),
        version: 1,
        ...documentFacts(draft, null),
      },
    };
  });
  resetBundles([...bundles, ...extra]);
}

/** Gives Body Reset exactly this many finished responses, so the 450 and 500 banners can be seen. */
export function setBodyResetResponses(finished: number) {
  const bundle = loadBundles().find((b) => b.quiz.id === "quiz-body-reset");
  if (!bundle) return;
  const now = Date.now();
  setForQuiz(bundle.quiz.id, { opened: Math.round(finished * 1.45), responses: generateResponses(bundle.draft, { finished, unfinished: 20, now, seed: 7, removed: { id: "smoke", q: "Do you smoke?" } }) });
}

/** An account that logs in with Google only (board AccountGoogleOnly). */
export const makeGoogleOnly = () => resetAccount(true);
