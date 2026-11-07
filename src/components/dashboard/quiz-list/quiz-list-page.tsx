"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorCard } from "@/components/dashboard/error-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { PlusIcon, SearchIcon, WifiOffIcon } from "@/components/ui/icons";
import { textLink } from "@/components/ui/link-styles";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/toast";
import { dashErrors } from "@/content/dashboard/common";
import { quizList, quizToasts } from "@/content/dashboard/quizzes";
import { useQuizzes } from "@/hooks/use-quizzes";
import { isSessionError, type ActionResult } from "@/lib/errors";
import { hasReachedQuizLimit, planName } from "@/lib/plan/limits";
import { filterAndSort, quizStatus, sortOptions, type QuizSort } from "@/lib/quizzes/list";
import type { QuizStart, QuizSummary } from "@/lib/quizzes/types";
import { quizHref } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { ListSkeleton } from "./list-skeleton";
import { NewQuizDialog } from "./new-quiz-dialog";
import { QuizCard } from "./quiz-card";
import { DeleteDialog, QuizLimitDialog, RenameDialog } from "./quiz-dialogs";
import type { QuizActions } from "./quiz-menu";
import { UsageMeter } from "./usage-meter";

type DialogState = { kind: "new" } | { kind: "limit" } | { kind: "rename"; quiz: QuizSummary } | { kind: "delete"; quiz: QuizSummary } | null;

/** The dashboard home: all of the person's quizzes, with search, sort and everything a card can do (board Quizzes). */
export function QuizListPage() {
  const quizzes = useQuizzes();
  const router = useRouter();
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<QuizSort>("edited");
  const [dialog, setDialog] = useState<DialogState>(null);

  if (quizzes.state.status === "loading") return <Page><ListSkeleton /></Page>;
  if (quizzes.state.status === "error") {
    return (
      <Page>
        <ErrorCard
          icon={<WifiOffIcon size={24} />}
          title={quizList.loadFailed.title}
          action={<Button shape="box" size="sm" onClick={quizzes.reload}>{quizList.loadFailed.retry}</Button>}
        >
          {quizList.loadFailed.text}
        </ErrorCard>
      </Page>
    );
  }

  const { quizzes: all, profile, limits } = quizzes.state;
  const atLimit = hasReachedQuizLimit(all.length, limits);
  const visible = filterAndSort(all, query, sort);
  const planLabel = planName(profile.plan);

  /** What follows a change that did not work: the limit dialog, or a message. Session problems have their own dialog. */
  const failed = (result: Extract<ActionResult<unknown>, { ok: false }>) => {
    if (result.error === "limit_quizzes") setDialog({ kind: "limit" });
    else if (!isSessionError(result.error)) show({ message: dashErrors.generic, tone: "error" });
  };

  const startNew = () => setDialog(atLimit ? { kind: "limit" } : { kind: "new" });

  const create = async (input: { name: string; from: QuizStart }) => {
    const result = await quizzes.create(input);
    if (!result.ok) return failed(result);
    setDialog(null);
    router.push(quizHref.edit(result.data.id));
  };

  const actions: QuizActions = {
    copyLink: async (quiz) => {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}${quizHref.public(quiz.slug)}`);
        show({ message: quizToasts.linkCopied });
      } catch {
        show({ message: dashErrors.generic, tone: "error" });
      }
    },
    rename: (quiz) => setDialog({ kind: "rename", quiz }),
    remove: (quiz) => setDialog({ kind: "delete", quiz }),
    duplicate: async (quiz) => {
      if (atLimit) return setDialog({ kind: "limit" });
      const result = await quizzes.duplicate(quiz.id);
      if (result.ok) show({ message: quizToasts.duplicated });
      else failed(result);
    },
    toggleOpen: async (quiz) => {
      const closing = quizStatus(quiz) === "open";
      const result = await quizzes.setAcceptingResponses(quiz.id, !closing);
      if (result.ok) show({ message: closing ? quizToasts.closed : quizToasts.opened });
      else failed(result);
    },
  };

  const rename = async (quiz: QuizSummary, name: string) => {
    const result = await quizzes.rename(quiz.id, name);
    if (!result.ok) return failed(result);
    setDialog(null);
    show({ message: quizToasts.renamed });
  };

  const confirmDelete = async (quiz: QuizSummary) => {
    const result = await quizzes.remove(quiz.id);
    if (!result.ok) return failed(result);
    setDialog(null);
    show({ message: quizToasts.deleted });
  };

  const close = () => setDialog(null);
  const searching = query.trim() !== "";

  return (
    <Page>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="m-0 text-[32px] font-bold leading-10">{quizList.title}</h1>
          <p className="m-0 mt-1 text-[17px] text-ink-2">{quizList.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Popover>
            <PopoverTrigger className={cn("min-h-11 rounded-md text-sm text-mute hover:text-slate focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate", textLink)}>
              {quizList.usage(all.length, limits.quizzes, planLabel)}
            </PopoverTrigger>
            <PopoverContent>
              <UsageMeter used={all.length} max={limits.quizzes} planLabel={planLabel} />
            </PopoverContent>
          </Popover>
          <Button shape="box" onClick={startNew}>
            <PlusIcon />
            {quizList.newQuiz}
          </Button>
        </div>
      </div>

      {all.length === 0 ? (
        <EmptyState
          icon={<PlusIcon size={26} />}
          title={quizList.empty.title}
          action={<Button shape="box" onClick={startNew}>{quizList.empty.action}</Button>}
        >
          {quizList.empty.text}
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative block min-w-0 flex-[1_1_280px]">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mute">
                <SearchIcon />
              </span>
              <Input shape="box" aria-label={quizList.searchLabel} placeholder={quizList.searchLabel} value={query} onChange={(e) => setQuery(e.target.value)} className="pl-11" />
            </label>
            <Select aria-label={quizList.sortLabel} value={sort} onChange={(e) => setSort(e.target.value as QuizSort)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          {visible.length === 0 ? (
            <EmptyState
              title={quizList.noResults.title(query.trim())}
              action={<Button shape="box" variant="secondary" onClick={() => setQuery("")}>{quizList.noResults.action}</Button>}
            >
              {quizList.noResults.text}
            </EmptyState>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
              {visible.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} actions={actions} />
              ))}
              {searching ? null : (
                <button
                  type="button"
                  onClick={startNew}
                  className="lift flex min-h-[200px] flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-dashline p-6 text-[17px] font-semibold text-slate transition-[translate,background-color] duration-200 [--lift-shadow:none] [--lift:2px] hover:bg-white/60 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
                >
                  <PlusIcon size={32} />
                  {quizList.createTile}
                </button>
              )}
            </div>
          )}
        </>
      )}

      {dialog?.kind === "new" ? <NewQuizDialog quizzes={all} onCreate={create} onClose={close} /> : null}
      {dialog?.kind === "limit" ? <QuizLimitDialog max={limits.quizzes} onClose={close} /> : null}
      {dialog?.kind === "rename" ? <RenameDialog quiz={dialog.quiz} onSave={(name) => rename(dialog.quiz, name)} onClose={close} /> : null}
      {dialog?.kind === "delete" ? <DeleteDialog quiz={dialog.quiz} onConfirm={() => confirmDelete(dialog.quiz)} onClose={close} /> : null}
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex max-w-[1080px] flex-col gap-8 px-8 py-12">{children}</main>;
}
