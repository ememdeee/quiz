import { describe, expect, it } from "vitest";
import { diffQuiz } from "./diff";
import { addPage, deletePage, duplicatePage, isLocked, movePage, removeAnswer } from "./ops";
import { quizDocumentSchema, type QuizDocument } from "./schema";
import { blankQuiz, quizTemplates } from "./templates";

const feedback = quizTemplates[1].document;
const order = (doc: QuizDocument) => doc.pages.map((p) => p.id);
const withRule: QuizDocument = {
  ...feedback,
  pages: [
    ...feedback.pages.slice(0, 2),
    { id: "why", type: "text", question: "Why?", input: "any", hint: "", required: false, show: { match: "all", rules: [{ page: "experience", op: "is", value: "poor" }] } },
    ...feedback.pages.slice(2),
  ],
};

describe("addPage", () => {
  it("puts the new page just before the End page and keeps the document valid", () => {
    const { doc, page } = addPage(blankQuiz("Q"), "choice");
    expect(doc.pages.map((p) => p.type)).toEqual(["welcome", "choice", "end"]);
    expect(page.type).toBe("choice");
    expect(quizDocumentSchema.safeParse(doc).success).toBe(true);
  });
});

describe("duplicatePage", () => {
  it("copies right after the original with new page and answer ids", () => {
    const result = duplicatePage(feedback, "experience");
    expect(result).not.toBeNull();
    const [original, copy] = result!.doc.pages.slice(1, 3);
    expect(copy.id).not.toBe(original.id);
    if (original.type === "choice" && copy.type === "choice") {
      expect(copy.answers.map((a) => a.text)).toEqual(original.answers.map((a) => a.text));
      expect(copy.answers.map((a) => a.id)).not.toEqual(original.answers.map((a) => a.id));
    }
  });

  it("refuses Start and End pages", () => {
    expect(duplicatePage(feedback, "start")).toBeNull();
    expect(duplicatePage(feedback, "end")).toBeNull();
    expect(isLocked(feedback.pages[0])).toBe(true);
  });
});

describe("movePage", () => {
  it("moves a middle page to a new place", () => {
    const result = movePage(feedback, "more", 1);
    expect("doc" in result && order(result.doc)).toEqual(["start", "more", "experience", "recommend", "end"]);
  });

  it("never moves Start or End, and never past them", () => {
    expect(movePage(feedback, "start", 2)).toEqual({ blocked: "locked" });
    expect(movePage(feedback, "end", 1)).toEqual({ blocked: "locked" });
    expect(movePage(feedback, "more", 4)).toEqual({ blocked: "edge" });
    expect(movePage(feedback, "experience", 0)).toEqual({ blocked: "edge" });
    expect(movePage(feedback, "experience", 1)).toEqual({ blocked: "edge" });
  });

  it("blocks a move that would make a condition look at a later page", () => {
    expect(movePage(withRule, "why", 1)).toEqual({ blocked: "conditions" });
    expect(movePage(withRule, "experience", 3)).toEqual({ blocked: "conditions" });
    expect(movePage(withRule, "why", 3)).toHaveProperty("doc");
  });
});

describe("deletePage and removeAnswer", () => {
  it("removes the page and the conditions that looked at it", () => {
    const doc = deletePage(withRule, "experience");
    expect(doc && order(doc)).toEqual(["start", "why", "recommend", "more", "end"]);
    expect(doc?.pages[1].show).toBeUndefined();
  });

  it("refuses Start and End pages", () => {
    expect(deletePage(feedback, "start")).toBeNull();
    expect(deletePage(feedback, "end")).toBeNull();
  });

  it("removes one answer and the conditions on it", () => {
    const doc = removeAnswer(withRule, "experience", "poor");
    const choice = doc.pages[1];
    expect(choice.type === "choice" && choice.answers.map((a) => a.id)).toEqual(["great", "good", "okay"]);
    expect(doc.pages[2].show).toBeUndefined();
  });
});

describe("diffQuiz", () => {
  it("is empty for identical documents", () => {
    expect(diffQuiz(feedback, structuredClone(feedback)).count).toBe(0);
  });

  it("counts added, edited and removed pages once each", () => {
    const edited: QuizDocument = {
      ...feedback,
      pages: feedback.pages.filter((p) => p.id !== "more").map((p) => (p.id === "recommend" ? { ...p, question: "Changed?" } : p)),
    };
    const { doc: grown } = addPage(edited, "info");
    const diff = diffQuiz(grown, feedback);
    expect(diff.added).toHaveLength(1);
    expect(diff.changed).toEqual(["recommend"]);
    expect(diff.removed).toEqual(["more"]);
    expect(diff.count).toBe(3);
  });

  it("does not count a page whose keys are written in another order", () => {
    const reordered: QuizDocument = { ...feedback, pages: feedback.pages.map((p) => Object.fromEntries(Object.entries(p).reverse()) as typeof p) };
    expect(diffQuiz(reordered, feedback).count).toBe(0);
  });

  it("counts a moved page as one change", () => {
    const moved = movePage(feedback, "more", 1);
    expect("doc" in moved && diffQuiz(moved.doc, feedback).count).toBe(1);
  });
});
