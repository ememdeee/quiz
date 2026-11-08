import { isValidEmail } from "@/lib/validation";
import type { StoredAnswer } from "@/lib/responses/types";
import { visiblePages, type Answers } from "./conditions";
import type { Page, QuizDocument } from "./schema";

/**
 * The rules of "How the quiz behaves" as pure functions: where a person is, what Continue checks, how the progress
 * bar moves, what Back does and what is saved. The quiz screen only calls these (handover 8.7).
 */

export type AnswerProblem = "pick_one" | "write_something" | "email" | "phone" | "number_needed" | "range" | "date_needed";

export type RunState = {
  doc: QuizDocument;
  /** What the person answered so far, by page id */
  answers: Answers;
  /** The pages this person reached, in order. The last one is the page on screen. */
  path: string[];
  /** 0 to 1. It only ever grows. */
  progress: number;
  /** What is wrong with the page on screen, shown after Continue */
  problem: AnswerProblem | null;
};

const PHONE = /^\+?[\d\s().-]+$/;

const hasText = (value: unknown): value is string => typeof value === "string" && value.trim() !== "";

/** Why an answer cannot be accepted, or null. An empty optional answer is fine. */
export function checkAnswer(page: Page, value: Answers[string]): AnswerProblem | null {
  if (page.type === "choice") return page.required && !(Array.isArray(value) && value.length > 0) ? "pick_one" : null;

  if (page.type === "text") {
    const text = typeof value === "string" ? value.trim() : "";
    if (text === "") return page.required ? (page.input === "email" ? "email" : page.input === "phone" ? "phone" : "write_something") : null;
    if (page.input === "email") return isValidEmail(text) ? null : "email";
    if (page.input === "phone") return PHONE.test(text) && text.replace(/\D/g, "").length >= 6 && text.replace(/\D/g, "").length <= 15 ? null : "phone";
    return null;
  }

  if (page.type === "number") {
    if (page.kind === "date") return hasText(value) || !page.required ? null : "date_needed";
    if (value === undefined || value === "") return page.required ? "number_needed" : null;
    const n = Number(value);
    if (Number.isNaN(n)) return "number_needed";
    if (page.min !== null && n < page.min) return "range";
    if (page.max !== null && n > page.max) return "range";
    return null;
  }

  return null;
}

/** The page the person is on. */
export const currentPage = (state: RunState): Page => state.doc.pages.find((p) => p.id === state.path[state.path.length - 1]) ?? state.doc.pages[0];

/** Where the current page sits among the pages this person will see: 0 to 1, the last page is 1. */
function position(doc: QuizDocument, answers: Answers, pageId: string): number {
  const visible = visiblePages(doc, answers);
  if (visible.length < 2) return 1;
  const at = visible.findIndex((p) => p.id === pageId);
  return at === -1 ? 0 : at / (visible.length - 1);
}

export function startRun(doc: QuizDocument): RunState {
  return { doc, answers: {}, path: [doc.pages[0].id], progress: 0, problem: null };
}

/** Picks up where a person stopped: their answers and the pages they reached. */
export function resumeRun(doc: QuizDocument, answers: Answers, pagesSeen: string[], lastPageId: string): RunState {
  const known = new Set(doc.pages.map((p) => p.id));
  const path = pagesSeen.filter((id) => known.has(id));
  const last = known.has(lastPageId) ? lastPageId : (path[path.length - 1] ?? doc.pages[0].id);
  const trimmed = path.includes(last) ? path.slice(0, path.indexOf(last) + 1) : [...path, last];
  return { doc, answers, path: trimmed, progress: position(doc, answers, last), problem: null };
}

/** Stores an answer. The message under the field goes away as soon as the person changes it. */
export function setAnswer(state: RunState, pageId: string, value: Answers[string]): RunState {
  return { ...state, answers: { ...state.answers, [pageId]: value }, problem: null };
}

/** Answers of pages that this person's answers have made hidden are dropped (they changed an earlier answer). */
function withoutHidden(doc: QuizDocument, answers: Answers): Answers {
  const visible = new Set(visiblePages(doc, answers).map((p) => p.id));
  return Object.fromEntries(Object.entries(answers).filter(([id]) => visible.has(id)));
}

export type Step = { state: RunState; /** true when the person has just reached the End page */ finished: boolean };

/** Continue: check the page, then go to the next page this person will see. A problem keeps them where they are. */
export function goNext(state: RunState): Step {
  const page = currentPage(state);
  const problem = checkAnswer(page, state.answers[page.id]);
  if (problem) return { state: { ...state, problem }, finished: false };

  const answers = withoutHidden(state.doc, state.answers);
  const index = state.doc.pages.findIndex((p) => p.id === page.id);
  const visible = new Set(visiblePages(state.doc, answers).map((p) => p.id));
  const next = state.doc.pages.slice(index + 1).find((p) => visible.has(p.id));
  if (!next) return { state: { ...state, answers, problem: null }, finished: page.type === "end" };

  const progress = Math.max(state.progress, position(state.doc, answers, next.id));
  return { state: { ...state, answers, path: [...state.path, next.id], progress, problem: null }, finished: next.type === "end" };
}

/** Back: the previous page this person actually saw. The Loading screen is skipped, it is not something to go back to. */
export function goBack(state: RunState): RunState {
  const path = [...state.path];
  while (path.length > 1) {
    path.pop();
    const page = state.doc.pages.find((p) => p.id === path[path.length - 1]);
    if (page && page.type !== "loading") break;
  }
  return { ...state, path, problem: null };
}

export const canGoBack = (state: RunState) => state.path.length > 1;

/** True on the first and last page, where the top bar is hidden. */
export function hidesTopBar(state: RunState): boolean {
  const page = currentPage(state);
  return page.type === "welcome" || page.type === "end";
}

/** One answer the way it is saved: the question text and the chosen option texts as they are right now (handover 5.5). */
export function storedAnswer(page: Page, value: Answers[string]): StoredAnswer | null {
  if (page.type === "choice") {
    const ids = Array.isArray(value) ? value : [];
    if (ids.length === 0) return null;
    const vt = ids.map((id) => page.answers.find((a) => a.id === id)?.text ?? "");
    return { type: "choice", q: page.question, v: ids, vt };
  }
  if (page.type === "text") return hasText(value) ? { type: "text", q: page.question, v: value.trim() } : null;
  if (page.type === "number") {
    if (page.kind === "date") return hasText(value) ? { type: "number", q: page.question, v: value } : null;
    if (value === undefined || value === "" || Number.isNaN(Number(value))) return null;
    return { type: "number", q: page.question, v: Number(value) };
  }
  return null;
}

/** Everything saved so far for one person. Pages that do not apply to them are left out. */
export function storedAnswers(state: RunState): Record<string, StoredAnswer> {
  const result: Record<string, StoredAnswer> = {};
  for (const page of state.doc.pages) {
    const saved = storedAnswer(page, state.answers[page.id]);
    if (saved) result[page.id] = saved;
  }
  return result;
}

/** The answers a saved response gives back to the quiz screen. */
export function answersFromStored(stored: Record<string, StoredAnswer>): Answers {
  return Object.fromEntries(Object.entries(stored).map(([id, a]) => [id, a.v]));
}

/** "Page 4 of 7" for the Welcome back screen: where the person stopped among the pages they will see. */
export function pageNumbers(state: RunState): { page: number; total: number } {
  const visible = visiblePages(state.doc, state.answers);
  const at = visible.findIndex((p) => p.id === currentPage(state).id);
  return { page: Math.max(1, at + 1), total: visible.length };
}
