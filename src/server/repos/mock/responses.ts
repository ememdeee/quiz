import { seedResponses } from "@/data/mock/responses";
import { fail, ok, type ErrorCode } from "@/lib/errors";
import type { ResponseSet } from "@/lib/responses/types";
import type { ResponsesRepo } from "../ports";
import { readFlags } from "./flags";
import { loadBundles, saveBundles } from "./store";

/** The dummy responses, kept in localStorage next to the quizzes. Seed quizzes start with made-up people. */
const KEY = "quiz.mock.responses.v1";

let memory: Record<string, ResponseSet> | null = null;

function load(): Record<string, ResponseSet> {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return (memory = JSON.parse(raw) as Record<string, ResponseSet>);
  } catch {
    // Unreadable storage: start again from the seed
  }
  return (memory = seedResponses());
}

export function saveResponses(all: Record<string, ResponseSet>) {
  memory = all;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage full or blocked: changes last until the page is closed
  }
}

export function resetResponses() {
  saveResponses(seedResponses());
}

export const forQuiz = (quizId: string): ResponseSet => load()[quizId] ?? { responses: [], opened: 0 };

/** Replaces one quiz's responses and keeps the number on its card (finished people) in step. */
export function setForQuiz(quizId: string, set: ResponseSet) {
  saveResponses({ ...load(), [quizId]: set });
  const finished = set.responses.filter((r) => r.status === "finished").length;
  saveBundles(loadBundles().map((b) => (b.quiz.id === quizId ? { ...b, quiz: { ...b.quiz, finishedResponses: finished } } : b)));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function gate(): Promise<ErrorCode | null> {
  const flags = readFlags();
  await wait(flags.slow ? 3000 : 250);
  if (flags.loggedOut) return "logged_out";
  if (flags.suspended) return "suspended";
  return null;
}

export const mockResponses: ResponsesRepo = {
  async list(quizId) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    if (!loadBundles().some((b) => b.quiz.id === quizId)) return fail("not_found");
    return ok(forQuiz(quizId));
  },

  async remove(quizId, responseId) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const set = forQuiz(quizId);
    if (!set.responses.some((r) => r.id === responseId)) return fail("not_found");
    setForQuiz(quizId, { ...set, responses: set.responses.filter((r) => r.id !== responseId) });
    return ok({ id: responseId });
  },

  async removeAll(quizId) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const set = forQuiz(quizId);
    setForQuiz(quizId, { ...set, responses: [] });
    return ok({ removed: set.responses.length });
  },
};
