import type { Metadata } from "next";
import { EditorPage } from "@/components/editor/editor-page";

export const metadata: Metadata = { title: "Edit quiz · Quiz", robots: { index: false } };

export default async function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return <EditorPage quizId={quizId} />;
}
