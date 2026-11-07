import type { ActionResult } from "@/lib/errors";
import type { QuizDocument } from "@/lib/quiz/schema";
import type { ResponseSet } from "@/lib/responses/types";
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

/** The people who answered one quiz. Only the quiz owner can read them. */
export interface ResponsesRepo {
  list(quizId: string): Promise<ActionResult<ResponseSet>>;
  remove(quizId: string, responseId: string): Promise<ActionResult<{ id: string }>>;
  removeAll(quizId: string): Promise<ActionResult<{ removed: number }>>;
}

/** The signed-in person's own details and how they log in (board Account). */
export type AccountState = {
  name: string;
  email: string;
  /** An address waiting for its confirm link. The old one keeps working until then. */
  pendingEmail: string | null;
  hasPassword: boolean;
  googleConnected: boolean;
};

export interface AccountRepo {
  get(): Promise<ActionResult<AccountState>>;
  updateName(name: string): Promise<ActionResult<AccountState>>;
  requestEmailChange(email: string): Promise<ActionResult<AccountState>>;
  resendEmailChange(): Promise<ActionResult<AccountState>>;
  cancelEmailChange(): Promise<ActionResult<AccountState>>;
  /** `current` is needed only when a password exists already. */
  setPassword(input: { current?: string; next: string }): Promise<ActionResult<AccountState>>;
  connectGoogle(): Promise<ActionResult<AccountState>>;
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

export type Repos = { quizzes: QuizzesRepo; profiles: ProfilesRepo; media: MediaRepo; responses: ResponsesRepo; account: AccountRepo };
