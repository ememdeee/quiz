import "server-only";
import { NextResponse } from "next/server";
import type { Answered } from "./quiz-api";

/** How the public endpoints answer. The browser code (repos/remote/runner.ts) reads these words. */
const statusFor: Record<Answered, number> = { ok: 200, closed: 409, not_found: 404, bad_token: 403, invalid: 422, rate_limited: 429, already_finished: 409, failed: 500 };

export const answer = (status: Answered) => NextResponse.json({ status }, { status: statusFor[status], headers: { "Cache-Control": "no-store" } });
export const data = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const MAX_BODY = 200_000;

/** The JSON a person sent, or null when it is missing, too big or not JSON. */
export async function readJson(request: Request): Promise<unknown | null> {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return null;
  const text = await request.text();
  if (text.length > MAX_BODY) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
