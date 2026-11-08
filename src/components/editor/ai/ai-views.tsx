"use client";

import { Banner } from "@/components/ui/banner";
import { Button, ButtonLink } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";
import { aiCheck, aiMessages } from "@/content/dashboard/ai";
import { routes } from "@/lib/routes";
import { askAgain, type AiChange, type AiImportResult, type AiProblem } from "@/lib/ai/import";
import { cn } from "@/lib/utils";

type Ok = Extract<AiImportResult, { ok: true }>;

const Quote = ({ children }: { children: string }) => <div className="rounded-[10px] bg-soft px-3.5 py-2.5 text-[15px] font-semibold text-ink">{children}</div>;

/** "We couldn't find a quiz in that text": says what to ask the AI, and copies the message for them. */
export function NoQuizView({ onCopy, onAgain }: { onCopy: (text: string) => void; onAgain: () => void }) {
  const words = aiMessages.noQuiz;
  return (
    <div className="flex flex-col gap-3.5">
      <p className="m-0 text-[15px] leading-[23px] text-ink-2">{words.text}</p>
      <Quote>{words.quote}</Quote>
      <p className="m-0 text-[15px] text-ink-2">{words.after}</p>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button shape="box" size="sm" variant="secondary" onClick={() => onCopy(askAgain.noQuiz)}>{words.copy}</Button>
        <Button shape="box" size="sm" onClick={onAgain}>{words.again}</Button>
      </div>
    </div>
  );
}

export function CutOffView({ onCopy, onAgain }: { onCopy: (text: string) => void; onAgain: () => void }) {
  const words = aiMessages.cutOff;
  return (
    <div className="flex flex-col gap-3.5">
      <p className="m-0 text-[15px] leading-[23px] text-ink-2">
        {words.before} <strong>{words.quote}</strong>
        {words.after}
      </p>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button shape="box" size="sm" variant="secondary" onClick={() => onCopy(askAgain.cutOff)}>{words.copy}</Button>
        <Button shape="box" size="sm" onClick={onAgain}>{words.again}</Button>
      </div>
    </div>
  );
}

export function ProblemsView({ problems, onCopy, onBack }: { problems: AiProblem[]; onCopy: (text: string) => void; onBack: () => void }) {
  const words = aiMessages.problems;
  return (
    <div className="flex flex-col gap-3.5">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {problems.map((problem) => (
          <li key={problem.text} className="rounded-[10px] border border-danger-line bg-danger-soft px-3.5 py-2.5 text-[15px] text-danger-ink">{problem.text}</li>
        ))}
      </ul>
      <p className="m-0 text-[15px] text-ink-2">{words.note}</p>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button shape="box" size="sm" variant="secondary" onClick={onBack}>{words.back}</Button>
        <Button shape="box" size="sm" onClick={() => onCopy(askAgain.problems(problems))}>{words.copy}</Button>
      </div>
    </div>
  );
}

export function TooManyView({ limit, onCopy }: { limit: number; onCopy: (text: string) => void }) {
  const words = aiMessages.tooMany;
  return (
    <div className="flex flex-col gap-3.5">
      <p className="m-0 text-[15px] leading-[23px] text-ink-2">{words.text(limit)}</p>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button shape="box" size="sm" variant="secondary" onClick={() => onCopy(askAgain.tooMany(limit))}>{words.copy}</Button>
        <ButtonLink shape="box" size="sm" href={routes.contact}>{words.contact}</ButtonLink>
      </div>
    </div>
  );
}

export function StaleView({ onAnyway, onCopyAgain }: { onAnyway: () => void; onCopyAgain: () => void }) {
  const words = aiMessages.stale;
  return (
    <div className="flex flex-col gap-3.5">
      <p className="m-0 text-[15px] leading-[23px] text-ink-2">{words.text}</p>
      <div className="flex flex-wrap justify-end gap-2.5">
        <Button shape="box" size="sm" variant="secondary" onClick={onAnyway}>{words.anyway}</Button>
        <Button shape="box" size="sm" onClick={onCopyAgain}>{words.again}</Button>
      </div>
    </div>
  );
}

const kindTone = { added: "solid", changed: "soft", removed: "neutral" } as const;

function ChangeRow({ change }: { change: AiChange }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-white px-3.5 py-3">
      <Pill tone={kindTone[change.kind]} className="mt-0.5 flex-none">{aiCheck.kinds[change.kind]}</Pill>
      <div className="min-w-0">
        <div className="text-[15px] font-semibold text-ink">{change.title || "—"}</div>
        <div className="text-sm text-mute">{change.detail}</div>
      </div>
    </li>
  );
}

/** "Here's what will change" (board AiHelperCheck): counts, the list, and the plan line. Nothing has changed yet. */
export function CheckView({ result, maxPages, onBack, onUpdate }: { result: Ok; maxPages: number; onBack: () => void; onUpdate: () => void }) {
  const { counts, changes, leftOut, document } = result;
  const tiles = [
    { n: counts.added, label: aiCheck.counts.added(counts.added) },
    { n: counts.changed, label: aiCheck.counts.changed(counts.changed) },
    { n: counts.removed, label: aiCheck.counts.removed(counts.removed) },
    { n: counts.same, label: aiCheck.counts.same },
  ];
  return (
    <div className="flex flex-col gap-4">
      <p className="m-0 text-[15px] leading-[23px] text-ink-2">{aiCheck.text}</p>
      {leftOut.length > 0 ? (
        <Banner>
          <strong>{aiCheck.leftOut(leftOut.length)}</strong> {aiCheck.leftOutText(leftOut.map((l) => l.position))}
        </Banner>
      ) : null}
      <div className="grid grid-cols-4 gap-2.5">
        {tiles.map((tile) => (
          <div key={tile.label} className={cn("rounded-xl border border-line px-3 py-2.5 text-center", tile.n === 0 && "opacity-60")}>
            <div className="text-2xl font-bold leading-8">{tile.n}</div>
            <div className="text-[13px] text-mute">{tile.label}</div>
          </div>
        ))}
      </div>
      <ul className="m-0 flex max-h-[260px] list-none flex-col gap-2 overflow-y-auto p-0">
        {changes.map((change) => (
          <ChangeRow key={`${change.kind}-${change.position}-${change.title}`} change={change} />
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-2 text-sm text-mute">
        <strong className="text-base text-ink">{aiCheck.pagesAfter(document.pages.length, maxPages)}</strong>
        {aiCheck.afterUpdate}
        <Pill tone="soft">{aiCheck.plan}</Pill>
      </div>
      <p className="m-0 rounded-xl bg-soft px-3.5 py-3 text-sm leading-[21px] text-ink">
        {aiCheck.draftBefore} <strong>{aiCheck.publishChanges}</strong>
        {aiCheck.draftMiddle} <strong>{aiCheck.undo}</strong> {aiCheck.draftAfter}
      </p>
      <div className="flex justify-end gap-2.5">
        <Button shape="box" variant="secondary" onClick={onBack}>{aiCheck.back}</Button>
        <Button shape="box" onClick={onUpdate}>{aiCheck.update}</Button>
      </div>
    </div>
  );
}
