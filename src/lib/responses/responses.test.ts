import { describe, expect, it } from "vitest";
import { generateResponses, seedResponses } from "@/data/mock/responses";
import { seedBundles } from "@/data/mock/seed";
import { toCsv, protectCell } from "./export/csv";
import { exportFileName } from "./export/download";
import { toJson } from "./export/json";
import { buildTable } from "./export/table";
import { answerRows, filterResponses, leftAtPage, minutesTaken } from "./individual";
import { summarize } from "./summarize";
import type { QuizResponse } from "./types";

const NOW = new Date("2026-11-07T12:00:00Z").getTime();
const doc = seedBundles(NOW)[0].draft;
const hours = (n: number) => new Date(NOW - n * 3_600_000).toISOString();

const person = (number: number, over: Partial<QuizResponse>): QuizResponse => ({
  id: `r${number}`,
  number,
  status: "finished",
  startedAt: hours(number),
  finishedAt: hours(number - 0.05),
  answers: {},
  pagesSeen: [],
  lastPageId: "welcome",
  ...over,
});
const choice = (id: string, text: string) => ({ type: "choice" as const, q: "What is your main goal?", v: [id], vt: [text] });
const age = (v: number) => ({ type: "number" as const, q: "How old are you?", v });

const people: QuizResponse[] = [
  person(1, { answers: { goal: choice("lose", "Lose weight"), age: age(25) }, pagesSeen: ["welcome", "goal", "age", "height", "weight", "target", "result"] }),
  person(2, { answers: { goal: choice("tone", "Tone my body"), age: age(45) }, pagesSeen: ["welcome", "goal", "age", "weight", "target", "result"] }),
  person(3, { status: "in_progress", finishedAt: null, answers: { goal: choice("lose", "Lose weight") }, pagesSeen: ["welcome", "goal", "age"], lastPageId: "age" }),
  person(4, { status: "in_progress", finishedAt: null, answers: {}, pagesSeen: ["welcome"], lastPageId: "welcome" }),
];

describe("summarize", () => {
  const s = summarize(doc, people, 10);

  it("counts the funnel", () => {
    expect(s.funnel).toEqual({ opened: 10, started: 4, finished: 2, finishRate: 50 });
  });

  it("shares who is still going at each page, counting only people the page applied to", () => {
    const byId = Object.fromEntries(s.leave.map((row) => [row.pageId, row.share]));
    expect(byId.welcome).toBe(100);
    expect(byId.goal).toBe(75);
    // the height page applies only to "Lose weight": 2 people, 1 got there
    expect(byId.height).toBe(50);
    expect(byId.result).toBe(50);
  });

  it("names the biggest drop", () => {
    expect(s.biggestDrop).toEqual({ from: "Body Reset", to: "What is your main goal?" });
  });

  it("gives choice shares among the people who answered", () => {
    const goal = s.questions.find((q) => q.pageId === "goal");
    expect(goal).toMatchObject({ kind: "choice", answered: 3 });
    expect(goal?.kind === "choice" && goal.options.map((o) => [o.label, o.count, o.share])).toEqual([
      ["Lose weight", 2, 67],
      ["Tone my body", 1, 33],
      ["Have more energy", 0, 0],
      ["Feel healthier", 0, 0],
    ]);
  });

  it("summarizes numbers with age brackets", () => {
    const a = s.questions.find((q) => q.pageId === "age");
    expect(a).toMatchObject({ kind: "number", average: 35, lowest: 25, highest: 45, answered: 2 });
    expect(a?.kind === "number" && a.histogram.map((b) => b.count)).toEqual([1, 0, 1, 0, 0]);
  });

  it("finds answers to deleted questions", () => {
    const withRemoved = [person(5, { answers: { smoke: { type: "choice", q: "Do you smoke?", v: ["no"], vt: ["No"] } } })];
    expect(summarize(doc, withRemoved, 1).removed).toEqual([{ id: "smoke", label: "Do you smoke?", answered: 1, answers: [{ text: "No", count: 1 }] }]);
  });

  it("summarizes dates and text answers", () => {
    const dated = [
      person(1, { answers: { target: { type: "number", q: "Your goal date", v: "2027-01-12" }, goal: choice("lose", "x") }, pagesSeen: ["target"] }),
      person(2, { answers: { target: { type: "number", q: "Your goal date", v: "2027-03-01" } }, pagesSeen: ["target"] }),
    ];
    const d = summarize(doc, dated, 2).questions.find((q) => q.pageId === "target");
    expect(d).toMatchObject({ kind: "date", earliest: "2027-01-12", latest: "2027-03-01", answered: 2 });
    expect(d?.kind === "date" && d.months.map((m) => m.label)).toEqual(["Jan", "Mar"]);
  });
});

