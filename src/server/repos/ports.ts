import type { ActionResult } from "@/lib/errors";
import type { QuizDocument } from "@/lib/quiz/schema";
import type { Profile, QuizBundle, QuizStart, QuizSummary } from "@/lib/quizzes/types";

/**
 * What the screens may ask the data layer for (handover 4.3). Everything is async, so the same
 * calls work against the browser mock now and against server actions in Phase 5.
 * The mock lives in ./mock; this file holds only the shapes, so it is safe to import anywhere.
 */
export interface QuizzesRepo {
  list(): Promise<ActionResult<QuizSummary[]>>;
  get(id: string): Promise<ActionResult<QuizBundle>>;
  saveDraft(id: string, draft: QuizDocument): Promise<ActionResult<QuizSummary>>;
  create(input: { name: string; from: QuizStart }): Promise<ActionResult<QuizSummary>>;
  rename(id: string, name: string): Promise<ActionResult<QuizSummary>>;
  duplicate(id: string): Promise<ActionResult<QuizSummary>>;
  setAcceptingResponses(id: string, accepting: boolean): Promise<ActionResult<QuizSummary>>;
  remove(id: string): Promise<ActionResult<{ id: string }>>;
}

export interface ProfilesRepo {
  getCurrent(): Promise<ActionResult<Profile>>;
}

export type Repos = { quizzes: QuizzesRepo; profiles: ProfilesRepo };
