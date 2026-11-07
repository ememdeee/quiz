import { pagesWithBrokenRules } from "./conditions";
import { pageTypes, type FieldProblem, type PageTypeDefinition, type ProblemCode } from "./page-types";
import type { Page, PageType, QuizDocument } from "./schema";

export type QuizProblemCode = ProblemCode | "shape_invalid" | "no_question" | "too_many_pages" | "rule_invalid";

/** `pageId` is null for a problem of the quiz as a whole. */
export type Problem = { pageId: string | null; field?: string; code: QuizProblemCode };

/**
 * Everything that must be fixed before a quiz can be published (handover 5.4). One function for the field errors
 * in the editor, the Publish check and (later) the Edit with AI import. It reports codes; screens turn them into words.
 */
export function validateQuiz(doc: QuizDocument, context: { maxPages: number }): Problem[] {
  const problems: Problem[] = [];
  const { pages } = doc;

  const last = pages.length - 1;
  const shapeOk =
    pages.length >= 2 &&
    pages[0].type === "welcome" &&
    pages[last].type === "end" &&
    pages.filter((p) => p.type === "welcome").length === 1 &&
    pages.filter((p) => p.type === "end").length === 1;
  if (!shapeOk) problems.push({ pageId: null, code: "shape_invalid" });
  if (pages.length > context.maxPages) problems.push({ pageId: null, code: "too_many_pages" });
  if (!pages.some((p) => pageTypes[p.type].isQuestion)) problems.push({ pageId: null, code: "no_question" });

  for (const page of pages) {
    const definition = pageTypes[page.type] as PageTypeDefinition<PageType>;
    for (const problem of definition.problems(page as never) as FieldProblem[]) problems.push({ pageId: page.id, ...problem });
  }
  for (const pageId of pagesWithBrokenRules(doc)) problems.push({ pageId, field: "show", code: "rule_invalid" });
  return problems;
}

/** The first page that has a problem, for "Go to page". */
export const firstProblemPage = (doc: QuizDocument, problems: Problem[]): Page | undefined =>
  doc.pages.find((page) => problems.some((problem) => problem.pageId === page.id));
