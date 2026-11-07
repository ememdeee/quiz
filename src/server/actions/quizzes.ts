"use server";

import type { Json } from "@/types/database";
import { fail, ok, type ActionResult } from "@/lib/errors";
import { getLimits } from "@/lib/plan/limits";
import { quizDocumentSchema, type QuizDocument } from "@/lib/quiz/schema";
import { blankQuiz, templateQuiz } from "@/lib/quiz/templates";
import { validateQuiz } from "@/lib/quiz/validate";
import { checkSlug, makeSlug } from "@/lib/slug";
import { documentFacts } from "@/lib/quizzes/summary";
import type { Profile, QuizBundle, QuizStart, QuizSummary } from "@/lib/quizzes/types";
import { overridesOf, requireUser, type Authed } from "@/server/auth/guards";
import type { Database } from "@/types/database";

/**
 * The owner's quizzes on Supabase (handover 7.1). Every call starts with `requireUser`, and every query then runs with the
 * person's own database rights, so the rules in the database (RLS, the quiz limit, the slug index) stand behind these checks.
 */
type Row = Database["public"]["Tables"]["quizzes"]["Row"];

const parse = (value: Json | null): QuizDocument | null => {
  if (value === null) return null;
  const result = quizDocumentSchema.safeParse(value);
  return result.success ? result.data : null;
};

function summaryOf(row: Row): QuizSummary | null {
  const draft = parse(row.draft);
  if (!draft) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    firstPublishedAt: row.published_at,
    acceptingResponses: row.accepting_responses,
    finishedResponses: row.finished_count,
    updatedAt: row.updated_at,
    ...documentFacts(draft, parse(row.published)),
  };
}

function bundleOf(row: Row): ActionResult<QuizBundle> {
  const draft = parse(row.draft);
  const quiz = summaryOf(row);
  return draft && quiz ? ok({ quiz, draft, published: parse(row.published) }) : fail("load_failed");
}

const one = async (auth: Authed, id: string): Promise<Row | null> => {
  const { data } = await auth.supabase.from("quizzes").select("*").eq("id", id).maybeSingle();
  return data;
};

export async function getProfileAction(): Promise<ActionResult<Profile>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { profile, email } = auth.data;
  return ok({ name: profile.name, email, plan: profile.plan, overrides: overridesOf(profile) });
}

export async function listQuizzesAction(): Promise<ActionResult<QuizSummary[]>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.from("quizzes").select("*").order("updated_at", { ascending: false });
  if (error) return fail("load_failed");
  return ok(data.map(summaryOf).filter((quiz): quiz is QuizSummary => quiz !== null));
}

export async function getQuizAction(id: string): Promise<ActionResult<QuizBundle>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const row = await one(auth.data, id);
  return row ? bundleOf(row) : fail("not_found");
}

function startingDocument(from: QuizStart, name: string, copyOf: Row | null): QuizDocument | null {
  if (from.kind === "blank") return blankQuiz(name);
  if (from.kind === "template") return templateQuiz(from.templateId, name);
  const original = copyOf ? parse(copyOf.draft) : null;
  return original ? { ...original, name } : null;
}

/** Adds a quiz: a free address first (the name, then with 4 random characters up to 5 times), and the database has the last word. */
async function insertQuiz(auth: Authed, name: string, doc: QuizDocument): Promise<ActionResult<QuizSummary>> {
  const tried = new Set<string>();
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const slug = makeSlug(name, (candidate) => tried.has(candidate));
    if (!slug) break;
    const { data, error } = await auth.supabase.from("quizzes").insert({ owner_id: auth.userId, name, slug, draft: doc as unknown as Json }).select("*").single();
    if (!error) return summaryOf(data) ? ok(summaryOf(data)!) : fail("load_failed");
    if (error.message.includes("quiz_limit_reached")) return fail("limit_quizzes");
    if (error.code === "23505") {
      tried.add(slug);
      continue;
    }
    return fail("load_failed");
  }
  return fail("load_failed");
}

export async function createQuizAction(input: { name: string; from: QuizStart }): Promise<ActionResult<QuizSummary>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const name = input.name.trim().slice(0, 100);
  if (!name) return fail("name_required");
  const copyOf = input.from.kind === "copy" ? await one(auth.data, input.from.quizId) : null;
  const doc = startingDocument(input.from, name, copyOf);
  if (!doc) return fail("not_found");
  return insertQuiz(auth.data, name, doc);
}

export async function duplicateQuizAction(id: string): Promise<ActionResult<QuizSummary>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const original = await one(auth.data, id);
  const draft = original ? parse(original.draft) : null;
  if (!original || !draft) return fail("not_found");
  const name = `Copy of ${original.name}`.slice(0, 100);
  return insertQuiz(auth.data, name, { ...draft, name });
}

