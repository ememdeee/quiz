import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { quizCard } from "@/content/dashboard/quizzes";
import { editedAgo } from "@/lib/format";
import { isFull, quizStatus, type QuizStatus } from "@/lib/quizzes/list";
import type { QuizSummary } from "@/lib/quizzes/types";
import { quizHref } from "@/lib/routes";
import { QuizMenu, type QuizActions } from "./quiz-menu";

const pillTone = { open: "solid", closed: "neutral", not_published: "outline" } as const satisfies Record<QuizStatus, "solid" | "neutral" | "outline">;

/** One quiz in the list (board Quizzes). What it offers depends on its status. `responseLimit` is the finished responses the plan allows per quiz. */
export function QuizCard({ quiz, actions, responseLimit }: { quiz: QuizSummary; actions: QuizActions; responseLimit: number }) {
  const status = quizStatus(quiz);
  const full = isFull(quiz, responseLimit);
  return (
    <Card className="flex min-w-0 flex-col gap-5 rounded-2xl p-6 [--lift:4px]">
      <div className="flex items-center justify-between gap-2">
        <Pill tone={full ? "neutral" : pillTone[status]}>{full ? quizCard.full.status : quizCard.status[status]}</Pill>
        <QuizMenu quiz={quiz} actions={actions} full={full} />
      </div>
      <div className="min-w-0">
        <h2 className="m-0 break-words text-[22px] font-bold leading-7 text-slate">{quiz.name}</h2>
        <p className="m-0 mt-1 text-[15px] text-mute">
          {full ? quizCard.full.description(responseLimit) : quizCard.description[status]}
          <br />
          <span className="text-[13px]">{editedAgo(quiz.updatedAt)}</span>
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        <ButtonLink href={quizHref.edit(quiz.id)} shape="box" size="sm" className="px-5">
          {quizCard.edit}
        </ButtonLink>
        {status === "not_published" ? (
          <ButtonLink href={quizHref.edit(quiz.id)} variant="secondary" shape="box" size="sm">
            {quizCard.publish}
          </ButtonLink>
        ) : (
          <ButtonLink href={quizHref.responses(quiz.id)} variant="secondary" shape="box" size="sm">
            {quizCard.responses(quiz.finishedResponses)}
          </ButtonLink>
        )}
        {status === "open" && !full ? (
          <Button variant="ghost" shape="box" size="sm" className="gap-1.5 px-3.5" onClick={() => actions.copyLink(quiz)}>
            <LinkIcon />
            {quizCard.copyLink}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
