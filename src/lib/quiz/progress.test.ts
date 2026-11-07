import { describe, expect, it } from "vitest";
import { canFinish, cleanProgress } from "./progress";
import { FORMAT, type QuizDocument } from "./schema";

const doc: QuizDocument = {
  format: FORMAT,
  name: "Test",
  pages: [
    { id: "start", type: "welcome", title: "Hi", text: "", picture: null },
    {
      id: "goal",
      type: "choice",
      question: "Your goal?",
      answers: [
        { id: "lose", text: "Lose weight", picture: null },
        { id: "tone", text: "Tone", picture: null },
      ],
      multiple: false,
      required: true,
      picture: null,
    },
    { id: "height", type: "number", question: "Height", kind: "height", unit: "cm", min: 120, max: 230, required: true, show: { match: "all", rules: [{ page: "goal", op: "is", value: "lose" }] } },
    { id: "mail", type: "text", question: "Email", input: "email", hint: "", required: true },
    { id: "end", type: "end", style: "thanks", title: "Thanks", text: "", picture: null },
  ],
};

const send = (answers: Record<string, unknown>, extra: Partial<{ pagesSeen: string[]; lastPageId: string }> = {}) =>
  cleanProgress(doc, { answers, pagesSeen: ["start", "goal"], lastPageId: "goal", ...extra });

describe("what the server accepts from a person answering", () => {
  it("writes the question and option texts from the published quiz, not from what was sent", () => {
    const result = send({ goal: ["lose"], height: 170 });
    expect(result).toMatchObject({ ok: true });
    if (!result.ok) return;
    expect(result.progress.answers.goal).toEqual({ type: "choice", q: "Your goal?", v: ["lose"], vt: ["Lose weight"] });
    expect(result.progress.answers.height).toEqual({ type: "number", q: "Height", v: 170 });
  });

  it("drops the answer of a page that the person's other answers have hidden", () => {
    const result = send({ goal: ["tone"], height: 170 });
    expect(result.ok && result.progress.answers.height).toBeFalsy();
    expect(result.ok && result.progress.answers.goal).toBeTruthy();
  });

  it("refuses a page that is not in the quiz, or one that asks nothing", () => {
    expect(send({ nope: "x" })).toEqual({ ok: false, problem: "unknown_page" });
    expect(send({ start: "x" })).toEqual({ ok: false, problem: "unknown_page" });
    expect(send({}, { lastPageId: "missing" })).toEqual({ ok: false, problem: "unknown_page" });
  });

  it("refuses answers that do not fit the page", () => {
    expect(send({ goal: ["made-up"] })).toEqual({ ok: false, problem: "bad_answer" });
    expect(send({ goal: ["lose", "tone"] })).toEqual({ ok: false, problem: "bad_answer" });
    expect(send({ goal: "lose" })).toEqual({ ok: false, problem: "bad_answer" });
    expect(send({ goal: ["lose"], height: 5 })).toEqual({ ok: false, problem: "bad_answer" });
    expect(send({ mail: "not-an-email" })).toEqual({ ok: false, problem: "bad_answer" });
    expect(send({ mail: 7 })).toEqual({ ok: false, problem: "bad_answer" });
  });

  it("refuses a body that is the wrong shape or far too big", () => {
    expect(cleanProgress(doc, null)).toEqual({ ok: false, problem: "malformed" });
    expect(cleanProgress(doc, { answers: { goal: { evil: true } }, pagesSeen: [], lastPageId: "goal" })).toEqual({ ok: false, problem: "malformed" });
    expect(cleanProgress(doc, { answers: { mail: "x".repeat(6000) }, pagesSeen: [], lastPageId: "goal" })).toEqual({ ok: false, problem: "malformed" });
  });

  it("keeps an empty answer to a question that needs one out of the saved answers, so a half-filled page is not saved", () => {
    const result = send({ goal: [], mail: "" });
    expect(result).toMatchObject({ ok: true });
    expect(result.ok && Object.keys(result.progress.answers)).toEqual([]);
  });

  it("cleans the list of pages seen: only real pages, once each, with the last one included", () => {
    const result = send({}, { pagesSeen: ["start", "start", "ghost", "goal"], lastPageId: "mail" });
    expect(result.ok && result.progress.pagesSeen).toEqual(["start", "goal", "mail"]);
  });
});

describe("who may be marked finished", () => {
  const finishing = (answers: Record<string, unknown>, lastPageId = "end") => {
    const result = cleanProgress(doc, { answers, pagesSeen: ["start", "goal", "mail", "end"], lastPageId });
    if (!result.ok) throw new Error(result.problem);
    return result.progress;
  };

  it("needs the End page and every answer the person was shown", () => {
    expect(canFinish(doc, finishing({ goal: ["tone"], mail: "a@b.co" }))).toBe(true);
    expect(canFinish(doc, finishing({ goal: ["tone"] }))).toBe(false);
    expect(canFinish(doc, finishing({ goal: ["tone"], mail: "a@b.co" }, "mail"))).toBe(false);
  });

  it("also needs the conditional answer when the person was shown that page", () => {
    expect(canFinish(doc, finishing({ goal: ["lose"], mail: "a@b.co" }))).toBe(false);
    expect(canFinish(doc, finishing({ goal: ["lose"], mail: "a@b.co", height: 170 }))).toBe(true);
  });
});
