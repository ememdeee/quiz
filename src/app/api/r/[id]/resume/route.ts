import { answer, data, readJson } from "@/server/public/http";
import { resumePublic } from "@/server/public/quiz-api";

/** What this browser saved earlier. A wrong token looks exactly like nothing saved. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = (await readJson(request)) as { token?: unknown } | null;
  if (!body || typeof body.token !== "string") return answer("invalid");
  const saved = await resumePublic((await params).id, body.token);
  return saved ? data({ status: "ok", saved }) : answer("not_found");
}
