import { answer, data } from "@/server/public/http";
import { loadPublic } from "@/server/public/quiz-api";

/** The quiz people open: only the published copy, never the draft. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await loadPublic(slug);
  return result === "rate_limited" ? answer("rate_limited") : data(result);
}
