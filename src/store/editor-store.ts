import { produce, type Draft } from "immer";
import { createStore } from "zustand/vanilla";
import { addPage, deletePage, duplicatePage, movePage, removeAnswer, type MoveBlock } from "@/lib/quiz/ops";
import type { Page, PageType, QuizDocument } from "@/lib/quiz/schema";

/**
 * The quiz being edited, with an undo history. The document is the whole truth: pages, order, conditions.
 * Typing is grouped (one Undo undoes a burst of typing in one field); every other action is one Undo step.
 */
export const HISTORY_LIMIT = 100;
/** Typing in the same field within this time counts as one step. */
export const TYPING_GROUP_MS = 800;

export type EditorState = {
  doc: QuizDocument;
  selectedId: string;
  /** Goes up on every change, so autosave knows when there is something new to save. */
  revision: number;
  past: QuizDocument[];
  /** Pages whose answers show picture slots. A screen setting, not part of the quiz document. */
  answerPictures: Record<string, boolean>;
  lastGroup: { key: string; at: number } | null;
};

export type EditorActions = {
  select: (pageId: string) => void;
  /** Change one page. `group` names the field being typed in, so a burst of typing is one Undo step. */
  edit: (pageId: string, recipe: (page: Draft<Page>) => void, group?: string) => void;
  /** Replace the whole document (one Undo step), for example after a reorder. */
  replace: (doc: QuizDocument) => void;
  add: (type: PageType) => Page;
  duplicate: (pageId: string) => void;
  move: (pageId: string, to: number) => MoveBlock | null;
  remove: (pageId: string) => void;
  removeAnswer: (pageId: string, answerId: string) => void;
  setAnswerPictures: (pageId: string, on: boolean) => void;
  undo: () => void;
  canUndo: () => boolean;
};

export type EditorStore = ReturnType<typeof createEditorStore>;

export function createEditorStore(initial: QuizDocument, now: () => number = Date.now) {
  return createStore<EditorState & EditorActions>()((set, get) => {
    /** Makes `next` the document. `group` merges this change into the previous step when it continues the same typing. */
    const commit = (next: QuizDocument, group?: string, selectedId?: string) =>
      set((state) => {
        if (next === state.doc) return state;
        const at = now();
        const continues = group !== undefined && state.lastGroup?.key === group && at - state.lastGroup.at < TYPING_GROUP_MS;
        return {
          doc: next,
          selectedId: selectedId ?? state.selectedId,
          revision: state.revision + 1,
          past: continues ? state.past : [...state.past, state.doc].slice(-HISTORY_LIMIT),
          lastGroup: group === undefined ? null : { key: group, at },
        };
      });

    return {
      doc: initial,
      selectedId: initial.pages[0]?.id ?? "",
      revision: 0,
      past: [],
      answerPictures: Object.fromEntries(
        initial.pages.filter((p) => p.type === "choice" && p.answers.some((a) => a.picture)).map((p) => [p.id, true]),
      ),
      lastGroup: null,

      select: (pageId) => set({ selectedId: pageId }),

      edit: (pageId, recipe, group) =>
        commit(
          produce(get().doc, (doc) => {
            const page = doc.pages.find((p) => p.id === pageId);
            if (page) recipe(page as Draft<Page>);
          }),
          group === undefined ? undefined : `${pageId}:${group}`,
        ),

      replace: (doc) => commit(doc),

      add: (type) => {
        const { doc, page } = addPage(get().doc, type);
        commit(doc, undefined, page.id);
        return page;
      },

      duplicate: (pageId) => {
        const result = duplicatePage(get().doc, pageId);
        if (result) commit(result.doc, undefined, result.page.id);
      },

      move: (pageId, to) => {
        const result = movePage(get().doc, pageId, to);
        if ("blocked" in result) return result.blocked;
        commit(result.doc);
        return null;
      },

      remove: (pageId) => {
        const { doc, selectedId } = get();
        const next = deletePage(doc, pageId);
        if (!next) return;
        const index = doc.pages.findIndex((p) => p.id === pageId);
        const fallback = next.pages[Math.min(index, next.pages.length - 1)]?.id ?? "";
        commit(next, undefined, selectedId === pageId ? fallback : selectedId);
      },

      removeAnswer: (pageId, answerId) => commit(removeAnswer(get().doc, pageId, answerId)),

      setAnswerPictures: (pageId, on) => set((state) => ({ answerPictures: { ...state.answerPictures, [pageId]: on } })),

      undo: () =>
        set((state) => {
          const previous = state.past[state.past.length - 1];
          if (!previous) return state;
          const stillThere = previous.pages.some((p) => p.id === state.selectedId);
          return {
            doc: previous,
            past: state.past.slice(0, -1),
            selectedId: stillThere ? state.selectedId : (previous.pages[0]?.id ?? ""),
            revision: state.revision + 1,
            lastGroup: null,
          };
        }),

      canUndo: () => get().past.length > 0,
    };
  });
}
