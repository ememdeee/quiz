"use client";

import type { Draft } from "immer";
import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useStore } from "zustand";
import type { PageOf, PageType } from "@/lib/quiz/schema";
import type { EditorActions, EditorState, EditorStore } from "@/store/editor-store";

/** Gives every part of the editor the one store that holds the quiz being edited. */
const StoreContext = createContext<EditorStore | null>(null);

export function EditorStoreProvider({ store, children }: { store: EditorStore; children: ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

function useStoreApi(): EditorStore {
  const store = useContext(StoreContext);
  if (!store) throw new Error("The editor store is missing: wrap the editor in EditorStoreProvider");
  return store;
}

/** Read a piece of the editor state; the part re-renders only when that piece changes. */
export function useEditor<T>(selector: (state: EditorState & EditorActions) => T): T {
  return useStore(useStoreApi(), selector);
}

/** The actions only (they never change, so using them never re-renders). */
export const useEditorActions = (): EditorActions => useStoreApi().getState();

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
