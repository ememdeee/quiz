import type { Page, PageOf, PageType } from "../schema";
import { choice } from "./choice";
import { end } from "./end";
import { info } from "./info";
import { loading } from "./loading";
import { number } from "./number";
import { text } from "./text";
import type { PageTypeDefinition } from "./types";
import { welcome } from "./welcome";

export type { FieldProblem, PageTypeDefinition, ProblemCode } from "./types";

/** The page-type registry. Look a type up here; never `switch` on `page.type` anywhere else. */
export const pageTypes: { [T in PageType]: PageTypeDefinition<T> } = { welcome, choice, text, number, info, loading, end };

/** The registry entry of one page, typed loosely enough to call with any page. */
export function definitionOf<T extends PageType>(page: PageOf<T>): PageTypeDefinition<T>;
export function definitionOf(page: Page): PageTypeDefinition<PageType> {
  return pageTypes[page.type] as PageTypeDefinition<PageType>;
}

/** The kinds of page the "What do you want to add?" dialog offers, in its two groups. */
export const addablePageTypes = (group: "ask" | "show"): PageType[] =>
  (Object.keys(pageTypes) as PageType[]).filter((type) => pageTypes[type].group === group);
