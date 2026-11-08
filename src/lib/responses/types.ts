import type { PageType } from "@/lib/quiz/schema";

/** One answer as saved: the question text and the chosen option texts are kept as they were when answered (handover 5.5). */
export type AnswerValue = string[] | number | string;
export type StoredAnswer = { type: PageType; q: string; v: AnswerValue; vt?: string[] };

export type QuizResponse = {
  id: string;
  /** "Response 128": counted in the order people started */
  number: number;
  status: "in_progress" | "finished";
  startedAt: string;
  finishedAt: string | null;
  answers: Record<string, StoredAnswer>;
  /** Ordered ids of the pages this person reached */
  pagesSeen: string[];
  lastPageId: string;
};

/** What the Summary needs besides the responses: how many people opened the quiz (from the daily counts). */
export type ResponseSet = { responses: QuizResponse[]; opened: number };
