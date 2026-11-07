import type { QuizSummary } from "./types";

export type QuizStatus = "not_published" | "open" | "closed";

/** What the status label of a card says. */
export function quizStatus(quiz: Pick<QuizSummary, "firstPublishedAt" | "acceptingResponses">): QuizStatus {
  if (quiz.firstPublishedAt === null) return "not_published";
  return quiz.acceptingResponses ? "open" : "closed";
}

export const sortOptions = [
  { value: "edited", label: "Last edited" },
  { value: "name", label: "Name, A to Z" },
  { value: "responses", label: "Most responses" },
] as const;
export type QuizSort = (typeof sortOptions)[number]["value"];

const byName = (a: QuizSummary, b: QuizSummary) => a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true });
const byEdited = (a: QuizSummary, b: QuizSummary) => b.updatedAt.localeCompare(a.updatedAt);

const comparers: Record<QuizSort, (a: QuizSummary, b: QuizSummary) => number> = {
  edited: byEdited,
  name: byName,
  responses: (a, b) => b.finishedResponses - a.finishedResponses || byEdited(a, b),
};

/** Search by name (any part, ignoring capitals), then sort. Never changes the list it is given. */
export function filterAndSort(quizzes: readonly QuizSummary[], query: string, sort: QuizSort): QuizSummary[] {
  const needle = query.trim().toLowerCase();
  const matches = needle ? quizzes.filter((q) => q.name.toLowerCase().includes(needle)) : [...quizzes];
  return matches.sort(comparers[sort]);
}
