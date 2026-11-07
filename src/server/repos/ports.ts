import type { AdminOverviewData, AdminPerson, PeopleQuery, PersonRow, PlanPatch } from "@/lib/admin/types";
import type { ActionResult } from "@/lib/errors";
import type { QuizDocument } from "@/lib/quiz/schema";
import type { QuizTheme } from "@/lib/quiz/theme";
import type { ResponseSet, StoredAnswer } from "@/lib/responses/types";
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

/** What the quiz screen needs to show one quiz: the pages, the pictures they point to and whether to say "Powered by Quiz". */
export type PublicQuiz = {
  quizId: string;
  document: QuizDocument;
  /** Picture id to address, for the pictures the document uses */
  pictures: Record<string, string>;
  showPoweredBy: boolean;
  /** null: the default colors */
  theme: QuizTheme | null;
};

/** A quiz either opens, or says why it does not (boards FEClosed, FENotPublished, FENotFound). */
export type PublicLoad = { status: "live"; quiz: PublicQuiz } | { status: "closed" | "not_published" | "not_found" };

/** What this device already did in a quiz (the saved place and answers of the same browser). */
export type SavedRun = { responseId: string; finished: boolean; answers: Record<string, StoredAnswer>; pagesSeen: string[]; lastPageId: string };

export type RunProgress = { answers: Record<string, StoredAnswer>; pagesSeen: string[]; lastPageId: string; finished: boolean };

/** The people answering a quiz. No login: what remembers them is this browser (handover 8.7). */
export interface RunnerRepo {
  load(slug: string): Promise<ActionResult<PublicLoad>>;
  /** The working copy, for the owner's "Try it". Never saves anything. */
  loadPreview(quizId: string): Promise<ActionResult<PublicLoad>>;
  /** Counts one visit (the caller makes sure it is once per tab session). */
  trackOpen(quizId: string): Promise<void>;
  /** The unfinished or finished response this browser has for the quiz, or null. */
  resume(quizId: string): Promise<SavedRun | null>;
  /** Creates a response when the person presses "Start the quiz". */
  start(quizId: string): Promise<ActionResult<{ responseId: string }>>;
  /** Saves everything so far. Fails with `quiz_closed` when the quiz closed in the meantime. */
  save(quizId: string, responseId: string, progress: RunProgress): Promise<ActionResult<null>>;
}

/**
 * What the admin area may ask for (board AdminOverview to AdminDialogs). Counts and details of people only,
 * never what people answered in a quiz. Every change is also written to the admin log.
 */
export interface AdminRepo {
  overview(): Promise<ActionResult<AdminOverviewData>>;
  list(query: PeopleQuery): Promise<ActionResult<{ rows: PersonRow[]; total: number; page: number; pages: number }>>;
  /** Everyone who matches the search and filter, for "Download as CSV" */
  listAll(query: Omit<PeopleQuery, "page">): Promise<ActionResult<PersonRow[]>>;
  get(id: string): Promise<ActionResult<AdminPerson>>;
  setPlan(id: string, patch: PlanPatch): Promise<ActionResult<AdminPerson>>;
  setNotes(id: string, notes: string): Promise<ActionResult<AdminPerson>>;
  suspend(id: string): Promise<ActionResult<AdminPerson>>;
  restore(id: string): Promise<ActionResult<AdminPerson>>;
  /** The typed email must be the person's email; the admin cannot delete their own account. */
  remove(id: string, typedEmail: string): Promise<ActionResult<{ id: string }>>;
}

export type Repos = {
  quizzes: QuizzesRepo;
  profiles: ProfilesRepo;
  media: MediaRepo;
  responses: ResponsesRepo;
  account: AccountRepo;
  runner: RunnerRepo;
  admin: AdminRepo;
};
