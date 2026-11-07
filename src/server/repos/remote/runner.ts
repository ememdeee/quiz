import { fail, ok, type ActionResult } from "@/lib/errors";
import type { PublicLoad, RunnerRepo, SavedRun } from "../ports";

/**
 * The people answering a quiz, over the public endpoints (/api/q/*, /api/r/*). No account: this browser remembers the response id
 * and its secret token in localStorage, and sends the token with every save.
 */
const KEY = (quizId: string) => `quiz.run.${quizId}`;
/** The address of each quiz this tab opened, because the repo is asked by quiz id but the endpoints use the address. */
const slugOf = new Map<string, string>();

type Remembered = { responseId: string; token: string };

function remembered(quizId: string): Remembered | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(KEY(quizId)) ?? "null") as Remembered | null;
    return value && typeof value.responseId === "string" && typeof value.token === "string" ? value : null;
  } catch {
    return null;
  }
}

function remember(quizId: string, value: Remembered | null) {
  try {
    if (value) window.localStorage.setItem(KEY(quizId), JSON.stringify(value));
    else window.localStorage.removeItem(KEY(quizId));
  } catch {
    // Storage blocked: the person simply starts fresh next time
  }
}

async function post(path: string, body: unknown): Promise<{ status: number; json: Record<string, unknown> }> {
  const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}), cache: "no-store" });
  return { status: response.status, json: (await response.json().catch(() => ({}))) as Record<string, unknown> };
}

export const remoteRunner: Omit<RunnerRepo, "loadPreview"> = {
  async load(slug): Promise<ActionResult<PublicLoad>> {
    try {
      const response = await fetch(`/api/q/${encodeURIComponent(slug)}`, { cache: "no-store" });
      if (!response.ok) return fail("load_failed");
      const loaded = (await response.json()) as PublicLoad;
      if (loaded.status === "live") slugOf.set(loaded.quiz.quizId, slug);
      return ok(loaded);
    } catch {
      return fail("load_failed");
    }
  },

  async trackOpen(quizId) {
    const slug = slugOf.get(quizId);
    if (slug) await post(`/api/q/${encodeURIComponent(slug)}/open`, {}).catch(() => undefined);
  },

  async resume(quizId): Promise<SavedRun | null> {
    const saved = remembered(quizId);
    if (!saved) return null;
    try {
      const { status, json } = await post(`/api/r/${saved.responseId}/resume`, { token: saved.token });
      if (status !== 200 || !json.saved) {
        // Not ours any more (deleted, or a wrong token): forget it
        if (status === 404 || status === 403) remember(quizId, null);
        return null;
      }
      return json.saved as SavedRun;
    } catch {
      return null;
    }
  },

  async start(quizId) {
    const slug = slugOf.get(quizId);
    if (!slug) return fail("not_found");
    try {
      const { status, json } = await post(`/api/q/${encodeURIComponent(slug)}/start`, {});
      if (status === 409) return fail("quiz_closed");
      if (status !== 200 || typeof json.responseId !== "string" || typeof json.token !== "string") return fail(status === 429 ? "rate_limited" : "load_failed");
      remember(quizId, { responseId: json.responseId, token: json.token });
      return ok({ responseId: json.responseId });
    } catch {
      return fail("load_failed");
    }
  },

  async save(quizId, responseId, progress) {
    const saved = remembered(quizId);
    if (!saved || saved.responseId !== responseId) return fail("not_found");
    try {
      const { status } = await post(`/api/r/${responseId}/${progress.finished ? "finish" : "answer"}`, {
        token: saved.token,
        progress: {
          answers: Object.fromEntries(Object.entries(progress.answers).map(([id, answer]) => [id, answer.v])),
          pagesSeen: progress.pagesSeen,
          lastPageId: progress.lastPageId,
        },
      });
      if (status === 200) return ok(null);
      if (status === 409) return fail("quiz_closed");
      return fail(status === 429 ? "rate_limited" : "load_failed");
    } catch {
      return fail("load_failed");
    }
  },
};
