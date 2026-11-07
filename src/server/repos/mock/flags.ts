/**
 * Switches for states that are hard to reach by clicking (listed on /dev). Mock only: they sit in the
 * browser's localStorage next to the dummy data and are removed with the mock layer.
 */
export type MockFlags = {
  /** Every call takes 3 seconds, so the loading skeletons can be looked at */
  slow: boolean;
  /** The next quiz list fails once ("We couldn't load your quizzes") */
  failNextLoad: boolean;
  /** Pretend the connection is gone (the offline bar) */
  offline: boolean;
  /** Pretend the account was suspended while logged in */
  suspended: boolean;
  /** Pretend the session ended */
  loggedOut: boolean;
  /** The next answer saved in a quiz fails once ("We couldn't save your answer") */
  failNextSave: boolean;
  /** The next quiz opened by its link fails once ("Something went wrong") */
  failNextQuizLoad: boolean;
  /** The next autosave in the editor answers "changed somewhere else" once (the conflict dialog, gap G1) */
  conflictNextSave: boolean;
};

const KEY = "quiz.mock.flags.v1";
const EVENT = "quiz-mock-flags";

export const defaultFlags: MockFlags = { slow: false, failNextLoad: false, offline: false, suspended: false, loggedOut: false, failNextSave: false, failNextQuizLoad: false, conflictNextSave: false };

export function readFlags(): MockFlags {
  if (typeof window === "undefined") return defaultFlags;
  try {
    return { ...defaultFlags, ...JSON.parse(window.localStorage.getItem(KEY) ?? "{}") };
  } catch {
    return defaultFlags;
  }
}

export function writeFlags(patch: Partial<MockFlags>) {
  const next = { ...readFlags(), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked: the switches simply do nothing
  }
  window.dispatchEvent(new Event(EVENT));
}

/** Call `listener` whenever a switch changes (this tab or another). Returns the unsubscribe function. */
export function subscribeFlags(listener: () => void): () => void {
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
