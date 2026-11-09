import type { Metadata } from "next";
import { QuizRunner } from "@/components/quiz-runtime/quiz-runner";
import { dataMode } from "@/lib/env";
import { previewDescription } from "@/lib/og/text";
import { absoluteUrl, quizHref } from "@/lib/routes";
import { previewOf } from "@/server/public/summary";

/**
 * Quiz links are never listed by search engines (decision D5), but when one is shared (WhatsApp, Telegram, Facebook, X) it
 * shows the quiz's own title and words from its Start page, its length, and a picture (see `opengraph-image.tsx` beside this file).
 * A quiz that is not published or does not exist gets the plain words below.
 */
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const preview = dataMode === "supabase" ? await previewOf(slug) : null;
  const title = preview?.title || "Quiz";
  const description = preview ? previewDescription(preview.text, preview.questions, preview.time) : "Answer a few questions.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website", siteName: "Quiz", url: absoluteUrl(quizHref.public(slug)) },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** `/quiz/[slug]`: what people open to answer a quiz. The page itself loads the quiz, so the server sends only the empty frame. */
export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <QuizRunner source={{ kind: "live", slug }} />;
}
