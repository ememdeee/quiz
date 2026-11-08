import { describe, expect, it } from "vitest";
import { quizDocumentSchema } from "../schema";
import { estimateMinutes, takesAbout } from "../time-estimate";
import { validateQuiz } from "../validate";
import { blankQuiz, describePage, quizTemplates, templateQuiz } from "./index";

describe("templates", () => {
  it.each(quizTemplates.map((t) => [t.name, t] as const))("%s is a valid, publishable document", (_name, template) => {
    expect(quizDocumentSchema.safeParse(template.document).success).toBe(true);
    expect(validateQuiz(template.document, { maxPages: 15 })).toEqual([]);
  });

  it("have the pages listed on the TemplateContents board", () => {
    const counts = Object.fromEntries(quizTemplates.map((t) => [t.id, t.document.pages.length]));
    expect(counts).toEqual({ "contact-form": 5, feedback: 5, "quiz-with-result": 6 });
    expect(describePage(quizTemplates[1].document.pages[2])).toEqual({ title: "How likely are you to recommend us?", kind: "Number · 0 to 10" });
    expect(describePage(quizTemplates[0].document.pages[4]).kind).toBe("End page · message only");
  });

  it("use the owner's name when a quiz is made from one", () => {
    expect(templateQuiz("feedback", "My survey")?.name).toBe("My survey");
    expect(templateQuiz("nope", "x")).toBeNull();
  });
});

describe("blankQuiz", () => {
  it("is a Start page titled with the name and an End page, and passes the schema", () => {
    const doc = blankQuiz("Customer feedback");
    expect(quizDocumentSchema.safeParse(doc).success).toBe(true);
    expect(doc.pages.map((p) => p.type)).toEqual(["welcome", "end"]);
    expect(doc.pages[0]).toMatchObject({ title: "Customer feedback" });
  });

  it("cannot be published until it has a question", () => {
    expect(validateQuiz(blankQuiz("x"), { maxPages: 15 }).map((p) => p.code)).toEqual(["no_question"]);
  });
});

describe("estimateMinutes", () => {
  it("is at least 1 and rounds up per 6 questions", () => {
    expect(estimateMinutes(blankQuiz("x"))).toBe(1);
    expect(estimateMinutes(quizTemplates[2].document)).toBe(1);
    const six = { ...quizTemplates[2].document, pages: [...quizTemplates[2].document.pages, ...quizTemplates[2].document.pages.slice(1, 4)] };
    expect(estimateMinutes(six)).toBe(1);
    const seven = { ...six, pages: [...six.pages, six.pages[1]] };
    expect(estimateMinutes(seven)).toBe(2);
  });

  it("words the line with the right plural", () => {
    expect(takesAbout(1)).toBe("Takes about 1 minute");
    expect(takesAbout(3)).toBe("Takes about 3 minutes");
  });
});
