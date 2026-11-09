import "server-only";
import { pageTypes } from "@/lib/quiz/page-types";
import { quizDocumentSchema } from "@/lib/quiz/schema";
import { estimateMinutes, takesAbout } from "@/lib/quiz/time-estimate";
import { mediaUrl } from "@/lib/media-url";
import { createAdminClient } from "@/server/supabase/admin";

/** What a link preview of a quiz needs: the Start page's words and picture, never anything from the draft or from answers. */
export type QuizPreview = {
  title: string;
  text: string;
  /** "Takes about 2 minutes", or "" when the quiz asks nothing */
  time: string;
  questions: number;
  /** The Start page's picture (the owner's own, from the public bucket), or null */
  picture: string | null;
  /** false when the owner's plan hides "Powered by Quiz" and chose to */
  showBrand: boolean;
};

export async function previewOf(slug: string): Promise<QuizPreview | null> {
  try {
    const db = createAdminClient();
    const { data } = await db.from("quizzes").select("published, owner_id, hide_powered_by").eq("slug", slug).maybeSingle();
    const parsed = quizDocumentSchema.safeParse(data?.published);
    if (!data || !parsed.success) return null;
    const start = parsed.data.pages.find((page) => page.type === "welcome");
    if (!start || start.type !== "welcome") return null;
    const [media, owner] = await Promise.all([
      start.picture ? db.from("media").select("path").eq("id", start.picture).eq("owner_id", data.owner_id).maybeSingle() : null,
      db.from("profiles").select("can_hide_powered_by").eq("id", data.owner_id).maybeSingle(),
    ]);
    const questions = parsed.data.pages.filter((page) => pageTypes[page.type].isQuestion).length;
    return {
      title: start.title || parsed.data.name,
      text: start.text.slice(0, 200),
      time: questions > 0 ? takesAbout(estimateMinutes(parsed.data)) : "",
      questions,
      picture: media?.data?.path ? mediaUrl(media.data.path) : null,
      showBrand: !(owner.data?.can_hide_powered_by && data.hide_powered_by),
    };
  } catch {
    return null;
  }
}
