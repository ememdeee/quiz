"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { Textarea } from "@/components/ui/field";
import { aiCheck, aiHelper, aiMessages } from "@/content/dashboard/ai";
import { buildAiExport } from "@/lib/ai/export";
import { importAiText, type AiImportResult, type AiProblem } from "@/lib/ai/import";
import { copyText } from "@/lib/clipboard";
import { useEditorActions, useEditorStoreApi } from "../editor-context";
import { useMedia } from "../media-context";
import { CheckView, CutOffView, NoQuizView, ProblemsView, StaleView, TooManyView } from "./ai-views";

type Ok = Extract<AiImportResult, { ok: true }>;
type View =
  | { kind: "start" }
  | { kind: "checking" }
  | { kind: "noQuiz" }
  | { kind: "cutOff" }
  | { kind: "problems"; problems: AiProblem[] }
  | { kind: "tooMany"; count: number }
  | { kind: "stale"; result: Ok }
  | { kind: "nothing" }
  | { kind: "check"; result: Ok };

const COPIED_MS = 5000;
const CHECK_MS = 450;

const Step = ({ n, title, children }: { n: number; title: string; children: ReactNode }) => (
  <section className="flex gap-3.5">
    <span className="grid size-8 flex-none place-items-center rounded-full bg-slate text-sm font-bold text-white">{n}</span>
    <div className="flex min-w-0 flex-1 flex-col gap-2.5">
      <h3 className="m-0 text-base font-bold text-ink">{title}</h3>
      {children}
    </div>
  </section>
);

