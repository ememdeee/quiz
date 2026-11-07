import type { Metadata } from "next";
import { DashHeader } from "@/components/dashboard/dash-header";
import { QuizPlaceholder } from "@/components/dashboard/quiz-placeholder";

export const metadata: Metadata = { title: "Responses · Quiz", robots: { index: false } };

export default async function ResponsesPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return (
    <>
      <DashHeader />
      <QuizPlaceholder quizId={quizId} />
    </>
  );
}
