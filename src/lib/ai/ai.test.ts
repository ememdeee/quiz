import { describe, expect, it } from "vitest";
import type { QuizDocument } from "@/lib/quiz/schema";
import { pageTypes } from "@/lib/quiz/page-types";
import { quizTemplates } from "@/lib/quiz/templates";
import { buildAiExport } from "./export";
import { askAgain, findQuizJson, importAiText } from "./import";
import { allowedValues, buildPrompt, pageFieldList } from "./prompt";

const current = quizTemplates[1].document;
const media = new Set<string>();
const run = (text: string, over: Partial<{ maxPages: number; current: QuizDocument }> = {}) =>
  importAiText(text, { current, maxPages: 15, mediaIds: media, ...over });
const json = (doc: QuizDocument) => JSON.stringify(doc, null, 2);
const edit = (change: (pages: QuizDocument["pages"]) => QuizDocument["pages"]): QuizDocument => ({ ...current, pages: change(structuredClone(current.pages)) });

describe("the prompt", () => {
  it("lists every page type and its fields from the schema", () => {
    const list = pageFieldList();
    expect(list.map((entry) => entry.type)).toEqual(Object.keys(pageTypes));
    expect(list.find((e) => e.type === "choice")?.fields).toEqual(["question", "answers", "multiple", "required", "picture"]);
    expect(list.find((e) => e.type === "end")?.fields).toEqual(["style", "title", "text", "picture", "buttonText", "link", "price", "priceNote", "note"]);
  });

  it("fills in the limit and the quiz, and ends on an empty request line", () => {
    const { full, dataOnly } = buildAiExport(current, 15);
    expect(full).toContain("Keep the quiz to 15 pages or fewer.");
    expect(full).toContain(dataOnly);
    expect(full).not.toContain("{PAGE_LIMIT}");
    expect(full).not.toContain("{QUIZ_DATA}");
    expect(full).not.toContain("{FIELDS}");
    expect(full.endsWith("\n\nMy request\n")).toBe(true);
    expect(JSON.parse(dataOnly)).toEqual(current);
  });
});

describe("findQuizJson", () => {
  it("finds the quiz inside words and a code fence", () => {
    const found = findQuizJson(`Sure! Here you go:\n\`\`\`json\n${json(current)}\n\`\`\`\nHope that helps {really}.`);
    expect(found.kind).toBe("found");
  });

  it("says no quiz for plain sentences and cut off for an unfinished answer", () => {
    expect(findQuizJson("I added the questions you wanted.").kind).toBe("none");
    expect(findQuizJson(json(current).slice(0, 400)).kind).toBe("cut_off");
  });

  it("is not fooled by braces inside text", () => {
    const doc = edit((pages) => pages.map((p) => (p.id === "more" && p.type === "text" ? { ...p, question: "Say } or {" } : p)));
    expect(findQuizJson(json(doc)).kind).toBe("found");
  });
});

