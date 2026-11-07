import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { getLimits } from "@/lib/plan/limits";
import { mediaUrl } from "@/lib/media-url";
import { pictureIds } from "@/lib/quiz/pictures";
import { canFinish, cleanProgress, type CleanProgress } from "@/lib/quiz/progress";
import { quizDocumentSchema, type QuizDocument } from "@/lib/quiz/schema";
import type { QuizTheme } from "@/lib/quiz/theme";
import type { StoredAnswer } from "@/lib/responses/types";
import { rateAllowed } from "@/server/rate-limit";
import { overridesOf } from "@/server/auth/guards";
import type { PublicLoad, SavedRun } from "@/server/repos/ports";
import { createAdminClient } from "@/server/supabase/admin";
import type { Database, Json } from "@/types/database";

/**
 * What people who answer a quiz may do, with no account (handover 6.6). All of it goes through the service key, so every
 * function here checks what it is asked: the quiz it names must exist and take answers, the secret token must match the
 * response, answers are checked against the PUBLISHED quiz, and each caller is rate limited by a hash of their address.
 */
type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const themeSchema = z.object({ primary: z.string(), onPrimary: z.string(), background: z.string(), text: z.string(), muted: z.string(), border: z.string() });

export type Answered = "ok" | "closed" | "not_found" | "bad_token" | "invalid" | "rate_limited" | "already_finished" | "failed";

const allowed = rateAllowed;

async function quizBySlug(slug: string): Promise<{ quiz: Quiz; owner: Profile } | null> {
  const db = createAdminClient();
  const { data: quiz } = await db.from("quizzes").select("*").eq("slug", slug).maybeSingle();
  if (!quiz) return null;
  const { data: owner } = await db.from("profiles").select("*").eq("id", quiz.owner_id).single();
  return owner ? { quiz, owner } : null;
}

const publishedOf = (quiz: Quiz): QuizDocument | null => {
  const result = quizDocumentSchema.safeParse(quiz.published);
  return result.success ? result.data : null;
};

/** The quiz as people see it, or the reason it cannot be opened. Closed, full and suspended all look the same to them. */
export async function loadPublic(slug: string): Promise<PublicLoad | "rate_limited"> {
  if (!(await allowed("load", 120, 60))) return "rate_limited";
  const found = await quizBySlug(slug);
  if (!found) return { status: "not_found" };
  const { quiz, owner } = found;
  const document = publishedOf(quiz);
  if (!document) return { status: "not_published" };
  const full = quiz.finished_count >= getLimits({ overrides: overridesOf(owner) }).responsesPerQuiz;
  if (!quiz.accepting_responses || owner.status !== "active" || full) return { status: "closed" };

  const ids = pictureIds(document);
  const pictures: Record<string, string> = {};
  if (ids.length > 0) {
    const { data } = await createAdminClient().from("media").select("id, path").eq("owner_id", quiz.owner_id).in("id", ids);
    for (const row of data ?? []) pictures[row.id] = mediaUrl(row.path);
  }
  const theme = owner.brand_unlocked ? themeSchema.safeParse(quiz.theme) : null;
  return {
    status: "live",
    quiz: {
      quizId: quiz.id,
      document,
      pictures,
      showPoweredBy: !(owner.can_hide_powered_by && quiz.hide_powered_by),
      theme: theme?.success ? (theme.data as QuizTheme) : null,
    },
  };
}

export async function openPublic(slug: string): Promise<void> {
  if (!(await allowed("open", 60, 60))) return;
  const found = await quizBySlug(slug);
  if (found) await createAdminClient().rpc("track_open", { p_quiz_id: found.quiz.id });
}

/** Creates a response. The secret token is made here and given out once; only its hash is kept. */
export async function startPublic(slug: string): Promise<{ status: "open"; responseId: string; token: string } | { status: Exclude<Answered, "ok"> }> {
  if (!(await allowed("start", 30, 60))) return { status: "rate_limited" };
  const token = randomBytes(24).toString("hex");
  const { data, error } = await createAdminClient().rpc("start_response", { p_slug: slug, p_token_hash: sha256(token) });
  if (error) return { status: "failed" };
  const result = data as { status: string; response_id?: string };
  if (result.status === "open") return { status: "open", responseId: result.response_id!, token };
  if (result.status === "not_found" || result.status === "not_published") return { status: "not_found" };
  return { status: "closed" };
}

type ResponseRow = Database["public"]["Tables"]["responses"]["Row"];

async function responseFor(responseId: string, token: string): Promise<{ response: ResponseRow; quiz: Quiz; owner: Profile } | "not_found" | "bad_token"> {
  const db = createAdminClient();
  const { data: response } = await db.from("responses").select("*").eq("id", responseId).maybeSingle();
  if (!response) return "not_found";
  if (response.token_hash !== sha256(token)) return "bad_token";
  const { data: quiz } = await db.from("quizzes").select("*").eq("id", response.quiz_id).single();
  if (!quiz) return "not_found";
  const { data: owner } = await db.from("profiles").select("*").eq("id", quiz.owner_id).single();
  return owner ? { response, quiz, owner } : "not_found";
}

/** What this browser saved earlier, so "Welcome back" can pick up where the person stopped. A wrong token looks like nothing saved. */
export async function resumePublic(responseId: string, token: string): Promise<SavedRun | null> {
  if (!(await allowed("resume", 60, 60))) return null;
  const found = await responseFor(responseId, token);
  if (typeof found === "string") return null;
  const { response } = found;
  return {
    responseId,
    finished: response.status === "finished",
    answers: (response.answers ?? {}) as unknown as Record<string, StoredAnswer>,
    pagesSeen: response.pages_seen,
    lastPageId: response.last_page_id ?? response.pages_seen[response.pages_seen.length - 1] ?? "",
  };
}

/** Saves what a person has answered so far (and finishes them when `finish` is set and they really are done). */
export async function savePublic(responseId: string, token: string, body: unknown, finish: boolean): Promise<Answered> {
  if (!(await allowed(finish ? "finish" : "answer", 240, 60))) return "rate_limited";
  const found = await responseFor(responseId, token);
  if (found === "not_found" || found === "bad_token") return found;
  const { response, quiz, owner } = found;
  if (response.status === "finished") return "already_finished";

  const document = publishedOf(quiz);
  if (!document || !quiz.accepting_responses || owner.status !== "active") return "closed";
  // Answers belong to the version the person started with; a newer publish keeps old answers readable but the page ids must still exist
  const cleaned = cleanProgress(document, body);
  if (!cleaned.ok) return "invalid";
  const progress: CleanProgress = cleaned.progress;
  if (finish && !canFinish(document, progress)) return "invalid";

  const db = createAdminClient();
  const { error } = await db
    .from("responses")
    .update({ answers: progress.answers as unknown as Json, pages_seen: progress.pagesSeen, last_page_id: progress.lastPageId, updated_at: new Date().toISOString() })
    .eq("id", responseId);
  if (error) return "failed";
  if (!finish) return "ok";

  const { data, error: finishError } = await db.rpc("finish_response", { p_response_id: responseId, p_token_hash: sha256(token) });
  if (finishError) return "failed";
  const status = (data as { status: string }).status;
  if (status === "finished" || status === "already_finished") return "ok";
  return status === "bad_token" ? "bad_token" : status === "not_found" ? "not_found" : "closed";
}
