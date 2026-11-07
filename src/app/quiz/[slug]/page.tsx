import type { Metadata } from "next";
import { QuizRunner } from "@/components/quiz-runtime/quiz-runner";

// Quiz links are never listed by search engines (decision D5)
export const metadata: Metadata = { title: "Quiz", robots: { index: false, follow: false } };

/** `/quiz/[slug]`: what people open to answer a quiz. The page itself loads the quiz, so the server sends only the empty frame. */
export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizRunner source={{ kind: "live", slug }} />;
}
