"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { useDashEvents } from "@/components/dashboard/dash-events";
import { DeleteDialog } from "@/components/dashboard/quiz-list/quiz-dialogs";
import { TOAST_SECONDS, useToast } from "@/components/ui/toast";
import { aiToast } from "@/content/dashboard/ai";
import { dashErrors } from "@/content/dashboard/common";
import { editorToasts } from "@/content/dashboard/editor";
import { useAutosave } from "@/hooks/use-autosave";
import { useProfile } from "@/hooks/use-quizzes";
import { FREE_LIMITS, getLimits } from "@/lib/plan/limits";
import { dependentsOfAnswer, dependentsOfPage } from "@/lib/quiz/conditions";
import { diffQuiz } from "@/lib/quiz/diff";
import type { PageType } from "@/lib/quiz/schema";
import { validateQuiz } from "@/lib/quiz/validate";
import type { QuizBundle, QuizSummary } from "@/lib/quizzes/types";
import { routes } from "@/lib/routes";
import { repos } from "@/server/repos";
import { createEditorStore } from "@/store/editor-store";
import { AddPageDialog } from "./add-page-dialog";
import { AiDialog } from "./ai/ai-dialog";
import { Canvas } from "./canvas/canvas";
import { ConflictDialog } from "./conflict-dialog";
import { EditorStoreProvider, EditorUiProvider, ProblemsProvider, useEditor, type EditorUi } from "./editor-context";
import { EditorHeader } from "./editor-header";
import { MediaProvider } from "./media-context";
import { DeletePageDialog, PageLimitDialog, RemoveAnswerDialog } from "./page-dialogs";
import { PageList } from "./page-list/page-list";
import { PagePanel } from "./panels";
import { PictureDialog } from "./picture-dialog";
import { NoQuestionDialog, ProblemsDialog, PublishDialog, ShareDialog } from "./publish-dialogs";
import { SettingsDrawer } from "./settings-drawer";

type DialogState =
  | { kind: "add" }
  | { kind: "limit" }
  | { kind: "delete"; pageId: string; count: number }
  | { kind: "answer"; pageId: string; answerId: string; count: number; text: string }
  | { kind: "publish" }
  | { kind: "problems" }
  | { kind: "noQuestion" }
  | { kind: "share"; live: boolean }
  | { kind: "settings" }
  | { kind: "deleteQuiz" }
  | { kind: "picture"; onPick: (mediaId: string) => void }
  | { kind: "ai" }
  | null;

