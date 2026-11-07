import { describe, expect, it } from "vitest";
import {
  describeShowRule,
  dependentsOfAnswer,
  dependentsOfPage,
  pagesWithBrokenRules,
  removeAnswerDependencies,
  removePageDependencies,
  visiblePages,
} from "./conditions";
import type { QuizDocument } from "./schema";
import { quizTemplates } from "./templates";

/** Feedback template plus a follow-up that shows only after a Poor answer. */
const base = quizTemplates[1].document;
const doc: QuizDocument = {
  ...base,
  pages: [
    ...base.pages.slice(0, 3),
    { id: "why", type: "text", question: "What went wrong?", input: "any", hint: "", required: false, show: { match: "all", rules: [{ page: "experience", op: "is", value: "poor" }] } },
    ...base.pages.slice(3),
  ],
};
const ids = (pages: { id: string }[]) => pages.map((p) => p.id);

describe("visiblePages", () => {
  it("hides a page whose rule is not met and shows it when it is", () => {
    expect(ids(visiblePages(doc, { experience: ["good"] }))).not.toContain("why");
    expect(ids(visiblePages(doc, { experience: ["poor"] }))).toContain("why");
  });

  it("treats an unanswered source as not met", () => {
    expect(ids(visiblePages(doc, {}))).not.toContain("why");
  });

  it("handles is not, more than and less than", () => {
    const rule = (op: "is not" | "more than" | "less than", page: string, value: string | number): QuizDocument => ({
      ...doc,
      pages: doc.pages.map((p) => (p.id === "why" ? { ...p, show: { match: "all", rules: [{ page, op, value }] } } : p)),
    });
    expect(ids(visiblePages(rule("is not", "experience", "poor"), { experience: ["good"] }))).toContain("why");
    expect(ids(visiblePages(rule("more than", "recommend", 6), { recommend: 9 }))).toContain("why");
    expect(ids(visiblePages(rule("less than", "recommend", 7), { recommend: 9 }))).not.toContain("why");
  });

  it("combines rules with all or any", () => {
    const two = (match: "all" | "any"): QuizDocument => ({
      ...doc,
      pages: doc.pages.map((p) =>
        p.id === "why"
          ? { ...p, show: { match, rules: [{ page: "experience", op: "is", value: "poor" }, { page: "recommend", op: "less than", value: 5 }] } }
          : p,
      ),
    });
    const answers = { experience: ["poor"], recommend: 9 };
    expect(ids(visiblePages(two("all"), answers))).not.toContain("why");
    expect(ids(visiblePages(two("any"), answers))).toContain("why");
  });

  it("makes a rule false when its source page is hidden", () => {
    const chained: QuizDocument = {
      ...doc,
      pages: doc.pages.map((p) => (p.id === "more" ? { ...p, show: { match: "all", rules: [{ page: "why", op: "is", value: "x" }] } } : p)),
    };
    expect(ids(visiblePages(chained, { experience: ["good"], why: "x" }))).not.toContain("more");
  });
});

describe("describeShowRule", () => {
  it("says the condition in plain words", () => {
    expect(describeShowRule(doc, doc.pages[3])).toBe("Show this page only when “How was your experience?” is “Poor”.");
    expect(describeShowRule(doc, doc.pages[1])).toBe("");
  });
});

describe("dependents and removal", () => {
  it("finds the pages that look at a page or at one answer", () => {
    expect(dependentsOfPage(doc, "experience")).toEqual(["why"]);
    expect(dependentsOfAnswer(doc, "experience", "poor")).toEqual(["why"]);
    expect(dependentsOfAnswer(doc, "experience", "great")).toEqual([]);
  });

  it("removes the rules and lets a page with none show to everyone", () => {
    const cleaned = removePageDependencies(doc, "experience");
    expect(cleaned.pages.find((p) => p.id === "why")?.show).toBeUndefined();
    expect(ids(visiblePages(cleaned, {}))).toContain("why");
    expect(removeAnswerDependencies(doc, "experience", "poor").pages[3].show).toBeUndefined();
    expect(removeAnswerDependencies(doc, "experience", "great").pages[3].show).toBeDefined();
  });

  it("keeps the other rules of a page when only one is removed", () => {
    const two: QuizDocument = {
      ...doc,
      pages: doc.pages.map((p) =>
        p.id === "why" ? { ...p, show: { match: "any", rules: [{ page: "experience", op: "is", value: "poor" }, { page: "recommend", op: "less than", value: 5 }] } } : p,
      ),
    };
    expect(removePageDependencies(two, "recommend").pages[3].show?.rules).toHaveLength(1);
  });
});

describe("pagesWithBrokenRules", () => {
  it("finds rules that look at a later or missing page", () => {
    expect(pagesWithBrokenRules(doc)).toEqual([]);
    const swapped: QuizDocument = { ...doc, pages: [doc.pages[0], doc.pages[3], doc.pages[1], ...doc.pages.slice(2, 3), ...doc.pages.slice(4)] };
    expect(pagesWithBrokenRules(swapped)).toEqual(["why"]);
  });
});
