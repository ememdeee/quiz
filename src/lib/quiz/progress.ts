import { z } from "zod";
import type { StoredAnswer } from "@/lib/responses/types";
import { visiblePages, type Answers } from "./conditions";
import { pageTypes } from "./page-types";
import { checkAnswer, storedAnswer } from "./runner";
import type { Page, QuizDocument } from "./schema";

/**
 * What the server accepts from a person answering a quiz (handover 6.6). Nothing the browser says about the quiz is trusted:
 * every answer is checked against the PUBLISHED page it belongs to, the question and option texts are written from the
 * published page (not from what was sent), and answers to pages this person's earlier answers have hidden are dropped.
 */
const rawAnswer = z.union([z.string().max(5000), z.number().finite(), z.array(z.string().max(60)).max(20)]);

const progressInput = z.object({
  answers: z.record(z.string().max(60), rawAnswer).refine((all) => Object.keys(all).length <= 200),
  pagesSeen: z.array(z.string().max(60)).max(400),
  lastPageId: z.string().max(60),
});

export type CleanProgress = { answers: Record<string, StoredAnswer>; pagesSeen: string[]; lastPageId: string };
export type ProgressProblem = "malformed" | "unknown_page" | "bad_answer";

const isAnswerKind = (page: Page) => pageTypes[page.type].isQuestion;

/** Checks and cleans one save. `unknown_page` means the page is not in the quiz people see. */
export function cleanProgress(doc: QuizDocument, input: unknown): { ok: true; progress: CleanProgress } | { ok: false; problem: ProgressProblem } {
  const parsed = progressInput.safeParse(input);
  if (!parsed.success) return { ok: false, problem: "malformed" };
  const { answers: sent, pagesSeen, lastPageId } = parsed.data;

  const byId = new Map(doc.pages.map((page) => [page.id, page]));
  if (!byId.has(lastPageId)) return { ok: false, problem: "unknown_page" };

  const raw: Answers = {};
  for (const [pageId, value] of Object.entries(sent)) {
    const page = byId.get(pageId);
    if (!page || !isAnswerKind(page)) return { ok: false, problem: "unknown_page" };
    if (!fitsPage(page, value)) return { ok: false, problem: "bad_answer" };
    raw[pageId] = value;
  }

  // Answers of pages that this person's other answers have hidden are not kept
  const visible = new Set(visiblePages(doc, raw).map((page) => page.id));
  const answers: Record<string, StoredAnswer> = {};
  for (const [pageId, value] of Object.entries(raw)) {
    if (!visible.has(pageId)) continue;
    const saved = storedAnswer(byId.get(pageId)!, value);
    if (saved) answers[pageId] = saved;
  }

  const seen = [...new Set(pagesSeen)].filter((id) => byId.has(id));
  if (!seen.includes(lastPageId)) seen.push(lastPageId);
  return { ok: true, progress: { answers, pagesSeen: seen, lastPageId } };
}

/** The value has the right shape for this page, and passes the page's own rules (range, email, option ids). */
function fitsPage(page: Page, value: Answers[string]): boolean {
  if (page.type === "choice") {
    if (!Array.isArray(value)) return false;
    const ids = new Set(page.answers.map((answer) => answer.id));
    if (!value.every((id) => ids.has(id)) || new Set(value).size !== value.length) return false;
    if (!page.multiple && value.length > 1) return false;
  } else if (page.type === "text") {
    if (typeof value !== "string") return false;
  } else if (page.type === "number") {
    if (page.kind === "date" ? typeof value !== "string" || (value !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(value)) : Array.isArray(value)) return false;
  }
  return checkAnswer(page, value) === null || isEmpty(value);
}

const isEmpty = (value: Answers[string]) => value === "" || value === undefined || (Array.isArray(value) && value.length === 0);

/** May this person be marked finished? They are on the End page and every question they were shown that needs an answer has a good one. */
export function canFinish(doc: QuizDocument, progress: CleanProgress): boolean {
  const last = doc.pages.find((page) => page.id === progress.lastPageId);
  if (!last || last.type !== "end") return false;
  const answers: Answers = Object.fromEntries(Object.entries(progress.answers).map(([id, answer]) => [id, answer.v]));
  return visiblePages(doc, answers)
    .filter(isAnswerKind)
    .every((page) => checkAnswer(page, answers[page.id]) === null);
}
