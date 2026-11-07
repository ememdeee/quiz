import { answer, readJson } from "@/server/public/http";
import { savePublic } from "@/server/public/quiz-api";

/** Saves a person's answers so far and marks them finished. Needs the secret token of the response. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = (await readJson(request)) as { token?: unknown; progress?: unknown } | null;
  if (!body || typeof body.token !== "string") return answer("invalid");
  return answer(await savePublic((await params).id, body.token, body.progress, true));
}
