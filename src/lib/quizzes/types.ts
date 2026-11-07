import type { LimitOverrides, Plan } from "@/lib/plan/limits";

/** One quiz as the list and the editor header see it. The pages themselves come in the editor slice. */
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
};

export type Profile = {
  name: string;
  email: string;
  plan: Plan;
  overrides: LimitOverrides;
};

/** What a new quiz starts from (board NewQuiz). */
export type QuizStart = { kind: "blank" } | { kind: "template"; templateId: string } | { kind: "copy"; quizId: string };
