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

export type Autosave = {
  state: SaveState;
  retry: () => void;
  /** The quiz was saved from another tab or window since this one loaded it (the dialog of gap G1 is waiting for an answer) */
  conflict: boolean;
  /** "Keep my version" saves what this screen has on top of the other one. "Reload" loads the newest version and drops what is here. */
  resolveConflict: (choice: "keep" | "reload") => Promise<void>;
  /** Tell the autosave the version some other call returned (publish, rename), so it does not count as "another tab". */
  syncVersion: (version: number) => void;
};

/**
 * Saves the draft a moment after the last change (board Saving): "Saving…", then saved, or "Couldn't save" with a way to try again.
 * While offline it waits and saves by itself when the connection is back. Leaving the page saves what is left.
 * Every save carries the version this screen last saw; if the quiz moved on in the meantime nothing is overwritten and the
 * person chooses (gap G1).
 */
export function useAutosave(quizId: string, store: EditorStore, startVersion: number): Autosave {
  const { reportError } = useDashEvents();
  const offline = useOffline();
  const [state, setState] = useState<SaveState>("saved");
  const [conflict, setConflict] = useState(false);
  const savedRevision = useRef(store.getState().revision);
  const version = useRef(startVersion);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saving = useRef(false);
  const waitingForAnswer = useRef(false);

  const flush = useCallback(async () => {
    if (saving.current || waitingForAnswer.current) return;
    const { revision, doc } = store.getState();
    if (revision === savedRevision.current) return setState("saved");
    saving.current = true;
    setState("saving");
    const result = await repos.quizzes.saveDraft(quizId, doc, { baseVersion: version.current });
    saving.current = false;
    if (!result.ok) {
      if (result.error === "conflict") {
        waitingForAnswer.current = true;
        setConflict(true);
        return setState("error");
      }
      reportError(result.error);
      return setState("error");
    }
    version.current = result.data.version;
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

  // Leaving the editor: save what is left (not while a "changed somewhere else" question is open: that would decide for the person)
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      const { revision, doc } = store.getState();
      if (revision !== savedRevision.current && !waitingForAnswer.current) void repos.quizzes.saveDraft(quizId, doc as QuizDocument, { baseVersion: version.current });
    },
    [quizId, store],
  );

  const resolveConflict = useCallback(
    async (choice: "keep" | "reload") => {
      if (choice === "reload") {
        window.location.reload();
        return;
      }
      const { revision, doc } = store.getState();
      const result = await repos.quizzes.saveDraft(quizId, doc, { keepMine: true });
      if (!result.ok) {
        reportError(result.error);
        return;
      }
      version.current = result.data.version;
      savedRevision.current = revision;
      waitingForAnswer.current = false;
      setConflict(false);
      // More was typed while the answer was being saved: carry on as usual
      if (store.getState().revision !== revision) void flush();
      else setState("saved");
    },
    [quizId, store, reportError, flush],
  );

  const syncVersion = useCallback((next: number) => {
    version.current = Math.max(version.current, next);
  }, []);

  return { state, retry: () => void flush(), conflict, resolveConflict, syncVersion };
}
