// `npm run db:check`: fails if any table in the public schema has Row Level Security off,
// or if the storage bucket / private schema rights are not as designed. Prints no secrets.
import { runSql } from "./sql.ts";

type Row = Record<string, unknown>;
const problems: string[] = [];

const tables = await runSql<Row>(`
  select c.relname as name, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p')
  order by 1`);
for (const t of tables) if (!t.rls) problems.push(`RLS is OFF on public.${t.name}`);
if (tables.length === 0) problems.push("no tables found in public (were the migrations applied?)");

const policies = await runSql<Row>(`select count(*)::int as n from pg_policies where schemaname = 'public'`);

const bucket = await runSql<Row>(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'quiz-media'`);
if (bucket.length !== 1) problems.push("storage bucket quiz-media is missing");
else {
  if (bucket[0].file_size_limit !== 5242880) problems.push("quiz-media size limit is not 5 MB");
  if (bucket[0].public !== true) problems.push("quiz-media is not public");
}

const priv = await runSql<Row>(`
  select has_schema_privilege('anon', 'private', 'usage') or has_schema_privilege('authenticated', 'private', 'usage') as open`);
if (priv[0]?.open) problems.push("the private schema is usable by anon/authenticated");

const anonFns = await runSql<Row>(`
  select count(*)::int as n from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname in ('public', 'private') and has_function_privilege('anon', p.oid, 'execute')`);
if ((anonFns[0]?.n as number) > 0) problems.push("anon can execute functions");

console.log(`tables in public: ${tables.length}, with RLS: ${tables.filter((t) => t.rls).length}, policies: ${policies[0]?.n}`);
if (problems.length) {
  console.error("DB CHECK FAILED:\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log("DB CHECK OK");
