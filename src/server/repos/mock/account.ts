import { MOCK_PASSWORD } from "@/data/mock/accounts";
import { mockProfile } from "@/data/mock/seed";
import { fail, ok, type ActionResult, type ErrorCode } from "@/lib/errors";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/lib/validation";
import type { AccountRepo, AccountState } from "../ports";
import { readFlags } from "./flags";

/** The signed-in person's own details, kept in localStorage. Nothing is sent anywhere. */
const KEY = "quiz.mock.account.v1";

type Stored = Omit<AccountState, "canDisconnectGoogle">;

const seed = (): Stored => ({ name: mockProfile.name, email: mockProfile.email, pendingEmail: null, hasPassword: true, googleConnected: false });

/** Google can go when the person has a password to log in with instead (the real rule is in `server/actions/account.ts`). */
const withDerived = (state: Stored): AccountState => ({ ...state, canDisconnectGoogle: state.googleConnected && state.hasPassword });

let memory: AccountState | null = null;

function load(): AccountState {
  if (memory) return memory;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return (memory = withDerived(JSON.parse(raw) as Stored));
  } catch {
    // Unreadable storage: start again from the seed
  }
  return (memory = withDerived(seed()));
}

export function saveAccount(state: Stored) {
  memory = withDerived(state);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage blocked: changes last until the page is closed
  }
}

/** /dev: reset the details, or make the account one that logs in with Google only. */
export function resetAccount(googleOnly = false) {
  saveAccount(googleOnly ? { ...seed(), hasPassword: false, googleConnected: true } : seed());
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function gate(): Promise<ErrorCode | null> {
  const flags = readFlags();
  await wait(flags.slow ? 3000 : 250);
  if (flags.loggedOut) return "logged_out";
  if (flags.suspended) return "suspended";
  return null;
}

/** Runs one change after the session check and saves what it returns. */
async function change(apply: (state: AccountState) => AccountState | ErrorCode): Promise<ActionResult<AccountState>> {
  const blocked = await gate();
  if (blocked) return fail(blocked);
  const result = apply(load());
  if (typeof result === "string") return fail(result);
  saveAccount(result);
  return ok(load());
}

export const mockAccount: AccountRepo = {
  async get() {
    const blocked = await gate();
    return blocked ? fail(blocked) : ok(load());
  },
  updateName: (name) => change((state) => ({ ...state, name: name.trim() === "" ? state.name : name })),
  requestEmailChange: (email) =>
    change((state) => {
      const next = email.trim().toLowerCase();
      if (!isValidEmail(next)) return "invalid_email";
      return next === state.email ? { ...state, pendingEmail: null } : { ...state, pendingEmail: next };
    }),
  resendEmailChange: () => change((state) => state),
  cancelEmailChange: () => change((state) => ({ ...state, pendingEmail: null })),
  setPassword: ({ current, next }) =>
    change((state) => {
      if (state.hasPassword && current !== MOCK_PASSWORD) return "wrong_password";
      return next.length < PASSWORD_MIN_LENGTH ? "password_short" : { ...state, hasPassword: true };
    }),
  connectGoogle: () => change((state) => ({ ...state, googleConnected: true })),
  disconnectGoogle: () => change((state) => (state.canDisconnectGoogle ? { ...state, googleConnected: false } : "load_failed")),
};
