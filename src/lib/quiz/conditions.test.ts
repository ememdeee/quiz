import { describe, expect, it } from "vitest";
import {
  describeShowRule,
  dependentsOfAnswer,
  dependentsOfPage,
  pagesWithBrokenRules,
  defaultRule,
  opsFor,
  removeAnswerDependencies,
  removePageDependencies,
  ruleSources,
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
    expect(describeShowRule(doc, doc.pages[3])).toBe("people see “What went wrong?” only if they answered “Poor”. Everyone else skips it.");
    expect(describeShowRule(doc, doc.pages[1])).toBe("");
  });

  it("joins several rules with and, or with or", () => {
    const two = (match: "all" | "any"): QuizDocument => ({
      ...doc,
      pages: doc.pages.map((p) =>
        p.id === "why" ? { ...p, show: { match, rules: [{ page: "experience", op: "is not", value: "great" }, { page: "recommend", op: "more than", value: 6 }] } } : p,
      ),
    });
    expect(describeShowRule(two("all"), two("all").pages[3])).toBe("people see “What went wrong?” only if they didn’t answer “Great” and their answer to “How likely are you to recommend us?” is more than 6. Everyone else skips it.");
    expect(describeShowRule(two("any"), two("any").pages[3])).toContain(" or ");
  });

  it("names age, height and weight", () => {
    const age: QuizDocument = { ...doc, pages: doc.pages.map((p) => (p.id === "recommend" ? { ...p, kind: "age" as const } : p)) };
    const rule = { match: "all" as const, rules: [{ page: "recommend", op: "more than" as const, value: 40 }] };
    const withRule = { ...age, pages: age.pages.map((p) => (p.id === "why" ? { ...p, show: rule } : p)) };
    expect(describeShowRule(withRule, withRule.pages[3])).toContain("their age is more than 40");
  });
});

describe("ruleSources, opsFor and defaultRule", () => {
  it("lists only earlier choice and number pages", () => {
    expect(ids(ruleSources(doc, "why"))).toEqual(["experience", "recommend"]);
    expect(ids(ruleSources(doc, "experience"))).toEqual([]);
    expect(ids(ruleSources(doc, "start"))).toEqual([]);
  });

  it("offers more than and less than only for numbers", () => {
    expect(opsFor(doc.pages[1])).toEqual(["is", "is not"]);
    expect(opsFor(doc.pages[2])).toEqual(["is", "is not", "more than", "less than"]);
  });

  it("starts a rule on the first answer or the smallest number", () => {
    expect(defaultRule(doc.pages[1])).toEqual({ page: "experience", op: "is", value: "great" });
    expect(defaultRule(doc.pages[2])).toEqual({ page: "recommend", op: "is", value: 0 });
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
