import type { LimitOverrides, Plan } from "@/lib/plan/limits";
import type { QuizDocument } from "@/lib/quiz/schema";

/** One quiz as the list and the editor header see it. The pages themselves are in the document (`QuizBundle`). */
export type QuizSummary = {
  id: string;
  name: string;
  slug: string;
  /** null until the first publish */
  firstPublishedAt: string | null;
  acceptingResponses: boolean;
  /** Pages changed since the last publish (0 when nothing is waiting). */
  unpublishedChanges: number;
  pageCount: number;
  finishedResponses: number;
  updatedAt: string;
  /**
   * The version of the working copy. Every save of the pages raises it. The editor sends the version it last saw with each save, so
   * a save from a second tab or window is noticed (the "changed somewhere else" dialog, gap G1).
   */
  version: number;
};

/** A quiz with its working copy and, once published, the copy people see. */
export type QuizBundle = { quiz: QuizSummary; draft: QuizDocument; published: QuizDocument | null };

export type Profile = {
  name: string;
  email: string;
  plan: Plan;
  overrides: LimitOverrides;
};

/** What a new quiz starts from (board NewQuiz). */
export type QuizStart = { kind: "blank" } | { kind: "template"; templateId: string } | { kind: "copy"; quizId: string };