/** Edit with AI (boards AiHelper, AiHelperCheck, AiHelperStates): copy the quiz, let an AI change it, paste the answer back, check, update. */
export function AiDialog({ maxPages, onApplied, onClose }: { maxPages: number; onApplied: (counts: Ok["counts"]) => void; onClose: () => void }) {
  const store = useEditorStoreApi();
  const { replace, select } = useEditorActions();
  const media = useMedia();
  const [view, setView] = useState<View>({ kind: "start" });
  const [answer, setAnswer] = useState("");
  const [copied, setCopied] = useState<"idle" | "full" | "data" | "failed">("idle");
  const [failedText, setFailedText] = useState("");
  const copiedAt = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  const copy = async (text: string, which: "full" | "data") => {
    const ok = await copyText(text);
    copiedAt.current = store.getState().revision;
    setFailedText(ok ? "" : text);
    setCopied(ok ? which : "failed");
    if (timer.current) clearTimeout(timer.current);
    if (ok) timer.current = setTimeout(() => setCopied("idle"), COPIED_MS);
  };

  const copyExport = (which: "full" | "data") => {
    const { full, dataOnly } = buildAiExport(store.getState().doc, maxPages);
    void copy(which === "full" ? full : dataOnly, which);
  };

  /** A ready-made message for the AI (see "Copy-back messages"). */
  const copyMessage = (text: string) => void copyText(text).then((ok) => ok && setCopied("idle"));

  const check = async () => {
    setView({ kind: "checking" });
    await new Promise((resolve) => setTimeout(resolve, CHECK_MS));
    const result = importAiText(answer, { current: store.getState().doc, maxPages, mediaIds: new Set(media.items.map((i) => i.id)) });
    if (!result.ok) {
      if (result.reason === "problems") return setView({ kind: "problems", problems: result.problems });
      if (result.reason === "too_many_pages") return setView({ kind: "tooMany", count: result.count });
      return setView({ kind: result.reason === "cut_off" ? "cutOff" : "noQuiz" });
    }
    if (result.unchanged) return setView({ kind: "nothing" });
    const changedSinceCopy = copiedAt.current !== null && store.getState().revision !== copiedAt.current;
    setView(changedSinceCopy ? { kind: "stale", result } : { kind: "check", result });
  };

  const apply = (result: Ok) => {
    const { selectedId } = store.getState();
    replace(result.document);
    if (!result.document.pages.some((p) => p.id === selectedId)) select(result.document.pages[0].id);
    onApplied(result.counts);
  };

  const backToStart = () => setView({ kind: "start" });
  const title = {
    start: aiHelper.title,
    checking: aiHelper.title,
    noQuiz: aiMessages.noQuiz.title,
    cutOff: aiMessages.cutOff.title,
    problems: view.kind === "problems" ? aiMessages.problems.title(view.problems.length) : "",
    tooMany: view.kind === "tooMany" ? aiMessages.tooMany.title(view.count) : "",
    stale: aiMessages.stale.title,
    nothing: aiCheck.nothing.title,
    check: aiCheck.title,
  }[view.kind];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={title} description={view.kind === "start" ? aiHelper.intro : undefined} className="max-w-[720px] gap-5 p-8">
      <Button shape="box" variant="secondary" aria-label={aiHelper.close} onClick={onClose} className="absolute right-6 top-6 size-11 px-0">
        <CloseIcon size={18} />
      </Button>

      {view.kind === "start" || view.kind === "checking" ? (
        <div className="flex flex-col gap-6">
          <Step n={1} title={aiHelper.step1.title}>
            <p className="m-0 text-[15px] text-ink-2">{aiHelper.step1.text}</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button shape="box" variant={copied === "full" ? "secondary" : "primary"} onClick={() => copyExport("full")} className="gap-2">
                {copied === "full" ? <CheckIcon size={16} /> : null}
                {copied === "full" ? aiHelper.step1.copied : aiHelper.step1.copy}
              </Button>
              <Button shape="box" variant="secondary" onClick={() => copyExport("data")} className="gap-2">
                {copied === "data" ? <CheckIcon size={16} /> : null}
                {copied === "data" ? aiHelper.step1.copied : aiHelper.step1.copyData}
              </Button>
            </div>
            <span role="status" className="text-sm text-mute">
              {copied === "full" || copied === "data" ? aiHelper.step1.copiedNote : aiHelper.step1.note}
            </span>
            {copied === "failed" ? (
              <div role="alert" className="flex flex-col gap-2 rounded-xl border border-danger-line bg-danger-soft p-3.5 text-sm text-danger-ink">
                <span>
                  <strong>{aiHelper.step1.failed}</strong> {aiHelper.step1.failedNote}
                </span>
                <Textarea shape="box" readOnly aria-label={aiHelper.step1.textLabel} rows={4} value={failedText} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs" />
                <Button shape="box" size="sm" variant="secondary" className="self-start" onClick={(e) => (e.currentTarget.previousElementSibling as HTMLTextAreaElement | null)?.select()}>
                  {aiHelper.step1.selectAll}
                </Button>
              </div>
            ) : null}
          </Step>

          <Step n={2} title={aiHelper.step2.title}>
            <p className="m-0 text-[15px] text-ink-2">{aiHelper.step2.text}</p>
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
              {aiHelper.step2.ideas.map((idea) => (
                <li key={idea} className="rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-sm text-slate">{idea}</li>
              ))}
            </ul>
          </Step>

          <Step n={3} title={aiHelper.step3.title}>
            <p className="m-0 text-[15px] text-ink-2">{aiHelper.step3.text}</p>
            <label htmlFor="ai-answer" className="sr-only">{aiHelper.step3.label}</label>
            <Textarea id="ai-answer" shape="box" rows={5} value={answer} placeholder={aiHelper.step3.label} onChange={(e) => setAnswer(e.target.value)} />
            <div className="flex flex-wrap items-center gap-3">
              <Button shape="box" loading={view.kind === "checking"} disabled={answer.trim() === ""} onClick={() => void check()}>
                {aiHelper.step3.check}
              </Button>
              <span role="status" className="text-sm text-mute">{view.kind === "checking" ? aiHelper.step3.checkingNote : aiHelper.step3.note}</span>
            </div>
          </Step>

          <div className="rounded-xl border border-line bg-dash px-4 py-3.5">
            <h3 className="m-0 mb-1.5 text-sm font-bold uppercase tracking-[0.04em] text-mute">{aiHelper.good.title}</h3>
            <ul className="m-0 flex list-disc flex-col gap-1 pl-5 text-sm leading-5 text-ink-2">
              {aiHelper.good.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {view.kind === "noQuiz" ? <NoQuizView onCopy={copyMessage} onAgain={backToStart} /> : null}
      {view.kind === "cutOff" ? <CutOffView onCopy={copyMessage} onAgain={backToStart} /> : null}
      {view.kind === "problems" ? <ProblemsView problems={view.problems} onCopy={copyMessage} onBack={backToStart} /> : null}
      {view.kind === "tooMany" ? <TooManyView limit={maxPages} onCopy={copyMessage} /> : null}
      {view.kind === "stale" ? <StaleView onAnyway={() => apply(view.result)} onCopyAgain={() => (copyExport("full"), backToStart())} /> : null}
      {view.kind === "check" ? <CheckView result={view.result} maxPages={maxPages} onBack={backToStart} onUpdate={() => apply(view.result)} /> : null}
      {view.kind === "nothing" ? (
        <div className="flex flex-col gap-3.5">
          <p className="m-0 text-[15px] text-ink-2">{aiCheck.nothing.text}</p>
          <div className="flex justify-end">
            <Button shape="box" size="sm" onClick={backToStart}>{aiCheck.nothing.back}</Button>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}
