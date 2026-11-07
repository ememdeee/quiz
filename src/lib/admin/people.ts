import { FREE_LIMITS, getLimits } from "@/lib/plan/limits";
import { protectCell } from "@/lib/responses/export/csv";
import type { AdminOverviewData, AdminPerson, PeopleFilter, PeopleQuery, PersonRow } from "./types";

/** The admin area's numbers and lists, worked out from the people. Pure functions, so the same code can run on real data later. */

export const PAGE_SIZE = 8;
/** "Close to a Free plan limit" means at least this share of any of the three limits (decision D13). */
export const NEAR_LIMIT = 0.8;

const DAY = 24 * 60 * 60 * 1000;

export const quizCount = (person: AdminPerson) => person.quizzes.length;
export const responseCount = (person: AdminPerson) => person.quizzes.reduce((sum, quiz) => sum + quiz.responses, 0);

/** On the Free plan and using at least 80% of the quizzes, pages in one quiz, or responses in one quiz. */
export function isNearLimit(person: AdminPerson): boolean {
  if (person.plan !== "free") return false;
  const limits = getLimits(person);
  const most = (pick: (quiz: AdminPerson["quizzes"][number]) => number) => person.quizzes.reduce((high, quiz) => Math.max(high, pick(quiz)), 0);
  return (
    quizCount(person) >= limits.quizzes * NEAR_LIMIT ||
    most((q) => q.pages) >= limits.pagesPerQuiz * NEAR_LIMIT ||
    most((q) => q.responses) >= limits.responsesPerQuiz * NEAR_LIMIT
  );
}

const matches = (person: AdminPerson, filter: PeopleFilter) =>
  filter === "everyone" || (filter === "unverified" ? !person.emailVerified : person.plan === filter);

const newestFirst = (a: AdminPerson, b: AdminPerson) => new Date(b.signedUpAt).getTime() - new Date(a.signedUpAt).getTime();

/** Search by name or email, filter, newest first, one page. `total` is the number of matches over all pages. */
export function queryPeople(
  people: readonly AdminPerson[],
  { search, filter, page }: PeopleQuery,
): { rows: PersonRow[]; total: number; page: number; pages: number } {
  const needle = search.trim().toLowerCase();
  const found = people
    .filter((person) => matches(person, filter) && (needle === "" || person.name.toLowerCase().includes(needle) || person.email.toLowerCase().includes(needle)))
    .sort(newestFirst);
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  const rows = found.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).map((person) => ({ person, quizzes: quizCount(person), responses: responseCount(person) }));
  return { rows, total: found.length, page: current, pages };
}

/** "Showing 1–8 of 1,284": the first and last row number on this page. */
export const showingRange = (page: number, total: number): [number, number] =>
  total === 0 ? [0, 0] : [(page - 1) * PAGE_SIZE + 1, Math.min(page * PAGE_SIZE, total)];

export function overviewOf(people: readonly AdminPerson[], now: number = Date.now()): AdminOverviewData {
  const ageDays = (person: AdminPerson) => (now - new Date(person.signedUpAt).getTime()) / DAY;
  const daily = Array.from({ length: 30 }, () => 0);
  for (const person of people) {
    const day = Math.floor(ageDays(person));
    if (day >= 0 && day < 30) daily[29 - day] += 1;
  }
  return {
    signedUp: people.length,
    newThisWeek: people.filter((p) => ageDays(p) < 7).length,
    newThisMonth: people.filter((p) => ageDays(p) < 30).length,
    custom: people.filter((p) => p.plan === "custom").length,
    quizzes: people.reduce((sum, p) => sum + quizCount(p), 0),
    responses: people.reduce((sum, p) => sum + responseCount(p), 0),
    unverified: people.filter((p) => !p.emailVerified).length,
    nearLimit: people.filter(isNearLimit).length,
    daily,
    newest: [...people].sort(newestFirst).slice(0, 5),
  };
}

const csvCell = (value: string | number) => `"${protectCell(String(value)).replace(/"/g, '""')}"`;

/** "Download as CSV": one row per person with the same columns as the table. */
export function peopleCsv(rows: readonly PersonRow[]): string {
  const header = ["Name", "Email", "Plan", "Quizzes", "Responses", "Signed up", "Email verified"];
  const lines = rows.map(({ person, quizzes, responses }) =>
    [person.name, person.email, person.plan === "free" ? "Free" : "Custom", quizzes, responses, person.signedUpAt.slice(0, 10), person.emailVerified ? "Yes" : "No"]
      .map(csvCell)
      .join(","),
  );
  return [header.map(csvCell).join(","), ...lines].join("\r\n");
}

/** "Today", "Yesterday" or "Nov 5": when someone signed up, in the viewer's time zone. */
export function dayLabel(date: string | number, now: number = Date.now()): string {
  const start = (t: number) => new Date(new Date(t).getFullYear(), new Date(t).getMonth(), new Date(t).getDate()).getTime();
  const days = Math.round((start(now) - start(new Date(date).getTime())) / DAY);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

/** The name of the downloaded file: users-2026-11-07.csv */
export const peopleFileName = (now: Date = new Date()) => `users-${now.toISOString().slice(0, 10)}.csv`;

/** The "Free: 5" hints next to the limit boxes. */
export const freeLimitHints = { quizzes: FREE_LIMITS.quizzes, pages: FREE_LIMITS.pagesPerQuiz, responses: FREE_LIMITS.responsesPerQuiz };

/**
 * A limit box: blank means the plan's number, otherwise a whole number of at least 1. Commas are allowed ("10,000").
 * Returns undefined when what was typed is not valid.
 */
export function parseLimit(text: string): number | null | undefined {
  const clean = text.replace(/[,\s]/g, "");
  if (clean === "") return null;
  if (!/^\d+$/.test(clean)) return undefined;
  const value = Number(clean);
  return value >= 1 ? value : undefined;
}
