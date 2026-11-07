/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { admin, createQuizAs, newSlug, people, resetAll } from "./helpers.ts";

const available = async (user: ReturnType<typeof people>["A"], slug: string, quizId?: string) =>
  (await user.db.rpc("slug_available", { p_slug: slug, p_quiz_id: quizId ?? null })).data;

describe("slugs", () => {
  const { A, B } = people();
  beforeEach(resetAll);
  afterAll(resetAll);

  it("is unique, ignoring upper/lower case, across all people", async () => {
    const slug = newSlug("qc-same");
    expect((await createQuizAs(A, { slug })).error).toBeNull();
    const dup = await createQuizAs(B, { slug: slug.toUpperCase() });
    expect(dup.error?.code).toBe("23505");
    const own = await createQuizAs(A, { slug: slug.toUpperCase() });
    expect(own.error?.code).toBe("23505");
  });

  it("slug_available: invalid, reserved, taken, free", async () => {
    const taken = (await createQuizAs(A)).data;
    expect(await available(B, "ab")).toEqual({ available: false, reason: "invalid" });
    expect(await available(B, "Has-Capitals")).toEqual({ available: false, reason: "invalid" });
    expect(await available(B, "double--hyphen")).toEqual({ available: false, reason: "invalid" });
    expect(await available(B, "-leading")).toEqual({ available: false, reason: "invalid" });
    expect(await available(B, "x".repeat(61))).toEqual({ available: false, reason: "invalid" });
    for (const word of ["new", "edit", "preview", "admin", "api", "www", "app", "quiz", "login", "register"]) {
      const reason = word.length < 3 ? "invalid" : "reserved";
      expect(await available(B, word)).toEqual({ available: false, reason });
    }
    expect(await available(B, taken.slug)).toEqual({ available: false, reason: "taken" });
    expect(await available(A, taken.slug, taken.id)).toEqual({ available: true }); // its own slug
    expect(await available(B, newSlug())).toEqual({ available: true });
  });

  it("deleting a quiz holds its slug for the same owner, and honors the hold", async () => {
    const quiz = (await createQuizAs(A)).data;
    const { data: deleted } = await A.db.from("quizzes").delete().eq("id", quiz.id).select();
    expect(deleted).toHaveLength(1);

    const { data: hold } = await admin.from("slug_holds").select("*").eq("slug", quiz.slug).single();
    expect(hold.owner_id).toBe(A.id);
    const days = (new Date(hold.expires_at).getTime() - Date.now()) / 86_400_000;
    expect(days).toBeGreaterThan(29);
    expect(days).toBeLessThanOrEqual(30);

    expect(await available(B, quiz.slug)).toEqual({ available: false, reason: "held" });
    expect((await createQuizAs(B, { slug: quiz.slug })).error?.code).toBe("23505"); // a stranger cannot grab it
    expect(await available(A, quiz.slug)).toEqual({ available: true });            // the owner can take it back

    expect((await createQuizAs(A, { slug: quiz.slug })).error).toBeNull();
    expect((await admin.from("slug_holds").select("slug").eq("slug", quiz.slug)).data).toEqual([]); // hold released
  });

  it("an expired hold no longer protects the slug", async () => {
    const quiz = (await createQuizAs(A)).data;
    await A.db.from("quizzes").delete().eq("id", quiz.id);
    await admin.from("slug_holds").update({ expires_at: new Date(Date.now() - 1000).toISOString() }).eq("slug", quiz.slug);
    expect(await available(B, quiz.slug)).toEqual({ available: true });
    expect((await createQuizAs(B, { slug: quiz.slug })).error).toBeNull();
  });

  it("changing a slug holds the old one", async () => {
    const quiz = (await createQuizAs(A)).data;
    const next = newSlug();
    expect((await A.db.from("quizzes").update({ slug: next }).eq("id", quiz.id)).error).toBeNull();
    expect(await available(B, quiz.slug)).toEqual({ available: false, reason: "held" });
    expect(await available(B, next)).toEqual({ available: false, reason: "taken" });
  });

  it("two people saving the same slug at the same moment: one wins", async () => {
    const slug = newSlug("qc-race");
    const results = await Promise.all([createQuizAs(A, { slug }), createQuizAs(B, { slug })]);
    expect(results.filter((r) => !r.error)).toHaveLength(1);
    expect(results.find((r) => r.error)?.error?.code).toBe("23505");
  });
});
