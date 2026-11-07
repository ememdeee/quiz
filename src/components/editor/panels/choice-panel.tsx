"use client";

import { Checkbox } from "@/components/ui/controls";
import { panel } from "@/content/dashboard/editor";
import { dependentsOfAnswer } from "@/lib/quiz/conditions";
import { newId } from "@/lib/quiz/ids";
import { MAX_ANSWERS, MIN_ANSWERS, type PageOf } from "@/lib/quiz/schema";
import { useEditor, useEditorActions, useEditorUi, usePageEdit } from "../editor-context";
import { PictureField, RequiredRow, RowList, TextField } from "./fields";

function Toggle({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px]">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      {label}
    </label>
  );
}

export function ChoicePanel({ page }: { page: PageOf<"choice"> }) {
  const edit = usePageEdit(page);
  const doc = useEditor((s) => s.doc);
  const withPictures = useEditor((s) => s.answerPictures[page.id] === true);
  const { setAnswerPictures } = useEditorActions();
  const { requestRemoveAnswer } = useEditorUi();

  const remove = (index: number) => {
    const answer = page.answers[index];
    if (dependentsOfAnswer(doc, page.id, answer.id).length > 0) return requestRemoveAnswer(page.id, answer.id);
    edit(undefined, (d) => void d.answers.splice(index, 1));
  };

  return (
    <>
      <TextField id={`${page.id}-question`} label={panel.question} value={page.question} onChange={(v) => edit("question", (d) => void (d.question = v))} />
      <RowList
        label={withPictures ? "Answers" : panel.choice.answers}
        rows={page.answers.map((a) => ({ id: a.id, value: a.text }))}
        inputLabel={withPictures ? panel.choice.answerLabel : panel.choice.answer}
        removeLabel={panel.choice.remove}
        addLabel={panel.choice.add}
        canAdd={page.answers.length < MAX_ANSWERS}
        canRemove={page.answers.length > MIN_ANSWERS}
        onChange={(index, v) => edit(`answer-${page.answers[index].id}`, (d) => void (d.answers[index].text = v))}
        onRemove={remove}
        onAdd={() => edit(undefined, (d) => void d.answers.push({ id: newId(), text: "", picture: null }))}
        leading={withPictures ? () => <span aria-hidden="true" className="size-11 flex-none rounded-lg border border-line bg-soft" /> : undefined}
      />
      {withPictures ? null : <PictureField />}
      <div className="flex flex-col">
        <Toggle id={`${page.id}-multiple`} label={panel.choice.multiple} checked={page.multiple} onChange={(v) => edit(undefined, (d) => void (d.multiple = v))} />
        <Toggle id={`${page.id}-pictures`} label={panel.choice.pictures} checked={withPictures} onChange={(v) => setAnswerPictures(page.id, v)} />
      </div>
      <RequiredRow checked={page.required} onChange={(v) => edit(undefined, (d) => void (d.required = v))} />
    </>
  );
}
