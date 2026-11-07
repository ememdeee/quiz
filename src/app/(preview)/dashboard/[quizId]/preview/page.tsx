import type { Metadata } from "next";
import { QuizRunner } from "@/components/quiz-runtime/quiz-runner";

export const metadata: Metadata = { title: "Preview · Quiz", robots: { index: false, follow: false } };

/** `/dashboard/[quizId]/preview`: the quiz exactly as people will see it, including changes not published yet. Saves nothing. */
export default async function PreviewPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return <QuizRunner source={{ kind: "preview", quizId }} />;
}
