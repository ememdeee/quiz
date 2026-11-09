import { fieldMessage } from "@/content/dashboard/publish";
import { diffQuiz, stable } from "@/lib/quiz/diff";
import { newId } from "@/lib/quiz/ids";
import { pageTypes } from "@/lib/quiz/page-types";
import { quizDocumentSchema, type Page, type QuizDocument } from "@/lib/quiz/schema";
import { validateQuiz, type Problem } from "@/lib/quiz/validate";

/**
 * What happens to an answer pasted back from an AI chat (board AiFormat, section 4): find the quiz in the text,
 * check it, work out what would change. Pure, so every step can be tested. Nothing is applied here.
 */
export type AiProblem = { text: string; ask: string };
export type AiChange = { kind: "added" | "changed" | "removed"; title: string; detail: string; position: number };

export type AiImportResult =
  | { ok: false; reason: "no_quiz" | "cut_off" }
  | { ok: false; reason: "problems"; problems: AiProblem[] }
  | { ok: false; reason: "too_many_pages"; count: number }
  | {
      ok: true;
      document: QuizDocument;
      changes: AiChange[];
      counts: { added: number; changed: number; removed: number; same: number };
      leftOut: { position: number; title: string }[];
      unchanged: boolean;
    };

type Found = { kind: "found"; value: Record<string, unknown> } | { kind: "cut_off" } | { kind: "none" };

/** The first complete JSON object that looks like a quiz, ignoring words and code fences around it. */
export function findQuizJson(text: string): Found {
  let cutOff = false;
  for (let start = text.indexOf("{"); start !== -1; start = text.indexOf("{", start + 1)) {
    let depth = 0;
    let inString = false;
    let escaped = false;
    let end = -1;
    for (let i = start; i < text.length; i++) {
      const char = text[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (char === "\\") escaped = true;
        else if (char === '"') inString = false;
      } else if (char === '"') inString = true;
      else if (char === "{") depth++;
      else if (char === "}" && --depth === 0) {
        end = i;
        break;
      }
    }
    if (end === -1) {
      if (/"(pages|format)"/.test(text.slice(start))) cutOff = true;
      break;
    }
    try {
      const value = JSON.parse(text.slice(start, end + 1));
      if (value && typeof value === "object" && "pages" in value) return { kind: "found", value };
    } catch {
      // Not JSON: keep looking
    }
    start = end;
  }
  return cutOff ? { kind: "cut_off" } : { kind: "none" };
}

/** Gives every id that starts with "new-" a real id. Returns the new document and what each old id became. */
function realIds(doc: QuizDocument): { doc: QuizDocument; map: Map<string, string> } {
  const map = new Map<string, string>();
  const pick = (id: string) => (id.startsWith("new-") ? (map.get(id) ?? map.set(id, newId()).get(id)!) : id);
  const pages = doc.pages.map((page) => {
    const next = { ...page, id: pick(page.id) } as Page;
    if (next.type === "choice") next.answers = next.answers.map((a) => ({ ...a, id: pick(a.id) }));
    return next;
  });
  return { doc: { ...doc, pages }, map };
}

/** Points the conditions at the new ids: the page they look at, and the answer they compare with. */
function remapRules(doc: QuizDocument, map: Map<string, string>): QuizDocument {
  if (map.size === 0) return doc;
  return {
    ...doc,
    pages: doc.pages.map((page) =>
      page.show
        ? ({ ...page, show: { ...page.show, rules: page.show.rules.map((r) => ({ ...r, page: map.get(r.page) ?? r.page, value: typeof r.value === "string" ? (map.get(r.value) ?? r.value) : r.value })) } } as Page)
        : page,
    ),
  };
}

const position = (doc: QuizDocument, id: string | null) => doc.pages.findIndex((p) => p.id === id) + 1;

