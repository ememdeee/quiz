"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashEvents } from "@/components/dashboard/dash-events";
import type { ActionResult } from "@/lib/errors";
import { getLimits, type Limits } from "@/lib/plan/limits";
import type { Profile, QuizBundle, QuizStart, QuizSummary } from "@/lib/quizzes/types";
import { repos } from "@/server/repos";

/** What a screen may show for the quiz list. The screens never talk to a repository themselves. */
export type QuizListState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; quizzes: QuizSummary[]; profile: Profile; limits: Limits };

export function useQuizzes() {
  const { reportError } = useDashEvents();
  const [state, setState] = useState<QuizListState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    const [list, profile] = await Promise.all([repos.quizzes.list(), repos.profiles.getCurrent()]);
    if (!list.ok) reportError(list.error);
    if (!profile.ok) reportError(profile.error);
    if (!list.ok || !profile.ok) return setState({ status: "error" });
    setState({ status: "ready", quizzes: list.data, profile: profile.data, limits: getLimits(profile.data) });
  }, [reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Runs a change, tells the dashboard about session problems, and updates the list when it worked. */
  const change = useCallback(
    async <T>(request: Promise<ActionResult<T>>, apply: (quizzes: QuizSummary[], data: T) => QuizSummary[]): Promise<ActionResult<T>> => {
      const result = await request;
      if (!result.ok) {
        reportError(result.error);
        return result;
      }
      setState((current) => (current.status === "ready" ? { ...current, quizzes: apply(current.quizzes, result.data) } : current));
      return result;
    },
    [reportError],
  );

  const replaceOne = (quizzes: QuizSummary[], updated: QuizSummary) => quizzes.map((q) => (q.id === updated.id ? updated : q));

  return {
    state,
    reload: load,
    create: (input: { name: string; from: QuizStart }) => change(repos.quizzes.create(input), (all, created) => [created, ...all]),
    rename: (id: string, name: string) => change(repos.quizzes.rename(id, name), replaceOne),
    duplicate: (id: string) => change(repos.quizzes.duplicate(id), (all, copy) => [copy, ...all]),
    setAcceptingResponses: (id: string, accepting: boolean) => change(repos.quizzes.setAcceptingResponses(id, accepting), replaceOne),
    remove: (id: string) => change(repos.quizzes.remove(id), (all, removed) => all.filter((q) => q.id !== removed.id)),
  };
}

export type QuizState = { status: "loading" } | { status: "ready"; bundle: QuizBundle } | { status: "not_found" };

/** One quiz by id, for the page that will hold the editor. Any answer other than a session problem counts as "not found". */
export function useQuiz(id: string): QuizState {
  const { reportError } = useDashEvents();
  const [state, setState] = useState<QuizState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void repos.quizzes.get(id).then((result) => {
      if (cancelled) return;
      if (result.ok) return setState({ status: "ready", bundle: result.data });
      if (!reportError(result.error)) setState({ status: "not_found" });
    });
    return () => {
      cancelled = true;
    };
  }, [id, reportError]);

  return state;
}

/** The signed-in person (plan and limits). null until it has loaded. */
export function useProfile(): Profile | null {
  const { reportError } = useDashEvents();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let cancelled = false;
    void repos.profiles.getCurrent().then((result) => {
      if (cancelled) return;
      if (result.ok) setProfile(result.data);
      else reportError(result.error);
    });
    return () => {
      cancelled = true;
    };
  }, [reportError]);

  return profile;
}
