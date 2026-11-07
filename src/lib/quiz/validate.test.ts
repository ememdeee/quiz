import { describe, expect, it } from "vitest";
import { addPage } from "./ops";
import { defaultsFor, unitChoices } from "./units";
import type { QuizDocument } from "./schema";
import { blankQuiz, quizTemplates } from "./templates";
import { validateQuiz } from "./validate";

const codes = (doc: QuizDocument, maxPages = 15) => validateQuiz(doc, { maxPages }).map((p) => `${p.pageId ?? "-"}:${p.code}`);
const feedback = quizTemplates[1].document;
const edit = (id: string, change: object): QuizDocument => ({ ...feedback, pages: feedback.pages.map((p) => (p.id === id ? ({ ...p, ...change } as typeof p) : p)) });

describe("validateQuiz", () => {
  it("passes a good quiz", () => {
    expect(codes(feedback)).toEqual([]);
  });

  it("asks for a question first", () => {
    expect(codes(blankQuiz("x"))).toEqual(["-:no_question"]);
  });

  it("flags a fresh, empty question page on every empty field", () => {
    const { doc, page } = addPage(blankQuiz("x"), "choice");
    expect(codes(doc)).toEqual([`${page.id}:question_missing`, `${page.id}:answers_too_few`, `${page.id}:answer_empty`, `${page.id}:answer_empty`]);
  });

  it("flags a choice page with one real answer", () => {
    const doc = edit("experience", { answers: [{ id: "a", text: "Yes", picture: null }, { id: "b", text: " ", picture: null }] });
    expect(codes(doc)).toEqual(["experience:answers_too_few", "experience:answer_empty"]);
  });

  it("flags a number range the wrong way round", () => {
    expect(codes(edit("recommend", { min: 10, max: 0 }))).toEqual(["recommend:range_invalid"]);
  });

  it("needs a button text and an https link when the End page has a button", () => {
    const doc = edit("end", { style: "button", buttonText: "", link: "http://example.com" });
    expect(codes(doc)).toEqual(["end:button_text_missing", "end:link_invalid"]);
    expect(codes(edit("end", { style: "button", buttonText: "Go", link: "https://example.com" }))).toEqual([]);
  });

  it("flags too many pages and a wrong shape", () => {
    expect(codes(feedback, 4)).toEqual(["-:too_many_pages"]);
    expect(codes({ ...feedback, pages: feedback.pages.slice(1) })).toContain("-:shape_invalid");
  });

  it("flags a condition that looks at a later page", () => {
    const doc = edit("experience", { show: { match: "all", rules: [{ page: "recommend", op: "more than", value: 3 }] } });
    expect(codes(doc)).toEqual(["experience:rule_invalid"]);
  });
});

describe("units", () => {
  it("gives each kind its starting unit and range", () => {
    expect(defaultsFor("age")).toEqual({ unit: "years", min: 18, max: 99 });
    expect(defaultsFor("height")).toEqual({ unit: "cm", min: 120, max: 230 });
    expect(defaultsFor("height", "in")).toEqual({ unit: "in", min: 48, max: 90 });
    expect(defaultsFor("weight", "lb")).toEqual({ unit: "lb", min: 70, max: 660 });
    expect(defaultsFor("number")).toEqual({ unit: null, min: null, max: null });
    expect(defaultsFor("date")).toEqual({ unit: null, min: null, max: null });
  });

  it("lists the unit choices only for height and weight", () => {
    expect(unitChoices("height")).toEqual(["cm", "in"]);
    expect(unitChoices("weight")).toEqual(["kg", "lb"]);
    expect(unitChoices("age")).toEqual([]);
  });
});