/** Saves a document as the draft. Returns the new version. A save never fails because another tab saved first: the last save wins until the "changed somewhere else" screen is designed (gap G1). */
async function saveDocument(auth: Authed, row: Row, doc: QuizDocument): Promise<ActionResult<number>> {
  const { data, error } = await auth.supabase.rpc("save_draft", { p_quiz_id: row.id, p_base_version: row.draft_version, p_doc: doc as unknown as Json });
  if (error) return fail("load_failed");
  const result = data as { status: string; version?: number; current_version?: number };
  if (result.status === "ok") return ok(result.version!);
  if (result.status === "conflict") {
    // Someone saved in between: try once more from the version that is there now
    const { data: again } = await auth.supabase.rpc("save_draft", { p_quiz_id: row.id, p_base_version: result.current_version!, p_doc: doc as unknown as Json });
    const retry = again as { status: string; version?: number };
    return retry.status === "ok" ? ok(retry.version!) : fail("conflict");
  }
  if (result.status === "too_many_pages") return fail("limit_pages");
  if (result.status === "too_large") return fail("too_large");
  return fail(result.status === "not_found" ? "not_found" : "load_failed");
}

export async function saveDraftAction(id: string, draft: QuizDocument): Promise<ActionResult<QuizSummary>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (!quizDocumentSchema.safeParse(draft).success) return fail("load_failed");
  const row = await one(auth.data, id);
  if (!row) return fail("not_found");
  const saved = await saveDocument(auth.data, row, draft);
  if (!saved.ok) return saved;
  const fresh = await one(auth.data, id);
  return fresh && summaryOf(fresh) ? ok(summaryOf(fresh)!) : fail("load_failed");
}

export async function renameQuizAction(id: string, name: string): Promise<ActionResult<QuizSummary>> {
  const trimmed = name.trim().slice(0, 100);
  if (!trimmed) return fail("name_required");
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const row = await one(auth.data, id);
  const draft = row ? parse(row.draft) : null;
  if (!row || !draft) return fail("not_found");
  const saved = await saveDocument(auth.data, row, { ...draft, name: trimmed });
  if (!saved.ok) return saved;
  await auth.data.supabase.from("quizzes").update({ name: trimmed }).eq("id", id);
  const fresh = await one(auth.data, id);
  return fresh && summaryOf(fresh) ? ok(summaryOf(fresh)!) : fail("load_failed");
}

export async function setAcceptingResponsesAction(id: string, accepting: boolean): Promise<ActionResult<QuizSummary>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.from("quizzes").update({ accepting_responses: accepting }).eq("id", id).select("*").maybeSingle();
  if (error) return fail("load_failed");
  return data && summaryOf(data) ? ok(summaryOf(data)!) : fail("not_found");
}

/** Makes the draft what people see. The strict check runs here first; the database re-checks the page count. */
export async function publishQuizAction(id: string, draft: QuizDocument): Promise<ActionResult<QuizBundle>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (!quizDocumentSchema.safeParse(draft).success) return fail("load_failed");
  if (validateQuiz(draft, { maxPages: getLimits({ overrides: overridesOf(auth.data.profile) }).pagesPerQuiz }).length > 0) return fail("publish_blocked");

  const row = await one(auth.data, id);
  if (!row) return fail("not_found");
  const saved = await saveDocument(auth.data, row, draft);
  if (!saved.ok) return saved;
  const { data, error } = await auth.data.supabase.rpc("publish_quiz", { p_quiz_id: id, p_base_version: saved.data });
  if (error) return fail("load_failed");
  const status = (data as { status: string }).status;
  if (status === "too_many_pages") return fail("limit_pages");
  if (status !== "ok") return fail(status === "conflict" ? "conflict" : "load_failed");
  const fresh = await one(auth.data, id);
  return fresh ? bundleOf(fresh) : fail("not_found");
}

export async function slugAvailableAction(id: string, slug: string): Promise<ActionResult<{ available: true } | { available: false; reason: "taken" | "invalid" | "reserved" }>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const problem = checkSlug(slug);
  if (problem) return ok({ available: false, reason: problem });
  const { data, error } = await auth.data.supabase.rpc("slug_available", { p_slug: slug, p_quiz_id: id });
  if (error) return fail("load_failed");
  const result = data as { available: boolean; reason?: string };
  if (result.available) return ok({ available: true });
  // A slug held for someone else looks "taken" to the person asking
  return ok({ available: false, reason: result.reason === "invalid" || result.reason === "reserved" ? result.reason : "taken" });
}

export async function setSlugAction(id: string, slug: string): Promise<ActionResult<QuizSummary>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  if (checkSlug(slug)) return fail("slug_invalid");
  const { data, error } = await auth.data.supabase.from("quizzes").update({ slug }).eq("id", id).select("*").maybeSingle();
  if (error) return fail(error.code === "23505" ? "slug_taken" : "load_failed");
  return data && summaryOf(data) ? ok(summaryOf(data)!) : fail("not_found");
}

export async function removeQuizAction(id: string): Promise<ActionResult<{ id: string }>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data, error } = await auth.data.supabase.from("quizzes").delete().eq("id", id).select("id");
  if (error) return fail("load_failed");
  return data.length > 0 ? ok({ id }) : fail("not_found");
}
