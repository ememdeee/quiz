import type { Metadata } from "next";
import { Suspense } from "react";
import { ResponsesPage } from "@/components/responses/responses-page";

export const metadata: Metadata = { title: "Responses · Quiz", robots: { index: false } };

export default async function ResponsesRoute({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  return (
    <Suspense>
      <ResponsesPage quizId={quizId} />
    </Suspense>
  );
}
