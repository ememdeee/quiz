import type { Page, QuizDocument } from "./schema";

export type QuizDiff = {
  added: string[];
  changed: string[];
  removed: string[];
  /** added + changed + removed: the "N changes not published" number */
  count: number;
};

/** Length of the longest run of pages that kept their relative order; the pages outside it were moved. */
function movedPages(before: string[], after: string[]): string[] {
  const rank = new Map(before.map((id, index) => [id, index]));
  const sequence = after.filter((id) => rank.has(id));
  const best: number[] = [];
  const previous: number[] = [];
  let end = -1;
  sequence.forEach((id, i) => {
    best[i] = 1;
    previous[i] = -1;
    for (let j = 0; j < i; j++) {
      if ((rank.get(sequence[j]) ?? 0) < (rank.get(id) ?? 0) && best[j] + 1 > best[i]) {
        best[i] = best[j] + 1;
        previous[i] = j;
      }
    }
    if (end === -1 || best[i] > best[end]) end = i;
  });
  const kept = new Set<string>();
  for (let i = end; i >= 0; i = previous[i]) kept.add(sequence[i]);
  return sequence.filter((id) => !kept.has(id));
}

const same = (a: Page, b: Page) => JSON.stringify(a) === JSON.stringify(b);

/**
 * What is different between the draft and the published copy, by page. A page counts once: added, removed, edited, or
 * moved to a different place. Used by the editor ("3 changes not published") and later by the Edit with AI check.
 */
export function diffQuiz(draft: QuizDocument, published: QuizDocument): QuizDiff {
  const before = new Map(published.pages.map((page) => [page.id, page]));
  const after = new Map(draft.pages.map((page) => [page.id, page]));
  const added = draft.pages.filter((page) => !before.has(page.id)).map((page) => page.id);
  const removed = published.pages.filter((page) => !after.has(page.id)).map((page) => page.id);
  const edited = draft.pages.filter((page) => before.has(page.id) && !same(page, before.get(page.id) as Page)).map((page) => page.id);
  const moved = movedPages(
    published.pages.map((p) => p.id),
    draft.pages.map((p) => p.id),
  );
  const changed = [...new Set([...edited, ...moved])];
  return { added, changed, removed, count: added.length + changed.length + removed.length };
}
