import { pageTypes } from "@/lib/quiz/page-types";
import type { Page, QuizDocument } from "@/lib/quiz/schema";
import type { QuizResponse, StoredAnswer } from "./types";

/** The date choices of the Responses pages (boards Report and Responses). */
export const dateRanges = [
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "all", label: "All time", days: null },
] as const;
export type DateRange = (typeof dateRanges)[number]["value"];

const DAY = 24 * 60 * 60 * 1000;

export function inRange(response: QuizResponse, range: DateRange, now: number = Date.now()): boolean {
  const days = dateRanges.find((r) => r.value === range)?.days ?? null;
  return days === null || now - new Date(response.startedAt).getTime() <= days * DAY;
}

/** The text of an answer as a person reads it ("Lose weight", "165 cm", "March 1, 2027"). */
export function answerText(page: Page | undefined, answer: StoredAnswer): string {
  if (answer.vt) return answer.vt.join(", ");
  if (page?.type === "number" && page.kind === "date" && typeof answer.v === "string") {
    return new Date(`${answer.v}T00:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  if (page?.type === "number" && page.unit && page.kind !== "age") return `${answer.v} ${page.unit}`;
  return String(answer.v);
}

type Filters = { query: string; range: DateRange; includeUnfinished: boolean };

/** Newest first, narrowed by the three controls above the list. Search looks at the answer text. */
export function filterResponses(doc: QuizDocument, responses: readonly QuizResponse[], filters: Filters, now?: number): QuizResponse[] {
  const needle = filters.query.trim().toLowerCase();
  const pages = new Map(doc.pages.map((p) => [p.id, p]));
  return responses
    .filter((r) => (filters.includeUnfinished ? true : r.status === "finished"))
    .filter((r) => inRange(r, filters.range, now))
    .filter((r) => !needle || Object.entries(r.answers).some(([id, a]) => answerText(pages.get(id), a).toLowerCase().includes(needle)))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** "Left at page 5": the position of the last page an unfinished person reached. null for people who finished. */
export function leftAtPage(doc: QuizDocument, response: QuizResponse): number | null {
  if (response.status === "finished") return null;
  const index = doc.pages.findIndex((p) => p.id === response.lastPageId);
  return index === -1 ? null : index + 1;
}

/** "Finished in 3 min": null while unfinished. */
export function minutesTaken(response: QuizResponse): number | null {
  if (!response.finishedAt) return null;
  return Math.max(1, Math.round((new Date(response.finishedAt).getTime() - new Date(response.startedAt).getTime()) / 60_000));
}

export type AnswerRow = { pageId: string; position: number | null; question: string; answer: string | null; removed: boolean };

/** Every answer in page order: skipped questions say "No answer" (null here), removed questions come last. */
export function answerRows(doc: QuizDocument, response: QuizResponse): AnswerRow[] {
  const rows: AnswerRow[] = doc.pages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => pageTypes[page.type].isQuestion)
    .filter(({ page }) => response.pagesSeen.includes(page.id) || response.answers[page.id])
    .map(({ page, index }) => {
      const answer = response.answers[page.id];
      const blank = !answer || (typeof answer.v === "string" && answer.v.trim() === "");
      return { pageId: page.id, position: index + 1, question: pageTypes[page.type].title(page as never), answer: blank ? null : answerText(page, answer), removed: false };
    });
  const known = new Set(doc.pages.map((p) => p.id));
  for (const [id, answer] of Object.entries(response.answers)) {
    if (!known.has(id)) rows.push({ pageId: id, position: null, question: answer.q, answer: answerText(undefined, answer), removed: true });
  }
  return rows;
}
