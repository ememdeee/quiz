import type { Metadata } from "next";
import { QuizPlaceholder } from "@/components/dashboard/quiz-placeholder";

export const metadata: Metadata = { title: "Quiz settings · Quiz", robots: { index: false } };

export default async function SettingsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return <QuizPlaceholder quizId={quizId} />;
}
