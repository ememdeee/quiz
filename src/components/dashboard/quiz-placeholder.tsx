"use client";

import { ArrowLeftIcon } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/button";
import { dashErrors } from "@/content/dashboard/common";
import { quizPlaceholder } from "@/content/dashboard/quizzes";
import { useQuiz } from "@/hooks/use-quizzes";
import { routes } from "@/lib/routes";
import { EditorSkeleton } from "./editor-skeleton";
import { ErrorCard } from "./error-card";

/**
 * The page behind every quiz link until the editor is built (next slice): the skeleton while it opens, "We can't
 * find this quiz" for an unknown id, otherwise only the quiz name and a way back. It invents no editor screen.
 */
export function QuizPlaceholder({ quizId }: { quizId: string }) {
  const state = useQuiz(quizId);
  return (
    <main className="mx-auto flex max-w-[1080px] flex-col gap-8 px-8 py-12">
      {state.status === "loading" ? <EditorSkeleton /> : null}
      {state.status === "not_found" ? (
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
      ) : null}
      {state.status === "ready" ? (
        <div>
            <ButtonLink href={routes.dashboard} variant="ghost" shape="box" size="sm" className="-ml-4">
              <ArrowLeftIcon />
              {quizPlaceholder.back}
            </ButtonLink>
            <h1 className="m-0 mt-2 text-[32px] font-bold leading-10">{state.quiz.name}</h1>
        </div>
      ) : null}
    </main>
  );
}
