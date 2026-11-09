"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ErrorCode } from "@/lib/errors";
import type { Answers } from "@/lib/quiz/conditions";
import { answersFromStored, currentPage, goBack, goNext, resumeRun, setAnswer, startRun, storedAnswers, type RunState } from "@/lib/quiz/runner";
import { repos } from "@/server/repos";
import type { PublicQuiz, SavedRun } from "@/server/repos/ports";

/** Where the quiz screen gets its quiz from: its public link, or the owner's working copy (Try it). */
export type RunnerSource = { kind: "live"; slug: string } | { kind: "preview"; quizId: string };

export type Screen =
  | { kind: "loading" }
  | { kind: "status"; status: "closed" | "not_published" | "not_found" | "error" }
  | { kind: "resume"; quiz: PublicQuiz; saved: SavedRun; run: RunState }
  | { kind: "done"; quiz: PublicQuiz }
  | { kind: "run"; quiz: PublicQuiz; run: RunState };

const openedKey = (quizId: string) => `quiz.opened.${quizId}`;

/** Counts a visit once for each browser tab session. */
function firstOpenInTab(quizId: string): boolean {
  try {
    if (window.sessionStorage.getItem(openedKey(quizId))) return false;
    window.sessionStorage.setItem(openedKey(quizId), "1");
  } catch {
    // Storage blocked: count it, a little too often is better than never
  }
  return true;
}

/**
 * Everything the quiz screen does: opens the quiz, remembers where the person stopped, checks each answer,
 * saves as they go and tells the screen what to show. The rules themselves live in `lib/quiz/runner.ts`.
 * Try it (`preview`) runs the same code and never calls save or start.
 */
export function useQuizRunner(source: RunnerSource) {
  const live = source.kind === "live";
  const [screen, setScreen] = useState<Screen>({ kind: "loading" });
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const responseId = useRef<string | null>(null);
  const retryWith = useRef<(() => Promise<void>) | null>(null);

  const sourceKey = source.kind === "live" ? source.slug : source.quizId;

  useEffect(() => {
    let cancelled = false;
    setScreen({ kind: "loading" });
    responseId.current = null;
    void (async () => {
      const loaded = source.kind === "live" ? await repos.runner.load(source.slug) : await repos.runner.loadPreview(source.quizId);
      if (cancelled) return;
      if (!loaded.ok) return setScreen({ kind: "status", status: loaded.error === "not_found" ? "not_found" : "error" });
      if (loaded.data.status !== "live") return setScreen({ kind: "status", status: loaded.data.status });
      const quiz = loaded.data.quiz;
      const fresh = startRun(quiz.document);
      if (source.kind === "preview") return setScreen({ kind: "run", quiz, run: fresh });

      if (firstOpenInTab(quiz.quizId)) void repos.runner.trackOpen(quiz.quizId);
      const saved = await repos.runner.resume(quiz.quizId);
      if (cancelled) return;
      if (!saved) return setScreen({ kind: "run", quiz, run: fresh });
      if (saved.finished) return setScreen({ kind: "done", quiz });
      const run = resumeRun(quiz.document, answersFromStored(saved.answers), saved.pagesSeen, saved.lastPageId);
      setScreen({ kind: "resume", quiz, saved, run });
    })();
    return () => {
      cancelled = true;
    };
    // `source` is described fully by its key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, source.kind, attempt]);

  const setRun = useCallback((run: RunState) => setScreen((current) => (current.kind === "run" ? { ...current, run } : current)), []);

  /** Saves the page the person just reached. Returns false (and tells the screen) when that did not work. */
  const persist = useCallback(
    async (quiz: PublicQuiz, next: RunState, finished: boolean, retry: () => Promise<void>): Promise<boolean> => {
      if (!live) return true;
      const failWith = (code: ErrorCode) => {
        if (code === "quiz_closed") setScreen({ kind: "status", status: "closed" });
        else {
          retryWith.current = retry;
          setSaveFailed(true);
        }
        return false;
      };
      if (!responseId.current) {
        const started = await repos.runner.start(quiz.quizId);
        if (!started.ok) return failWith(started.error);
        responseId.current = started.data.responseId;
      }
      const saved = await repos.runner.save(quiz.quizId, responseId.current, {
        answers: storedAnswers(next),
        pagesSeen: next.path,
        lastPageId: currentPage(next).id,
        finished,
      });
      if (!saved.ok) return failWith(saved.error);
      // A save that went through carries all the answers, so it also covers an older one that failed
      retryWith.current = null;
      setSaveFailed(false);
      return true;
    },
    [live],
  );

  /** Saves go out one after another in the order they were made, so a slow one never overtakes a newer one. */
  const queue = useRef<Promise<boolean>>(Promise.resolve(true));
  const enqueue = useCallback(
    (quiz: PublicQuiz, next: RunState, finished: boolean, retry: () => Promise<void>) => {
      queue.current = queue.current.then(() => persist(quiz, next, finished, retry));
      return queue.current;
    },
    [persist],
  );

  /**
   * Continue: check the page, then show the next one at once. The save runs in the background; if it fails the person sees
   * "We couldn't save your answer" with Try again (every save carries all the answers, so the newest one is enough).
   * The last page waits for its save, because "Thank you" must only appear once the answers are really kept.
   */
  const advance = useCallback(
    async (quiz: PublicQuiz, from: RunState) => {
      const step = goNext(from);
      if (step.state.problem) return setRun(step.state);
      setSaveFailed(false);
      if (!step.finished) {
        setRun(step.state);
        const resend = async () => {
          setSaveFailed(false);
          await enqueue(quiz, step.state, false, resend);
        };
        void enqueue(quiz, step.state, false, resend);
        return;
      }
      setSaving(true);
      const saved = await enqueue(quiz, step.state, true, () => advance(quiz, from));
      setSaving(false);
      if (saved) setRun(step.state);
    },
    [enqueue, setRun],
  );

  const next = useCallback(() => {
    if (screen.kind === "run" && !saving) void advance(screen.quiz, screen.run);
  }, [screen, saving, advance]);

  /** Stores what the person typed or picked. A single choice moves on by itself. */
  const answer = useCallback(
    (pageId: string, value: Answers[string], moveOn = false) => {
      if (screen.kind !== "run" || saving) return;
      const updated = setAnswer(screen.run, pageId, value);
      setRun(updated);
      setSaveFailed(false);
      if (moveOn) void advance(screen.quiz, updated);
    },
    [screen, saving, advance, setRun],
  );

  const back = useCallback(() => {
    if (screen.kind !== "run" || saving) return;
    setSaveFailed(false);
    setRun(goBack(screen.run));
  }, [screen, saving, setRun]);

  const retry = useCallback(() => {
    const again = retryWith.current;
    if (!again || saving) return;
    void again();
  }, [saving]);

  /** "Welcome back", Continue */
  const continueRun = useCallback(() => {
    if (screen.kind !== "resume") return;
    responseId.current = screen.saved.responseId;
    setScreen({ kind: "run", quiz: screen.quiz, run: screen.run });
  }, [screen]);

  /** "Start over" and "Take it again": a new response begins when the person presses Start. */
  const startOver = useCallback(() => {
    if (screen.kind !== "resume" && screen.kind !== "done") return;
    responseId.current = null;
    setScreen({ kind: "run", quiz: screen.quiz, run: startRun(screen.quiz.document) });
  }, [screen]);

  return { screen, saving, saveFailed, next, answer, back, retry, continueRun, startOver, reload: () => setAttempt((n) => n + 1) };
}
