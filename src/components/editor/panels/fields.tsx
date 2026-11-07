"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/controls";
import { Field, Input, Textarea } from "@/components/ui/field";
import { CloseIcon, ImageIcon, PlusIcon } from "@/components/ui/icons";
import { ToggleChip } from "@/components/ui/chip";
import { panel } from "@/content/dashboard/editor";
import { cn } from "@/lib/utils";

/** The small building blocks every page panel is made of, so each panel only says what is special about its page. */

export function TextField({ id, label, value, onChange, hint, error }: { id: string; label: string; value: string; onChange: (value: string) => void; hint?: string; error?: string }) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error}>
      <Input id={id} shape="box" value={value} invalid={Boolean(error)} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function AreaField({ id, label, value, rows, onChange }: { id: string; label: string; value: string; rows: number; onChange: (value: string) => void }) {
  return (
    <Field label={label} htmlFor={id}>
      <Textarea id={id} shape="box" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

/** "Picture (optional)" with the dashed button. Choosing a picture is the media dialog of the next slice, so it waits. */
export function PictureField() {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold">
        {panel.picture} <span className="font-normal text-mute">{panel.optional}</span>
      </span>
      <button
        type="button"
        disabled
        className="flex min-h-14 items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-ctrl text-[15px] font-medium text-ink-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ImageIcon />
        {panel.addPicture}
      </button>
    </div>
  );
}

/** "People must answer to continue" with its switch. */
export function RequiredRow({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-3.5">
      <span className="text-[15px] font-semibold">{panel.required}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-line bg-soft px-3.5 py-3 text-sm leading-[21px] text-ink">{children}</div>;
}

export const Sub = ({ children }: { children: ReactNode }) => <span className="text-sm text-mute">{children}</span>;

/** One-of-several chips (the text kinds, the number kinds, the End page styles). */
export function ChipGroup<T extends string>({ label, value, options, onChange, note }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; note?: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <span className="text-[15px] font-semibold">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <ToggleChip key={option.value} pressed={option.value === value} onClick={() => onChange(option.value)}>
            {option.label}
          </ToggleChip>
        ))}
      </div>
      {note ? <Sub>{note}</Sub> : null}
    </div>
  );
}

/** A list of one-line inputs that can be added to and removed from (the answers, the loading steps). */
export function RowList({
  label,
  rows,
  inputLabel,
  removeLabel,
  addLabel,
  onChange,
  onRemove,
  onAdd,
  canAdd,
  canRemove,
  leading,
  className,
}: {
  label: string;
  rows: readonly { id: string; value: string }[];
  inputLabel: (n: number) => string;
  removeLabel: (n: number) => string;
  addLabel: string;
  onChange: (index: number, value: string) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  canAdd: boolean;
  canRemove: boolean;
  /** Something drawn before each input (the picture slot of an answer) */
  leading?: (index: number) => ReactNode;
  className?: string;
}) {
  return (
    <div role="group" aria-label={label} className={cn("flex flex-col gap-2", className)}>
      <span className="text-[15px] font-semibold">{label}</span>
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-center gap-2">
          {leading?.(index)}
          <Input shape="box" aria-label={inputLabel(index + 1)} value={row.value} onChange={(e) => onChange(index, e.target.value)} />
          <Button shape="box" variant="secondary" aria-label={removeLabel(index + 1)} disabled={!canRemove} onClick={() => onRemove(index)} className="size-11 flex-none px-0 text-mute">
            <CloseIcon size={18} />
          </Button>
        </div>
      ))}
      <Button shape="box" size="sm" variant="ghost" disabled={!canAdd} onClick={onAdd} className="self-start bg-soft">
        <PlusIcon size={16} />
        {addLabel}
      </Button>
    </div>
  );
}
