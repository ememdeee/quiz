import { visiblePages, type Answers } from "@/lib/quiz/conditions";
import { pageTypes } from "@/lib/quiz/page-types";
import type { Page, QuizDocument } from "@/lib/quiz/schema";
import type { QuizResponse, StoredAnswer } from "./types";

/**
 * Everything the Summary page shows, worked out from the saved responses (board Report). Pure functions, so the
 * numbers can be tested and the same code runs against the real data later.
 */
export type Funnel = { opened: number; started: number; finished: number; finishRate: number };
export type LeaveRow = { pageId: string; position: number; label: string; share: number };
export type Bar = { label: string; count: number; share: number };

export type QuestionSummary =
  | { kind: "choice"; pageId: string; position: number; label: string; answered: number; options: Bar[] }
  | { kind: "number"; pageId: string; position: number; label: string; answered: number; average: number | null; lowest: number | null; highest: number | null; histogram: Bar[] }
  | { kind: "date"; pageId: string; position: number; label: string; answered: number; earliest: string | null; latest: string | null; months: Bar[] }
  | { kind: "text"; pageId: string; position: number; label: string; wrote: number; skipped: number; latest: { text: string; number: number; at: string }[]; total: number };

export type RemovedQuestion = { id: string; label: string; answered: number; answers: { text: string; count: number }[] };

export type Summary = {
  funnel: Funnel;
  leave: LeaveRow[];
  biggestDrop: { from: string; to: string } | null;
  questions: QuestionSummary[];
  removed: RemovedQuestion[];
};

const percent = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

/** The answers a person gave, in the shape the display conditions read. */
export function answersOf(response: QuizResponse): Answers {
  return Object.fromEntries(Object.entries(response.answers).map(([id, a]) => [id, a.v]));
}

const labelOf = (page: Page) => pageTypes[page.type].title(page as never).trim();

/** People who were shown a page, and how many of them got to it. */
function reach(doc: QuizDocument, responses: QuizResponse[]) {
  const applied = new Map<string, number>();
  const reached = new Map<string, number>();
  for (const response of responses) {
    const seen = new Set(response.pagesSeen);
    for (const page of visiblePages(doc, answersOf(response))) {
      applied.set(page.id, (applied.get(page.id) ?? 0) + 1);
      if (seen.has(page.id)) reached.set(page.id, (reached.get(page.id) ?? 0) + 1);
    }
  }
  return { applied, reached };
}

export function funnelOf(responses: QuizResponse[], opened: number): Funnel {
  const finished = responses.filter((r) => r.status === "finished").length;
  return { opened, started: responses.length, finished, finishRate: percent(finished, responses.length) };
}

function leaveRows(doc: QuizDocument, responses: QuizResponse[]): LeaveRow[] {
  const { applied, reached } = reach(doc, responses);
  return doc.pages.map((page, index) => {
    const seenBy = page.type === "end" ? responses.filter((r) => r.status === "finished" && (applied.get(page.id) ?? 0) > 0).length : (reached.get(page.id) ?? 0);
    return { pageId: page.id, position: index + 1, label: labelOf(page), share: percent(seenBy, applied.get(page.id) ?? 0) };
  });
}

/** "The biggest drop is between X and Y": the largest fall from one page to the next. */
function biggestDrop(doc: QuizDocument, rows: LeaveRow[]): Summary["biggestDrop"] {
  let best = 0;
  let found: Summary["biggestDrop"] = null;
  for (let i = 1; i < rows.length; i++) {
    const drop = rows[i - 1].share - rows[i].share;
    if (drop > best) {
      best = drop;
      found = { from: rows[i - 1].label, to: doc.pages[i].type === "end" ? "the result" : rows[i].label };
    }
  }
  return found;
}

const answerOf = (response: QuizResponse, page: Page): StoredAnswer | undefined => response.answers[page.id];
const nonBlank = (a: StoredAnswer | undefined) => a !== undefined && !(typeof a.v === "string" && a.v.trim() === "") && !(Array.isArray(a.v) && a.v.length === 0);

const AGE_BRACKETS = [
  { label: "18–29", from: 0, to: 29 },
  { label: "30–39", from: 30, to: 39 },
  { label: "40–49", from: 40, to: 49 },
  { label: "50–59", from: 50, to: 59 },
  { label: "60+", from: 60, to: Infinity },
];

