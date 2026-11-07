"use client";

import { useEffect, useRef } from "react";
import { useQuizRunner, type RunnerSource } from "@/hooks/use-quiz-runner";
import { canGoBack, currentPage, hidesTopBar, pageNumbers } from "@/lib/quiz/runner";
import { QuizFrame, TopBar } from "./blocks";
import { PageView, type ViewContext } from "./page-views";
import { AlreadyDoneScreen, ClosedScreen, ErrorScreen, NotFoundScreen, NotPublishedScreen, ResumeScreen } from "./status-screens";

/**
 * The quiz as people take it: `/quiz/[slug]` (live) and Try it (preview, which never saves). Phone first;
 * on a computer it is the same screen in a centered card.
 */
export function QuizRunner({ source }: { source: RunnerSource }) {
  const runner = useQuizRunner(source);
  const { screen } = runner;
  const previewOf = source.kind === "preview" ? source.quizId : undefined;

  const pageRef = useRef<HTMLDivElement>(null);
  const pageId = screen.kind === "run" ? currentPage(screen.run).id : null;
  const first = useRef(true);
  useEffect(() => {
    // Move the screen reader to the new page's heading, but not on the very first page
    if (first.current) {
      first.current = false;
      return;
    }
    pageRef.current?.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
  }, [pageId]);

  if (screen.kind === "loading") return <QuizFrame theme={null} previewOf={previewOf}><div aria-busy="true" className="flex-1" /></QuizFrame>;
  if (screen.kind === "status") {
    return (
      <QuizFrame theme={null} previewOf={previewOf}>
        {screen.status === "closed" ? <ClosedScreen /> : null}
        {screen.status === "not_published" ? <NotPublishedScreen /> : null}
        {screen.status === "not_found" ? <NotFoundScreen /> : null}
        {screen.status === "error" ? <ErrorScreen onRetry={runner.reload} /> : null}
      </QuizFrame>
    );
  }
  if (screen.kind === "resume") {
    const { page, total } = pageNumbers(screen.run);
    return (
      <QuizFrame theme={screen.quiz.theme} previewOf={previewOf}>
        <ResumeScreen page={page} total={total} progress={screen.run.progress} onContinue={runner.continueRun} onStartOver={runner.startOver} />
      </QuizFrame>
    );
  }
  if (screen.kind === "done") {
    return (
      <QuizFrame theme={screen.quiz.theme} previewOf={previewOf}>
        <AlreadyDoneScreen onAgain={runner.startOver} />
      </QuizFrame>
    );
  }

  const { quiz, run } = screen;
  const page = currentPage(run);
  const ctx: ViewContext = {
    doc: quiz.document,
    pictures: quiz.pictures,
    answers: run.answers,
    problem: run.problem,
    saving: runner.saving,
    saveFailed: runner.saveFailed,
    showPoweredBy: quiz.showPoweredBy,
    setAnswer: runner.answer,
    next: runner.next,
    retry: runner.retry,
  };

  return (
    <QuizFrame theme={quiz.theme} previewOf={previewOf}>
      {hidesTopBar(run) ? null : <TopBar progress={run.progress} onBack={page.type === "loading" || !canGoBack(run) ? undefined : runner.back} />}
      <div ref={pageRef} key={page.id} className="flex flex-1 flex-col">
        <PageView page={page} ctx={ctx} />
      </div>
    </QuizFrame>
  );
}
