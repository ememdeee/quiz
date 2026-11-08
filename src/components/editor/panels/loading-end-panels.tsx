"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui/field";
import { panel } from "@/content/dashboard/editor";
import { MAX_STEPS, type PageOf } from "@/lib/quiz/schema";
import { useFieldProps, usePageEdit } from "../editor-context";
import { AreaField, ChipGroup, PictureField, RowList, Sub, TextField } from "./fields";

const MIN_SECONDS = 2;
const MAX_SECONDS = 15;

export function LoadingPanel({ page }: { page: PageOf<"loading"> }) {
  const edit = usePageEdit(page);
  const field = useFieldProps(page.id);
  const words = panel.loading;
  // What is typed in the seconds box, until the person leaves it (a half-typed "1" must not jump to 2)
  const [typed, setTyped] = useState<string | null>(null);

  const changeSeconds = (value: string) => {
    setTyped(value);
    const n = Number(value);
    if (Number.isInteger(n) && n >= MIN_SECONDS && n <= MAX_SECONDS) edit(undefined, (d) => void (d.seconds = n));
  };

  return (
    <>
      <TextField id={`${page.id}-message`} label={words.message} value={page.message} onChange={(v) => edit("message", (d) => void (d.message = v))} {...field("message")} />
      <RowList
        label={words.steps}
        rows={page.steps.map((value, index) => ({ id: `step-${index}`, value }))}
        inputLabel={words.step}
        removeLabel={words.remove}
        addLabel={words.add}
        canAdd={page.steps.length < MAX_STEPS}
        canRemove={page.steps.length > 1}
        onChange={(index, v) => edit(`step-${index}`, (d) => void (d.steps[index] = v))}
        onRemove={(index) => edit(undefined, (d) => void d.steps.splice(index, 1))}
        onAdd={() => edit(undefined, (d) => void d.steps.push(""))}
        rowError={(index) => field(`steps.${index}`).error}
        onRowBlur={(index) => field(`steps.${index}`).onBlur()}
      />
      <Field label={words.duration} htmlFor={`${page.id}-seconds`}>
        <div className="flex items-center gap-2.5">
          <Input
            id={`${page.id}-seconds`}
            shape="box"
            type="number"
            min={MIN_SECONDS}
            max={MAX_SECONDS}
            className="w-24"
            value={typed ?? page.seconds}
            onChange={(e) => changeSeconds(e.target.value)}
            onBlur={() => setTyped(null)}
          />
          <Sub>{words.seconds}</Sub>
        </div>
      </Field>
    </>
  );
}

const styles = [
  { value: "thanks", label: panel.end.thanks },
  { value: "button", label: panel.end.button },
  { value: "offer", label: panel.end.offer },
] as const;

const styleNotes = { thanks: panel.end.thanksNote, button: panel.end.buttonNote, offer: panel.end.offerNote } as const;

/** The End page (boards TypeEndThanks, TypeEndButton, TypeResult): three styles that show different fields. */
export function EndPanel({ page }: { page: PageOf<"end"> }) {
  const edit = usePageEdit(page);
  const field = useFieldProps(page.id);
  const words = panel.end;
  const optional = (value: string | undefined) => value ?? "";
  const set = (field: "buttonText" | "link" | "price" | "priceNote" | "note") => (value: string) => edit(field, (d) => void (d[field] = value));

  return (
    <>
      <ChipGroup label={words.style} value={page.style} options={styles} note={styleNotes[page.style]} onChange={(style) => edit(undefined, (d) => void (d.style = style))} />
      <TextField id={`${page.id}-title`} label={panel.title1} value={page.title} onChange={(v) => edit("title", (d) => void (d.title = v))} {...field("title")} />
      <AreaField id={`${page.id}-text`} label={page.style === "offer" ? panel.text : panel.message} rows={3} value={page.text} onChange={(v) => edit("text", (d) => void (d.text = v))} />
      {page.style === "thanks" ? <PictureField value={page.picture} onChange={(id) => edit(undefined, (d) => void (d.picture = id))} /> : null}
      {page.style === "offer" ? (
        <div className="grid grid-cols-2 gap-3">
          <TextField id={`${page.id}-price`} label={words.price} value={optional(page.price)} onChange={set("price")} />
          <TextField id={`${page.id}-button`} label={words.buttonText} value={optional(page.buttonText)} onChange={set("buttonText")} {...field("buttonText")} />
        </div>
      ) : null}
      {page.style === "button" ? <TextField id={`${page.id}-button`} label={words.buttonText} value={optional(page.buttonText)} onChange={set("buttonText")} {...field("buttonText")} /> : null}
      {page.style !== "thanks" ? (
        <TextField id={`${page.id}-link`} label={words.link} value={optional(page.link)} onChange={set("link")} {...field("link")} hint={page.style === "offer" ? words.linkNoteOffer : words.linkNote} />
      ) : null}
      {page.style === "offer" ? (
        <>
          <TextField id={`${page.id}-pricenote`} label={`${words.priceNote} ${panel.optional}`} value={optional(page.priceNote)} onChange={set("priceNote")} />
          <TextField id={`${page.id}-note`} label={`${words.note} ${panel.optional}`} value={optional(page.note)} onChange={set("note")} />
        </>
      ) : null}
    </>
  );
}
