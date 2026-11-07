"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDashEvents } from "@/components/dashboard/dash-events";
import type { SaveState } from "@/components/ui/save-status";
import { useOffline } from "@/hooks/use-offline";
import type { QuizDocument } from "@/lib/quiz/schema";
import { repos } from "@/server/repos";
import type { EditorStore } from "@/store/editor-store";

/** Wait this long after the last change before saving. */
export const AUTOSAVE_MS = 800;

/**
 * Saves the draft a moment after the last change (board Saving): "Saving…", then saved, or "Couldn't save" with a way to try again.
 * While offline it waits and saves by itself when the connection is back. Leaving the page saves what is left.
 */
export function useAutosave(quizId: string, store: EditorStore): { state: SaveState; retry: () => void } {
  const { reportError } = useDashEvents();
  const offline = useOffline();
  const [state, setState] = useState<SaveState>("saved");
  const savedRevision = useRef(store.getState().revision);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);

  const flush = useCallback(async () => {
    if (saving.current) return;
    const { revision, doc } = store.getState();
    if (revision === savedRevision.current) return setState("saved");
    saving.current = true;
    setState("saving");
    const result = await repos.quizzes.saveDraft(quizId, doc);
    saving.current = false;
    if (!result.ok) {
      reportError(result.error);
      return setState("error");
    }
    savedRevision.current = revision;
    // Something changed while this was saving: go again
    if (store.getState().revision !== revision) void flush();
    else setState("saved");
  }, [quizId, store, reportError]);

  useEffect(() => {
    return store.subscribe((current, previous) => {
      if (current.revision === previous.revision) return;
      setState("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void (navigator.onLine ? flush() : undefined), AUTOSAVE_MS);
    });
  }, [store, flush]);

  // Back online: save what is waiting
  useEffect(() => {
    if (!offline && store.getState().revision !== savedRevision.current) void flush();
  }, [offline, store, flush]);

  // Leaving the editor: save what is left
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      const { revision, doc } = store.getState();
      if (revision !== savedRevision.current) void repos.quizzes.saveDraft(quizId, doc as QuizDocument);
    },
    [quizId, store],
  );

  return { state, retry: () => void flush() };
}
