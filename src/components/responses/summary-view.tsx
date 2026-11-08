"use client";

import Link from "next/link";
import { useState } from "react";
import { Select } from "@/components/ui/field";
import { summaryWords } from "@/content/dashboard/responses";
import { formatNumber, formatShortDate } from "@/lib/format";
import { quizHref } from "@/lib/routes";
import type { QuestionSummary, RemovedQuestion, Summary } from "@/lib/responses/summarize";
import { cn } from "@/lib/utils";
import { BarRow, Columns, StatBox } from "./bars";

const Card = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <section className={cn("flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-white p-6", className)}>{children}</section>
);

const Eyebrow = ({ children }: { children: string }) => <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-mute">{children}</span>;
const CardTitle = ({ children }: { children: string }) => <h2 className="m-0 mt-0.5 text-xl font-bold text-ink">{children}</h2>;

function QuestionCard({ question, quizId }: { question: QuestionSummary; quizId: string }) {
  const words = summaryWords;
  const head = (
    <div>
      <Eyebrow>{`${question.position} · ${words.kinds[question.kind]}`}</Eyebrow>
      <CardTitle>{question.label}</CardTitle>
    </div>
  );

  if (question.kind === "choice") {
    return (
      <Card>
        {head}
        <div className="flex flex-col gap-3.5">
          {question.options.map((option) => (
            <BarRow key={option.label} label={option.label} value={option.share} shown={`${option.share}%`} thin />
          ))}
        </div>
        <span className="text-sm text-mute">{words.peopleAnswered(question.answered)}</span>
      </Card>
    );
  }
  if (question.kind === "number") {
    return (
      <Card>
        {head}
        <div className="grid grid-cols-3 gap-3">
          <StatBox value={question.average ?? "–"} label={words.average} />
          <StatBox value={question.lowest === null ? "–" : `${question.lowest} – ${question.highest}`} label={words.range} />
          <StatBox value={formatNumber(question.answered)} label={words.answered} />
        </div>
        {question.histogram.length > 0 ? <Columns bars={question.histogram} /> : null}
      </Card>
    );
  }
  if (question.kind === "date") {
    const show = (iso: string | null) => (iso ? formatShortDate(`${iso}T00:00:00`) : "–");
    return (
      <Card>
        {head}
        <div className="grid grid-cols-3 gap-3">
          <StatBox value={show(question.earliest)} label={words.earliest} />
          <StatBox value={show(question.latest)} label={words.latest} />
          <StatBox value={formatNumber(question.answered)} label={words.answered} />
        </div>
        {question.months.length > 0 ? <Columns bars={question.months} /> : null}
      </Card>
    );
  }
  return (
    <Card>
      {head}
      <div className="grid grid-cols-2 gap-3">
        <StatBox value={formatNumber(question.wrote)} label={words.wrote} />
        <StatBox value={formatNumber(question.skipped)} label={words.skipped} />
      </div>
      <div className="flex flex-col gap-2">
        {question.latest.map((answer) => (
          <div key={answer.number} className="rounded-xl border border-line px-3.5 py-3 text-[15px] leading-[22px]">
            {answer.text}
            <small className="mt-1 block text-xs text-mute">{words.responseLine(answer.number, formatShortDate(answer.at))}</small>
          </div>
        ))}
      </div>
      {question.total > 0 ? (
        <Link href={`${quizHref.responses(quizId)}?view=individual`} className="self-start text-[15px] font-semibold text-slate">
          {words.seeAll(question.total)}
        </Link>
      ) : null}
    </Card>
  );
}

function RemovedCard({ removed }: { removed: RemovedQuestion }) {
  return (
    <Card>
      <div>
        <Eyebrow>{summaryWords.removedTitle}</Eyebrow>
        <CardTitle>{removed.label}</CardTitle>
      </div>
      <div className="flex flex-col gap-2">
        {removed.answers.map((answer) => (
          <BarRow key={answer.text} label={answer.text} value={removed.answered ? (answer.count / removed.answered) * 100 : 0} shown={String(answer.count)} thin />
        ))}
      </div>
      <span className="text-sm text-mute">{summaryWords.removedCount(removed.answered)}</span>
    </Card>
  );
}

/** The Summary tab (board Report): the funnel, where people leave, what they answered, and a card for every question. */
export function SummaryView({ summary, quizId }: { summary: Summary; quizId: string }) {
  const words = summaryWords;
  const { funnel } = summary;
  const choices = summary.questions.filter((q): q is Extract<QuestionSummary, { kind: "choice" }> => q.kind === "choice");
  const [picked, setPicked] = useState(choices[0]?.pageId ?? "");
  const shown = choices.find((q) => q.pageId === picked) ?? choices[0];
  const tiles = [
    { label: words.opened, value: formatNumber(funnel.opened) },
    { label: words.started, value: formatNumber(funnel.started) },
    { label: words.finished, value: formatNumber(funnel.finished) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-[14px] border border-line bg-white p-5">
            <div className="text-[15px] text-mute">{tile.label}</div>
            <div className="mt-1 text-4xl font-bold leading-[44px]">{tile.value}</div>
          </div>
        ))}
        <div className="rounded-[14px] bg-slate p-5 text-white">
          <div className="text-[15px] text-fill">{words.rate}</div>
          <div className="mt-1 text-4xl font-bold leading-[44px]">{funnel.finishRate}%</div>
        </div>
      </div>

      <div className="flex flex-wrap items-start gap-6">
        <Card className="flex-[1_1_480px]">
          <div>
            <h2 className="m-0 text-lg font-bold">{words.leaveTitle}</h2>
            <span className="text-sm text-mute">{words.leaveText}</span>
          </div>
          <div className="flex flex-col gap-3">
            {summary.leave.map((row) => (
              <BarRow key={row.pageId} label={`${row.position}. ${row.label}`} value={row.share} shown={`${row.share}%`} />
            ))}
          </div>
          {summary.biggestDrop ? <p className="m-0 rounded-[10px] bg-dash px-3.5 py-3 text-sm leading-5 text-ink-2">{words.drop(summary.biggestDrop.from, summary.biggestDrop.to)}</p> : null}
        </Card>

        {shown ? (
          <Card className="flex-[1_1_360px]">
            <div>
              <h2 className="m-0 text-lg font-bold">{words.answeredTitle}</h2>
              <Select aria-label={words.pickQuestion} value={shown.pageId} onChange={(e) => setPicked(e.target.value)} className="mt-2 w-full">
                {choices.map((q) => (
                  <option key={q.pageId} value={q.pageId}>
                    {q.position}. {q.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-3.5">
              {shown.options.map((option) => (
                <BarRow key={option.label} label={option.label} value={option.share} shown={`${option.share}%`} thin />
              ))}
            </div>
          </Card>
        ) : null}
      </div>

      <div>
        <h2 className="m-0 text-[22px] font-bold">{words.everyTitle}</h2>
        <p className="m-0 mt-1 text-[15px] text-mute">{words.everyText}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {summary.questions.map((question) => (
          <QuestionCard key={question.pageId} question={question} quizId={quizId} />
        ))}
      </div>

      {summary.removed.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="m-0 text-[22px] font-bold">{words.removedTitle}</h2>
            <p className="m-0 mt-1 text-[15px] text-mute">{words.removedText}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {summary.removed.map((removed) => (
              <RemovedCard key={removed.id} removed={removed} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
