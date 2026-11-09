import { describe, expect, it } from "vitest";
import { NUMBER_QUESTIONS, questionAfterKindChange } from "./units";

describe("the question of a number page", () => {
  it("follows the kind while it was never edited", () => {
    expect(questionAfterKindChange(NUMBER_QUESTIONS.age, "age", "height")).toBe(NUMBER_QUESTIONS.height);
    expect(questionAfterKindChange("", "age", "weight")).toBe(NUMBER_QUESTIONS.weight);
  });

  it("keeps what the owner wrote", () => {
    expect(questionAfterKindChange("How old is your dog?", "age", "number")).toBe("How old is your dog?");
  });
});
