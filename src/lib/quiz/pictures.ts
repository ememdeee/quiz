import type { PageOf, QuizDocument } from "./schema";

/** Ids of every picture a quiz points to (page pictures and answer pictures), each once. */
export function pictureIds(doc: QuizDocument): string[] {
  const ids = new Set<string>();
  for (const page of doc.pages) {
    if ("picture" in page && page.picture) ids.add(page.picture);
    if (page.type === "choice") for (const answer of page.answers) if (answer.picture) ids.add(answer.picture);
  }
  return [...ids];
}

/** A choice page shows its answers as picture tiles as soon as one answer has a picture (board FEChoicePics). */
export const showsAnswerPictures = (page: PageOf<"choice">) => page.answers.some((answer) => answer.picture);
