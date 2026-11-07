import { mockProfile } from "@/data/mock/seed";
import { fail, ok, type ActionResult } from "@/lib/errors";
import { getLimits } from "@/lib/plan/limits";
import { pictureIds } from "@/lib/quiz/pictures";
import type { QuizDocument } from "@/lib/quiz/schema";
import type { QuizResponse } from "@/lib/responses/types";
import type { PublicLoad, RunnerRepo, SavedRun } from "../ports";
import { readFlags, writeFlags } from "./flags";
import { mockMedia } from "./media";
import { forQuiz, setForQuiz } from "./responses";
import { loadBundles } from "./store";

/**
 * The people who answer a quiz, against the dummy data. This browser remembers who it was by the response id kept
 * next to the quiz id; the real version keeps the same id (and a token) in the same place.
 */
const runKey = (quizId: string) => `quiz.run.${quizId}`;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const delay = () => wait(readFlags().slow ? 3000 : 200);

function remembered(quizId: string): string | null {
  try {
    return window.localStorage.getItem(runKey(quizId));
  } catch {
    return null;
  }
}

function remember(quizId: string, responseId: string) {
  try {
    window.localStorage.setItem(runKey(quizId), responseId);
  } catch {
    // Storage blocked: the person simply starts fresh next time
  }
}

/** True when nobody may start or save: switched off by the owner, account suspended, or the Free limit reached. */
function isClosed(quizId: string, finishing: boolean): boolean {
  const bundle = loadBundles().find((b) => b.quiz.id === quizId);
  if (!bundle) return true;
  if (!bundle.quiz.acceptingResponses || readFlags().suspended) return true;
  const finished = forQuiz(quizId).responses.filter((r) => r.status === "finished").length;
  return finishing && finished >= getLimits(mockProfile).responsesPerQuiz;
}

async function open(document: QuizDocument, quizId: string): Promise<PublicLoad> {
  const media = await mockMedia.list();
  const library = media.ok ? media.data : [];
  const pictures = Object.fromEntries(pictureIds(document).flatMap((id) => library.filter((m) => m.id === id).map((m) => [id, m.src])));
  return { status: "live", quiz: { quizId, document, pictures, showPoweredBy: mockProfile.plan === "free", theme: null } };
}

export const mockRunner: RunnerRepo = {
  async load(slug) {
    await delay();
    if (readFlags().failNextQuizLoad) {
      writeFlags({ failNextQuizLoad: false });
      return fail("load_failed");
    }
    const bundle = loadBundles().find((b) => b.quiz.slug === slug);
    if (!bundle) return ok({ status: "not_found" });
    if (!bundle.published) return ok({ status: "not_published" });
    const full = forQuiz(bundle.quiz.id).responses.filter((r) => r.status === "finished").length >= getLimits(mockProfile).responsesPerQuiz;
    if (!bundle.quiz.acceptingResponses || readFlags().suspended || full) return ok({ status: "closed" });
    return ok(await open(bundle.published, bundle.quiz.id));
  },

  async loadPreview(quizId) {
    await delay();
    if (readFlags().loggedOut) return fail("logged_out");
    const bundle = loadBundles().find((b) => b.quiz.id === quizId);
    return ok(bundle ? await open(bundle.draft, quizId) : { status: "not_found" });
  },

  async trackOpen(quizId) {
    const set = forQuiz(quizId);
    setForQuiz(quizId, { ...set, opened: set.opened + 1 });
  },

  async resume(quizId) {
    const responseId = remembered(quizId);
    if (!responseId) return null;
    const response = forQuiz(quizId).responses.find((r) => r.id === responseId);
    if (!response) return null;
    const saved: SavedRun = {
      responseId,
      finished: response.status === "finished",
      answers: response.answers,
      pagesSeen: response.pagesSeen,
      lastPageId: response.lastPageId,
    };
    return saved;
  },

  async start(quizId) {
    await delay();
    if (isClosed(quizId, false)) return fail("quiz_closed");
    const bundle = loadBundles().find((b) => b.quiz.id === quizId);
    const first = bundle?.published?.pages[0].id;
    if (!first) return fail("not_found");
    const set = forQuiz(quizId);
    const response: QuizResponse = {
      id: `r-${crypto.randomUUID()}`,
      number: set.responses.reduce((most, r) => Math.max(most, r.number), 0) + 1,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      answers: {},
      pagesSeen: [first],
      lastPageId: first,
    };
    setForQuiz(quizId, { ...set, responses: [...set.responses, response] });
    remember(quizId, response.id);
    return ok({ responseId: response.id });
  },

  async save(quizId, responseId, progress): Promise<ActionResult<null>> {
    await delay();
    if (readFlags().failNextSave) {
      writeFlags({ failNextSave: false });
      return fail("load_failed");
    }
    const set = forQuiz(quizId);
    const current = set.responses.find((r) => r.id === responseId);
    if (!current) return fail("not_found");
    if (isClosed(quizId, progress.finished && current.status !== "finished")) return fail("quiz_closed");
    const updated: QuizResponse = {
      ...current,
      status: progress.finished ? "finished" : current.status,
      finishedAt: progress.finished ? (current.finishedAt ?? new Date().toISOString()) : current.finishedAt,
      answers: progress.answers,
      pagesSeen: progress.pagesSeen,
      lastPageId: progress.lastPageId,
    };
    setForQuiz(quizId, { ...set, responses: set.responses.map((r) => (r.id === responseId ? updated : r)) });
    return ok(null);
  },
};
