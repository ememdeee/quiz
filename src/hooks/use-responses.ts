"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashEvents } from "@/components/dashboard/dash-events";
import type { ActionResult } from "@/lib/errors";
import { getLimits, type Limits } from "@/lib/plan/limits";
import type { QuizBundle } from "@/lib/quizzes/types";
import type { ResponseSet } from "@/lib/responses/types";
import { repos } from "@/server/repos";

export type ResponsesState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "ready"; bundle: QuizBundle; set: ResponseSet; limits: Limits };

/** One quiz and the people who answered it, for the Responses pages. */
export function useResponses(quizId: string) {
  const { reportError } = useDashEvents();
  const [state, setState] = useState<ResponsesState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    const [quiz, set, profile] = await Promise.all([repos.quizzes.get(quizId), repos.responses.list(quizId), repos.profiles.getCurrent()]);
    for (const result of [quiz, set, profile]) if (!result.ok && reportError(result.error)) return;
    if (!quiz.ok || !set.ok || !profile.ok) {
      const missing = [quiz, set].some((r) => !r.ok && r.error === "not_found");
      return setState({ status: missing ? "not_found" : "error" });
    }
    setState({ status: "ready", bundle: quiz.data, set: set.data, limits: getLimits(profile.data) });
  }, [quizId, reportError]);

  useEffect(() => {
    void load();
  }, [load]);

  const apply = useCallback(
    async <T>(request: Promise<ActionResult<T>>, change: (set: ResponseSet) => ResponseSet) => {
      const result = await request;
      if (!result.ok) {
        reportError(result.error);
        return result;
      }
      setState((current) => (current.status === "ready" ? { ...current, set: change(current.set) } : current));
      return result;
    },
    [reportError],
  );

  return {
    state,
    reload: load,
    removeOne: (id: string) => apply(repos.responses.remove(quizId, id), (set) => ({ ...set, responses: set.responses.filter((r) => r.id !== id) })),
    removeAll: () => apply(repos.responses.removeAll(quizId), (set) => ({ ...set, responses: [] })),
  };
}
