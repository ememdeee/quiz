import "server-only";
import { pageTypes } from "@/lib/quiz/page-types";
import { quizDocumentSchema } from "@/lib/quiz/schema";
import { estimateMinutes, takesAbout } from "@/lib/quiz/time-estimate";
import { createAdminClient } from "@/server/supabase/admin";

/** What a link preview of a quiz needs: the Start page's words, never anything from the draft or from answers. */
export type QuizPreview = { title: string; text: string; time: string };

export async function previewOf(slug: string): Promise<QuizPreview | null> {
  try {
    const { data } = await createAdminClient().from("quizzes").select("published").eq("slug", slug).maybeSingle();
    const parsed = quizDocumentSchema.safeParse(data?.published);
    if (!parsed.success) return null;
    const start = parsed.data.pages.find((page) => page.type === "welcome");
    if (!start || start.type !== "welcome") return null;
    const questions = parsed.data.pages.filter((page) => pageTypes[page.type].isQuestion).length;
    return { title: start.title || parsed.data.name, text: start.text.slice(0, 140), time: questions > 0 ? takesAbout(estimateMinutes(parsed.data)) : "" };
  } catch {
    return null;
  }
}
