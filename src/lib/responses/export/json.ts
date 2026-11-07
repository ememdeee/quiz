import type { QuizDocument } from "@/lib/quiz/schema";
import { answerText } from "../individual";
import type { QuizResponse } from "../types";

/** `{ id, status, startedAt, finishedAt, answers: [{ pageId, question, answer }] }` for every response. */
export function toJson(doc: QuizDocument, responses: readonly QuizResponse[]): string {
  const pages = new Map(doc.pages.map((p) => [p.id, p]));
  const data = [...responses]
    .sort((a, b) => a.number - b.number)
    .map((r) => ({
      id: r.id,
      status: r.status,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
      answers: Object.entries(r.answers).map(([pageId, a]) => ({ pageId, question: a.q, answer: answerText(pages.get(pageId), a) })),
    }));
  return JSON.stringify(data, null, 2);
}
