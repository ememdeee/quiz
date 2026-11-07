/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ALL_TABLES, HASH, admin, anon, createPublishedQuiz, doc, people, resetAll } from "./helpers.ts";

// Some column that exists in every table, for filters on update/delete.
const ANY_COLUMN: Record<string, string> = {
  profiles: "id", quizzes: "id", responses: "id", quiz_daily_stats: "quiz_id", media: "id", slug_holds: "slug",
  email_changes: "id", login_attempts: "id", rate_limits: "key", contact_messages: "id", admin_log: "id",
};

describe("a stranger (publishable key, no login)", () => {
  beforeAll(async () => {
    const { A } = people();
    const quiz = await createPublishedQuiz(A.id);
    await admin.from("responses").insert({ quiz_id: quiz.id, quiz_version: 1, token_hash: HASH, status: "finished" });
    await admin.rpc("track_open", { p_quiz_id: quiz.id });
  });
  afterAll(resetAll);

  for (const table of ALL_TABLES) {
    it(`cannot read ${table}`, async () => {
      const { data } = await anon.from(table).select("*").limit(5);
      expect(data ?? []).toHaveLength(0);
    });
    it(`cannot insert into ${table}`, async () => {
      const { error } = await anon.from(table).insert({});
      expect(error).not.toBeNull();
    });
    it(`cannot update ${table}`, async () => {
      const { error } = await anon.from(table).update({}).not(ANY_COLUMN[table], "is", null);
      expect(error).not.toBeNull();
    });
    it(`cannot delete from ${table}`, async () => {
      const { error } = await anon.from(table).delete().not(ANY_COLUMN[table], "is", null);
      expect(error).not.toBeNull();
    });
  }

  const rpcs: Record<string, Record<string, unknown>> = {
    save_draft: { p_quiz_id: crypto.randomUUID(), p_base_version: 1, p_doc: doc() },
    publish_quiz: { p_quiz_id: crypto.randomUUID(), p_base_version: 1 },
    slug_available: { p_slug: "some-slug" },
    start_response: { p_slug: "some-slug", p_token_hash: HASH },
    finish_response: { p_response_id: crypto.randomUUID(), p_token_hash: HASH },
    track_open: { p_quiz_id: crypto.randomUUID() },
    rate_limit_hit: { p_key: "x", p_limit: 5, p_window_seconds: 60 },
  };
  for (const [fn, args] of Object.entries(rpcs)) {
    it(`cannot call ${fn}`, async () => {
      const { error } = await anon.rpc(fn, args);
      expect(error?.code).toBe("42501"); // permission denied for function
    });
  }
});
