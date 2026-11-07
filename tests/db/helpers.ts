/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { inject } from "vitest";
import { assertDevProject, loadEnv, requireEnv } from "./env.ts";

export { runSql } from "./sql.ts";

loadEnv();
assertDevProject(); // (a) refuses to run unless the URL is the dev project

const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const opts = { auth: { persistSession: false, autoRefreshToken: false } };

export const HASH = "a".repeat(64); // a fake token hash for responses
export const ALL_TABLES = [
  "profiles", "quizzes", "responses", "quiz_daily_stats", "media", "slug_holds",
  "email_changes", "login_attempts", "rate_limits", "contact_messages", "admin_log",
] as const;

/** Service role client: bypasses RLS. Used to set things up and to check results. */
export const admin: SupabaseClient<any> = createClient(url, serviceKey, opts);
/** A stranger: the publishable key and no session. */
export const anon: SupabaseClient<any> = createClient(url, anonKey, opts);

export type TestUser = { id: string; email: string; db: SupabaseClient<any>; token: string };

/** The three signed-in test people (b) created in global-setup. */
export function people(): { A: TestUser; B: TestUser; C: TestUser } {
  const [a, b, c] = inject("users").map((u) => ({
    id: u.id,
    email: u.email,
    token: u.accessToken,
    db: createClient<any>(url, anonKey, {
      ...opts,
      global: { headers: { Authorization: `Bearer ${u.accessToken}` } },
    }),
  }));
  return { A: a, B: b, C: c };
}

export const rand = () => Math.random().toString(36).slice(2, 10);
export const newSlug = (prefix = "qc") => `${prefix}-${rand()}`;

export function doc(pageCount = 2, name = "QC quiz") {
  const pages: any[] = [{ id: "welcome1", type: "welcome", title: name, text: "", picture: null }];
  for (let i = 0; i < pageCount - 2; i++) pages.push({ id: `p${i}`, type: "info", title: `Page ${i}`, text: "", picture: null });
  pages.push({ id: "end1", type: "end", style: "thanks", title: "Thank you!", text: "", picture: null });
  return { format: "quiz-v1", name, pages };
}

/** Creates a quiz as the person (with their own session, like the app does). */
export async function createQuizAs(user: TestUser, extra: Record<string, unknown> = {}) {
  return user.db
    .from("quizzes")
    .insert({ owner_id: user.id, name: "QC quiz", slug: newSlug(), draft: doc(), ...extra })
    .select()
    .single();
}

/** Creates a published quiz with the service role (full control of every column). */
export async function createPublishedQuiz(ownerId: string, extra: Record<string, unknown> = {}) {
  const d = doc();
  const { data, error } = await admin
    .from("quizzes")
    .insert({
      owner_id: ownerId, name: "QC published", slug: newSlug(), draft: d,
      published: d, published_version: 1, published_at: new Date().toISOString(), ...extra,
    })
    .select()
    .single();
  if (error) throw new Error(`createPublishedQuiz: ${error.message}`);
  return data;
}

/** Puts a person back to a clean state (no quizzes, pictures, holds; default plan and limits). */
export async function resetUser(id: string) {
  await admin.from("quizzes").delete().eq("owner_id", id);
  await admin.from("media").delete().eq("owner_id", id);
  await admin.from("slug_holds").delete().eq("owner_id", id);
  await admin.from("profiles").update({
    name: "", role: "user", plan: "free", status: "active", suspended_at: null,
    max_quizzes: null, max_pages: null, max_responses: null,
    brand_unlocked: false, can_hide_powered_by: false, custom_domain: null, admin_notes: null,
  }).eq("id", id);
}

export async function resetAll() {
  const { A, B, C } = people();
  for (const u of [A, B, C]) await resetUser(u.id);
}

export async function getQuiz(id: string) {
  const { data } = await admin.from("quizzes").select("*").eq("id", id).maybeSingle();
  return data;
}

export const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "base64",
);
