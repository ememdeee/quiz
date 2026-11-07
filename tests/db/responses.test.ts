/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { HASH, admin, createPublishedQuiz, doc, getQuiz, newSlug, people, resetAll } from "./helpers.ts";

const start = async (slug: string) => (await admin.rpc("start_response", { p_slug: slug, p_token_hash: HASH })).data;
const finish = async (id: string, hash = HASH) => (await admin.rpc("finish_response", { p_response_id: id, p_token_hash: hash })).data;

describe("start_response and finish_response", () => {
  const { A } = people();
  beforeEach(resetAll);
  afterAll(resetAll);

  it("is not callable by logged-in people either (server code only)", async () => {
    const quiz = await createPublishedQuiz(A.id);
    expect((await A.db.rpc("start_response", { p_slug: quiz.slug, p_token_hash: HASH })).error?.code).toBe("42501");
    expect((await A.db.rpc("finish_response", { p_response_id: crypto.randomUUID(), p_token_hash: HASH })).error?.code).toBe("42501");
    expect((await A.db.rpc("track_open", { p_quiz_id: quiz.id })).error?.code).toBe("42501");
    expect((await A.db.rpc("rate_limit_hit", { p_key: "x", p_limit: 1, p_window_seconds: 60 })).error?.code).toBe("42501");
  });

  it("reports the right status for each kind of quiz", async () => {
    expect((await start("no-such-quiz-here")).status).toBe("not_found");

    const d = doc();
    await admin.from("quizzes").insert({ owner_id: A.id, name: "Draft only", slug: "qc-draft-only", draft: d });
    expect((await start("qc-draft-only")).status).toBe("not_published");

    const closed = await createPublishedQuiz(A.id, { accepting_responses: false });
    expect((await start(closed.slug)).status).toBe("closed");

    const open = await createPublishedQuiz(A.id);
    const started = await start(open.slug.toUpperCase()); // slugs are case-insensitive
    expect(started.status).toBe("open");
    expect(started.quiz_version).toBe(1);

    await admin.from("profiles").update({ status: "suspended" }).eq("id", A.id);
    expect((await start(open.slug)).status).toBe("owner_suspended");
    expect((await finish(started.response_id)).status).toBe("owner_suspended");
  });

  it("checks the token, and finishing twice is harmless", async () => {
    const quiz = await createPublishedQuiz(A.id);
    const { response_id } = await start(quiz.slug);
    expect((await finish(response_id, "b".repeat(64))).status).toBe("bad_token");
    expect((await finish(crypto.randomUUID())).status).toBe("not_found");
    expect((await finish(response_id)).status).toBe("finished");
    expect((await finish(response_id)).status).toBe("already_finished");
    expect((await getQuiz(quiz.id)).finished_count).toBe(1);
  });

  it("refuses at the limit; unfinished do not count; deleting a response frees a slot", async () => {
    await admin.from("profiles").update({ plan: "custom", max_responses: 3 }).eq("id", A.id);
    const quiz = await createPublishedQuiz(A.id);
    const ids: string[] = [];
    for (let i = 0; i < 4; i++) ids.push((await start(quiz.slug)).response_id);
    expect(await getQuiz(quiz.id).then((q) => q.finished_count)).toBe(0); // unfinished do not count

    for (const id of ids.slice(0, 3)) expect((await finish(id)).status).toBe("finished");
    expect((await getQuiz(quiz.id)).finished_count).toBe(3);
    expect((await finish(ids[3])).status).toBe("full");
    expect((await start(quiz.slug)).status).toBe("full");

    // the owner deletes one finished response with their own session -> a slot is free again
    const { data } = await A.db.from("responses").delete().eq("id", ids[0]).select();
    expect(data).toHaveLength(1);
    expect((await getQuiz(quiz.id)).finished_count).toBe(2);
    expect((await finish(ids[3])).status).toBe("finished");
    expect((await getQuiz(quiz.id)).finished_count).toBe(3);
  });

  it("two finishes at 499 of 500 let exactly one through", async () => {
    const quiz = await createPublishedQuiz(A.id);
    const rows = Array.from({ length: 499 }, () => ({
      quiz_id: quiz.id, quiz_version: 1, token_hash: HASH, status: "finished", finished_at: new Date().toISOString(),
    }));
    const { error } = await admin.from("responses").insert(rows);
    expect(error).toBeNull();
    expect((await getQuiz(quiz.id)).finished_count).toBe(499);

    const first = (await start(quiz.slug)).response_id;
    const second = (await start(quiz.slug)).response_id;
    const results = await Promise.all([finish(first), finish(second)]);
    expect(results.map((r) => r.status).sort()).toEqual(["finished", "full"]);
    expect((await getQuiz(quiz.id)).finished_count).toBe(500);
  });

  it("track_open counts opens per day, only for published quizzes", async () => {
    const quiz = await createPublishedQuiz(A.id);
    await admin.rpc("track_open", { p_quiz_id: quiz.id });
    await admin.rpc("track_open", { p_quiz_id: quiz.id });
    const { data } = await admin.from("quiz_daily_stats").select("opened").eq("quiz_id", quiz.id);
    expect(data).toEqual([{ opened: 2 }]);

    const draft = (await admin.from("quizzes").insert({ owner_id: A.id, name: "d", slug: newSlug(), draft: doc() }).select().single()).data;
    await admin.rpc("track_open", { p_quiz_id: draft.id });
    expect((await admin.from("quiz_daily_stats").select("opened").eq("quiz_id", draft.id)).data).toEqual([]);
  });

  it("rate_limit_hit allows up to the limit and then says no", async () => {
    const key = `qc-${newSlug()}`;
    const answers: boolean[] = [];
    for (let i = 0; i < 4; i++) answers.push((await admin.rpc("rate_limit_hit", { p_key: key, p_limit: 3, p_window_seconds: 3600 })).data);
    expect(answers).toEqual([true, true, true, false]);
    await admin.from("rate_limits").delete().eq("key", key);
  });
});
