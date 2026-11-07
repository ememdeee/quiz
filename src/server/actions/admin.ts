"use server";

import type { User } from "@supabase/supabase-js";
import { overviewOf, queryPeople } from "@/lib/admin/people";
import type { AdminOverviewData, AdminPerson, AdminQuiz, PeopleQuery, PersonRow, PlanPatch } from "@/lib/admin/types";
import { fail, ok, type ActionResult } from "@/lib/errors";
import { MEDIA_BUCKET } from "@/lib/media-url";
import { requireAdmin } from "@/server/auth/guards";
import { createAdminClient } from "@/server/supabase/admin";
import type { Database, Json } from "@/types/database";

/**
 * The admin area on Supabase (handover 7.1, 8.10). Only an admin gets past `requireAdmin`. Reads use the service key because
 * an admin has no special database rights, and only counts and profile facts are read: never what people answered.
 * Every change is written to `admin_log`. The people are put together in memory, which is fine for a few thousand
 * people; a database function replaces this when the list outgrows it.
 */
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const BAN_FOREVER = "876000h";

async function everyone(): Promise<AdminPerson[] | null> {
  const db = createAdminClient();
  const users: User[] = [];
  for (let page = 1; ; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return null;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }
  const [{ data: profiles }, { data: quizzes }] = await Promise.all([
    db.from("profiles").select("*"),
    db.from("quizzes").select("id, owner_id, name, accepting_responses, finished_count, updated_at, published_at, pages:draft->pages"),
  ]);
  if (!profiles || !quizzes) return null;

  const byOwner = new Map<string, AdminQuiz[]>();
  for (const quiz of quizzes) {
    const list = byOwner.get(quiz.owner_id) ?? [];
    list.push({
      id: quiz.id,
      name: quiz.name,
      status: quiz.published_at === null ? "not_published" : quiz.accepting_responses ? "open" : "closed",
      pages: Array.isArray(quiz.pages) ? quiz.pages.length : 0,
      responses: quiz.finished_count,
      updatedAt: quiz.updated_at,
    });
    byOwner.set(quiz.owner_id, list);
  }
  const profileOf = new Map<string, Profile>(profiles.map((profile) => [profile.id, profile]));

  return users.flatMap((user) => {
    const profile = profileOf.get(user.id);
    if (!profile) return [];
    return [personOf(user, profile, byOwner.get(user.id) ?? [])];
  });
}

function personOf(user: User, profile: Profile, quizzes: AdminQuiz[]): AdminPerson {
  return {
    id: user.id,
    name: profile.name || (user.email ?? "").split("@")[0],
    email: user.email ?? "",
    plan: profile.plan,
    brandColors: profile.brand_unlocked,
    hidePoweredBy: profile.can_hide_powered_by,
    customDomain: profile.custom_domain,
    overrides: { maxQuizzes: profile.max_quizzes, maxPages: profile.max_pages, maxResponses: profile.max_responses },
    emailVerified: Boolean(user.email_confirmed_at),
    signedUpAt: user.created_at,
    signsInWithGoogle: (user.app_metadata?.providers as string[] | undefined)?.includes("google") ?? false,
    suspendedAt: profile.status === "suspended" ? (profile.suspended_at ?? user.banned_until ?? new Date().toISOString()) : null,
    notes: profile.admin_notes ?? "",
    quizzes,
  };
}

async function logAction(adminId: string, action: string, targetId: string | null, details?: Json) {
  await createAdminClient().from("admin_log").insert({ admin_id: adminId, action, target_user_id: targetId, details: details ?? null });
}

export async function adminOverviewAction(): Promise<ActionResult<AdminOverviewData>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const people = await everyone();
  return people ? ok(overviewOf(people)) : fail("load_failed");
}

export async function adminListAction(query: PeopleQuery): Promise<ActionResult<{ rows: PersonRow[]; total: number; page: number; pages: number }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const people = await everyone();
  return people ? ok(queryPeople(people, query)) : fail("load_failed");
}

