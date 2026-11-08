import { pageTypes } from "@/lib/quiz/page-types";
import type { QuizDocument } from "@/lib/quiz/schema";
import { answerText } from "../individual";
import type { QuizResponse } from "../types";

/** One row per person, one column per question (handover 8.8). The same table feeds CSV, Excel and JSON. */
export type ResponseTable = { headers: string[]; rows: string[][] };

const FIXED = ["Response", "Status", "Started", "Finished"];

/** Questions you removed keep their column at the end, named with their last saved text. */
export function removedColumns(doc: QuizDocument, responses: readonly QuizResponse[]): { id: string; label: string }[] {
  const known = new Set(doc.pages.map((p) => p.id));
  const found = new Map<string, string>();
  for (const response of [...responses].sort((a, b) => a.startedAt.localeCompare(b.startedAt))) {
    for (const [id, answer] of Object.entries(response.answers)) if (!known.has(id)) found.set(id, answer.q);
  }
  return [...found.entries()].map(([id, q]) => ({ id, label: `(removed) ${q}` }));
}

export function buildTable(doc: QuizDocument, responses: readonly QuizResponse[]): ResponseTable {
  const questions = doc.pages.map((page, index) => ({ page, index })).filter(({ page }) => pageTypes[page.type].isQuestion);
  const removed = removedColumns(doc, responses);
  const headers = [...FIXED, ...questions.map(({ page, index }) => `${index + 1}. ${pageTypes[page.type].title(page as never)}`), ...removed.map((c) => c.label)];
  const rows = [...responses]
    .sort((a, b) => a.number - b.number)
    .map((response) => [
      String(response.number),
      response.status === "finished" ? "Finished" : "Unfinished",
      response.startedAt,
      response.finishedAt ?? "",
      ...questions.map(({ page }) => {
        const answer = response.answers[page.id];
        return answer ? (answer.vt ? answer.vt.join("; ") : answerText(page, answer)) : "";
      }),
      ...removed.map((c) => {
        const answer = response.answers[c.id];
        return answer ? (answer.vt ? answer.vt.join("; ") : String(answer.v)) : "";
      }),
    ]);
  return { headers, rows };
}
