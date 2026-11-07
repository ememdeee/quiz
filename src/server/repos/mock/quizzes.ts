import { mockProfile } from "@/data/mock/seed";
import { fail, ok, type ActionResult, type ErrorCode } from "@/lib/errors";
import { getLimits, hasReachedQuizLimit } from "@/lib/plan/limits";
import { quizDocumentSchema, type QuizDocument } from "@/lib/quiz/schema";
import { blankQuiz, templateQuiz } from "@/lib/quiz/templates";
import { validateQuiz } from "@/lib/quiz/validate";
import { checkSlug, makeSlug } from "@/lib/slug";
import { documentFacts } from "@/lib/quizzes/summary";
import type { Profile, QuizBundle, QuizStart, QuizSummary } from "@/lib/quizzes/types";
import type { ProfilesRepo, QuizzesRepo } from "../ports";
import { readFlags, writeFlags } from "./flags";
import { loadBundles, saveBundles } from "./store";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** What a real request could answer before doing any work: logged out, suspended, or just slow. */
async function gate(): Promise<ErrorCode | null> {
  const flags = readFlags();
  await wait(flags.slow ? 3000 : 250);
  if (flags.loggedOut) return "logged_out";
  if (flags.suspended) return "suspended";
  return null;
}

const find = (id: string) => loadBundles().find((b) => b.quiz.id === id);

function replace(id: string, change: (bundle: QuizBundle) => QuizBundle): ActionResult<QuizBundle> {
  const bundles = loadBundles();
  const index = bundles.findIndex((b) => b.quiz.id === id);
  if (index === -1) return fail("not_found");
  const updated = change(bundles[index]);
  saveBundles(bundles.map((b, i) => (i === index ? updated : b)));
  return ok(updated);
}

/** The same quiz with its facts recomputed from its documents and a fresh "edited" time. */
const touched = (bundle: QuizBundle, patch: Partial<QuizSummary> = {}): QuizBundle => ({
  ...bundle,
  quiz: { ...bundle.quiz, ...patch, ...documentFacts(bundle.draft, bundle.published), updatedAt: new Date().toISOString() },
});

function startingDocument(from: QuizStart, name: string): QuizDocument | null {
  if (from.kind === "blank") return blankQuiz(name);
  if (from.kind === "template") return templateQuiz(from.templateId, name);
  const original = find(from.quizId);
  return original ? { ...structuredClone(original.draft), name } : null;
}

/** Adds a quiz after the checks the real server will make: the plan limit first, then the name. */
function add(name: string, document: (name: string) => QuizDocument | null, profile: Profile): ActionResult<QuizSummary> {
  const bundles = loadBundles();
  if (hasReachedQuizLimit(bundles.length, getLimits(profile))) return fail("limit_quizzes");
  const trimmed = name.trim();
  if (!trimmed) return fail("name_required");
  const draft = document(trimmed);
  if (!draft) return fail("not_found");
  const slug = makeSlug(trimmed, (candidate) => bundles.some((b) => b.quiz.slug === candidate));
  if (slug === null) return fail("load_failed");
  const quiz: QuizSummary = {
    id: crypto.randomUUID(),
    name: trimmed,
    slug,
    firstPublishedAt: null,
    acceptingResponses: true,
    finishedResponses: 0,
    updatedAt: new Date().toISOString(),
    ...documentFacts(draft, null),
  };
  saveBundles([{ quiz, draft, published: null }, ...bundles]);
  return ok(quiz);
}

const summaryOf = (result: ActionResult<QuizBundle>): ActionResult<QuizSummary> => (result.ok ? ok(result.data.quiz) : result);

export const mockQuizzes: QuizzesRepo = {
  async list() {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    if (readFlags().failNextLoad) {
      writeFlags({ failNextLoad: false });
      return fail("load_failed");
    }
    return ok(loadBundles().map((b) => b.quiz));
  },

  async get(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const bundle = find(id);
    return bundle ? ok(bundle) : fail("not_found");
  },

  async create({ name, from }) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    return add(name, (trimmed) => startingDocument(from, trimmed), mockProfile);
  },

  async rename(id, name) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const trimmed = name.trim();
    if (!trimmed) return fail("name_required");
    return summaryOf(replace(id, (bundle) => touched({ ...bundle, draft: { ...bundle.draft, name: trimmed } }, { name: trimmed })));
  },

  async duplicate(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const original = find(id);
    if (!original) return fail("not_found");
    return add(`Copy of ${original.quiz.name}`, (name) => ({ ...structuredClone(original.draft), name }), mockProfile);
  },

  async setAcceptingResponses(id, accepting) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    return summaryOf(replace(id, (bundle) => touched(bundle, { acceptingResponses: accepting })));
  },

  async saveDraft(id, draft) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    if (!quizDocumentSchema.safeParse(draft).success) return fail("load_failed");
    return summaryOf(replace(id, (bundle) => touched({ ...bundle, draft }, { name: draft.name })));
  },

  async publish(id, draft) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    if (validateQuiz(draft, { maxPages: getLimits(mockProfile).pagesPerQuiz }).length > 0) return fail("publish_blocked");
    return replace(id, (bundle) =>
      touched({ ...bundle, draft, published: structuredClone(draft) }, { firstPublishedAt: bundle.quiz.firstPublishedAt ?? new Date().toISOString() }),
    );
  },

  async slugAvailable(id, slug) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const problem = checkSlug(slug);
    if (problem) return ok({ available: false, reason: problem });
    const taken = loadBundles().some((b) => b.quiz.slug === slug && b.quiz.id !== id);
    return ok(taken ? { available: false, reason: "taken" } : { available: true });
  },

  async setSlug(id, slug) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    if (checkSlug(slug)) return fail("slug_invalid");
    if (loadBundles().some((b) => b.quiz.slug === slug && b.quiz.id !== id)) return fail("slug_taken");
    return summaryOf(replace(id, (bundle) => touched(bundle, { slug })));
  },

  async remove(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const bundles = loadBundles();
    if (!bundles.some((b) => b.quiz.id === id)) return fail("not_found");
    saveBundles(bundles.filter((b) => b.quiz.id !== id));
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