export async function adminListAllAction(query: Omit<PeopleQuery, "page">): Promise<ActionResult<PersonRow[]>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const people = await everyone();
  if (!people) return fail("load_failed");
  const first = queryPeople(people, { ...query, page: 1 });
  return ok(Array.from({ length: first.pages }, (_, i) => queryPeople(people, { ...query, page: i + 1 }).rows).flat());
}

async function findPerson(id: string): Promise<AdminPerson | null> {
  const people = await everyone();
  return people?.find((person) => person.id === id) ?? null;
}

export async function adminGetAction(id: string): Promise<ActionResult<AdminPerson>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const person = await findPerson(id);
  return person ? ok(person) : fail("not_found");
}

export async function adminSetPlanAction(id: string, patch: PlanPatch): Promise<ActionResult<AdminPerson>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const limits = [patch.overrides.maxQuizzes, patch.overrides.maxPages, patch.overrides.maxResponses];
  if (limits.some((value) => value !== null && (!Number.isInteger(value) || value < 1))) return fail("invalid_limit");

  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      plan: patch.plan,
      brand_unlocked: patch.brandColors,
      can_hide_powered_by: patch.hidePoweredBy,
      custom_domain: patch.customDomain,
      max_quizzes: patch.overrides.maxQuizzes,
      max_pages: patch.overrides.maxPages,
      max_responses: patch.overrides.maxResponses,
    })
    .eq("id", id);
  if (error) return fail("load_failed");
  await logAction(auth.data.userId, "plan", id, { plan: patch.plan });
  const person = await findPerson(id);
  return person ? ok(person) : fail("not_found");
}

export async function adminSetNotesAction(id: string, notes: string): Promise<ActionResult<AdminPerson>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const { error } = await createAdminClient().from("profiles").update({ admin_notes: notes.slice(0, 5000) }).eq("id", id);
  if (error) return fail("load_failed");
  const person = await findPerson(id);
  return person ? ok(person) : fail("not_found");
}

/** Suspending closes the person's quizzes (the public read treats them as closed) and blocks login. Nothing is deleted. */
export async function adminSuspendAction(id: string): Promise<ActionResult<AdminPerson>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  if (id === auth.data.userId) return fail("own_account");
  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ status: "suspended", suspended_at: new Date().toISOString() }).eq("id", id);
  if (error) return fail("load_failed");
  await db.auth.admin.updateUserById(id, { ban_duration: BAN_FOREVER });
  await logAction(auth.data.userId, "suspend", id);
  const person = await findPerson(id);
  return person ? ok(person) : fail("not_found");
}

export async function adminRestoreAction(id: string): Promise<ActionResult<AdminPerson>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ status: "active", suspended_at: null }).eq("id", id);
  if (error) return fail("load_failed");
  await db.auth.admin.updateUserById(id, { ban_duration: "none" });
  await logAction(auth.data.userId, "restore", id);
  const person = await findPerson(id);
  return person ? ok(person) : fail("not_found");
}

/** Deleting asks for the person's email, takes the account, quizzes, answers and pictures with it, and cannot be done to oneself. */
export async function adminRemoveAction(id: string, typedEmail: string): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.ok) return auth;
  if (id === auth.data.userId) return fail("own_account");
  const person = await findPerson(id);
  if (!person) return fail("not_found");
  if (typedEmail.trim().toLowerCase() !== person.email.toLowerCase()) return fail("confirm_mismatch");

  const db = createAdminClient();
  const { data: files } = await db.storage.from(MEDIA_BUCKET).list(id, { limit: 1000 });
  if (files && files.length > 0) await db.storage.from(MEDIA_BUCKET).remove(files.map((file) => `${id}/${file.name}`));
  const { error } = await db.auth.admin.deleteUser(id);
  if (error) return fail("load_failed");
  await logAction(auth.data.userId, "delete", id, { quizzes: person.quizzes.length, responses: person.quizzes.reduce((sum, quiz) => sum + quiz.responses, 0) });
  return ok({ id });
}
