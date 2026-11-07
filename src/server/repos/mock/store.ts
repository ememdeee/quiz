import { seedQuizzes } from "@/data/mock/seed";
import type { QuizSummary } from "@/lib/quizzes/types";

/** The dummy database: the owner's quizzes, kept in localStorage so a refresh keeps every edit. */
const KEY = "quiz.mock.quizzes.v1";

let memory: QuizSummary[] | null = null;

export function loadQuizzes(): QuizSummary[] {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      memory = JSON.parse(raw) as QuizSummary[];
      return memory;
    }
  } catch {
    // Unreadable or blocked storage: start again from the seed
  }
  memory = seedQuizzes();
  return memory;
}

export function saveQuizzes(quizzes: QuizSummary[]) {
  memory = quizzes;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(quizzes));
  } catch {
    // Storage full or blocked: edits last until the page is closed
  }
}

export function resetQuizzes(quizzes: QuizSummary[] = seedQuizzes()) {
  saveQuizzes(quizzes);
}
