"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { DashHeader } from "@/components/dashboard/dash-header";
import { useDashUser } from "@/components/dashboard/dash-shell";
import { EditorSkeleton } from "@/components/dashboard/editor-skeleton";
import { ErrorCard } from "@/components/dashboard/error-card";
import { AccountMenu } from "@/components/layout/account-menu";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { ArrowLeftIcon, ChatIcon, WifiOffIcon } from "@/components/ui/icons";
import { tabClass, tabsListClass } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { dashErrors } from "@/content/dashboard/common";
import { editorHeader } from "@/content/dashboard/editor";
import { quizToasts } from "@/content/dashboard/quizzes";
import { exportMenu, responsesDelete, responsesEmpty, responsesPage } from "@/content/dashboard/responses";
import { useResponses } from "@/hooks/use-responses";
import { copyText } from "@/lib/clipboard";
import { quizHref, routes } from "@/lib/routes";
import { buildExport, exportFileName, saveFile, type ExportFormat } from "@/lib/responses/export/download";
import { dateRanges, inRange, type DateRange } from "@/lib/responses/individual";
import { summarize } from "@/lib/responses/summarize";
import type { QuizResponse } from "@/lib/responses/types";
import { ExportMenu, MoreMenu } from "./export-menu";
import { IndividualView } from "./individual-view";
import { DeleteAllDialog, DeleteOneDialog, ResponseLimitBanner } from "./responses-dialogs";
import { SummaryView } from "./summary-view";

type DialogState = { kind: "one"; response: QuizResponse } | { kind: "all" } | null;

/** `/dashboard/[quizId]/responses`: the Summary and Individual tabs, export and delete (boards Report, Responses, ResponsesDelete). */
export function ResponsesPage({ quizId }: { quizId: string }) {
  const { state, reload, removeOne, removeAll } = useResponses(quizId);
  const view = useSearchParams().get("view") === "individual" ? "individual" : "summary";
  const { show } = useToast();
  const user = useDashUser();
  const [range, setRange] = useState<DateRange>("30");
  const [dialog, setDialog] = useState<DialogState>(null);

  const ready = state.status === "ready" ? state : null;
  const inView = useMemo(() => (ready ? ready.set.responses.filter((r) => inRange(r, range)) : []), [ready, range]);
  const summary = useMemo(() => {
    if (!ready) return null;
    const share = ready.set.responses.length > 0 ? inView.length / ready.set.responses.length : 0;
    return summarize(ready.bundle.draft, inView, range === "all" ? ready.set.opened : Math.round(ready.set.opened * share));
  }, [ready, inView, range]);

  if (state.status === "loading") {
    return (
      <>
        <DashHeader />
        <main className="mx-auto flex max-w-[1240px] flex-col gap-8 px-6 py-8">
          <EditorSkeleton />
        </main>
      </>
    );
  }
  if (!ready || !summary) {
    return (
      <>
        <DashHeader />
        <main className="mx-auto flex max-w-[1080px] flex-col gap-8 px-8 py-12">
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
          ) : (
            <ErrorCard icon={<WifiOffIcon size={24} />} title={responsesPage.loadFailed.title} action={<Button shape="box" size="sm" onClick={reload}>{responsesPage.loadFailed.retry}</Button>}>
              {responsesPage.loadFailed.text}
            </ErrorCard>
          )}
        </main>
      </>
    );
  }

  const { bundle, set, limits } = ready;
  const finished = set.responses.filter((r) => r.status === "finished").length;
  const doc = bundle.draft;

  const download = async (format: ExportFormat) => {
    try {
      saveFile(await buildExport(format, doc, inView), exportFileName(bundle.quiz.name, format));
    } catch {
      show({ message: exportMenu.failed, tone: "error" });
    }
  };

  const copyLink = async () => {
    const ok = await copyText(`${window.location.origin}${quizHref.public(bundle.quiz.slug)}`);
    show(ok ? { message: quizToasts.linkCopied } : { message: dashErrors.generic, tone: "error" });
  };

  const confirmOne = async (response: QuizResponse) => {
    const result = await removeOne(response.id);
    setDialog(null);
    if (result.ok) show({ message: responsesDelete.one.toast(response.number), note: responsesDelete.one.toastNote });
  };

  const confirmAll = async () => {
    const result = await removeAll();
    setDialog(null);
    if (result.ok) show({ message: responsesDelete.all.toast });
  };

  const tab = (name: "summary" | "individual", label: string) => (
    <Link href={name === "summary" ? quizHref.responses(quizId) : `${quizHref.responses(quizId)}?view=individual`} aria-current={view === name ? "page" : undefined} className={tabClass}>
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-4 border-b border-line bg-white px-6 py-3">
        <ButtonLink href={routes.dashboard} variant="ghost" shape="box" size="sm" className="gap-2 px-3 font-medium">
          <ArrowLeftIcon />
          {responsesPage.back}
        </ButtonLink>
        <div className="flex min-w-[200px] grow items-center gap-2.5">
          <span className="min-w-0 truncate text-xl font-bold">{bundle.quiz.name}</span>
        </div>
        <nav aria-label={responsesPage.sections} className={tabsListClass}>
          <Link href={quizHref.edit(quizId)} className={tabClass}>
            {editorHeader.edit}
          </Link>
          <Link href={quizHref.responses(quizId)} aria-current="page" className={tabClass}>
            {responsesPage.responsesTab}
          </Link>
        </nav>
        <AccountMenu user={user} />
      </header>

      <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-[28px] font-bold leading-9">{responsesPage.title}</h1>
            <p className="m-0 mt-0.5 text-base text-ink-2">{view === "individual" ? responsesPage.subtitleIndividual(finished) : responsesPage.subtitleSummary}</p>
          </div>
          {set.responses.length > 0 ? (
            <div className="flex items-center gap-3">
              {view === "summary" ? (
                <Select aria-label={responsesPage.dateRange} value={range} onChange={(e) => setRange(e.target.value as DateRange)}>
                  {dateRanges.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : null}
              <ExportMenu label={view === "summary" ? responsesPage.export : responsesPage.exportAll} count={inView.length} primary={view === "individual"} onExport={download} />
              <MoreMenu onDeleteAll={() => setDialog({ kind: "all" })} />
            </div>
          ) : null}
        </div>

        <ResponseLimitBanner finished={finished} max={limits.responsesPerQuiz} />

        {set.responses.length === 0 ? (
          <EmptyState icon={<ChatIcon />} title={responsesEmpty.title} action={<Button shape="box" variant="secondary" onClick={copyLink}>{responsesEmpty.action}</Button>}>
            {responsesEmpty.text}
          </EmptyState>
        ) : (
          <>
            <div className={tabsListClass + " self-start"}>
              {tab("summary", responsesPage.tabs.summary)}
              {tab("individual", responsesPage.tabs.individual)}
            </div>
            {view === "summary" ? <SummaryView summary={summary} quizId={quizId} /> : <IndividualView doc={doc} responses={set.responses} range={range} onRange={setRange} onDelete={(response) => setDialog({ kind: "one", response })} />}
          </>
        )}
      </main>

      {dialog?.kind === "one" ? <DeleteOneDialog number={dialog.response.number} onConfirm={() => confirmOne(dialog.response)} onClose={() => setDialog(null)} /> : null}
      {dialog?.kind === "all" ? <DeleteAllDialog count={set.responses.length} onDownload={() => void download("csv")} onConfirm={confirmAll} onClose={() => setDialog(null)} /> : null}
    </div>
  );
}
