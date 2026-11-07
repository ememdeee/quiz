import { pagesWithBrokenRules, removeAnswerDependencies, removePageDependencies } from "./conditions";
import { newId } from "./ids";
import { pageTypes } from "./page-types";
import type { Page, PageType, QuizDocument } from "./schema";

/** The plain changes an editor makes to a quiz document: add, copy, move, delete. Pure, so they are easy to test and to undo. */

/** Start and End pages have a lock: they can be edited, never moved, copied or deleted. */
export const isLocked = (page: Page) => page.type === "welcome" || page.type === "end";

export const indexOfPage = (doc: QuizDocument, id: string) => doc.pages.findIndex((page) => page.id === id);

/** Why a page could not be moved, or null when the move is fine. */
export type MoveBlock = "locked" | "edge" | "conditions";

function place(doc: QuizDocument, from: number, to: number): QuizDocument {
  const pages = [...doc.pages];
  const [moved] = pages.splice(from, 1);
  pages.splice(to, 0, moved);
  return { ...doc, pages };
}

/** Moves a page to a new position among the middle pages. Blocked when it would break a display condition. */
export function movePage(doc: QuizDocument, id: string, to: number): { doc: QuizDocument } | { blocked: MoveBlock } {
  const from = indexOfPage(doc, id);
  if (from === -1 || isLocked(doc.pages[from])) return { blocked: "locked" };
  if (to < 1 || to > doc.pages.length - 2 || to === from) return { blocked: "edge" };
  const next = place(doc, from, to);
  if (pagesWithBrokenRules(next).length > pagesWithBrokenRules(doc).length) return { blocked: "conditions" };
  return { doc: next };
}

/** A new page of this kind, just before the End page. */
export function addPage(doc: QuizDocument, type: PageType): { doc: QuizDocument; page: Page } {
  const page = pageTypes[type].create(newId()) as Page;
  const pages = [...doc.pages];
  pages.splice(pages.length - 1, 0, page);
  return { doc: { ...doc, pages }, page };
}

/** A copy of a page right after the original, with its own ids. Not for Start and End pages. */
export function duplicatePage(doc: QuizDocument, id: string): { doc: QuizDocument; page: Page } | null {
  const index = indexOfPage(doc, id);
  const original = doc.pages[index];
  if (!original || isLocked(original)) return null;
  const copy = structuredClone(original) as Page;
  copy.id = newId();
  if (copy.type === "choice") copy.answers = copy.answers.map((answer) => ({ ...answer, id: newId() }));
  const pages = [...doc.pages];
  pages.splice(index + 1, 0, copy);
  return { doc: { ...doc, pages }, page: copy };
}

/** Removes a page and the conditions of other pages that looked at it. Not for Start and End pages. */
export function deletePage(doc: QuizDocument, id: string): QuizDocument | null {
  const page = doc.pages.find((p) => p.id === id);
  if (!page || isLocked(page)) return null;
  const without = { ...doc, pages: doc.pages.filter((p) => p.id !== id) };
  return removePageDependencies(without, id);
}

/** Removes one answer of a choice page and the conditions that looked at it. */
export function removeAnswer(doc: QuizDocument, pageId: string, answerId: string): QuizDocument {
  const pages = doc.pages.map((page) =>
    page.id === pageId && page.type === "choice" ? { ...page, answers: page.answers.filter((a) => a.id !== answerId) } : page,
  );
  return removeAnswerDependencies({ ...doc, pages }, pageId, answerId);
}
