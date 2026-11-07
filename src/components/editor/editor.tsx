"use client";

import { useCallback, useMemo, useState } from "react";
import { TOAST_SECONDS, useToast } from "@/components/ui/toast";
import { editorToasts } from "@/content/dashboard/editor";
import { useAutosave } from "@/hooks/use-autosave";
import { useProfile } from "@/hooks/use-quizzes";
import { dependentsOfAnswer, dependentsOfPage } from "@/lib/quiz/conditions";
import type { PageType } from "@/lib/quiz/schema";
import { FREE_LIMITS, getLimits } from "@/lib/plan/limits";
import type { QuizBundle } from "@/lib/quizzes/types";
import { createEditorStore } from "@/store/editor-store";
import { AddPageDialog } from "./add-page-dialog";
import { Canvas } from "./canvas/canvas";
import { EditorStoreProvider, EditorUiProvider, useEditor, type EditorUi } from "./editor-context";
import { EditorHeader } from "./editor-header";
import { DeletePageDialog, PageLimitDialog, RemoveAnswerDialog } from "./page-dialogs";
import { PageList } from "./page-list/page-list";
import { PagePanel } from "./panels";

type DialogState =
  | { kind: "add" }
  | { kind: "limit" }
  | { kind: "delete"; pageId: string; count: number }
  | { kind: "answer"; pageId: string; answerId: string; count: number; text: string }
  | null;

/** The editor for one quiz (board Main): page list, what people see, and the panel for the chosen page. */
export function Editor({ bundle }: { bundle: QuizBundle }) {
  const [store] = useState(() => createEditorStore(bundle.draft));
  const save = useAutosave(bundle.quiz.id, store);
  const profile = useProfile();
  const maxPages = profile ? getLimits(profile).pagesPerQuiz : FREE_LIMITS.pagesPerQuiz;
  const { show } = useToast();
  const [dialog, setDialog] = useState<DialogState>(null);

  /** Deletes a page at once and offers Undo. */
  const deletePage = useCallback(
    (pageId: string) => {
      store.getState().remove(pageId);
      const after = store.getState().revision;
      show({
        message: editorToasts.pageDeleted,
        seconds: TOAST_SECONDS.undo,
        action: {
          label: editorToasts.undo,
          // Only undo the delete itself: if the person kept editing, there is nothing for this button to take back
          onSelect: () => store.getState().revision === after && store.getState().undo(),
        },
      });
    },
    [store, show],
  );

  const ui = useMemo<EditorUi>(() => {
    const atLimit = () => store.getState().doc.pages.length >= maxPages;
    return {
      requestAddPage: () => setDialog(atLimit() ? { kind: "limit" } : { kind: "add" }),
      requestDuplicate: (pageId) => (atLimit() ? setDialog({ kind: "limit" }) : store.getState().duplicate(pageId)),
      requestDeletePage: (pageId) => {
        const count = dependentsOfPage(store.getState().doc, pageId).length;
        if (count > 0) setDialog({ kind: "delete", pageId, count });
        else deletePage(pageId);
      },
      requestRemoveAnswer: (pageId, answerId) => {
        const { doc } = store.getState();
        const page = doc.pages.find((p) => p.id === pageId);
        const text = page?.type === "choice" ? (page.answers.find((a) => a.id === answerId)?.text ?? "") : "";
        const count = dependentsOfAnswer(doc, pageId, answerId).length;
        if (count > 0) setDialog({ kind: "answer", pageId, answerId, count, text });
        else store.getState().removeAnswer(pageId, answerId);
      },
      requestMove: (pageId, to) => {
        if (store.getState().move(pageId, to) === "conditions") show({ message: editorToasts.moveBlocked, tone: "error", seconds: TOAST_SECONDS.confirm });
      },
    };
  }, [store, maxPages, show, deletePage]);

  const closeDialog = () => setDialog(null);
  const addPage = (type: PageType) => {
    store.getState().add(type);
    closeDialog();
  };

  return (
    <EditorStoreProvider store={store}>
      <EditorUiProvider ui={ui}>
        <div className="flex min-h-dvh flex-col">
          <EditorHeader bundle={bundle} save={save.state} onRetry={save.retry} />
          <div className="flex flex-wrap items-start gap-6 p-6">
            <PageList maxPages={maxPages} />
            <Canvas />
            <SelectedPanel />
          </div>
        </div>

        {dialog?.kind === "add" ? <AddPageDialog onAdd={addPage} onClose={closeDialog} /> : null}
        {dialog?.kind === "limit" ? <PageLimitDialog max={maxPages} onClose={closeDialog} /> : null}
        {dialog?.kind === "delete" ? (
          <DeletePageDialog
            count={dialog.count}
            onClose={closeDialog}
            onConfirm={() => {
              deletePage(dialog.pageId);
              closeDialog();
            }}
          />
        ) : null}
        {dialog?.kind === "answer" ? (
          <RemoveAnswerDialog
            count={dialog.count}
            answer={dialog.text}
            onClose={closeDialog}
            onConfirm={() => {
              store.getState().removeAnswer(dialog.pageId, dialog.answerId);
              closeDialog();
            }}
          />
        ) : null}
      </EditorUiProvider>
    </EditorStoreProvider>
  );
}

function SelectedPanel() {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const index = Math.max(0, doc.pages.findIndex((p) => p.id === selectedId));
  const page = doc.pages[index];
  return page ? <PagePanel page={page} position={index + 1} /> : null;
}
