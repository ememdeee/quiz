"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/controls";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { ChevronRightIcon, TrashIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { individualWords } from "@/content/dashboard/responses";
import { formatDateTime } from "@/lib/format";
import type { QuizDocument } from "@/lib/quiz/schema";
import { answerRows, dateRanges, filterResponses, leftAtPage, minutesTaken, type DateRange } from "@/lib/responses/individual";
import type { QuizResponse } from "@/lib/responses/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

/** The Individual tab (board Responses): people on the left, one person's answers on the right. */
export function IndividualView({
  doc,
  responses,
  range,
  onRange,
  onDelete,
}: {
  doc: QuizDocument;
  responses: QuizResponse[];
  range: DateRange;
  onRange: (range: DateRange) => void;
  onDelete: (response: QuizResponse) => void;
}) {
  const words = individualWords;
  const [query, setQuery] = useState("");
  const [includeUnfinished, setIncludeUnfinished] = useState(true);
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = useMemo(() => filterResponses(doc, responses, { query, range, includeUnfinished }), [doc, responses, query, range, includeUnfinished]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const shown = list.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const index = list.findIndex((r) => r.id === selectedId);
  const selected = list[index] ?? list[0];
  const selectedIndex = list.indexOf(selected);

  // A new search or filter starts at the top; a deleted person leaves the next one open
  useEffect(() => setPage(0), [query, range, includeUnfinished]);
  useEffect(() => {
    if (selectedId && index === -1) setSelectedId(list[0]?.id ?? null);
  }, [index, list, selectedId]);

  const go = (offset: number) => {
    const target = list[selectedIndex + offset];
    if (!target) return;
    setSelectedId(target.id);
    setPage(Math.floor((selectedIndex + offset) / PAGE_SIZE));
  };

  const filters = (
    <div className="flex flex-col gap-3">
      <Input shape="box" aria-label={words.search} placeholder={words.search} value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-11 text-[15px]" />
      <div className="flex gap-2.5">
        <Select aria-label="Date range" value={range} onChange={(e) => onRange(e.target.value as DateRange)} className="min-h-11 min-w-0 flex-1">
          {dateRanges.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-[15px]">
          <Checkbox checked={includeUnfinished} onCheckedChange={(value) => setIncludeUnfinished(value === true)} />
          {words.includeUnfinished}
        </label>
      </div>
    </div>
  );

  if (list.length === 0) {
    return (
      <div className="flex max-w-[560px] flex-col gap-4">
        {filters}
        <EmptyState title={words.noMatch.title(query.trim())} action={<Button shape="box" variant="secondary" onClick={() => setQuery("")}>{words.noMatch.action}</Button>}>
          {words.noMatch.text}
        </EmptyState>
      </div>
    );
  }

  const left = leftAtPage(doc, selected);
  const minutes = minutesTaken(selected);
  const rows = answerRows(doc, selected);

  return (
    <div className="flex flex-wrap items-start gap-6">
      <section className="flex min-w-0 max-w-[460px] flex-[1_1_380px] flex-col gap-3">
        {filters}
        <div className="overflow-hidden rounded-[14px] border border-line bg-white">
          {shown.map((response) => {
            const leftAt = leftAtPage(doc, response);
            const active = response.id === selected.id;
            return (
              <button
                key={response.id}
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => setSelectedId(response.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 border-l-4 border-t border-t-line px-4 py-3.5 text-left first:border-t-0 focus-visible:outline-[3px] focus-visible:-outline-offset-[3px] focus-visible:outline-slate",
                  active ? "border-l-slate bg-soft" : "border-l-transparent hover:bg-dash",
                )}
              >
                <span>
                  <span className="block text-base font-semibold">{words.response(response.number)}</span>
                  <span className="block text-sm text-mute">{formatDateTime(response.startedAt)}</span>
                </span>
                {leftAt ? <Pill>{words.leftAt(leftAt)}</Pill> : null}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm text-mute">
          <span>{words.showing(shown.length, list.length)}</span>
          <span className="inline-flex gap-2">
            <Button shape="box" size="sm" variant="secondary" disabled={current === 0} onClick={() => setPage(current - 1)}>
              {words.previous}
            </Button>
            <Button shape="box" size="sm" variant="secondary" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              {words.next}
            </Button>
          </span>
        </div>
      </section>

      <section className="flex min-w-0 flex-[999_1_460px] flex-col rounded-[14px] border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5">
          <div>
            <h2 className="m-0 text-xl font-bold">{words.response(selected.number)}</h2>
            <span className="text-sm text-mute">
              {formatDateTime(selected.startedAt)} · {left ? words.leftAt(left) : minutes !== null ? words.finishedIn(minutes) : ""}
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <Button shape="box" size="sm" variant="danger-quiet" className="gap-1.5 px-3.5" onClick={() => onDelete(selected)}>
              <TrashIcon size={16} />
              {words.delete}
            </Button>
            <span className="text-sm text-mute">{words.of(selectedIndex + 1, list.length)}</span>
            <Button shape="box" variant="secondary" aria-label={words.previousPerson} disabled={selectedIndex === 0} onClick={() => go(-1)} className="size-11 px-0">
              <ChevronRightIcon size={18} className="rotate-180" />
            </Button>
            <Button shape="box" variant="secondary" aria-label={words.nextPerson} disabled={selectedIndex >= list.length - 1} onClick={() => go(1)} className="size-11 px-0">
              <ChevronRightIcon size={18} />
            </Button>
          </div>
        </div>
        <div className="max-h-[560px] overflow-y-auto px-6 pb-4 pt-2">
          {rows.map((row) => (
            <div key={row.pageId} className="border-b border-line py-4 last:border-b-0">
              <div className="flex items-center gap-2 text-sm text-mute">
                {row.position ? `${row.position}. ` : ""}
                {row.question}
                {row.removed ? <Pill className="px-2 py-0 text-xs">{words.removedQuestion}</Pill> : null}
              </div>
              <div className={cn("mt-1 text-[17px] font-semibold", row.answer === null && "text-mute")}>{row.answer ?? words.noAnswer}</div>
              {row.removed ? <div className="mt-0.5 text-[13px] text-mute">{words.removedNote}</div> : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
