import { seedBundles } from "@/data/mock/seed";
import type { QuizBundle } from "@/lib/quizzes/types";

/** The dummy database: the owner's quizzes with their documents, kept in localStorage so a refresh keeps every edit. */
/** v2: quizzes now carry a `version` (the conflict check, gap G1). Dummy data saved under v1 is simply dropped. */
const KEY = "quiz.mock.bundles.v2";

let memory: QuizBundle[] | null = null;

export function loadBundles(): QuizBundle[] {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      memory = JSON.parse(raw) as QuizBundle[];
      return memory;
    }
  } catch {
    // Unreadable or blocked storage: start again from the seed
  }
  memory = seedBundles();
  return memory;
}

export function saveBundles(bundles: QuizBundle[]) {
  memory = bundles;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(bundles));
  } catch {
    // Storage full or blocked: edits last until the page is closed
  }
}

export function resetBundles(bundles: QuizBundle[] = seedBundles()) {
  saveBundles(bundles);
}
