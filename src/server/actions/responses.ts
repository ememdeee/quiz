"use server";

import { fail, ok, type ActionResult } from "@/lib/errors";
import type { QuizResponse, ResponseSet, StoredAnswer } from "@/lib/responses/types";
import { requireUser } from "@/server/auth/guards";

/** What people answered, for the quiz owner only (the database lets nobody else read them). */

const PAGE = 1000;

export async function listResponsesAction(quizId: string): Promise<ActionResult<ResponseSet>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { supabase } = auth.data;

  const { data: quiz } = await supabase.from("quizzes").select("id").eq("id", quizId).maybeSingle();
  if (!quiz) return fail("not_found");

  // The database answers 1,000 rows at a time, so read page after page until there are no more
  const rows: Awaited<ReturnType<typeof read>> = [];
  for (let from = 0; ; from += PAGE) {
    const page = await read(from);
    if (page === null) return fail("load_failed");
    rows.push(...page);
    if (page.length < PAGE) break;
  }

  async function read(from: number) {
    const { data, error } = await supabase
      .from("responses")
      .select("id, status, answers, pages_seen, last_page_id, started_at, finished_at")
      .eq("quiz_id", quizId)
      .order("started_at", { ascending: true })
      .range(from, from + PAGE - 1);
    return error ? null : data;
  }

  const { data: days } = await supabase.from("quiz_daily_stats").select("opened").eq("quiz_id", quizId);
  const responses: QuizResponse[] = rows.map((row, index) => ({
    id: row.id,
    number: index + 1,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    answers: (row.answers ?? {}) as unknown as Record<string, StoredAnswer>,
    pagesSeen: row.pages_seen,
    lastPageId: row.last_page_id ?? row.pages_seen[row.pages_seen.length - 1] ?? "",
  }));
  return ok({ responses, opened: (days ?? []).reduce((sum, day) => sum + day.opened, 0) });
}

export async function removeResponseAction(quizId: string, responseId: string): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.from("responses").delete().eq("id", responseId).eq("quiz_id", quizId).select("id");
  if (error) return fail("load_failed");
  return data.length > 0 ? ok({ id: responseId }) : fail("not_found");
}

export async function removeAllResponsesAction(quizId: string): Promise<ActionResult<{ removed: number }>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.from("responses").delete().eq("quiz_id", quizId).select("id");
  if (error) return fail("load_failed");
  return ok({ removed: data.length });
}
