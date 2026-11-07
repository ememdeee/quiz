import { answer, data } from "@/server/public/http";
import { startPublic } from "@/server/public/quiz-api";

/** Presses "Start the quiz": makes a response and hands out its secret token once. */
export async function POST(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const result = await startPublic((await params).slug);
  return result.status === "open" ? data(result) : answer(result.status);
}
