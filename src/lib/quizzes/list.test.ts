import { describe, expect, it } from "vitest";
import { filterAndSort, quizStatus } from "./list";
import type { QuizSummary } from "./types";

const make = (over: Partial<QuizSummary>): QuizSummary => ({
  id: "x",
  name: "Quiz",
  slug: "quiz-x",
  firstPublishedAt: "2026-01-01T00:00:00Z",
  acceptingResponses: true,
  unpublishedChanges: 0,
  pageCount: 5,
  finishedResponses: 0,
  updatedAt: "2026-11-01T00:00:00Z",
  ...over,
});

const a = make({ id: "a", name: "banana", finishedResponses: 5, updatedAt: "2026-11-01T00:00:00Z" });
const b = make({ id: "b", name: "Apple", finishedResponses: 50, updatedAt: "2026-11-03T00:00:00Z" });
const c = make({ id: "c", name: "cherry pie", finishedResponses: 5, updatedAt: "2026-11-05T00:00:00Z" });
const list = [a, b, c];

describe("quizStatus", () => {
  it("is not_published before the first publish, whatever the switch says", () => {
    expect(quizStatus(make({ firstPublishedAt: null }))).toBe("not_published");
    expect(quizStatus(make({ firstPublishedAt: null, acceptingResponses: false }))).toBe("not_published");
  });

  it("is open or closed after publishing", () => {
    expect(quizStatus(make({}))).toBe("open");
    expect(quizStatus(make({ acceptingResponses: false }))).toBe("closed");
  });
});

describe("filterAndSort", () => {
  it("sorts by last edited, newest first", () => {
    expect(filterAndSort(list, "", "edited").map((q) => q.id)).toEqual(["c", "b", "a"]);
  });

  it("sorts by name A to Z ignoring capitals", () => {
    expect(filterAndSort(list, "", "name").map((q) => q.name)).toEqual(["Apple", "banana", "cherry pie"]);
  });

  it("sorts by most responses, newest first when equal", () => {
    expect(filterAndSort(list, "", "responses").map((q) => q.id)).toEqual(["b", "c", "a"]);
  });

  it("searches any part of the name without caring about capitals or spaces around it", () => {
    expect(filterAndSort(list, "  PIE ", "edited").map((q) => q.id)).toEqual(["c"]);
    expect(filterAndSort(list, "an", "edited").map((q) => q.id)).toEqual(["a"]);
  });

  it("returns nothing for a word that matches nothing", () => {
    expect(filterAndSort(list, "fitness", "edited")).toEqual([]);
  });

  it("does not change the list it was given", () => {
    const copy = [...list];
    filterAndSort(list, "", "name");
    expect(list).toEqual(copy);
  });
});