/** What a problem says on screen, and what to tell the AI so it can fix it. */
export function describeProblem(problem: Problem, doc: QuizDocument): AiProblem {
  const n = position(doc, problem.pageId);
  const page = doc.pages[n - 1];
  switch (problem.code) {
    case "answers_too_few":
      return { text: `Page ${n}: a multiple-choice page needs at least 2 answers.`, ask: `Page ${n} needs at least 2 answers.` };
    case "rule_invalid": {
      const rule = page?.show?.rules.find((r) => position(doc, r.page) === 0 || position(doc, r.page) >= n);
      const target = rule ? position(doc, rule.page) : 0;
      const where = target > 0 ? `page ${target}, which comes later` : "a page that doesn’t exist";
      return { text: `Page ${n}: this rule looks at ${where}.`, ask: `Page ${n} looks at ${where}.` };
    }
    case "shape_invalid": {
      const last = doc.pages[doc.pages.length - 1];
      const text = last && last.type !== "end" ? `The last page must be the End page. Right now it is ${/^[aeiou]/.test(last.type) ? "an" : "a"} ${pageTypes[last.type].label}.` : "The quiz needs exactly one Start page first and one End page last.";
      return { text, ask: "The first page must be the welcome page and the last page the end page, with exactly one of each." };
    }
    case "no_question":
      return { text: "The quiz needs at least one question.", ask: "The quiz needs at least one question page." };
    default: {
      const message = fieldMessage(problem.code);
      return { text: `Page ${n}: ${message}`, ask: `Page ${n}: ${message}` };
    }
  }
}

const kindLabel = (page: Page) => {
  const base = pageTypes[page.type].listLabel(page as never);
  return page.type === "choice" ? `${base} · ${page.answers.length} answers` : base;
};

const fieldWords: Record<string, string> = {
  question: "The question is different",
  title: "The title is different",
  text: "The text is different",
  message: "The message is different",
  hint: "The hint is different",
  steps: "The steps are different",
  seconds: "The time is different",
  show: "Who sees this page is different",
  picture: "The picture is different",
};

/** A short plain description of what changed on one page: "New answer: “Sleep better”", "The text is different". */
export function describeChange(before: Page, after: Page): string {
  const details: string[] = [];
  if (before.type === "choice" && after.type === "choice") {
    const old = new Map(before.answers.map((a) => [a.id, a.text]));
    const now = new Map(after.answers.map((a) => [a.id, a.text]));
    for (const a of after.answers) if (!old.has(a.id)) details.push(`New answer: “${a.text}”`);
    for (const a of before.answers) if (!now.has(a.id)) details.push(`Answer removed: “${a.text}”`);
    if (after.answers.some((a) => old.has(a.id) && old.get(a.id) !== a.text)) details.push("An answer is worded differently");
  }
  const was = before as Record<string, unknown>;
  const now = after as Record<string, unknown>;
  for (const key of new Set([...Object.keys(was), ...Object.keys(now)])) {
    if (key === "id" || key === "type" || key === "answers") continue;
    if (stable(was[key]) !== stable(now[key])) details.push(fieldWords[key] ?? "Some settings are different");
  }
  return [...new Set(details)].slice(0, 2).join(" · ");
}

