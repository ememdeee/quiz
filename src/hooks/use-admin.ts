"use client";

import { useCallback, useEffect, useState } from "react";
import { useDashEvents } from "@/components/dashboard/dash-events";
import type { AdminOverviewData, AdminPerson, PeopleQuery, PersonRow } from "@/lib/admin/types";
import type { ActionResult } from "@/lib/errors";
import { repos } from "@/server/repos";

type Loaded<T> = { status: "loading" } | { status: "error"; notFound: boolean } | { status: "ready"; data: T };

/** Runs one load now and again whenever `key` changes. Session problems go to the shared dialogs, anything else becomes "error". */
function useLoad<T>(load: () => Promise<ActionResult<T>>, key: string) {
  const { reportError } = useDashEvents();
  const [state, setState] = useState<Loaded<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void load().then((result) => {
      if (cancelled) return;
      if (result.ok) return setState({ status: "ready", data: result.data });
      if (!reportError(result.error)) setState({ status: "error", notFound: result.error === "not_found" });
    });
    return () => {
      cancelled = true;
    };
    // `load` is described fully by `key`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt, reportError]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setAttempt((n) => n + 1);
  }, []);
  return { state, setState, reload };
}

export function useAdminOverview() {
  const { state, reload } = useLoad<AdminOverviewData>(() => repos.admin.overview(), "overview");
  return { state, reload };
}

export type PeoplePage = { rows: PersonRow[]; total: number; page: number; pages: number };

/** The Users table for one search, filter and page. The table keeps showing the old rows while the next ones load. */
export function usePeople(query: PeopleQuery) {
  const { state, reload } = useLoad<PeoplePage>(() => repos.admin.list(query), `${query.search}|${query.filter}|${query.page}`);
  return { state, reload };
}

/** One person, with the changes the admin can make. Each change returns the result so a dialog can show what went wrong. */
export function usePerson(id: string) {
  const { reportError } = useDashEvents();
  const { state, setState, reload } = useLoad<AdminPerson>(() => repos.admin.get(id), id);

  const run = useCallback(
    async (request: Promise<ActionResult<AdminPerson>>) => {
      const result = await request;
      if (result.ok) setState({ status: "ready", data: result.data });
      else reportError(result.error);
      return result;
    },
    [reportError, setState],
  );

  return {
    state,
    reload,
    setPlan: (patch: Parameters<typeof repos.admin.setPlan>[1]) => run(repos.admin.setPlan(id, patch)),
    setNotes: (notes: string) => run(repos.admin.setNotes(id, notes)),
    suspend: () => run(repos.admin.suspend(id)),
    restore: () => run(repos.admin.restore(id)),
    remove: (typedEmail: string) => repos.admin.remove(id, typedEmail),
  };
}

/** Everyone who matches a search, for "Download as CSV". */
export const loadAllPeople = (query: Omit<PeopleQuery, "page">) => repos.admin.listAll(query);
