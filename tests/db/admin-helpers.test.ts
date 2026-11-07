 
import { describe, expect, it } from "vitest";
import { anon, people, runSql } from "./helpers.ts";

describe("admin helpers and function rights", () => {
  const { A } = people();

  it("the private schema is not exposed through the API", async () => {
    const viaAnon = await (anon as any).schema("private").rpc("admin_overview");
    const viaPerson = await (A.db as any).schema("private").rpc("admin_overview");
    expect(viaAnon.error).not.toBeNull();
    expect(viaPerson.error).not.toBeNull();
    expect((await A.db.rpc("admin_overview")).error).not.toBeNull(); // no public copy either
    expect((await A.db.rpc("admin_users_page")).error).not.toBeNull();
  });

  it("anon and authenticated have no right on the private schema or its functions", async () => {
    const rows = await runSql<any>(`
      select has_schema_privilege('anon', 'private', 'usage') as anon_schema,
             has_schema_privilege('authenticated', 'private', 'usage') as auth_schema,
             has_schema_privilege('service_role', 'private', 'usage') as service_schema`);
    expect(rows[0]).toEqual({ anon_schema: false, auth_schema: false, service_schema: true });

    const fns = await runSql<any>(`
      select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'private'
        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))`);
    expect(fns).toEqual([]);
  });

  it("anon can execute no function at all in public or private", async () => {
    const rows = await runSql<any>(`
      select n.nspname, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'execute')`);
    expect(rows).toEqual([]);
  });

  it("logged-in people can execute only the three RPCs meant for them", async () => {
    const rows = await runSql<any>(`
      select p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public' and has_function_privilege('authenticated', p.oid, 'execute')
      order by 1`);
    expect(rows.map((r) => r.proname)).toEqual(["publish_quiz", "save_draft", "slug_available"]);
  });

  it("admin helpers work for the service role and return no response content", async () => {
    const overview = await runSql<any>("select private.admin_overview() as o");
    expect(Object.keys(overview[0].o).sort()).toEqual([
      "quizzes_published", "quizzes_total", "responses_finished", "users_new_7d", "users_suspended", "users_total",
    ]);
    const page = await runSql<any>("select * from private.admin_users_page(null, 5, 0)");
    for (const row of page) {
      expect(Object.keys(row)).not.toContain("answers");
    }
    const { id } = A;
    const detail = await runSql<any>(`select private.admin_user_detail('${id}') as d`);
    expect(detail[0].d.id).toBe(id);
    expect(Object.keys(detail[0].d)).not.toContain("answers");
  });

  it("every table in public has RLS on", async () => {
    const rows = await runSql<any>(`
      select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity`);
    expect(rows).toEqual([]);
  });
});