function histogram(values: number[], kind: string): Bar[] {
  if (values.length === 0) return [];
  const edges =
    kind === "age"
      ? AGE_BRACKETS
      : (() => {
          const lo = Math.min(...values);
          const hi = Math.max(...values);
          const width = Math.max(1, Math.ceil((hi - lo + 1) / 5));
          return Array.from({ length: 5 }, (_, i) => ({ label: `${lo + i * width}–${lo + (i + 1) * width - 1}`, from: lo + i * width, to: lo + (i + 1) * width - 1 }));
        })();
  const bars = edges.map((edge) => ({ label: edge.label, count: values.filter((v) => v >= edge.from && v <= edge.to).length }));
  const top = Math.max(...bars.map((b) => b.count), 1);
  return bars.map((b) => ({ ...b, share: percent(b.count, top) }));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function byMonth(dates: string[]): Bar[] {
  const counts = new Map<string, number>();
  for (const d of [...dates].sort()) counts.set(d.slice(0, 7), (counts.get(d.slice(0, 7)) ?? 0) + 1);
  const entries = [...counts.entries()];
  const shown = entries.length > 6 ? entries.slice(0, 5) : entries;
  const rest = entries.length > 6 ? entries.slice(5) : [];
  const bars = shown.map(([key, count]) => ({ label: MONTHS[Number(key.slice(5)) - 1], count }));
  if (rest.length > 0) bars.push({ label: `${MONTHS[Number(rest[0][0].slice(5)) - 1]}+`, count: rest.reduce((sum, [, c]) => sum + c, 0) });
  const top = Math.max(...bars.map((b) => b.count), 1);
  return bars.map((b) => ({ ...b, share: percent(b.count, top) }));
}

function questionSummary(page: Page, position: number, responses: QuizResponse[]): QuestionSummary | null {
  const label = labelOf(page);
  const given = responses.map((r) => ({ r, a: answerOf(r, page) })).filter((x) => nonBlank(x.a)) as { r: QuizResponse; a: StoredAnswer }[];

  if (page.type === "choice") {
    const options = page.answers.map((answer) => {
      const count = given.filter(({ a }) => Array.isArray(a.v) && a.v.includes(answer.id)).length;
      return { label: answer.text, count, share: percent(count, given.length) };
    });
    return { kind: "choice", pageId: page.id, position, label, answered: given.length, options };
  }
  if (page.type === "number" && page.kind === "date") {
    const dates = given.map(({ a }) => String(a.v)).sort();
    return { kind: "date", pageId: page.id, position, label, answered: dates.length, earliest: dates[0] ?? null, latest: dates[dates.length - 1] ?? null, months: byMonth(dates) };
  }
  if (page.type === "number") {
    const values = given.map(({ a }) => Number(a.v)).filter((v) => !Number.isNaN(v));
    const average = values.length > 0 ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null;
    return { kind: "number", pageId: page.id, position, label, answered: values.length, average, lowest: values.length ? Math.min(...values) : null, highest: values.length ? Math.max(...values) : null, histogram: histogram(values, page.kind) };
  }
  if (page.type === "text") {
    const reached = responses.filter((r) => r.pagesSeen.includes(page.id)).length;
    const latest = [...given].sort((x, y) => y.r.startedAt.localeCompare(x.r.startedAt)).slice(0, 3).map(({ r, a }) => ({ text: String(a.v), number: r.number, at: r.startedAt }));
    return { kind: "text", pageId: page.id, position, label, wrote: given.length, skipped: Math.max(0, reached - given.length), latest, total: given.length };
  }
  return null;
}

/** Answers to pages that are no longer in the quiz, kept under their last saved question text. */
function removedQuestions(doc: QuizDocument, responses: QuizResponse[]): RemovedQuestion[] {
  const known = new Set(doc.pages.map((p) => p.id));
  const found = new Map<string, { label: string; at: string; counts: Map<string, number>; answered: number }>();
  for (const response of responses) {
    for (const [id, answer] of Object.entries(response.answers)) {
      if (known.has(id)) continue;
      const entry = found.get(id) ?? { label: answer.q, at: response.startedAt, counts: new Map(), answered: 0 };
      if (response.startedAt >= entry.at) Object.assign(entry, { label: answer.q, at: response.startedAt });
      const text = answer.vt ? answer.vt.join("; ") : String(answer.v);
      entry.counts.set(text, (entry.counts.get(text) ?? 0) + 1);
      entry.answered += 1;
      found.set(id, entry);
    }
  }
  return [...found.entries()].map(([id, e]) => ({
    id,
    label: e.label,
    answered: e.answered,
    answers: [...e.counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([text, count]) => ({ text, count })),
  }));
}

export function summarize(doc: QuizDocument, responses: QuizResponse[], opened: number): Summary {
  const leave = leaveRows(doc, responses);
  const questions = doc.pages
    .map((page, index) => (pageTypes[page.type].isQuestion ? questionSummary(page, index + 1, responses) : null))
    .filter((q): q is QuestionSummary => q !== null);
  return { funnel: funnelOf(responses, opened), leave, biggestDrop: biggestDrop(doc, leave), questions, removed: removedQuestions(doc, responses) };
}