describe("importAiText", () => {
  it("round trip: exporting and importing the same text reports no changes", () => {
    const result = run(buildAiExport(current, 15).full + "\n" + json(current));
    expect(result.ok && result.unchanged).toBe(true);
    const data = run(buildAiExport(current, 15).dataOnly);
    expect(data.ok && data.counts).toEqual({ added: 0, changed: 0, removed: 0, same: 5 });
  });

  it("reports no quiz and cut off", () => {
    expect(run("no data here")).toEqual({ ok: false, reason: "no_quiz" });
    expect(run(json(current).slice(0, 300))).toEqual({ ok: false, reason: "cut_off" });
  });

  it("describes added, changed and removed pages", () => {
    const doc = edit((pages) => [
      pages[0],
      { ...pages[1], answers: [...(pages[1] as { answers: object[] }).answers, { id: "new-1", text: "Sleep better", picture: null }] } as never,
      { id: "new-2", type: "info", title: "Did you know?", text: "", picture: null },
      pages[3],
      pages[4],
    ]);
    const result = run(json(doc));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.counts).toEqual({ added: 1, changed: 1, removed: 1, same: 3 });
    const byKind = (kind: string) => result.changes.filter((c) => c.kind === kind);
    expect(byKind("added")[0]).toMatchObject({ title: "Did you know?", detail: "New page 3 · Info page" });
    expect(byKind("changed")[0].detail).toBe("Page 2 · New answer: “Sleep better”");
    expect(byKind("removed")[0]).toMatchObject({ title: "How likely are you to recommend us?", detail: "Was page 3 · Answers already collected stay in Responses" });
    expect(result.document.pages.every((p) => !p.id.startsWith("new-"))).toBe(true);
  });

  it("gives new ids to new rules too, and keeps the rule pointing at the right answer", () => {
    const doc = edit((pages) => [
      pages[0],
      { ...pages[1], answers: [{ id: "new-a", text: "Fine", picture: null }, { id: "new-b", text: "Bad", picture: null }] } as never,
      { id: "new-p", type: "text", question: "Why?", input: "any", hint: "", required: false, show: { match: "all", rules: [{ page: "experience", op: "is", value: "new-b" }] } },
      pages[4],
    ]);
    const result = run(json(doc));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const choice = result.document.pages[1];
    const why = result.document.pages[2];
    expect(choice.type === "choice" && why.show?.rules[0].value).toBe(choice.type === "choice" ? choice.answers[1].id : "");
  });

  it("lists problems with words for the person and a message for the AI", () => {
    const doc = edit((pages) => pages.map((p) => (p.id === "experience" && p.type === "choice" ? { ...p, answers: p.answers.slice(0, 1) } : p)));
    const result = run(json(doc));
    expect(result).toMatchObject({ ok: false, reason: "problems" });
    if (result.ok || result.reason !== "problems") return;
    expect(result.problems[0].text).toBe("Page 2: a multiple-choice page needs at least 2 answers.");
    expect(askAgain.problems(result.problems)).toContain("Page 2 needs at least 2 answers.");
  });

  it("flags a rule that looks at a later page and a wrong last page", () => {
    const later = edit((pages) => pages.map((p) => (p.id === "experience" ? { ...p, show: { match: "all" as const, rules: [{ page: "recommend", op: "more than" as const, value: 3 }] } } : p)));
    const result = run(json(later));
    expect(result.ok === false && result.reason === "problems" && result.problems[0].text).toBe("Page 2: this rule looks at page 3, which comes later.");
    const swapped = edit((pages) => [...pages.slice(0, 4), { id: "x", type: "info", title: "Hi", text: "", picture: null }]);
    const wrong = run(json(swapped));
    expect(wrong.ok === false && wrong.reason === "problems" && wrong.problems.some((p) => p.text === "The last page must be the End page. Right now it is an Info page.")).toBe(true);
  });

  it("refuses too many pages with the plan limit", () => {
    expect(run(json(current), { maxPages: 4 })).toEqual({ ok: false, reason: "too_many_pages", count: 5 });
    expect(askAgain.tooMany(15)).toContain("15 pages or fewer");
  });

  it("drops pictures that are not in the library and lists them", () => {
    const doc = edit((pages) => pages.map((p) => (p.id === "start" && p.type === "welcome" ? { ...p, picture: "ghost" } : p)));
    const result = run(json(doc));
    expect(result.ok && result.leftOut).toEqual([{ position: 1, title: "Tell us what you think" }]);
    const kept = importAiText(json(doc), { current, maxPages: 15, mediaIds: new Set(["ghost"]) });
    expect(kept.ok && kept.leftOut).toEqual([]);
  });

  it("ignores the name in the pasted data", () => {
    const result = run(json({ ...current, name: "Something else" }));
    expect(result.ok && result.document.name).toBe(current.name);
  });

  it("treats the same id as a different kind of page as one removed and one added", () => {
    const doc = edit((pages) => pages.map((p) => (p.id === "more" ? { id: "more", type: "info" as const, title: "Thanks", text: "", picture: null } : p)));
    const result = run(json(doc));
    expect(result.ok && result.counts).toMatchObject({ added: 1, removed: 1 });
  });
});

describe("fields an AI leaves out", () => {
  it("accepts answers and pages without an empty picture", () => {
    const doc = JSON.parse(json(current)) as { pages: Record<string, unknown>[] };
    for (const page of doc.pages) {
      delete page.picture;
      if (Array.isArray(page.answers)) for (const answer of page.answers as Record<string, unknown>[]) delete answer.picture;
    }
    const result = run(JSON.stringify(doc));
    expect(result.ok).toBe(true);
  });

  it("names a wrong field once, not once for every answer", () => {
    const doc = JSON.parse(json(current)) as { pages: Record<string, unknown>[] };
    for (const page of doc.pages) if (Array.isArray(page.answers)) for (const answer of page.answers as Record<string, unknown>[]) answer.picture = 5;
    const result = run(JSON.stringify(doc));
    const lines = !result.ok && result.reason === "problems" ? result.problems.map((p) => p.text) : [];
    expect(lines.length).toBeGreaterThan(0);
    expect(new Set(lines).size).toBe(lines.length);
    expect(lines[0]).toContain("“answers picture”");
  });
});

describe("fixed choices", () => {
  it("tells the AI every allowed word of a text page, a number page and an end page", () => {
    const prompt = buildPrompt("{}", 15);
    expect(allowedValues().find((v) => v.type === "text" && v.field === "input")?.values).toEqual(["any", "email", "phone"]);
    expect(prompt).toContain('"input" is one of: "any", "email", "phone"');
    expect(prompt).toContain('"kind" is one of: "age", "height", "weight", "number", "date"');
    expect(prompt).toContain('"style" is one of: "thanks", "button", "offer"');
  });

  it("says which words are allowed when the AI made one up", () => {
    const doc = edit((pages) => pages.map((p) => (p.type === "text" ? ({ ...p, input: "textarea" } as unknown as typeof p) : p)));
    const result = run(json(doc));
    expect(!result.ok && result.reason === "problems" && result.problems[0].ask).toMatch(/It must be one of: “any”, “email”, “phone”./);
  });
});
