import type { Metadata } from "next";
import { DashHeader } from "@/components/dashboard/dash-header";
import { QuizListPage } from "@/components/dashboard/quiz-list/quiz-list-page";

export const metadata: Metadata = { title: "Your quizzes · Quiz", robots: { index: false } };

export default function DashboardPage() {
  return (
    <>
      <DashHeader />
      <QuizListPage />
    </>
  );
}
