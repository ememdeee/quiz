import { pageTypes } from "./page-types";
import type { Page, QuizDocument, Rule, ShowRule } from "./schema";

/**
 * Display conditions: a page can be shown only when earlier answers say so. The editor, the quiz people take,
 * the summary and the validator all use these functions and nothing else (handover 5.3).
 */

/** What a person answered so far, by page id: the chosen answer ids for a choice page, a number for a number page. */
export type Answers = Record<string, string[] | number | string | undefined>;

const sourceKinds = new Set<Page["type"]>(["choice", "number"]);

/** Only choice and number pages can be the thing a condition looks at. */
export const canBeRuleSource = (page: Page) => sourceKinds.has(page.type);

function ruleHolds(rule: Rule, answers: Answers): boolean {
  const given = answers[rule.page];
  if (given === undefined) return false;
  if (rule.op === "is" || rule.op === "is not") {
    const matches = Array.isArray(given) ? given.includes(String(rule.value)) : String(given) === String(rule.value);
    return rule.op === "is" ? matches : !matches;
  }
  const have = Number(given);
  const want = Number(rule.value);
  if (Number.isNaN(have) || Number.isNaN(want)) return false;
  return rule.op === "more than" ? have > want : have < want;
}

/** The pages this person will see, in order. A rule that looks at a hidden page is false. */
export function visiblePages(doc: QuizDocument, answers: Answers): Page[] {
  const shown = new Set<string>();
  const result: Page[] = [];
  for (const page of doc.pages) {
    const check = (rule: Rule) => shown.has(rule.page) && ruleHolds(rule, answers);
    const rule = page.show;
    const visible = !rule || (rule.match === "all" ? rule.rules.every(check) : rule.rules.some(check));
    if (visible) {
      shown.add(page.id);
      result.push(page);
    }
  }
  return result;
}

export const isPageVisible = (doc: QuizDocument, page: Page, answers: Answers) => visiblePages(doc, answers).some((p) => p.id === page.id);

const quoted = (text: string) => `“${text}”`;

/** What a rule says about the person, in words: "they answered “Lose weight”", "their age is more than 40". */
function describeRule(doc: QuizDocument, rule: Rule): string {
  const source = doc.pages.find((p) => p.id === rule.page);
  if (source?.type === "choice") {
    const answer = quoted(source.answers.find((a) => a.id === rule.value)?.text ?? "");
    return rule.op === "is not" ? `they didn’t answer ${answer}` : `they answered ${answer}`;
  }
  if (source?.type === "number") {
    const subject = { age: "their age", height: "their height", weight: "their weight", number: "", date: "" }[source.kind] || `their answer to ${quoted(source.question)}`;
    return `${subject} ${rule.op === "is not" ? "is not" : rule.op === "is" ? "is" : "is " + rule.op} ${rule.value}`;
  }
  return "a page that no longer exists";
}

/** The "In plain words" sentence under the conditions (board Conditions). Empty when the page has no condition. */
export function describeShowRule(doc: QuizDocument, page: Page): string {
  const show: ShowRule | undefined = page.show;
  if (!show) return "";
  const title = quoted(pageTypes[page.type].title(page as never));
  const parts = show.rules.map((rule) => describeRule(doc, rule));
  if (show.match === "any") return `people see ${title} if ${parts.join(" or ")}.`;
  return `people see ${title} only if ${parts.join(" and ")}. Everyone else skips it.`;
}

/** Earlier choice and number pages: what a page's conditions may look at. */
export function ruleSources(doc: QuizDocument, pageId: string): Page[] {
  const index = doc.pages.findIndex((p) => p.id === pageId);
  return doc.pages.slice(0, Math.max(0, index)).filter(canBeRuleSource);
}

/** The comparisons that make sense for a page, in the order the menu shows them. */
export const opsFor = (source: Page): Rule["op"][] => (source.type === "number" ? ["is", "is not", "more than", "less than"] : ["is", "is not"]);

/** A first rule for a page: its nearest earlier source, "is" its first answer (or 0 for a number). */
export function defaultRule(source: Page): Rule {
  const value = source.type === "choice" ? (source.answers[0]?.id ?? "") : (source.type === "number" ? (source.min ?? 0) : "");
  return { page: source.id, op: "is", value };
}

const usesPage = (rule: Rule, pageId: string) => rule.page === pageId;
const usesAnswer = (rule: Rule, pageId: string, answerId: string) =>
  rule.page === pageId && (rule.op === "is" || rule.op === "is not") && rule.value === answerId;

const pagesWithRule = (doc: QuizDocument, test: (rule: Rule) => boolean) =>
  doc.pages.filter((page) => page.show?.rules.some(test)).map((page) => page.id);

/** Ids of the pages whose conditions look at this page. */
export const dependentsOfPage = (doc: QuizDocument, pageId: string) => pagesWithRule(doc, (rule) => usesPage(rule, pageId));

/** Ids of the pages whose conditions look at this one answer. */
export const dependentsOfAnswer = (doc: QuizDocument, pageId: string, answerId: string) =>
  pagesWithRule(doc, (rule) => usesAnswer(rule, pageId, answerId));

function withoutRules(doc: QuizDocument, drop: (rule: Rule) => boolean): QuizDocument {
  return {
    ...doc,
    pages: doc.pages.map((page) => {
      if (!page.show || !page.show.rules.some(drop)) return page;
      const rules = page.show.rules.filter((rule) => !drop(rule));
      const next: Page = { ...page, show: { ...page.show, rules } };
      if (rules.length === 0) delete next.show;
      return next;
    }),
  };
}

/** Drops every rule that looks at this page. A page left with no rules shows to everyone. */
export const removePageDependencies = (doc: QuizDocument, pageId: string) => withoutRules(doc, (rule) => usesPage(rule, pageId));

/** Drops every rule that looks at this answer. */
export const removeAnswerDependencies = (doc: QuizDocument, pageId: string, answerId: string) =>
  withoutRules(doc, (rule) => usesAnswer(rule, pageId, answerId));

/** Pages with a rule that looks at a missing page, at itself, or at a LATER page (a rule may only look back). */
export function pagesWithBrokenRules(doc: QuizDocument): string[] {
  const position = new Map(doc.pages.map((page, index) => [page.id, index]));
  return doc.pages
    .filter((page, index) => page.show?.rules.some((rule) => (position.get(rule.page) ?? Infinity) >= index))
    .map((page) => page.id);
}
