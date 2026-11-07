import { describe, expect, it } from "vitest";
import { FREE_LIMITS, getLimits, hasReachedQuizLimit, NO_OVERRIDES } from "./limits";

describe("getLimits", () => {
  it("gives the Free plan numbers when nothing is overridden", () => {
    expect(getLimits({ overrides: NO_OVERRIDES })).toEqual({ quizzes: 5, pagesPerQuiz: 15, responsesPerQuiz: 500 });
  });

  it("uses an override where one is set and keeps the default elsewhere", () => {
    const limits = getLimits({ overrides: { maxQuizzes: 20, maxPages: null, maxResponses: 5000 } });
    expect(limits).toEqual({ quizzes: 20, pagesPerQuiz: 15, responsesPerQuiz: 5000 });
  });

  it("treats 0 as a real override, not as unset", () => {
    expect(getLimits({ overrides: { ...NO_OVERRIDES, maxQuizzes: 0 } }).quizzes).toBe(0);
  });
});

describe("hasReachedQuizLimit", () => {
  it("is false below the limit and true at or above it", () => {
    expect(hasReachedQuizLimit(4, FREE_LIMITS)).toBe(false);
    expect(hasReachedQuizLimit(5, FREE_LIMITS)).toBe(true);
    expect(hasReachedQuizLimit(6, FREE_LIMITS)).toBe(true);
  });
});
