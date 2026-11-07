import { describe, expect, it } from "vitest";
import { FORMAT, type Page, type QuizDocument } from "./schema";
import { canGoBack, checkAnswer, currentPage, goBack, goNext, hidesTopBar, pageNumbers, resumeRun, setAnswer, startRun, storedAnswers } from "./runner";

const choice = (id: string, over: Partial<Extract<Page, { type: "choice" }>> = {}): Page => ({
  id,
  type: "choice",
  question: `Question ${id}`,
  answers: [
    { id: "a", text: "Apple", picture: null },
    { id: "b", text: "Banana", picture: null },
  ],
  multiple: false,
  required: true,
  picture: null,
  ...over,
});

const doc = (pages: Page[]): QuizDocument => ({
  format: FORMAT,
  name: "Test",
  pages: [{ id: "start", type: "welcome", title: "Hi", text: "", picture: null }, ...pages, { id: "end", type: "end", style: "thanks", title: "Thanks", text: "", picture: null }],
});

/** goal -> (height only for "lose") -> age */
const conditional = doc([
  choice("goal", { answers: [{ id: "lose", text: "Lose", picture: null }, { id: "tone", text: "Tone", picture: null }] }),
  { id: "height", type: "number", question: "Height", kind: "height", unit: "cm", min: 120, max: 230, required: true, show: { match: "all", rules: [{ page: "goal", op: "is", value: "lose" }] } },
  { id: "age", type: "number", question: "Age", kind: "age", unit: "years", min: 18, max: 99, required: true },
]);

const advance = (state: ReturnType<typeof startRun>, ...values: [string, never][]) => {
  let current = state;
  for (const [id, value] of values) current = goNext(setAnswer(current, id, value)).state;
  return current;
};

describe("checkAnswer", () => {
  it("asks for a required choice but not an optional one", () => {
    expect(checkAnswer(choice("q"), undefined)).toBe("pick_one");
    expect(checkAnswer(choice("q"), [])).toBe("pick_one");
    expect(checkAnswer(choice("q"), ["a"])).toBeNull();
    expect(checkAnswer(choice("q", { required: false }), undefined)).toBeNull();
  });

  it("checks email and phone format, and lets an optional text stay empty", () => {
    const text = (input: "any" | "email" | "phone", required = true): Page => ({ id: "t", type: "text", question: "Q", input, hint: "", required });
    expect(checkAnswer(text("any"), "  ")).toBe("write_something");
    expect(checkAnswer(text("any"), "Sarah")).toBeNull();
    expect(checkAnswer(text("email"), "sarah@")).toBe("email");
    expect(checkAnswer(text("email"), "sarah@example.com")).toBeNull();
    expect(checkAnswer(text("email"), "")).toBe("email");
    expect(checkAnswer(text("phone"), "abc")).toBe("phone");
    expect(checkAnswer(text("phone"), "+62 812-3456-7890")).toBeNull();
    expect(checkAnswer(text("email", false), "")).toBeNull();
    expect(checkAnswer(text("email", false), "nope")).toBe("email");
  });

  it("checks a number against its range and a date for being picked", () => {
    const age = conditional.pages[3];
    expect(checkAnswer(age, undefined)).toBe("number_needed");
    expect(checkAnswer(age, 17)).toBe("range");
    expect(checkAnswer(age, 120)).toBe("range");
    expect(checkAnswer(age, 46)).toBeNull();
    expect(checkAnswer(age, 18)).toBeNull();
    const date: Page = { id: "d", type: "number", question: "When", kind: "date", unit: null, min: null, max: null, required: true };
    expect(checkAnswer(date, undefined)).toBe("date_needed");
    expect(checkAnswer(date, "2027-03-01")).toBeNull();
    expect(checkAnswer({ ...date, required: false }, undefined)).toBeNull();
  });
});

