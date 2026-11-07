import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Reads .env.local the same way scripts/with-env.mjs does (values are never printed). */
function loadEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const line of readFileSync(join(process.cwd(), ".env.local"), "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (match) env[match[1]] = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
  }
  return env;
}

const env = loadEnv();

/** The service-role client of the dev project: it makes and removes the test people. */
export const admin: SupabaseClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const PASSWORD = "Qc-test-pass-1";

const runId = Date.now().toString(36);
let counter = 0;
const made: string[] = [];

/** A new person in the dev project. Removed again by `cleanup`. */
export async function makePerson(options: { verified?: boolean; name?: string; role?: "user" | "admin"; password?: string } = {}) {
  counter += 1;
  const email = `qc-${runId}-${counter}@example.com`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: options.password ?? PASSWORD,
    email_confirm: options.verified ?? true,
    user_metadata: { name: options.name ?? "QC Person" },
  });
  if (error || !data.user) throw new Error(`could not create ${email}: ${error?.message}`);
  made.push(data.user.id);
  if (options.role === "admin") await admin.from("profiles").update({ role: "admin" }).eq("id", data.user.id);
  return { id: data.user.id, email };
}

export const emailOf = (n: number) => `qc-${runId}-${n}@example.com`;
export const freshEmail = () => {
  counter += 1;
  return emailOf(counter);
};

/** Deletes every person made in this run (their quizzes and answers go with them) and clears the sign-in lock. */
export async function cleanup() {
  for (const id of made.splice(0)) await admin.auth.admin.deleteUser(id);
  await admin.from("login_attempts").delete().like("email", `qc-${runId}-%`);
}

/** Removes a person found by email (for people made through the website itself). */
export async function removeByEmail(email: string) {
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = data.users.find((u) => u.email === email);
  if (found) await admin.auth.admin.deleteUser(found.id);
}
