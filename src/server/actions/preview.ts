"use server";

import { ok, type ActionResult } from "@/lib/errors";
import { mediaUrl } from "@/lib/media-url";
import { pictureIds } from "@/lib/quiz/pictures";
import { quizDocumentSchema } from "@/lib/quiz/schema";
import { requireUser } from "@/server/auth/guards";
import type { PublicLoad } from "@/server/repos/ports";

/** "Try it": the owner's working copy (draft) with the owner's pictures, for the owner only. Nothing about it is ever saved. */
export async function loadPreviewAction(quizId: string): Promise<ActionResult<PublicLoad>> {
  const auth = await requireUser();
  if (!auth.ok) return auth;
  const { data: quiz } = await auth.data.supabase.from("quizzes").select("draft, hide_powered_by").eq("id", quizId).maybeSingle();
  const parsed = quiz ? quizDocumentSchema.safeParse(quiz.draft) : null;
  if (!quiz || !parsed?.success) return ok({ status: "not_found" });

  const pictures: Record<string, string> = {};
  const ids = pictureIds(parsed.data);
  if (ids.length > 0) {
    const { data } = await auth.data.supabase.from("media").select("id, path").in("id", ids);
    for (const row of data ?? []) pictures[row.id] = mediaUrl(row.path);
  }
  const showPoweredBy = !(auth.data.profile.can_hide_powered_by && quiz.hide_powered_by);
  return ok({ status: "live", quiz: { quizId, document: parsed.data, pictures, showPoweredBy, theme: null } });
}

