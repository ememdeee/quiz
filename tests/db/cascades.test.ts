/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, describe, expect, it } from "vitest";
import { HASH, admin, createPublishedQuiz, people, rand, resetAll } from "./helpers.ts";

describe("cascades and sign-up", () => {
  const { A } = people();
  afterAll(resetAll);

  it("deleting a person removes their profile, quizzes, responses, pictures, stats and holds", async () => {
    const { data, error } = await admin.auth.admin.createUser({
      email: `qc-d${rand()}@example.test`, password: `Pw-${crypto.randomUUID()}`, email_confirm: true,
      user_metadata: { full_name: "  Dee Test  " },
    });
    expect(error).toBeNull();
    const id = data.user!.id;

    // handle_new_user: profile row exists, name taken from full_name (trimmed)
    const { data: profile } = await admin.from("profiles").select("name, role, plan").eq("id", id).single();
    expect(profile).toEqual({ name: "Dee Test", role: "user", plan: "free" });

    const quiz = await createPublishedQuiz(id);
    await admin.from("responses").insert([
      { quiz_id: quiz.id, quiz_version: 1, token_hash: HASH, status: "finished" },
      { quiz_id: quiz.id, quiz_version: 1, token_hash: HASH },
    ]);
    await admin.rpc("track_open", { p_quiz_id: quiz.id });
    await admin.from("media").insert({ owner_id: id, path: `${id}/${crypto.randomUUID()}.png`, file_name: "d.png", mime: "image/png", size_bytes: 5 });
    await admin.from("slug_holds").insert({ slug: `qc-hold-${rand()}`, owner_id: id, expires_at: new Date(Date.now() + 1e9).toISOString() });
    await admin.from("email_changes").insert({ user_id: id, new_email: `qc-n${rand()}@example.test`, token_hash: HASH, expires_at: new Date(Date.now() + 1e9).toISOString() });

    const del = await admin.auth.admin.deleteUser(id);
    expect(del.error).toBeNull();

    expect((await admin.from("profiles").select("id").eq("id", id)).data).toEqual([]);
    expect((await admin.from("quizzes").select("id").eq("owner_id", id)).data).toEqual([]);
    expect((await admin.from("responses").select("id").eq("quiz_id", quiz.id)).data).toEqual([]);
    expect((await admin.from("quiz_daily_stats").select("quiz_id").eq("quiz_id", quiz.id)).data).toEqual([]);
    expect((await admin.from("media").select("id").eq("owner_id", id)).data).toEqual([]);
    expect((await admin.from("slug_holds").select("slug").eq("owner_id", id)).data).toEqual([]);
    expect((await admin.from("email_changes").select("id").eq("user_id", id)).data).toEqual([]);
  });

  it("deleting a quiz removes its responses and stats", async () => {
    const quiz = await createPublishedQuiz(A.id);
    await admin.from("responses").insert({ quiz_id: quiz.id, quiz_version: 1, token_hash: HASH, status: "finished" });
    await admin.rpc("track_open", { p_quiz_id: quiz.id });
    expect((await A.db.from("quizzes").delete().eq("id", quiz.id)).error).toBeNull();
    expect((await admin.from("responses").select("id").eq("quiz_id", quiz.id)).data).toEqual([]);
    expect((await admin.from("quiz_daily_stats").select("quiz_id").eq("quiz_id", quiz.id)).data).toEqual([]);
  });

  it("the audit log survives deleting a person (no foreign keys)", async () => {
    const ghost = crypto.randomUUID();
    const { error } = await admin.from("admin_log").insert({ admin_id: ghost, action: "qc-test", target_user_id: ghost });
    expect(error).toBeNull();
    await admin.from("admin_log").delete().eq("action", "qc-test");
  });
});
