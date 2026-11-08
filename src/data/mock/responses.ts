import { visiblePages } from "@/lib/quiz/conditions";
import type { Page, QuizDocument } from "@/lib/quiz/schema";
import { answersOf } from "@/lib/responses/summarize";
import type { QuizResponse, ResponseSet, StoredAnswer } from "@/lib/responses/types";
import { seedBundles } from "./seed";

/** Small deterministic random numbers, so the dummy responses are the same every time the data is reset. */
function random(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const WORDS = [
  "I’d love shorter morning routines.",
  "Does this work if I travel a lot?",
  "Thank you, this was simple to follow.",
  "Can I do this with a bad knee?",
  "Please add evening plans too.",
  "Not sure yet, I’m just curious.",
];

const DAY = 24 * 60 * 60 * 1000;

function answerFor(page: Page, next: () => number, now: number): StoredAnswer | null {
  if (page.type === "choice") {
    const picked = page.answers[Math.min(page.answers.length - 1, Math.floor(next() * next() * page.answers.length))];
    return { type: "choice", q: page.question, v: [picked.id], vt: [picked.text] };
  }
  if (page.type === "text") return next() < 0.3 ? { type: "text", q: page.question, v: WORDS[Math.floor(next() * WORDS.length)] } : null;
  if (page.type !== "number") return null;
  if (page.kind === "date") {
    return { type: "number", q: page.question, v: new Date(now + (30 + Math.floor(next() * 330)) * DAY).toISOString().slice(0, 10) };
  }
  const low = page.min ?? 0;
  const high = page.max ?? 10;
  const middle = (low + high) / 2;
  const value = Math.round(middle + (next() + next() + next() - 1.5) * ((high - low) / 3));
  return { type: "number", q: page.question, v: Math.min(high, Math.max(low, value)) };
}

type Options = { finished: number; unfinished: number; now: number; seed: number; removed?: { id: string; q: string } };

/** Made-up people answering a quiz: some finish, some leave part way, some answer a question that was deleted later. */
export function generateResponses(doc: QuizDocument, { finished, unfinished, now, seed, removed }: Options): QuizResponse[] {
  const next = random(seed);
  const people = Array.from({ length: finished + unfinished }, (_, i) => ({ finished: i < finished, startedAt: now - Math.floor(next() * 40 * DAY) - 60_000 }));
  people.sort((a, b) => a.startedAt - b.startedAt);

  return people.map((person, index) => {
    const answers: Record<string, StoredAnswer> = {};
    const seen: string[] = [];
    const stopAt = person.finished ? Infinity : 1 + Math.floor(next() * Math.max(1, doc.pages.length - 2));
    for (const page of doc.pages) {
      if (seen.length >= stopAt) break;
      if (!visiblePages(doc, answersOf({ answers } as QuizResponse)).some((p) => p.id === page.id)) continue;
      seen.push(page.id);
      const answer = answerFor(page, next, now);
      if (answer) answers[page.id] = answer;
    }
    if (removed && person.finished && next() < 0.3) answers[removed.id] = { type: "choice", q: removed.q, v: ["no"], vt: ["No"] };
    const finishedAt = person.finished ? new Date(person.startedAt + (2 + Math.floor(next() * 4)) * 60_000).toISOString() : null;
    return {
      id: `r-${seed}-${index + 1}`,
      number: index + 1,
      status: person.finished ? "finished" : "in_progress",
      startedAt: new Date(person.startedAt).toISOString(),
      finishedAt,
      answers,
      pagesSeen: seen,
      lastPageId: seen[seen.length - 1] ?? doc.pages[0].id,
    };
  });
}

/** The responses of the seed quizzes: Body Reset has 128 finished (as on its card) and a few who left. */
export function seedResponses(now: number = Date.now()): Record<string, ResponseSet> {
  const bundles = seedBundles(now);
  const make = (id: string, finished: number, unfinished: number, seed: number, removed?: Options["removed"]): ResponseSet => {
    const doc = bundles.find((b) => b.quiz.id === id)?.draft as QuizDocument;
    return { responses: generateResponses(doc, { finished, unfinished, now, seed, removed }), opened: Math.round((finished + unfinished) * 1.45) };
  };
  return {
    "quiz-body-reset": make("quiz-body-reset", 128, 61, 7, { id: "smoke", q: "Do you smoke?" }),
    "quiz-debug": make("quiz-debug", 12, 3, 11),
  };
}
