import { diffQuiz } from "@/lib/quiz/diff";
import type { QuizDocument } from "@/lib/quiz/schema";
import type { QuizSummary } from "./types";

/** The numbers on a quiz card that come from its documents, so the list can never disagree with the editor. */
export function documentFacts(draft: QuizDocument, published: QuizDocument | null): Pick<QuizSummary, "pageCount" | "unpublishedChanges"> {
  return { pageCount: draft.pages.length, unpublishedChanges: published ? diffQuiz(draft, published).count : 0 };
}
