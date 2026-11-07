import type { ActionResult } from "@/lib/errors";
import type { QuizDocument } from "@/lib/quiz/schema";
import type { Profile, QuizBundle, QuizStart, QuizSummary } from "@/lib/quizzes/types";

/**
 * What the screens may ask the data layer for (handover 4.3). Everything is async, so the same
 * calls work against the browser mock now and against server actions in Phase 5.
 * The mock lives in ./mock; this file holds only the shapes, so it is safe to import anywhere.
 */
export interface QuizzesRepo {
  list(): Promise<ActionResult<QuizSummary[]>>;
  get(id: string): Promise<ActionResult<QuizBundle>>;
  saveDraft(id: string, draft: QuizDocument): Promise<ActionResult<QuizSummary>>;
  create(input: { name: string; from: QuizStart }): Promise<ActionResult<QuizSummary>>;
  rename(id: string, name: string): Promise<ActionResult<QuizSummary>>;
  duplicate(id: string): Promise<ActionResult<QuizSummary>>;
  setAcceptingResponses(id: string, accepting: boolean): Promise<ActionResult<QuizSummary>>;
  /** Makes the draft what people see. Refused when the draft still has problems. */
  publish(id: string, draft: QuizDocument): Promise<ActionResult<QuizBundle>>;
  /** Changes the web address (the name is renamed with `rename`). */
  setSlug(id: string, slug: string): Promise<ActionResult<QuizSummary>>;
  /** Live check while typing the web address. */
  slugAvailable(id: string, slug: string): Promise<ActionResult<{ available: true } | { available: false; reason: "taken" | "invalid" | "reserved" }>>;
  remove(id: string): Promise<ActionResult<{ id: string }>>;
}

/** The owner's picture library. Newest first. */
export type MediaItem = { id: string; src: string; name: string };

export interface MediaRepo {
  list(): Promise<ActionResult<MediaItem[]>>;
  add(input: { src: string; name: string }): Promise<ActionResult<MediaItem>>;
}

export interface ProfilesRepo {
  getCurrent(): Promise<ActionResult<Profile>>;
}

export type Repos = { quizzes: QuizzesRepo; profiles: ProfilesRepo; media: MediaRepo };