describe("moving through the quiz", () => {
  it("starts on the Start page with no top bar and moves forward", () => {
    const start = startRun(conditional);
    expect(currentPage(start).id).toBe("start");
    expect(hidesTopBar(start)).toBe(true);
    expect(canGoBack(start)).toBe(false);
    const next = goNext(start).state;
    expect(currentPage(next).id).toBe("goal");
    expect(hidesTopBar(next)).toBe(false);
  });

  it("stays on the page and says what is wrong when the answer is missing", () => {
    const onGoal = goNext(startRun(conditional)).state;
    const step = goNext(onGoal);
    expect(currentPage(step.state).id).toBe("goal");
    expect(step.state.problem).toBe("pick_one");
    expect(setAnswer(step.state, "goal", ["tone"]).problem).toBeNull();
  });

  it("skips a page whose condition is not met and shows it when it is", () => {
    const tone = advance(startRun(conditional), ["start", undefined as never], ["goal", ["tone"] as never]);
    expect(currentPage(tone).id).toBe("age");
    const lose = advance(startRun(conditional), ["start", undefined as never], ["goal", ["lose"] as never]);
    expect(currentPage(lose).id).toBe("height");
  });

  it("reaches the End page and reports that the person finished", () => {
    let state = advance(startRun(conditional), ["start", undefined as never], ["goal", ["tone"] as never]);
    const step = goNext(setAnswer(state, "age", 40));
    expect(currentPage(step.state).id).toBe("end");
    expect(step.finished).toBe(true);
    expect(hidesTopBar(step.state)).toBe(true);
    state = step.state;
    expect(state.progress).toBe(1);
  });

  it("goes Back to the previous page that was actually seen and keeps earlier answers", () => {
    const state = advance(startRun(conditional), ["start", undefined as never], ["goal", ["tone"] as never]);
    expect(currentPage(state).id).toBe("age");
    const back = goBack(state);
    expect(currentPage(back).id).toBe("goal");
    expect(back.answers.goal).toEqual(["tone"]);
    expect(canGoBack(goBack(back))).toBe(false);
  });

  it("drops the answer of a page that no longer applies after the person changes an earlier answer", () => {
    let state = advance(startRun(conditional), ["start", undefined as never], ["goal", ["lose"] as never], ["height", 170 as never]);
    expect(currentPage(state).id).toBe("age");
    state = goBack(goBack(state));
    expect(currentPage(state).id).toBe("goal");
    expect(state.answers.height).toBe(170);
    const moved = goNext(setAnswer(state, "goal", ["tone"])).state;
    expect(currentPage(moved).id).toBe("age");
    expect(moved.answers.height).toBeUndefined();
  });

  it("skips the Loading screen when going back", () => {
    const withLoading = doc([choice("q"), { id: "load", type: "loading", message: "Working", steps: ["One"], seconds: 3 }, { id: "info", type: "info", title: "Done", text: "", picture: null }]);
    let state = advance(startRun(withLoading), ["start", undefined as never], ["q", ["a"] as never], ["load", undefined as never]);
    expect(currentPage(state).id).toBe("info");
    state = goBack(state);
    expect(currentPage(state).id).toBe("q");
  });
});

describe("progress", () => {
  it("is pages reached divided by pages this person will see, and never shrinks", () => {
    let state = startRun(conditional);
    expect(state.progress).toBe(0);
    state = goNext(state).state; // goal, 1 of (start, goal, age, end) -> 1/3
    expect(state.progress).toBeCloseTo(1 / 3);
    state = goNext(setAnswer(state, "goal", ["lose"])).state; // height shows: start, goal, height, age, end -> 2/4
    expect(state.progress).toBeCloseTo(2 / 4);
    const before = state.progress;
    state = goBack(state);
    expect(state.progress).toBe(before);
    state = goNext(setAnswer(state, "goal", ["tone"])).state; // height hidden now: age is 2/3 but the bar keeps its place
    expect(currentPage(state).id).toBe("age");
    expect(state.progress).toBeGreaterThanOrEqual(before);
  });
});

describe("what is saved and resuming", () => {
  it("saves the question text and the chosen option texts as they are now", () => {
    const state = advance(startRun(conditional), ["start", undefined as never], ["goal", ["lose"] as never], ["height", 170 as never]);
    expect(storedAnswers(state)).toEqual({
      goal: { type: "choice", q: "Question goal", v: ["lose"], vt: ["Lose"] },
      height: { type: "number", q: "Height", v: 170 },
    });
  });

  it("does not save an empty optional answer", () => {
    const optional = doc([{ id: "t", type: "text", question: "Q", input: "any", hint: "", required: false }]);
    const state = advance(startRun(optional), ["start", undefined as never], ["t", "  " as never]);
    expect(storedAnswers(state)).toEqual({});
  });

  it("picks up where the person stopped, with progress and the page count", () => {
    const state = resumeRun(conditional, { goal: ["lose"], height: 170 }, ["start", "goal", "height", "age"], "age");
    expect(currentPage(state).id).toBe("age");
    expect(state.path).toEqual(["start", "goal", "height", "age"]);
    expect(state.progress).toBeCloseTo(3 / 4);
    expect(pageNumbers(state)).toEqual({ page: 4, total: 5 });
  });

  it("copes with a page that was removed since the person stopped", () => {
    const state = resumeRun(conditional, {}, ["start", "gone"], "gone");
    expect(currentPage(state).id).toBe("start");
  });
});
