import { NextResponse } from "next/server";
import { createAdminClient } from "@/server/supabase/admin";

const noStore = { "Cache-Control": "no-store" };

/**
 * Keep-alive for the free Supabase plan (it pauses a project after 7 days without activity).
 * Opening this link runs one tiny real query, which counts as activity. It returns no data, only ok, the time it took and when.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const { error } = await createAdminClient().from("quizzes").select("id", { head: true, count: "exact" }).limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true, database: "awake", ms: Date.now() - startedAt, checkedAt: new Date().toISOString() }, { headers: noStore });
  } catch {
    return NextResponse.json({ ok: false, database: "unreachable", ms: Date.now() - startedAt, checkedAt: new Date().toISOString() }, { status: 503, headers: noStore });
  }
}
