/** Small text helpers for link previews (the share pictures and the title and description tags). */

/** One line of text no longer than `max` characters, cut at a word where possible and ended with “…”. */
export function clip(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–-]+$/, "")}…`;
}

/** A font size that keeps a headline inside the picture: the longer the title, the smaller the letters. `narrow` is for the layout with a picture beside it. */
export function titleSize(title: string, narrow = false): number {
  const n = title.length;
  const size = n <= 16 ? 96 : n <= 28 ? 80 : n <= 44 ? 66 : n <= 64 ? 54 : 46;
  return narrow ? Math.round(size * 0.82) : size;
}

/**
 * The description line of a shared quiz: the Start page's own words when it has any, otherwise what the quiz is
 * ("10 questions · about 2 minutes"), so a preview is never an empty line.
 */
export function previewDescription(text: string, questions: number, time: string): string {
  const words = text.replace(/\s+/g, " ").trim();
  if (words) return clip(words, 160);
  const length = time ? time.replace(/^Takes about/, "about") : "";
  if (questions > 0) return `${questions} ${questions === 1 ? "question" : "questions"}${length ? ` · ${length}` : ""}. Tap to start.`;
  return "Tap to open this quiz.";
}
