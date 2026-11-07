"use client";

import { Segmented } from "@/components/ui/controls";
import { Field, FieldHint, Input } from "@/components/ui/field";
import { panel } from "@/content/dashboard/editor";
import type { PageOf } from "@/lib/quiz/schema";
import { defaultsFor, unitChoices, type NumberKind } from "@/lib/quiz/units";
import { usePageEdit } from "../editor-context";
import { ChipGroup, RequiredRow, Sub, TextField } from "./fields";

const kinds: readonly { value: NumberKind; label: string }[] = [
  { value: "age", label: panel.number.age },
  { value: "height", label: panel.number.height },
  { value: "weight", label: panel.number.weight },
  { value: "number", label: panel.number.number },
  { value: "date", label: panel.number.date },
];

const asNumber = (value: string) => (value.trim() === "" ? null : Number(value));

/** "Number or date" (boards TypeNumber and TypeNumberKinds): what changes depends on which kind is chosen. */
export function NumberPanel({ page }: { page: PageOf<"number"> }) {
  const edit = usePageEdit(page);
  const words = panel.number;
  const units = unitChoices(page.kind);
  const other = units.find((u) => u !== page.unit);
  const otherRange = other ? defaultsFor(page.kind, other) : null;

  return (
    <>
      <TextField id={`${page.id}-question`} label={panel.question} value={page.question} onChange={(v) => edit("question", (d) => void (d.question = v))} />
      <ChipGroup
        label={words.enter}
        value={page.kind}
        options={kinds}
        onChange={(kind) => edit(undefined, (d) => void Object.assign(d, { kind }, defaultsFor(kind)))}
      />

      {page.kind === "age" ? (
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold">{words.unitShown}</span>
          <span className="text-[15px] text-ink-2">{words.ageUnit}</span>
        </div>
      ) : null}

      {units.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold">{words.unit}</span>
          <Segmented
            aria-label={words.unit}
            value={page.unit ?? units[0]}
            options={units.map((u) => ({ value: u, label: u }))}
            onValueChange={(unit) => edit(undefined, (d) => void Object.assign(d, defaultsFor(page.kind, unit)))}
          />
          {other && otherRange ? (
            <Sub>
              {words.switching(other, otherRange.min ?? 0, otherRange.max ?? 0)} {page.kind === "height" ? words.heightNote : ""}
            </Sub>
          ) : null}
        </div>
      ) : null}

      {page.kind === "number" ? (
        <Field label={words.unitShown} htmlFor={`${page.id}-unit`} hint={panel.optional}>
          <Input id={`${page.id}-unit`} shape="box" value={page.unit ?? ""} onChange={(e) => edit("unit", (d) => void (d.unit = e.target.value === "" ? null : e.target.value))} />
        </Field>
      ) : null}

      {page.kind === "date" ? (
        <div className="flex flex-col gap-2">
          <Sub>{words.dateNote}</Sub>
          <Sub>{words.dateNote2}</Sub>
        </div>
      ) : (
        <div role="group" aria-label={words.allowed} className="flex flex-col gap-2">
          <span className="text-[15px] font-semibold">{words.allowed}</span>
          <div className="flex items-center gap-2.5">
            <Input shape="box" type="number" aria-label={words.smallest} value={page.min ?? ""} onChange={(e) => edit("min", (d) => void (d.min = asNumber(e.target.value)))} />
            <span className="text-sm text-mute">{words.to}</span>
            <Input shape="box" type="number" aria-label={words.largest} value={page.max ?? ""} onChange={(e) => edit("max", (d) => void (d.max = asNumber(e.target.value)))} />
          </div>
          <FieldHint>{page.kind === "number" ? words.anyNote : words.rangeNote}</FieldHint>
        </div>
      )}

      <RequiredRow checked={page.required} onChange={(v) => edit(undefined, (d) => void (d.required = v))} />
    </>
  );
}
