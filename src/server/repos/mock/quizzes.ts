import { BLANK_PAGE_COUNT, quizTemplates } from "@/data/mock/templates";
import { mockProfile } from "@/data/mock/seed";
import { fail, ok, type ActionResult, type ErrorCode } from "@/lib/errors";
import { getLimits, hasReachedQuizLimit } from "@/lib/plan/limits";
import { makeSlug } from "@/lib/slug";
import type { Profile, QuizStart, QuizSummary } from "@/lib/quizzes/types";
import type { ProfilesRepo, QuizzesRepo } from "../ports";
import { readFlags, writeFlags } from "./flags";
import { loadQuizzes, saveQuizzes } from "./store";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** What a real request could answer before doing any work: logged out, suspended, or just slow. */
async function gate(): Promise<ErrorCode | null> {
  const flags = readFlags();
  await wait(flags.slow ? 3000 : 250);
  if (flags.loggedOut) return "logged_out";
  if (flags.suspended) return "suspended";
  return null;
}

const touch = (quiz: QuizSummary): QuizSummary => ({ ...quiz, updatedAt: new Date().toISOString() });

function replace(id: string, change: (quiz: QuizSummary) => QuizSummary): ActionResult<QuizSummary> {
  const quizzes = loadQuizzes();
  const index = quizzes.findIndex((q) => q.id === id);
  if (index === -1) return fail("not_found");
  const updated = change(quizzes[index]);
  saveQuizzes(quizzes.map((q, i) => (i === index ? updated : q)));
  return ok(updated);
}

function newQuiz(name: string, pageCount: number, quizzes: QuizSummary[]): QuizSummary | null {
  const slug = makeSlug(name, (candidate) => quizzes.some((q) => q.slug === candidate));
  if (slug === null) return null;
  return {
    id: crypto.randomUUID(),
    name,
    slug,
    firstPublishedAt: null,
    acceptingResponses: true,
    unpublishedChanges: 0,
    pageCount,
    finishedResponses: 0,
    updatedAt: new Date().toISOString(),
  };
}

function pagesFor(from: QuizStart, quizzes: QuizSummary[]): number | null {
  if (from.kind === "blank") return BLANK_PAGE_COUNT;
  if (from.kind === "template") return quizTemplates.find((t) => t.id === from.templateId)?.pages.length ?? null;
  return quizzes.find((q) => q.id === from.quizId)?.pageCount ?? null;
}

/** Adds a quiz after the checks the real server will make: the plan limit first, then the name. */
function add(name: string, pageCount: number | null, profile: Profile): ActionResult<QuizSummary> {
  const quizzes = loadQuizzes();
  if (hasReachedQuizLimit(quizzes.length, getLimits(profile))) return fail("limit_quizzes");
  const trimmed = name.trim();
  if (!trimmed) return fail("name_required");
  if (pageCount === null) return fail("not_found");
  const created = newQuiz(trimmed, pageCount, quizzes);
  if (!created) return fail("load_failed");
  saveQuizzes([created, ...quizzes]);
  return ok(created);
}

export const mockQuizzes: QuizzesRepo = {
  async list() {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    if (readFlags().failNextLoad) {
      writeFlags({ failNextLoad: false });
      return fail("load_failed");
    }
    return ok([...loadQuizzes()]);
  },

  async get(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const quiz = loadQuizzes().find((q) => q.id === id);
    return quiz ? ok(quiz) : fail("not_found");
  },

  async create({ name, from }) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    return add(name, pagesFor(from, loadQuizzes()), mockProfile);
  },

  async rename(id, name) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const trimmed = name.trim();
    if (!trimmed) return fail("name_required");
    return replace(id, (quiz) => touch({ ...quiz, name: trimmed }));
  },

  async duplicate(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const original = loadQuizzes().find((q) => q.id === id);
    if (!original) return fail("not_found");
    return add(`Copy of ${original.name}`, original.pageCount, mockProfile);
  },

  async setAcceptingResponses(id, accepting) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    return replace(id, (quiz) => touch({ ...quiz, acceptingResponses: accepting }));
  },

  async remove(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const quizzes = loadQuizzes();
    if (!quizzes.some((q) => q.id === id)) return fail("not_found");
    saveQuizzes(quizzes.filter((q) => q.id !== id));
    return ok({ id });
  },
};

export const mockProfiles: ProfilesRepo = {
  async getCurrent() {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    return ok(mockProfile);
  },
};
