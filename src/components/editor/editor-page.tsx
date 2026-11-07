"use client";

import { DashHeader } from "@/components/dashboard/dash-header";
import { EditorSkeleton } from "@/components/dashboard/editor-skeleton";
import { ErrorCard } from "@/components/dashboard/error-card";
import { ButtonLink } from "@/components/ui/button";
import { dashErrors } from "@/content/dashboard/common";
import { useQuiz } from "@/hooks/use-quizzes";
import { routes } from "@/lib/routes";
import { Editor } from "./editor";

/** `/dashboard/[quizId]`: the grey blocks while the quiz opens, "We can't find this quiz", or the editor (boards Saving, DashErrors, Main). */
export function EditorPage({ quizId, openSettings = false }: { quizId: string; openSettings?: boolean }) {
  const state = useQuiz(quizId);
  if (state.status === "ready") return <Editor key={quizId} bundle={state.bundle} openSettings={openSettings} />;
  return (
    <>
      <DashHeader />
      <main className="mx-auto flex max-w-[1080px] flex-col gap-8 px-8 py-12">
        {state.status === "loading" ? (
          <EditorSkeleton />
        ) : (
          <ErrorCard
            title={dashErrors.quizNotFound.title}
            action={
              <ButtonLink href={routes.dashboard} variant="secondary" shape="box" size="sm">
                {dashErrors.quizNotFound.back}
              </ButtonLink>
            }
          >
            {dashErrors.quizNotFound.text}
          </ErrorCard>
        )}
      </main>
    </>
  );
}
