import { pageTypes } from "./page-types";
import type { QuizDocument } from "./schema";

/** Seconds a person is assumed to need per question page. */
const SECONDS_PER_QUESTION = 10;

/** Minutes on the Start page ("Takes about N minutes"): at least 1, rounded up. */
export function estimateMinutes(doc: QuizDocument): number {
  const questions = doc.pages.filter((page) => pageTypes[page.type].isQuestion).length;
  return Math.max(1, Math.ceil((questions * SECONDS_PER_QUESTION) / 60));
}

/** The line itself: "Takes about 1 minute". */
export const takesAbout = (minutes: number) => `Takes about ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
