 
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { HASH, admin, createPublishedQuiz, doc, newSlug, people, resetAll } from "./helpers.ts";

// Person A tries to read and change everything that belongs to person B.
describe("person A cannot touch person B's data", () => {
  const { A, B } = people();
  let quizId = "";
  let responseId = "";
  let mediaId = "";

  beforeAll(async () => {
    const quiz = await createPublishedQuiz(B.id, { name: "B private quiz" });
    quizId = quiz.id;
    const { data: resp } = await admin.from("responses")
      .insert({ quiz_id: quizId, quiz_version: 1, token_hash: HASH, status: "finished", answers: { x: 1 } })
      .select().single();
    responseId = resp.id;
    await admin.rpc("track_open", { p_quiz_id: quizId });
    const { data: media } = await admin.from("media")
      .insert({ owner_id: B.id, path: `${B.id}/${crypto.randomUUID()}.png`, file_name: "b.png", mime: "image/png", size_bytes: 10 })
      .select().single();
    mediaId = media.id;
  });
  afterAll(resetAll);

  it("cannot select B's rows in any table", async () => {
    expect((await A.db.from("quizzes").select("id").eq("id", quizId)).data).toEqual([]);
    expect((await A.db.from("responses").select("id").eq("id", responseId)).data).toEqual([]);
    expect((await A.db.from("quiz_daily_stats").select("quiz_id").eq("quiz_id", quizId)).data).toEqual([]);
    expect((await A.db.from("media").select("id").eq("id", mediaId)).data).toEqual([]);
    expect((await A.db.from("profiles").select("id").eq("id", B.id)).data).toEqual([]);
    // ...and a wide select only returns A's own rows
    expect((await A.db.from("profiles").select("id")).data).toEqual([{ id: A.id }]);
  });

  it("cannot update B's rows in any table", async () => {
    const q = await A.db.from("quizzes").update({ name: "hacked" }).eq("id", quizId).select();
    expect(q.data ?? []).toHaveLength(0);
    const m = await A.db.from("media").update({ file_name: "hacked" }).eq("id", mediaId).select();
    expect(m.data ?? []).toHaveLength(0);
    const p = await A.db.from("profiles").update({ name: "hacked" }).eq("id", B.id).select();
    expect(p.data ?? []).toHaveLength(0);
    // responses and quiz_daily_stats: no update right at all
    expect((await A.db.from("responses").update({ answers: {} }).eq("id", responseId)).error).not.toBeNull();
    expect((await A.db.from("quiz_daily_stats").update({ opened: 99 }).eq("quiz_id", quizId)).error).not.toBeNull();

    const { data: quiz } = await admin.from("quizzes").select("name").eq("id", quizId).single();
    expect(quiz?.name).toBe("B private quiz");
    const { data: media } = await admin.from("media").select("file_name").eq("id", mediaId).single();
    expect(media?.file_name).toBe("b.png");
    const { data: profile } = await admin.from("profiles").select("name").eq("id", B.id).single();
    expect(profile?.name).not.toBe("hacked");
  });

  it("cannot delete B's rows in any table", async () => {
    expect((await A.db.from("quizzes").delete().eq("id", quizId).select()).data ?? []).toHaveLength(0);
    expect((await A.db.from("responses").delete().eq("id", responseId).select()).data ?? []).toHaveLength(0);
    expect((await A.db.from("media").delete().eq("id", mediaId).select()).data ?? []).toHaveLength(0);
    expect((await A.db.from("quiz_daily_stats").delete().eq("quiz_id", quizId)).error).not.toBeNull();
    expect((await A.db.from("profiles").delete().eq("id", B.id)).error).not.toBeNull();

    expect((await admin.from("quizzes").select("id").eq("id", quizId)).data).toHaveLength(1);
    expect((await admin.from("responses").select("id").eq("id", responseId)).data).toHaveLength(1);
    expect((await admin.from("media").select("id").eq("id", mediaId)).data).toHaveLength(1);
    expect((await admin.from("quiz_daily_stats").select("quiz_id").eq("quiz_id", quizId)).data).toHaveLength(1);
    expect((await admin.from("profiles").select("id").eq("id", B.id)).data).toHaveLength(1);
  });

  it("cannot create rows in B's name, and cannot write responses at all", async () => {
    const q = await A.db.from("quizzes").insert({ owner_id: B.id, name: "x", slug: newSlug(), draft: doc() });
    expect(q.error).not.toBeNull();
    const m = await A.db.from("media").insert({ owner_id: B.id, path: `${B.id}/${crypto.randomUUID()}.png`, file_name: "x.png", mime: "image/png", size_bytes: 1 });
    expect(m.error).not.toBeNull();
    // A's own media row must also live in A's own folder
    const own = await A.db.from("media").insert({ owner_id: A.id, path: `${B.id}/${crypto.randomUUID()}.png`, file_name: "x.png", mime: "image/png", size_bytes: 1 });
    expect(own.error).not.toBeNull();
    const r = await A.db.from("responses").insert({ quiz_id: quizId, quiz_version: 1, token_hash: HASH });
    expect(r.error).not.toBeNull();
    const s = await A.db.from("quiz_daily_stats").insert({ quiz_id: quizId, day: "2020-01-01", opened: 1 });
    expect(s.error).not.toBeNull();
  });

  it("owner A can read the responses and stats of A's own quiz (and B's quiz owner can read B's)", async () => {
    expect((await B.db.from("responses").select("id").eq("id", responseId)).data).toHaveLength(1);
    expect((await B.db.from("quiz_daily_stats").select("quiz_id").eq("quiz_id", quizId)).data).toHaveLength(1);
    expect((await B.db.from("media").select("id").eq("id", mediaId)).data).toHaveLength(1);
  });

  it("owner can delete a response of their own quiz", async () => {
    const { data } = await B.db.from("responses").delete().eq("id", responseId).select();
    expect(data).toHaveLength(1);
  });
});
