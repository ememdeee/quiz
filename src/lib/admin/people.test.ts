import { describe, expect, it } from "vitest";
import { NO_OVERRIDES } from "@/lib/plan/limits";
import { dayLabel, isNearLimit, overviewOf, PAGE_SIZE, parseLimit, peopleCsv, queryPeople, showingRange } from "./people";
import type { AdminPerson } from "./types";

const NOW = Date.parse("2026-11-07T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;
const ago = (days: number) => new Date(NOW - days * DAY).toISOString();

const person = (id: string, over: Partial<AdminPerson> = {}): AdminPerson => ({
  id,
  name: `Person ${id}`,
  email: `${id}@example.com`,
  plan: "free",
  brandColors: false,
  hidePoweredBy: false,
  customDomain: null,
  overrides: NO_OVERRIDES,
  emailVerified: true,
  signedUpAt: ago(40),
  signsInWithGoogle: false,
  suspendedAt: null,
  notes: "",
  quizzes: [],
  ...over,
});

const quiz = (responses: number, pages = 5) => ({
  id: `q${responses}-${pages}`,
  name: "Quiz",
  status: "open" as const,
  pages,
  responses,
  updatedAt: ago(0),
});

const ids = (people: AdminPerson[], search: string, filter: "everyone" | "free" | "custom" | "unverified" = "everyone") =>
  queryPeople(people, { search, filter, page: 1 }).rows.map((row) => row.person.id);

describe("the people list", () => {
  const people = [
    person("a", { name: "Sarah Lee", signedUpAt: ago(1) }),
    person("b", { name: "Budi Santoso", plan: "custom", signedUpAt: ago(2) }),
    person("c", { name: "Maria Gomez", emailVerified: false, signedUpAt: ago(3) }),
  ];

  it("lists the newest first and searches name and email without caring about capitals", () => {
    expect(ids(people, "")).toEqual(["a", "b", "c"]);
    expect(ids(people, "MARIA")).toEqual(["c"]);
    expect(ids(people, "b@example")).toEqual(["b"]);
  });

  it("filters by plan and by email not verified", () => {
    expect(ids(people, "", "custom")).toEqual(["b"]);
    expect(ids(people, "", "free")).toEqual(["a", "c"]);
    expect(ids(people, "", "unverified")).toEqual(["c"]);
  });

  it("pages through many people and keeps the page inside the range", () => {
    const many = Array.from({ length: 20 }, (_, i) => person(`p${i}`, { signedUpAt: ago(i) }));
    const first = queryPeople(many, { search: "", filter: "everyone", page: 1 });
    expect(first.rows).toHaveLength(PAGE_SIZE);
    expect(first.total).toBe(20);
    expect(first.pages).toBe(3);
    expect(queryPeople(many, { search: "", filter: "everyone", page: 3 }).rows).toHaveLength(4);
    expect(queryPeople(many, { search: "", filter: "everyone", page: 99 }).page).toBe(3);
    expect(queryPeople(many, { search: "nobody", filter: "everyone", page: 1 })).toMatchObject({ total: 0, pages: 1, page: 1 });
  });

  it("says which rows are showing", () => {
    expect(showingRange(1, 20)).toEqual([1, 8]);
    expect(showingRange(3, 20)).toEqual([17, 20]);
    expect(showingRange(1, 0)).toEqual([0, 0]);
  });

  it("counts quizzes and finished responses per person", () => {
    const [row] = queryPeople([person("z", { quizzes: [quiz(10), quiz(5, 6)] })], { search: "", filter: "everyone", page: 1 }).rows;
    expect(row.quizzes).toBe(2);
    expect(row.responses).toBe(15);
  });
});

describe("close to a Free plan limit", () => {
  it("is true from 80% of quizzes, pages in a quiz or responses in a quiz", () => {
    expect(isNearLimit(person("a", { quizzes: [quiz(1), quiz(1), quiz(1), quiz(1)] }))).toBe(true); // 4 of 5
    expect(isNearLimit(person("a", { quizzes: [quiz(1), quiz(1), quiz(1)] }))).toBe(false);
    expect(isNearLimit(person("a", { quizzes: [quiz(1, 12)] }))).toBe(true); // 12 of 15
    expect(isNearLimit(person("a", { quizzes: [quiz(400)] }))).toBe(true); // 400 of 500
    expect(isNearLimit(person("a", { quizzes: [quiz(399)] }))).toBe(false);
  });

  it("looks at the person's own limits, and never counts the Custom plan", () => {
    expect(isNearLimit(person("a", { quizzes: [quiz(400)], overrides: { ...NO_OVERRIDES, maxResponses: 5000 } }))).toBe(false);
    expect(isNearLimit(person("a", { plan: "custom", quizzes: [quiz(499)] }))).toBe(false);
  });
});

describe("the overview", () => {
  const people = [
    person("a", { signedUpAt: new Date(NOW - 0.5 * DAY).toISOString(), quizzes: [quiz(10)] }),
    person("b", { signedUpAt: ago(3), plan: "custom", emailVerified: false }),
    person("c", { signedUpAt: ago(20), quizzes: [quiz(5), quiz(450)] }),
    person("d", { signedUpAt: ago(100) }),
  ];
  const overview = overviewOf(people, NOW);

  it("adds up people, plans, quizzes, finished responses and email problems", () => {
    expect(overview).toMatchObject({ signedUp: 4, newThisWeek: 2, newThisMonth: 3, custom: 1, quizzes: 3, responses: 465, unverified: 1, nearLimit: 1 });
  });

  it("draws 30 days of sign-ups ending today, and lists the newest first", () => {
    expect(overview.daily).toHaveLength(30);
    expect(overview.daily[29]).toBe(1);
    expect(overview.daily[26]).toBe(1);
    expect(overview.daily[9]).toBe(1);
    expect(overview.daily.reduce((a, b) => a + b, 0)).toBe(3);
    expect(overview.newest.map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("the CSV and the limit boxes", () => {
  it("writes a header and one quoted row per person and protects spreadsheet formulas", () => {
    const csv = peopleCsv([{ person: person("a", { name: "=HYPERLINK(1)", emailVerified: false }), quizzes: 1, responses: 2 }]);
    const [header, row] = csv.split("\r\n");
    expect(header).toBe('"Name","Email","Plan","Quizzes","Responses","Signed up","Email verified"');
    expect(row).toContain(`"'=HYPERLINK(1)"`);
    expect(row).toContain('"No"');
  });

  it("reads a limit box: blank is the plan's number, commas are fine, nonsense is refused", () => {
    expect(parseLimit("")).toBeNull();
    expect(parseLimit("  ")).toBeNull();
    expect(parseLimit("10,000")).toBe(10000);
    expect(parseLimit("50")).toBe(50);
    expect(parseLimit("0")).toBeUndefined();
    expect(parseLimit("-3")).toBeUndefined();
    expect(parseLimit("2.5")).toBeUndefined();
    expect(parseLimit("many")).toBeUndefined();
  });
});

describe("the sign-up day", () => {
  it("says Today, Yesterday, or the date", () => {
    const noon = new Date(2026, 10, 7, 12).getTime();
    expect(dayLabel(new Date(2026, 10, 7, 1).toISOString(), noon)).toBe("Today");
    expect(dayLabel(new Date(2026, 10, 6, 23).toISOString(), noon)).toBe("Yesterday");
    expect(dayLabel(new Date(2026, 10, 5, 9).toISOString(), noon)).toBe("Nov 5");
  });
});
