"use client";

import { panel } from "@/content/dashboard/editor";
import type { PageOf } from "@/lib/quiz/schema";
import { usePageEdit } from "../editor-context";
import { AreaField, ChipGroup, Note, PictureField, RequiredRow, TextField } from "./fields";

export function WelcomePanel({ page }: { page: PageOf<"welcome"> }) {
  const edit = usePageEdit(page);
  return (
    <>
      <TextField id={`${page.id}-title`} label={panel.title1} value={page.title} onChange={(v) => edit("title", (d) => void (d.title = v))} />
      <AreaField id={`${page.id}-text`} label={panel.shortText} rows={3} value={page.text} onChange={(v) => edit("text", (d) => void (d.text = v))} />
      <PictureField />
      <Note>{panel.welcomeNote}</Note>
    </>
  );
}

export function InfoPanel({ page }: { page: PageOf<"info"> }) {
  const edit = usePageEdit(page);
  return (
    <>
      <TextField id={`${page.id}-title`} label={panel.title1} value={page.title} onChange={(v) => edit("title", (d) => void (d.title = v))} />
      <AreaField id={`${page.id}-text`} label={panel.text} rows={4} value={page.text} onChange={(v) => edit("text", (d) => void (d.text = v))} />
      <PictureField />
    </>
  );
}

const inputs = [
  { value: "any", label: panel.text1.any },
  { value: "email", label: panel.text1.email },
  { value: "phone", label: panel.text1.phone },
] as const;

export function TextPanel({ page }: { page: PageOf<"text"> }) {
  const edit = usePageEdit(page);
  return (
    <>
      <TextField id={`${page.id}-question`} label={panel.question} value={page.question} onChange={(v) => edit("question", (d) => void (d.question = v))} />
      <ChipGroup label={panel.text1.typing} value={page.input} options={inputs} note={panel.text1.note} onChange={(v) => edit(undefined, (d) => void (d.input = v))} />
      <TextField id={`${page.id}-hint`} label={panel.text1.hint} value={page.hint} onChange={(v) => edit("hint", (d) => void (d.hint = v))} />
      <RequiredRow checked={page.required} onChange={(v) => edit(undefined, (d) => void (d.required = v))} />
    </>
  );
}