/** Check a pasted answer against the quiz as it is now. `mediaIds` are the pictures the person has uploaded. */
export function importAiText(text: string, context: { current: QuizDocument; maxPages: number; mediaIds: ReadonlySet<string> }): AiImportResult {
  const found = findQuizJson(text);
  if (found.kind !== "found") return { ok: false, reason: found.kind === "cut_off" ? "cut_off" : "no_quiz" };

  const parsed = quizDocumentSchema.safeParse(found.value);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((issue): AiProblem => {
      const index = issue.path[0] === "pages" && typeof issue.path[1] === "number" ? issue.path[1] + 1 : null;
      const where = index ? `Page ${index}` : "The quiz";
      const field = issue.path.slice(index ? 2 : 0).join(" ");
      // A field with fixed choices says which ones are allowed, so the AI (and the person) can fix it in one go
      const allowed = issue.code === "invalid_value" && "values" in issue ? ` It must be one of: ${(issue.values as unknown[]).map((v) => `“${String(v)}”`).join(", ")}.` : "";
      const t = index ? `${where}: “${field || "a field"}” isn’t in the right format.${allowed}` : issue.path[0] === "format" ? "The format must be “quiz-v1”." : "The quiz data isn’t in the right format.";
      return { text: t, ask: t };
    });
    return { ok: false, reason: "problems", problems: dedupe(problems) };
  }

  const ids = parsed.data.pages.map((p) => p.id);
  if (new Set(ids).size !== ids.length) {
    const t = "Two pages share the same id. Every page needs its own id.";
    return { ok: false, reason: "problems", problems: [{ text: t, ask: t }] };
  }

  const fresh = realIds(parsed.data);
  let document: QuizDocument = { ...remapRules(fresh.doc, fresh.map), name: context.current.name };

  // The same id coming back as a different kind of page is one removed page and one added page
  const before = new Map(context.current.pages.map((p) => [p.id, p]));
  const swapped = new Map<string, string>();
  document = {
    ...document,
    pages: document.pages.map((page) => {
      if (before.get(page.id) && before.get(page.id)?.type !== page.type) swapped.set(page.id, newId());
      return swapped.has(page.id) ? ({ ...page, id: swapped.get(page.id) as string } as Page) : page;
    }),
  };
  document = remapRules(document, swapped);

  // Pictures that are not in the library are left out
  const leftOut: { position: number; title: string }[] = [];
  document = {
    ...document,
    pages: document.pages.map((page, index) => {
      const next = { ...page } as Page & { picture?: string | null };
      let dropped = false;
      if ("picture" in next && next.picture && !context.mediaIds.has(next.picture)) {
        next.picture = null;
        dropped = true;
      }
      if (next.type === "choice") {
        next.answers = next.answers.map((a) => (a.picture && !context.mediaIds.has(a.picture) ? ((dropped = true), { ...a, picture: null }) : a));
      }
      if (dropped) leftOut.push({ position: index + 1, title: pageTypes[page.type].title(page as never) });
      return next as Page;
    }),
  };

  const shown = document.pages.filter((p) => (p.type === "welcome" || p.type === "end") && p.show);
  const checked = validateQuiz(document, { maxPages: Number.MAX_SAFE_INTEGER });
  const problems = checked.map((p) => describeProblem(p, document));
  for (const page of shown) {
    const t = `Page ${position(document, page.id)}: the Start and End pages can’t have conditions.`;
    problems.push({ text: t, ask: t });
  }
  if (problems.length > 0) return { ok: false, reason: "problems", problems: dedupe(problems) };
  if (document.pages.length > context.maxPages) return { ok: false, reason: "too_many_pages", count: document.pages.length };

  const diff = diffQuiz(document, context.current);
  const changes: AiChange[] = [
    ...diff.added.map((id): AiChange => {
      const page = document.pages.find((p) => p.id === id) as Page;
      return { kind: "added", title: pageTypes[page.type].title(page as never), detail: `New page ${position(document, id)} · ${kindLabel(page)}`, position: position(document, id) };
    }),
    ...diff.changed.map((id): AiChange => {
      const page = document.pages.find((p) => p.id === id) as Page;
      const old = before.get(id) as Page;
      return { kind: "changed", title: pageTypes[page.type].title(page as never), detail: `Page ${position(document, id)} · ${describeChange(old, page) || `Moved to page ${position(document, id)}`}`, position: position(document, id) };
    }),
    ...diff.removed.map((id): AiChange => {
      const page = before.get(id) as Page;
      return { kind: "removed", title: pageTypes[page.type].title(page as never), detail: `Was page ${position(context.current, id)} · Answers already collected stay in Responses`, position: position(context.current, id) };
    }),
  ];
  const counts = { added: diff.added.length, changed: diff.changed.length, removed: diff.removed.length, same: document.pages.length - diff.added.length - diff.changed.length };
  return { ok: true, document, changes, counts, leftOut, unchanged: diff.count === 0 };
}

function dedupe(problems: AiProblem[]): AiProblem[] {
  const seen = new Set<string>();
  return problems.filter((p) => (seen.has(p.text) ? false : (seen.add(p.text), true)));
}

/** The ready-made messages a person pastes into their AI chat when something went wrong (board AiFormat, "Copy-back messages"). */
export const askAgain = {
  noQuiz: "Send the whole quiz again as data, in one code block, with no other text.",
  cutOff: "Please continue. Send the whole quiz from the start, in one code block.",
  problems: (problems: AiProblem[]) => `Please fix these problems and send the whole quiz again in one code block: ${problems.map((p) => p.ask).join(" ")}`,
  tooMany: (limit: number) => `Please keep the quiz to ${limit} pages or fewer and send the whole quiz again in one code block.`,
} as const;
