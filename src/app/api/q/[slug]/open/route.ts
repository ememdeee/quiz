import { data } from "@/server/public/http";
import { openPublic } from "@/server/public/quiz-api";

/** Counts one visit (the browser asks once for each tab session). */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  await openPublic((await params).slug);
  return data({ status: "ok" });
}
