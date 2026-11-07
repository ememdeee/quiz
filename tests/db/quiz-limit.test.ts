/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { admin, createQuizAs, people, resetAll } from "./helpers.ts";

describe("enforce_quiz_limit", () => {
  const { A, B } = people();
  beforeEach(resetAll);
  afterAll(resetAll);

  it("allows 5 quizzes and blocks the 6th on the Free plan", async () => {
    for (let i = 0; i < 5; i++) {
      const { error } = await createQuizAs(A);
      expect(error).toBeNull();
    }
    const sixth = await createQuizAs(A);
    expect(sixth.error?.message).toContain("quiz_limit_reached");
    const { count } = await admin.from("quizzes").select("id", { count: "exact", head: true }).eq("owner_id", A.id);
    expect(count).toBe(5);
  });

  it("respects a raised limit (override on the profile)", async () => {
    await admin.from("profiles").update({ plan: "custom", max_quizzes: 6 }).eq("id", A.id);
    for (let i = 0; i < 6; i++) expect((await createQuizAs(A)).error).toBeNull();
    expect((await createQuizAs(A)).error?.message).toContain("quiz_limit_reached");
  });

  it("counts each person separately", async () => {
    for (let i = 0; i < 5; i++) await createQuizAs(A);
    expect((await createQuizAs(B)).error).toBeNull();
  });

  it("two parallel inserts at 4 quizzes let exactly one through", async () => {
    for (let i = 0; i < 4; i++) await createQuizAs(A);
    const results = await Promise.all([createQuizAs(A), createQuizAs(A)]);
    expect(results.filter((r) => !r.error)).toHaveLength(1);
  });
});
