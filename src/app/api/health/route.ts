import { NextResponse } from "next/server";

/** For uptime monitoring: the site is up. */
export function GET() {
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