describe("individual view", () => {
  it("lists newest first and hides unfinished people on request", () => {
    const all = filterResponses(doc, people, { query: "", range: "all", includeUnfinished: true }, NOW);
    expect(all.map((r) => r.number)).toEqual([1, 2, 3, 4]);
    expect(filterResponses(doc, people, { query: "", range: "all", includeUnfinished: false }, NOW).map((r) => r.number)).toEqual([1, 2]);
  });

  it("searches the answer text and narrows by date", () => {
    expect(filterResponses(doc, people, { query: "tone", range: "all", includeUnfinished: true }, NOW).map((r) => r.number)).toEqual([2]);
    expect(filterResponses(doc, people, { query: "165 cm", range: "all", includeUnfinished: true }, NOW)).toEqual([]);
    const old = person(9, { startedAt: new Date(NOW - 20 * 86_400_000).toISOString() });
    expect(filterResponses(doc, [old], { query: "", range: "7", includeUnfinished: true }, NOW)).toEqual([]);
    expect(filterResponses(doc, [old], { query: "", range: "30", includeUnfinished: true }, NOW)).toHaveLength(1);
  });

  it("says where people left and how long it took", () => {
    expect(leftAtPage(doc, people[2])).toBe(3);
    expect(leftAtPage(doc, people[0])).toBeNull();
    expect(minutesTaken(people[0])).toBe(3);
    expect(minutesTaken(people[2])).toBeNull();
  });

  it("shows answers in page order, No answer for skipped, removed questions last", () => {
    const response = person(1, {
      answers: { goal: choice("lose", "Lose weight"), height: { type: "number", q: "Your height", v: 165 }, smoke: { type: "choice", q: "Do you smoke?", v: ["no"], vt: ["No"] } },
      pagesSeen: ["welcome", "goal", "age", "height"],
    });
    const rows = answerRows(doc, response);
    expect(rows.map((r) => [r.position, r.answer])).toEqual([[2, "Lose weight"], [3, null], [4, "165 cm"], [null, "No"]]);
    expect(rows[3]).toMatchObject({ removed: true, question: "Do you smoke?" });
  });
});

describe("export", () => {
  const table = buildTable(doc, [people[1], people[0]]);

  it("has one column per question and one row per person, in order of arrival", () => {
    expect(table.headers.slice(0, 6)).toEqual(["Response", "Status", "Started", "Finished", "2. What is your main goal?", "3. How old are you?"]);
    expect(table.rows.map((r) => r[0])).toEqual(["1", "2"]);
    expect(table.rows[0][4]).toBe("Lose weight");
    expect(table.rows[0][5]).toBe("25");
  });

  it("puts removed questions in their own column at the end", () => {
    const withRemoved = person(3, { answers: { smoke: { type: "choice", q: "Do you smoke?", v: ["no"], vt: ["No"] } } });
    const t = buildTable(doc, [people[0], withRemoved]);
    expect(t.headers[t.headers.length - 1]).toBe("(removed) Do you smoke?");
    expect(t.rows[1][t.headers.length - 1]).toBe("No");
  });

  it("writes a CSV with a byte order mark, quotes and protection against formulas", () => {
    const csv = toCsv({ headers: ["a", "b"], rows: [['He said "hi", ok', "=SUM(A1)"], ["+1", "plain"]] });
    expect(csv.startsWith("﻿a,b\r\n")).toBe(true);
    expect(csv).toContain('"He said ""hi"", ok",\'=SUM(A1)');
    expect(protectCell("@x")).toBe("'@x");
    expect(protectCell("-5")).toBe("'-5");
    expect(protectCell("5")).toBe("5");
  });

  it("writes JSON and file names the way the plan says", () => {
    const parsed = JSON.parse(toJson(doc, people));
    expect(parsed).toHaveLength(4);
    expect(parsed[0].answers[0]).toEqual({ pageId: "goal", question: "What is your main goal?", answer: "Lose weight" });
    expect(exportFileName("Body Reset", "csv", new Date("2026-11-07T10:00:00Z"))).toBe("body-reset-responses-2026-11-07.csv");
  });
});

describe("dummy responses", () => {
  it("are the same every time and match the quiz card", () => {
    const a = seedResponses(NOW)["quiz-body-reset"];
    const b = seedResponses(NOW)["quiz-body-reset"];
    expect(a).toEqual(b);
    expect(a.responses.filter((r) => r.status === "finished")).toHaveLength(128);
    expect(a.responses.some((r) => r.answers.smoke)).toBe(true);
  });

  it("only answer pages that applied to them", () => {
    const made = generateResponses(doc, { finished: 40, unfinished: 0, now: NOW, seed: 3 });
    for (const r of made) {
      const lose = (r.answers.goal?.v as string[] | undefined)?.[0] === "lose";
      expect(r.answers.height !== undefined).toBe(lose);
      expect(r.pagesSeen[r.pagesSeen.length - 1]).toBe("result");
    }
  });
});
