import { MOCK_ADMIN_EMAIL, seedPeople } from "@/data/mock/admin";
import { overviewOf, queryPeople, quizCount, responseCount } from "@/lib/admin/people";
import type { AdminPerson } from "@/lib/admin/types";
import { fail, ok, type ActionResult, type ErrorCode } from "@/lib/errors";
import type { AdminRepo } from "../ports";
import { readFlags } from "./flags";

/**
 * The people the admin area shows, in localStorage next to the other dummy data. Changes (plan, suspend,
 * delete) are kept and every one is added to a log, as the real database will do in `admin_log`.
 */
const KEY = "quiz.mock.admin.v1";
const LOG_KEY = "quiz.mock.admin-log.v1";

let memory: AdminPerson[] | null = null;

function load(): AdminPerson[] {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return (memory = JSON.parse(raw) as AdminPerson[]);
  } catch {
    // Unreadable storage: start again from the seed
  }
  return (memory = seedPeople());
}

function save(people: AdminPerson[]) {
  memory = people;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(people));
  } catch {
    // Storage full or blocked: changes last until the page is closed
  }
}

export function resetAdmin() {
  save(seedPeople());
  try {
    window.localStorage.removeItem(LOG_KEY);
  } catch {
    // Nothing to clear
  }
}

/** Every suspend, restore, delete and plan change: who did it, to whom and when. */
function log(action: string, target: AdminPerson, details?: Record<string, unknown>) {
  try {
    const entries = JSON.parse(window.localStorage.getItem(LOG_KEY) ?? "[]") as unknown[];
    entries.push({ admin: MOCK_ADMIN_EMAIL, action, target: target.email, details, at: new Date().toISOString() });
    window.localStorage.setItem(LOG_KEY, JSON.stringify(entries));
  } catch {
    // The log is for the real database; here it is only a courtesy
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function gate(): Promise<ErrorCode | null> {
  const flags = readFlags();
  await wait(flags.slow ? 3000 : 250);
  if (flags.loggedOut) return "logged_out";
  return null;
}

/** Finds one person, changes them and saves, after the session check. */
async function change(id: string, apply: (person: AdminPerson) => AdminPerson | ErrorCode, note: string, details?: Record<string, unknown>): Promise<ActionResult<AdminPerson>> {
  const blocked = await gate();
  if (blocked) return fail(blocked);
  const people = load();
  const person = people.find((p) => p.id === id);
  if (!person) return fail("not_found");
  const result = apply(person);
  if (typeof result === "string") return fail(result);
  save(people.map((p) => (p.id === id ? result : p)));
  log(note, result, details);
  return ok(result);
}

export const mockAdmin: AdminRepo = {
  async overview() {
    const blocked = await gate();
    return blocked ? fail(blocked) : ok(overviewOf(load()));
  },

  async list(query) {
    const blocked = await gate();
    return blocked ? fail(blocked) : ok(queryPeople(load(), query));
  },

  async listAll(query) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    return ok(collectAll(query));
  },

  async get(id) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const person = load().find((p) => p.id === id);
    return person ? ok(person) : fail("not_found");
  },

  setPlan: (id, patch) => change(id, (person) => ({ ...person, ...patch }), "plan", { plan: patch.plan }),
  setNotes: (id, notes) => change(id, (person) => ({ ...person, notes }), "notes"),
  suspend: (id) => change(id, (person) => (person.email === MOCK_ADMIN_EMAIL ? "own_account" : { ...person, suspendedAt: new Date().toISOString() }), "suspend"),
  restore: (id) => change(id, (person) => ({ ...person, suspendedAt: null }), "restore"),

  async remove(id, typedEmail) {
    const blocked = await gate();
    if (blocked) return fail(blocked);
    const people = load();
    const person = people.find((p) => p.id === id);
    if (!person) return fail("not_found");
    if (person.email === MOCK_ADMIN_EMAIL) return fail("own_account");
    if (typedEmail.trim().toLowerCase() !== person.email.toLowerCase()) return fail("confirm_mismatch");
    log("delete", person, { quizzes: quizCount(person), responses: responseCount(person) });
    save(people.filter((p) => p.id !== id));
    return ok({ id });
  },
};

/** Every page of a search, one after the other. */
function collectAll(query: Parameters<AdminRepo["listAll"]>[0]) {
  const first = queryPeople(load(), { ...query, page: 1 });
  return Array.from({ length: first.pages }, (_, i) => queryPeople(load(), { ...query, page: i + 1 }).rows).flat();
}
