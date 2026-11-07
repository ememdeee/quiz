// Small helper for the Mailtrap sandbox inbox (development emails, decision D20). Never prints secrets.
import { requireEnv } from "../db/env.ts";

const API = "https://mailtrap.io/api/accounts";

export type MailMessage = { id: number; subject: string; to_email: string; created_at: string };

function base(): string {
  return `${API}/${requireEnv("MAILTRAP_ACCOUNT_ID")}/inboxes/${requireEnv("MAILTRAP_INBOX_ID")}`;
}

async function call(path: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${requireEnv("MAILTRAP_API_TOKEN")}`, Accept: "application/json", ...init.headers },
  });
  if (!res.ok) throw new Error(`Mailtrap API ${init.method ?? "GET"} ${path || "/"} failed with status ${res.status}`);
  return res;
}

/** All messages in the inbox (newest first). */
export async function listMessages(): Promise<MailMessage[]> {
  return (await (await call("/messages")).json()) as MailMessage[];
}

/** The HTML body of one message. */
export async function readHtml(id: number): Promise<string> {
  return await (await call(`/messages/${id}/body.html`)).text();
}

/** The plain text body of one message (may be empty). */
export async function readText(id: number): Promise<string> {
  try {
    return await (await call(`/messages/${id}/body.txt`)).text();
  } catch {
    return ""; // some emails have no text part (the API answers 404)
  }
}

/** Deletes every message in the inbox. */
export async function deleteAll(): Promise<void> {
  await call("/clean", { method: "PATCH" });
}

/** Waits (polling) for a message sent to `email`; returns it or throws after `timeoutMs`. */
export async function waitForMessage(email: string, timeoutMs = 30_000): Promise<MailMessage> {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    const found = (await listMessages()).find((m) => m.to_email.toLowerCase() === email.toLowerCase());
    if (found) return found;
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`No email for the test person arrived within ${timeoutMs / 1000} seconds.`);
}
