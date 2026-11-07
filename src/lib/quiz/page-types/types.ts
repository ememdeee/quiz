import type { PageOf, PageType } from "../schema";

/** Why a page cannot be published yet. `field` names the input to mark; `code` is turned into words by the screens. */
export type FieldProblem = { field?: string; code: ProblemCode };

export type ProblemCode =
  | "title_missing"
  | "question_missing"
  | "message_missing"
  | "answers_too_few"
  | "answer_empty"
  | "step_empty"
  | "range_invalid"
  | "button_text_missing"
  | "link_invalid";

/**
 * Everything the app knows about one kind of page, in one place. Nothing else in the app may branch on the
 * page type: it asks the registry (`pageTypes[page.type]`). A new kind of page means one new file here.
 */
export type PageTypeDefinition<T extends PageType> = {
  type: T;
  /** Name in the "What do you want to add?" dialog */
  label: string;
  /** Line under that name */
  description: string;
  /** Which group of the dialog offers it. null: Start and End pages are never added by hand. */
  group: "ask" | "show" | null;
  /** True for pages that ask something (choice, text, number). A quiz needs at least one. */
  isQuestion: boolean;
  /** The words under the title in the page list ("Multiple choice", "Asks for a number") */
  listLabel: (page: PageOf<T>) => string;
  /** The longer line used when describing a page elsewhere ("Number · 0 to 10") */
  summaryLabel: (page: PageOf<T>) => string;
  /** The page's own heading: its question, title or message. May be empty. */
  title: (page: PageOf<T>) => string;
  /** A fresh page of this kind, as the editor adds it */
  create: (id: string) => PageOf<T>;
  /** Strict rules checked before publishing */
  problems: (page: PageOf<T>) => FieldProblem[];
};

export const isBlank = (value: string | undefined) => !value || value.trim() === "";
