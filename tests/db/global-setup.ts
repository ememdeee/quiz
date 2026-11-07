// Runs once before all database tests: creates three real test people (email confirmed) with the
// Auth admin API, signs each in with the publishable key, and removes them (and their files) at the end.
import { createClient } from "@supabase/supabase-js";
import type { TestProject } from "vitest/node";
import { assertDevProject, loadEnv, requireEnv } from "./env.ts";

export type TestUserInfo = { id: string; email: string; accessToken: string };

declare module "vitest" {
  export interface ProvidedContext {
    users: TestUserInfo[];
  }
}

const isTestEmail = (email?: string | null) => !!email && /^qc-[a-z0-9]+@example\.test$/.test(email);

export default async function setup(project: TestProject) {
  loadEnv();
  assertDevProject();
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const opts = { auth: { persistSession: false, autoRefreshToken: false } };
  const admin = createClient(url, serviceKey, opts);

  const removeUser = async (id: string) => {
    const { data: files } = await admin.storage.from("quiz-media").list(id, { limit: 1000 });
    if (files?.length) await admin.storage.from("quiz-media").remove(files.map((f) => `${id}/${f.name}`));
    await admin.auth.admin.deleteUser(id);
  };

  // Leftovers from a crashed earlier run
  const { data: existing } = await admin.auth.admin.listUsers({ perPage: 200 });
  for (const u of existing?.users ?? []) if (isTestEmail(u.email)) await removeUser(u.id);

  const users: TestUserInfo[] = [];
  const created: string[] = [];
  for (const label of ["a", "b", "c"]) {
    const rand = Math.random().toString(36).slice(2, 10);
    const email = `qc-${label}${rand}@example.test`;
    const password = `Pw-${crypto.randomUUID()}`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: `QC ${label.toUpperCase()}` },
    });
    if (error || !data.user) throw new Error(`Could not create test user: ${error?.message}`);
    created.push(data.user.id);
    const client = createClient(url, anonKey, opts);
    const { data: session, error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError || !session.session) throw new Error(`Could not sign in test user: ${signInError?.message}`);
    users.push({ id: data.user.id, email, accessToken: session.session.access_token });
  }
  project.provide("users", users);

  return async () => {
    for (const id of created) await removeUser(id);
  };
}
