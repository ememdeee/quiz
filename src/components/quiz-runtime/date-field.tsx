"use client";

import { useState } from "react";
import { CalendarIcon, ChevronRightIcon } from "@/components/ui/icons";
import { quizText } from "@/content/quiz";
import { formatLongDate, formatMonth, monthGrid, parseIsoDate, shiftMonth, toIsoDate, todayIso } from "@/lib/quiz/calendar";
import { cn } from "@/lib/utils";

/** The date answer: a box showing the chosen day and a month calendar that opens under it (boards FEDate and FEDateError). */
export function DateField({ value, onChange, invalid, describedBy }: { value: string; onChange: (value: string) => void; invalid: boolean; describedBy?: string }) {
  const [open, setOpen] = useState(false);
  const shown = parseIsoDate(value) ?? parseIsoDate(todayIso())!;
  const [view, setView] = useState({ year: shown.year, month: shown.month });
  const chosen = parseIsoDate(value);

  const move = (by: number) => setView((current) => shiftMonth(current.year, current.month, by));

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={quizText.calendar.open}
        aria-describedby={describedBy}
        onClick={() => setOpen((was) => !was)}
        className={cn(
          "flex min-h-14 w-full items-center justify-between rounded-[14px] border-2 bg-quiz-bg px-4 text-lg outline-none focus-visible:border-quiz-primary",
          invalid ? "border-danger" : open || value ? "border-quiz-primary" : "border-quiz-line",
          value ? "text-quiz-fg" : "text-quiz-muted",
        )}
      >
        <span>{value ? formatLongDate(value) : quizText.pickDate}</span>
        <CalendarIcon />
      </button>

      {open ? (
        <div role="dialog" aria-label={formatMonth(view.year, view.month)} className="rounded-2xl border-2 border-quiz-line p-3">
          <div className="flex items-center justify-between px-1 pb-2.5 pt-1">
            <span className="text-[17px] font-semibold">{formatMonth(view.year, view.month)}</span>
            <span className="flex">
              <button type="button" aria-label={quizText.calendar.previous} onClick={() => move(-1)} className="grid size-10 place-items-center rounded-full text-quiz-muted focus-visible:outline-[3px] focus-visible:outline-quiz-primary">
                <ChevronRightIcon size={20} className="rotate-180" />
              </button>
              <button type="button" aria-label={quizText.calendar.next} onClick={() => move(1)} className="grid size-10 place-items-center rounded-full text-quiz-muted focus-visible:outline-[3px] focus-visible:outline-quiz-primary">
                <ChevronRightIcon size={20} />
              </button>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {quizText.calendar.weekdays.map((name) => (
              <span key={name} className="py-1.5 text-[13px] font-semibold text-quiz-muted">
                {name}
              </span>
            ))}
            {monthGrid(view.year, view.month)
              .flat()
              .map((day, index) =>
                day === null ? (
                  <span key={`blank-${index}`} />
                ) : (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={chosen?.year === view.year && chosen.month === view.month && chosen.day === day}
                    onClick={() => {
                      onChange(toIsoDate(view.year, view.month, day));
                      setOpen(false);
                    }}
                    className={cn(
                      "grid h-10 place-items-center rounded-full text-base focus-visible:outline-[3px] focus-visible:outline-quiz-primary",
                      chosen?.year === view.year && chosen.month === view.month && chosen.day === day && "bg-quiz-primary font-semibold text-quiz-on-primary",
                    )}
                  >
                    {day}
                  </button>
                ),
              )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
