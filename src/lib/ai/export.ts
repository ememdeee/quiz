import type { QuizDocument } from "@/lib/quiz/schema";
import { buildPrompt } from "./prompt";

/** The quiz as data: everything that makes up the pages, and nothing else (no responses, no settings, no picture files). */
export const quizData = (doc: QuizDocument) => JSON.stringify(doc, null, 2);

/** What "Copy for AI" and "Copy the quiz data only" put on the clipboard. */
export function buildAiExport(doc: QuizDocument, pageLimit: number): { full: string; dataOnly: string } {
  const data = quizData(doc);
  return { full: buildPrompt(data, pageLimit), dataOnly: data };
}
