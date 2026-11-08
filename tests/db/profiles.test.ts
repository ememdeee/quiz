 
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { admin, createPublishedQuiz, people, resetAll, runSql } from "./helpers.ts";

describe("profiles are protected", () => {
  const { A, B } = people();
  beforeEach(resetAll);
  afterAll(resetAll);

  it("a profile row exists with the safe defaults (created by handle_new_user)", async () => {
    const { data } = await A.db.from("profiles").select("*").eq("id", A.id).single();
    expect(data?.role).toBe("user");
    expect(data.plan).toBe("free");
    expect(data.status).toBe("active");
    await admin.from("profiles").update({ name: "" }).eq("id", A.id);
  });

  it("a person can change their own name", async () => {
    const { error } = await A.db.from("profiles").update({ name: "New Name" }).eq("id", A.id);
    expect(error).toBeNull();
    const { data } = await admin.from("profiles").select("name").eq("id", A.id).single();
    expect(data?.name).toBe("New Name");
  });

  const forbidden: [string, unknown][] = [
    ["role", "admin"], ["plan", "custom"], ["status", "suspended"], ["suspended_at", new Date().toISOString()],
    ["max_quizzes", 999], ["max_pages", 999], ["max_responses", 999999],
    ["brand_unlocked", true], ["can_hide_powered_by", true], ["custom_domain", "evil.example"], ["admin_notes", "hi"],
  ];
  for (const [column, value] of forbidden) {
    it(`a person cannot change their own ${column}`, async () => {
      const { error } = await A.db.from("profiles").update({ [column]: value }).eq("id", A.id);
      expect(error).not.toBeNull();
      const { data } = await admin.from("profiles").select(column).eq("id", A.id).single();
      expect((data as any)[column]).not.toEqual(value);
    });
  }

  it("a person cannot create or delete a profile", async () => {
    expect((await A.db.from("profiles").insert({ id: crypto.randomUUID() })).error).not.toBeNull();
    expect((await A.db.from("profiles").delete().eq("id", A.id)).error).not.toBeNull();
    expect((await admin.from("profiles").select("id").eq("id", A.id)).data).toHaveLength(1);
  });

  it("the guard trigger blocks it even if a column right were granted", async () => {
    // Everything happens inside one failing statement, so the temporary grant is rolled back.
    const query = `
      do $$
      begin
        grant update (role) on public.profiles to authenticated;
        perform set_config('request.jwt.claims', '{"sub":"${A.id}","role":"authenticated"}', true);
        set local role authenticated;
        begin
          update public.profiles set role = 'admin' where id = '${A.id}';
          raise exception 'NOT_BLOCKED';
        exception when others then
          reset role;
          raise exception 'RESULT:%', sqlerrm;
        end;
      end $$;`;
    await expect(runSql(query)).rejects.toThrow(/RESULT:profile_columns_protected/);
    const { data } = await admin.from("profiles").select("role").eq("id", A.id).single();
    expect(data?.role).toBe("user");
  });

  it("an admin account gets no extra access from the database (admins use server code)", async () => {
    await admin.from("profiles").update({ role: "admin" }).eq("id", A.id);
    const quiz = await createPublishedQuiz(B.id);
    expect((await A.db.from("quizzes").select("id").eq("id", quiz.id)).data).toEqual([]);
    expect((await A.db.from("profiles").select("id")).data).toEqual([{ id: A.id }]);
    expect((await A.db.from("quizzes").update({ name: "x" }).eq("id", quiz.id).select()).data ?? []).toHaveLength(0);
    expect((await A.db.from("admin_log").select("*")).data ?? []).toHaveLength(0);
    // and A still cannot change their own role while being an admin
    expect((await A.db.from("profiles").update({ role: "user" }).eq("id", A.id)).error).not.toBeNull();
  });
});
