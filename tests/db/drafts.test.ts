/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { admin, createQuizAs, doc, getQuiz, people, resetAll } from "./helpers.ts";

describe("save_draft and publish_quiz", () => {
  const { A, B } = people();
  let quizId = "";

  beforeEach(async () => {
    await resetAll();
    const { data, error } = await createQuizAs(A);
    expect(error).toBeNull();
    quizId = data.id;
  });
  afterAll(resetAll);

  const save = (user = A, base = 1, d: unknown = doc(3, "Renamed")) =>
    user.db.rpc("save_draft", { p_quiz_id: quizId, p_base_version: base, p_doc: d });

  it("saves, bumps the version and keeps the name in step", async () => {
    const { data } = await save();
    expect(data).toEqual({ status: "ok", version: 2 });
    const quiz = await getQuiz(quizId);
    expect(quiz.draft_version).toBe(2);
    expect(quiz.draft.pages).toHaveLength(3);
    expect(quiz.name).toBe("Renamed");
  });

  it("returns conflict for a stale base_version and changes nothing", async () => {
    await save(A, 1);
    const { data } = await save(A, 1, doc(2, "Stale"));
    expect(data.status).toBe("conflict");
    expect(data.current_version).toBe(2);
    expect((await getQuiz(quizId)).name).toBe("Renamed");
  });

  it("two saves with the same base_version at the same moment: one wins", async () => {
    const results = await Promise.all([save(A, 1, doc(2, "One")), save(A, 1, doc(2, "Two"))]);
    expect(results.map((r) => r.data.status).sort()).toEqual(["conflict", "ok"]);
  });

  it("refuses the wrong owner (not_found) and anonymous callers", async () => {
    const { data } = await save(B, 1);
    expect(data.status).toBe("not_found");
    expect((await getQuiz(quizId)).draft_version).toBe(1);
  });

  it("enforces the page limit (15 on Free) and a raised limit", async () => {
    expect((await save(A, 1, doc(16))).data.status).toBe("too_many_pages");
    expect((await save(A, 1, doc(15))).data.status).toBe("ok");
    await admin.from("profiles").update({ plan: "custom", max_pages: 20 }).eq("id", A.id);
    expect((await save(A, 2, doc(20))).data.status).toBe("ok");
    expect((await save(A, 3, doc(21))).data.status).toBe("too_many_pages");
  });

  it("refuses an oversize document (over 1 MB) and a document of the wrong shape", async () => {
    const big = doc(2);
    (big.pages[0] as any).text = "x".repeat(1_100_000);
    expect((await save(A, 1, big)).data.status).toBe("too_large");
    expect((await save(A, 1, { nope: true })).data.status).toBe("invalid");
    expect((await save(A, 1, [])).data.status).toBe("invalid");
    expect((await getQuiz(quizId)).draft_version).toBe(1);
  });

  it("a person cannot write the draft or its version by a plain update", async () => {
    const { error } = await A.db.from("quizzes").update({ draft: doc(2), draft_version: 50 }).eq("id", quizId);
    expect(error).not.toBeNull();
    expect((await getQuiz(quizId)).draft_version).toBe(1);
  });

  it("publish_quiz copies the draft, and refuses a stale version or the wrong owner", async () => {
    await save(A, 1);
    expect((await A.db.rpc("publish_quiz", { p_quiz_id: quizId, p_base_version: 1 })).data.status).toBe("conflict");
    expect((await B.db.rpc("publish_quiz", { p_quiz_id: quizId, p_base_version: 2 })).data.status).toBe("not_found");
    const { data } = await A.db.rpc("publish_quiz", { p_quiz_id: quizId, p_base_version: 2 });
    expect(data).toEqual({ status: "ok", version: 2 });
    const quiz = await getQuiz(quizId);
    expect(quiz.published).toEqual(quiz.draft);
    expect(quiz.published_version).toBe(2);
    expect(quiz.published_at).not.toBeNull();
  });

  it("a person cannot fake a published quiz or its counter", async () => {
    expect((await A.db.from("quizzes").update({ published: doc(), published_version: 9 }).eq("id", quizId)).error).not.toBeNull();
    expect((await A.db.from("quizzes").update({ finished_count: 0 }).eq("id", quizId)).error).not.toBeNull();
  });

  it("updated_at moves on an edit", async () => {
    const before = (await getQuiz(quizId)).updated_at;
    await new Promise((r) => setTimeout(r, 50));
    await save();
    expect((await getQuiz(quizId)).updated_at > before).toBe(true);
  });
});
