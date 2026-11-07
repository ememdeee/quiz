"use client";

import Link from "next/link";
import { useDashUser } from "@/components/dashboard/dash-shell";
import { AccountMenu } from "@/components/layout/account-menu";
import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowLeftIcon, EyeIcon, LinkIcon, SlidersIcon, UndoIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import type { SaveState } from "@/components/ui/save-status";
import { tabClass, tabsListClass } from "@/components/ui/tabs";
import { saveStatusText } from "@/content/dashboard/common";
import { editorHeader } from "@/content/dashboard/editor";
import { diffQuiz } from "@/lib/quiz/diff";
import { quizStatus } from "@/lib/quizzes/list";
import type { QuizBundle } from "@/lib/quizzes/types";
import { quizHref, routes } from "@/lib/routes";
import { useEditor, useEditorActions } from "./editor-context";

const pillTone = { open: "solid", closed: "neutral", not_published: "outline" } as const;

/** The editor's top bar (boards Main and EditorStates): name, status, what is saved, and the quiz-level actions. */
export function EditorHeader({ bundle, save, onRetry }: { bundle: QuizBundle; save: SaveState; onRetry: () => void }) {
  const user = useDashUser();
  const doc = useEditor((s) => s.doc);
  const canUndo = useEditor((s) => s.past.length > 0);
  const { undo } = useEditorActions();
  const { quiz, published } = bundle;
  const status = quizStatus(quiz);
  const isPublished = status !== "not_published";
  const waiting = published ? diffQuiz(doc, published).count : 0;
  const upToDate = isPublished && waiting === 0;

  const saved = isPublished ? `${editorHeader.saved} · ${upToDate ? editorHeader.everythingPublished : editorHeader.notPublished(waiting)}` : editorHeader.saved;

  return (
    <header className="flex flex-wrap items-center gap-3.5 border-b border-line bg-white px-6 py-3">
      <ButtonLink href={routes.dashboard} variant="ghost" shape="box" size="sm" className="gap-2 px-3 font-medium">
        <ArrowLeftIcon />
        {editorHeader.back}
      </ButtonLink>

      <div className="flex min-w-[200px] grow items-center gap-2.5">
        <span className="min-w-0 truncate text-xl font-bold">{doc.name}</span>
        <Pill tone={pillTone[status]}>{editorHeader.status[status]}</Pill>
        <span role={save === "error" ? "alert" : "status"} className={save === "error" ? "text-sm font-semibold text-danger" : "text-sm text-mute"}>
          {save === "saving" ? saveStatusText.saving : save === "error" ? saveStatusText.error : saved}
        </span>
        {save === "error" ? (
          <Button shape="box" size="sm" variant="danger-quiet" onClick={onRetry}>
            {saveStatusText.retry}
          </Button>
        ) : null}
      </div>

      <nav aria-label={editorHeader.sections} className={tabsListClass}>
        <Link href={quizHref.edit(quiz.id)} aria-current="page" className={tabClass}>
          {editorHeader.edit}
        </Link>
        <Link href={quizHref.responses(quiz.id)} className={tabClass}>
          {editorHeader.responses}
        </Link>
      </nav>

      <Button shape="box" size="sm" variant="secondary" disabled={!canUndo} onClick={undo} className="gap-2">
        <UndoIcon />
        {editorHeader.undo}
      </Button>
      <ButtonLink href={quizHref.settings(quiz.id)} shape="box" size="sm" variant="secondary" className="gap-2">
        <SlidersIcon />
        {editorHeader.settings}
      </ButtonLink>
      <Button shape="box" size="sm" variant="secondary" disabled={!isPublished} className="gap-2">
        <LinkIcon />
        {editorHeader.share}
      </Button>
      <ButtonLink href={quizHref.preview(quiz.id)} shape="box" size="sm" variant="secondary" className="gap-2">
        <EyeIcon size={18} />
        {editorHeader.tryIt}
      </ButtonLink>
      <Button shape="box" size="sm" disabled={upToDate} className="px-[22px]">
        {upToDate ? editorHeader.published : isPublished ? editorHeader.publishChanges : editorHeader.publish}
      </Button>
      <AccountMenu user={user} />
    </header>
  );
}
