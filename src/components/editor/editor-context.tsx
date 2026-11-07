"use client";

import type { Draft } from "immer";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useStore } from "zustand";
import { fieldMessage } from "@/content/dashboard/publish";
import type { PageOf, PageType } from "@/lib/quiz/schema";
import { validateQuiz, type Problem } from "@/lib/quiz/validate";
import type { EditorActions, EditorState, EditorStore } from "@/store/editor-store";

/** Gives every part of the editor the one store that holds the quiz being edited. */
const StoreContext = createContext<EditorStore | null>(null);

export function EditorStoreProvider({ store, children }: { store: EditorStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

/** The store itself, for code that needs the state right now rather than a value to draw. */
export function useEditorStoreApi(): EditorStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("The editor store is missing: wrap the editor in EditorStoreProvider");
  return store;
}

/** Read a piece of the editor state; the part re-renders only when that piece changes. */
export function useEditor<T>(selector: (state: EditorState & EditorActions) => T): T {
  return useStore(useEditorStoreApi(), selector);
}

/** The actions only (they never change, so using them never re-renders). */
export const useEditorActions = (): EditorActions => useEditorStoreApi().getState();

/** Edit one page of a known type. `field` names what is typed in, so a burst of typing is one Undo step. */
export function usePageEdit<T extends PageType>(page: PageOf<T>) {
  const { edit } = useEditorActions();
  return useCallback(
    (field: string | undefined, recipe: (draft: Draft<PageOf<T>>) => void) => edit(page.id, (draft) => recipe(draft as Draft<PageOf<T>>), field),
    [edit, page.id],
  );
}

/** What the parts of the editor ask the editor itself to do, because it owns the dialogs and toasts. */
export type EditorUi = {
  requestAddPage: () => void;
  requestDuplicate: (pageId: string) => void;
  requestDeletePage: (pageId: string) => void;
  requestRemoveAnswer: (pageId: string, answerId: string) => void;
  requestMove: (pageId: string, to: number) => void;
  requestPublish: () => void;
  requestShare: () => void;
  requestSettings: () => void;
  /** Opens the picture dialog; `onPick` gets the id of the chosen picture. */
  requestPicture: (onPick: (mediaId: string) => void) => void;
  requestAi: () => void;
};

const UiContext = createContext<EditorUi | null>(null);

export function EditorUiProvider({ ui, children }: { ui: EditorUi; children: ReactNode }) {
  return <UiContext.Provider value={ui}>{children}</UiContext.Provider>;
}

export function useEditorUi(): EditorUi {
  const ui = useContext(UiContext);
  if (!ui) throw new Error("EditorUiProvider is missing");
  return ui;
}

/** Everything wrong with the quiz right now, worked out once and shared (board PublishProblems). */
const ProblemsContext = createContext<Problem[]>([]);

export function ProblemsProvider({ maxPages, children }: { maxPages: number; children: ReactNode }) {
  const doc = useEditor((s) => s.doc);
  const problems = useMemo(() => validateQuiz(doc, { maxPages }), [doc, maxPages]);
  return <ProblemsContext.Provider value={problems}>{children}</ProblemsContext.Provider>;
}

export const useProblems = () => useContext(ProblemsContext);

/**
 * Props for one field of a page: the error to show (only after the person left the field, or after Publish was
 * pressed) and the blur handler that marks it as left.
 */
export function useFieldProps(pageId: string) {
  const problems = useProblems();
  const revealAll = useEditor((s) => s.revealAll);
  const touched = useEditor((s) => s.touched);
  const { touch } = useEditorActions();
  return useCallback(
    (field: string) => {
      const problem = problems.find((p) => p.pageId === pageId && p.field === field);
      const visible = problem && (revealAll || touched[`${pageId}:${field}`]);
      return { error: visible ? fieldMessage(problem.code) : undefined, onBlur: () => touch(pageId, field) };
    },
    [problems, revealAll, touched, touch, pageId],
  );
}
