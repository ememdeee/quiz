import { newId } from "@/lib/quiz/ids";
import { FORMAT, type PageOf, type QuizDocument } from "@/lib/quiz/schema";
import { blankQuiz } from "@/lib/quiz/templates";
import { documentFacts } from "@/lib/quizzes/summary";
import type { Profile, QuizBundle, QuizSummary } from "@/lib/quizzes/types";
import { NO_OVERRIDES } from "@/lib/plan/limits";

/** The owner on the Free plan with 3 of 5 quizzes, as in the Quizzes board. */
export const mockProfile: Profile = { name: "Sarah Miller", email: "demo@quiz.test", plan: "free", overrides: NO_OVERRIDES };

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

const number = (id: string, question: string, over: Partial<PageOf<"number">>): PageOf<"number"> => ({
  id,
  type: "number",
  question,
  kind: "number",
  unit: null,
  min: null,
  max: null,
  required: true,
  ...over,
});

/** Body Reset as in the Main board: 7 pages, the height question only for people who want to lose weight. */
const bodyReset: QuizDocument = {
  format: FORMAT,
  name: "Body Reset",
  pages: [
    { id: "welcome", type: "welcome", title: "Body Reset", text: "Take the 1-minute quiz to create your personalized plan.", picture: null },
    {
      id: "goal",
      type: "choice",
      question: "What is your main goal?",
      answers: [
        { id: "lose", text: "Lose weight", picture: null },
        { id: "tone", text: "Tone my body", picture: null },
        { id: "energy", text: "Have more energy", picture: null },
        { id: "healthier", text: "Feel healthier", picture: null },
      ],
      multiple: false,
      required: true,
      picture: null,
    },
    number("age", "How old are you?", { kind: "age", unit: "years", min: 18, max: 99 }),
    { ...number("height", "Your height", { kind: "height", unit: "cm", min: 120, max: 230 }), show: { match: "all", rules: [{ page: "goal", op: "is", value: "lose" }] } },
    number("weight", "Your weight", { kind: "weight", unit: "kg", min: 30, max: 300 }),
    number("target", "Your goal date", { kind: "date" }),
    {
      id: "result",
      type: "end",
      style: "offer",
      title: "Your plan is ready!",
      text: "Based on your answers, we created a plan to help you reach your goal.",
      picture: null,
      price: "$29",
      priceNote: "One-time payment",
      buttonText: "GET MY PLAN",
      link: "https://yourshop.com/checkout",
      note: "60-day money-back guarantee",
    },
  ],
};

/** What people see: the same quiz before three edits (one page added, two reworded). */
const bodyResetPublished: QuizDocument = {
  ...bodyReset,
  pages: bodyReset.pages
    .filter((page) => page.id !== "weight")
    .map((page) => {
      if (page.id === "goal" && page.type === "choice") return { ...page, question: "What is your goal?" };
      if (page.id === "age" && page.type === "number") return { ...page, question: "Your age" };
      return page;
    }),
};

const debugQuiz: QuizDocument = {
  ...blankQuiz("Debug quiz"),
  pages: [
    { id: "welcome", type: "welcome", title: "Debug quiz", text: "", picture: null },
    { id: "q1", type: "text", question: "What broke?", input: "any", hint: "", required: true },
    { id: "q2", type: "text", question: "Your email", input: "email", hint: "", required: false },
    { id: "end", type: "end", style: "thanks", title: "Thank you!", text: "We got your answers. You can close this page now.", picture: null },
  ],
};

const customerFeedback: QuizDocument = {
  ...blankQuiz("Customer feedback"),
  pages: [
    { id: newId(), type: "welcome", title: "Customer feedback", text: "Tell us how we did. It takes a minute.", picture: null },
    { id: newId(), type: "end", style: "thanks", title: "Thank you!", text: "We got your answers. You can close this page now.", picture: null },
  ],
};

type Seed = { meta: Omit<QuizSummary, "pageCount" | "unpublishedChanges">; draft: QuizDocument; published: QuizDocument | null };

/** The three quizzes of the Quizzes board. Times are "ago" so the list always reads like the design. */
export function seedBundles(now: number = Date.now()): QuizBundle[] {
  const ago = (ms: number) => new Date(now - ms).toISOString();
  const seeds: Seed[] = [
    {
      meta: { id: "quiz-body-reset", name: "Body Reset", slug: "body-reset", firstPublishedAt: ago(40 * DAY), acceptingResponses: true, finishedResponses: 128, updatedAt: ago(2 * DAY) },
      draft: bodyReset,
      published: bodyResetPublished,
    },
    {
      meta: { id: "quiz-debug", name: "Debug quiz", slug: "debug-quiz", firstPublishedAt: ago(60 * DAY), acceptingResponses: false, finishedResponses: 12, updatedAt: ago(21 * DAY) },
      draft: debugQuiz,
      published: debugQuiz,
    },
    {
      meta: { id: "quiz-customer-feedback", name: "Customer feedback", slug: "customer-feedback", firstPublishedAt: null, acceptingResponses: true, finishedResponses: 0, updatedAt: ago(10 * 1000) },
      draft: customerFeedback,
      published: null,
    },
  ];
  return seeds.map(({ meta, draft, published }) => ({ quiz: { ...meta, ...documentFacts(draft, published) }, draft, published }));
}