/** The editor for one quiz (board Main): page list, what people see, and the panel for the chosen page. */
export function Editor({ bundle: initial, openSettings = false }: { bundle: QuizBundle; openSettings?: boolean }) {
  const [store] = useState(() => createEditorStore(initial.draft));
  const [bundle, setBundle] = useState(initial);
  const save = useAutosave(initial.quiz.id, store, initial.quiz.version);
  const profile = useProfile();
  const maxPages = profile ? getLimits(profile).pagesPerQuiz : FREE_LIMITS.pagesPerQuiz;
  const { show } = useToast();
  const { reportError } = useDashEvents();
  const router = useRouter();
  const [dialog, setDialog] = useState<DialogState>(openSettings ? { kind: "settings" } : null);
  const [publishing, setPublishing] = useState(false);
  // A new web address of a live quiz waits here until Publish, so the shared link keeps working until then (gap G27)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);

  const { syncVersion } = save;
  const setQuiz = useCallback(
    (quiz: QuizSummary) => {
      syncVersion(quiz.version);
      setBundle((current) => ({ ...current, quiz }));
    },
    [syncVersion],
  );

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
      requestPublish: () => {
        const { doc } = store.getState();
        store.getState().revealProblems();
        const problems = validateQuiz(doc, { maxPages });
        if (problems.some((p) => p.code === "no_question")) setDialog({ kind: "noQuestion" });
        else setDialog(problems.length > 0 ? { kind: "problems" } : { kind: "publish" });
      },
      requestShare: () => setDialog({ kind: "share", live: false }),
      requestSettings: () => setDialog({ kind: "settings" }),
      requestPicture: (onPick) => setDialog({ kind: "picture", onPick }),
      requestAi: () => setDialog({ kind: "ai" }),
    };
  }, [store, maxPages, show, deletePage]);

  const closeDialog = () => setDialog(null);

  const addPage = (type: PageType) => {
    store.getState().add(type);
    closeDialog();
  };

  const publish = async () => {
    setPublishing(true);
    if (pendingSlug) {
      const moved = await repos.quizzes.setSlug(bundle.quiz.id, pendingSlug);
      setPendingSlug(null);
      if (!moved.ok) {
        setPublishing(false);
        if (!reportError(moved.error)) show({ message: moved.error === "slug_taken" ? editorToasts.addressTaken : dashErrors.generic, tone: "error" });
        return closeDialog();
      }
      setQuiz(moved.data);
    }
    const result = await repos.quizzes.publish(bundle.quiz.id, store.getState().doc);
    setPublishing(false);
    if (!result.ok) {
      if (!reportError(result.error)) show({ message: dashErrors.generic, tone: "error" });
      return closeDialog();
    }
    syncVersion(result.data.quiz.version);
    setBundle(result.data);
    setDialog({ kind: "share", live: true });
  };

  const removeQuiz = async () => {
    const result = await repos.quizzes.remove(bundle.quiz.id);
    if (result.ok) router.push(routes.dashboard);
    else if (!reportError(result.error)) show({ message: dashErrors.generic, tone: "error" });
  };

  const applied = (counts: { added: number; changed: number; removed: number }) => {
    closeDialog();
    const after = store.getState().revision;
    show({
      message: aiToast.updated(counts.added, counts.changed, counts.removed),
      seconds: TOAST_SECONDS.undo,
      action: { label: editorToasts.undo, onSelect: () => store.getState().revision === after && store.getState().undo() },
    });
  };

  return (
    <EditorStoreProvider store={store}>
      <EditorUiProvider ui={ui}>
        <MediaProvider>
          <ProblemsProvider maxPages={maxPages}>
            <div className="flex min-h-dvh flex-col">
              <EditorHeader bundle={bundle} save={save.state} onRetry={save.retry} pendingSlug={pendingSlug} />
              <div className="flex flex-wrap items-start gap-6 p-6">
                <PageList maxPages={maxPages} />
                <Canvas />
                <SelectedPanel />
              </div>
            </div>

            {save.conflict ? <ConflictDialog onChoose={save.resolveConflict} /> : null}
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
            {dialog?.kind === "publish" ? (
              <PublishDialog
                changes={bundle.published ? diffQuiz(store.getState().doc, bundle.published).count : null}
                newAddress={pendingSlug}
                pages={store.getState().doc.pages.length}
                pending={publishing}
                onConfirm={() => void publish()}
                onClose={closeDialog}
              />
            ) : null}
            {dialog?.kind === "problems" ? (
              <ProblemsDialogHost
                onGo={(pageId) => {
                  store.getState().select(pageId);
                  closeDialog();
                }}
                onClose={closeDialog}
                maxPages={maxPages}
              />
            ) : null}
            {dialog?.kind === "noQuestion" ? <NoQuestionDialog onAdd={() => ui.requestAddPage()} onClose={closeDialog} /> : null}
            {dialog?.kind === "share" ? <ShareDialog slug={bundle.quiz.slug} live={dialog.live} onClose={closeDialog} /> : null}
            {dialog?.kind === "settings" ? (
              <SettingsDrawer quiz={bundle.quiz} save={save.state} onQuiz={setQuiz} pendingSlug={pendingSlug} onPendingSlug={setPendingSlug} onDelete={() => setDialog({ kind: "deleteQuiz" })} onClose={closeDialog} />
            ) : null}
            {dialog?.kind === "deleteQuiz" ? <DeleteDialog quiz={bundle.quiz} onConfirm={removeQuiz} onClose={() => setDialog({ kind: "settings" })} /> : null}
            {dialog?.kind === "picture" ? (
              <PictureDialog
                current={null}
                onClose={closeDialog}
                onPick={(id) => {
                  dialog.onPick(id);
                  closeDialog();
                }}
              />
            ) : null}
            {dialog?.kind === "ai" ? <AiDialog maxPages={maxPages} onApplied={applied} onClose={closeDialog} /> : null}
          </ProblemsProvider>
        </MediaProvider>
      </EditorUiProvider>
    </EditorStoreProvider>
  );
}

/** Reads the current problems when the dialog opens, so it lists exactly what the person has to fix. */
function ProblemsDialogHost({ onGo, onClose, maxPages }: { onGo: (pageId: string) => void; onClose: () => void; maxPages: number }) {
  const doc = useEditor((s) => s.doc);
  const problems = useMemo(() => validateQuiz(doc, { maxPages }), [doc, maxPages]);
  return <ProblemsDialog doc={doc} problems={problems} onGo={onGo} onClose={onClose} />;
}

function SelectedPanel() {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const index = Math.max(0, doc.pages.findIndex((p) => p.id === selectedId));
  const page = doc.pages[index];
  return page ? <PagePanel page={page} position={index + 1} /> : null;
}

