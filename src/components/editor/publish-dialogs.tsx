"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { ArrowRightIcon, CheckIcon, CloseIcon } from "@/components/ui/icons";
import { problemLine, pageLabel, problemsDialog, publishDialog, shareDialog } from "@/content/dashboard/publish";
import type { Page, QuizDocument } from "@/lib/quiz/schema";
import type { Problem } from "@/lib/quiz/validate";
import { quizHref } from "@/lib/routes";

/** "Publish your changes?" (board Publish): the last question before people see the new version. */
export function PublishDialog({ changes, pages, pending, onConfirm, onClose }: { changes: number | null; pages: number; pending: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !pending && onClose()}
      title={changes === null ? publishDialog.titleFirst : publishDialog.title}
      description={publishDialog.text}
      className="max-w-[520px] gap-5 p-8"
      actions={
        <>
          <Button shape="box" variant="secondary" disabled={pending} onClick={onClose}>
            {publishDialog.notYet}
          </Button>
          <Button shape="box" loading={pending} className="px-[26px]" onClick={onConfirm}>
            {publishDialog.publish}
          </Button>
        </>
      }
    >
      <div className="rounded-xl bg-dash px-4 py-3.5 text-[15px] leading-[22px] text-ink-2">{changes === null ? publishDialog.firstTime(pages) : publishDialog.changed(changes)}</div>
    </Dialog>
  );
}

/** "Fix 3 things before you publish" (board PublishProblems): every problem with a way to jump to its page. */
export function ProblemsDialog({ doc, problems, onGo, onClose }: { doc: QuizDocument; problems: Problem[]; onGo: (pageId: string) => void; onClose: () => void }) {
  const rows = doc.pages
    .map((page, index) => ({ page, position: index + 1, found: problems.filter((p) => p.pageId === page.id) }))
    .filter((row) => row.found.length > 0);
  const lines = (page: Page, found: Problem[]) => [...new Set(found.map((problem) => problemLine(problem, page)))];
  /** Each different line is one thing to fix, so the title counts what the list shows. */
  const total = rows.reduce((sum, row) => sum + lines(row.page, row.found).length, 0);

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={problemsDialog.title(total)}
      description={problemsDialog.text}
      className="max-w-[540px]"
      actions={
        <Button shape="box" size="sm" onClick={onClose}>
          {problemsDialog.close}
        </Button>
      }
    >
      <ul className="m-0 list-none p-0">
        {rows.map(({ page, position, found }) => (
          <li key={page.id} className="flex items-start gap-3.5 border-b border-soft py-3.5 last:border-b-0">
            <span className="grid size-7 flex-none place-items-center rounded-full bg-soft text-[13px] font-bold">{position}</span>
            <div className="min-w-0 grow">
              <div className="text-[15px] font-semibold text-ink">{pageLabel(page, true)}</div>
              {lines(page, found).map((line) => (
                <div key={line} className="text-sm text-danger">
                  {line}
                </div>
              ))}
            </div>
            <Button shape="box" variant="secondary" className="min-h-11 px-3.5 text-sm" onClick={() => onGo(page.id)}>
              {problemsDialog.goToPage}
            </Button>
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

/** "Add a question first": a quiz with no question cannot be published. */
export function NoQuestionDialog({ onAdd, onClose }: { onAdd: () => void; onClose: () => void }) {
  const words = problemsDialog.noQuestion;
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={words.title}
      description={words.text}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
            {words.notNow}
          </Button>
          <Button shape="box" size="sm" onClick={onAdd}>
            {words.add}
          </Button>
        </>
      }
    />
  );
}

/** "Your quiz is live" right after publishing, and "Share your quiz" any other time (boards Share and ShareQuiz). */
export function ShareDialog({ slug, live, onClose }: { slug: string; live: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window === "undefined" ? quizHref.public(slug) : `${window.location.origin}${quizHref.public(slug)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={live ? shareDialog.liveTitle : shareDialog.title} description={live ? shareDialog.liveText : shareDialog.text} className="max-w-[560px] gap-[22px] p-8">
      <Button shape="box" variant="secondary" aria-label={shareDialog.close} onClick={onClose} className="absolute right-6 top-6 size-11 px-0">
        <CloseIcon size={18} />
      </Button>
      <div className="flex flex-wrap gap-2.5">
        <input
          aria-label={shareDialog.linkLabel}
          readOnly
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="min-h-[52px] min-w-0 flex-[1_1_280px] rounded-[10px] border border-ctrl bg-dash px-3.5 text-base text-slate focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
        />
        <Button shape="box" onClick={copy} className="min-h-[52px] px-6">
          {shareDialog.copy}
        </Button>
      </div>
      {copied ? (
        <div role="status" className="flex items-center gap-2 text-sm text-mute">
          <CheckIcon size={16} />
          {shareDialog.copied}
        </div>
      ) : null}
      <div className="flex justify-end">
        <Link
          href={quizHref.public(slug)}
          target="_blank"
          className="inline-flex min-h-12 items-center gap-2 rounded-[10px] border border-line-strong px-5 text-base font-semibold text-slate no-underline transition-colors duration-200 hover:bg-dash focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
        >
          {shareDialog.open}
          <ArrowRightIcon size={16} className="-rotate-45" />
        </Link>
      </div>
    </Dialog>
  );
}
