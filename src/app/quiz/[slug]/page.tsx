import type { Metadata } from "next";
import { QuizRunner } from "@/components/quiz-runtime/quiz-runner";
import { dataMode } from "@/lib/env";
import { previewOf } from "@/server/public/summary";

/** Quiz links are never listed by search engines (decision D5), but they get a proper title and preview picture when shared. */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const preview = dataMode === "supabase" ? await previewOf((await params).slug) : null;
  const title = preview?.title ?? "Quiz";
  return { title, description: preview?.text || "Answer a few questions.", robots: { index: false, follow: false }, openGraph: { title, description: preview?.text || undefined } };
}

/** `/quiz/[slug]`: what people open to answer a quiz. The page itself loads the quiz, so the server sends only the empty frame. */
export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizRunner source={{ kind: "live", slug }} />;
}
