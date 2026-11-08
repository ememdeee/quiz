"use client";

import { Checkbox } from "@/components/ui/controls";
import { panel } from "@/content/dashboard/editor";
import { dependentsOfAnswer } from "@/lib/quiz/conditions";
import { newId } from "@/lib/quiz/ids";
import { MAX_ANSWERS, MIN_ANSWERS, type PageOf } from "@/lib/quiz/schema";
import { useEditor, useEditorActions, useEditorUi, useFieldProps, usePageEdit } from "../editor-context";
import { pictureDialog } from "@/content/dashboard/settings";
import { useMedia } from "../media-context";
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
  const field = useFieldProps(page.id);
  const doc = useEditor((s) => s.doc);
  const withPictures = useEditor((s) => s.answerPictures[page.id] === true);
  const { setAnswerPictures } = useEditorActions();
  const { requestRemoveAnswer, requestPicture } = useEditorUi();
  const { srcOf } = useMedia();

  const remove = (index: number) => {
    const answer = page.answers[index];
    if (dependentsOfAnswer(doc, page.id, answer.id).length > 0) return requestRemoveAnswer(page.id, answer.id);
    edit(undefined, (d) => void d.answers.splice(index, 1));
  };

  return (
    <>
      <TextField id={`${page.id}-question`} label={panel.question} value={page.question} onChange={(v) => edit("question", (d) => void (d.question = v))} {...field("question")} />
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
        error={field("answers").error}
        rowError={(index) => field(`answers.${page.answers[index].id}`).error}
        onRowBlur={(index) => field(`answers.${page.answers[index].id}`).onBlur()}
        onAdd={() => edit(undefined, (d) => void d.answers.push({ id: newId(), text: "", picture: null }))}
        leading={
          withPictures
            ? (index) => (
                <button
                  type="button"
                  aria-label={pictureDialog.change}
                  onClick={() => requestPicture((id) => edit(undefined, (d) => void (d.answers[index].picture = id)))}
                  className="size-11 flex-none overflow-hidden rounded-lg border border-line bg-soft focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
                >
                  {srcOf(page.answers[index].picture) ? (
                    // eslint-disable-next-line @next/next/no-img-element -- library pictures are small data URLs or static files
                    <img src={srcOf(page.answers[index].picture) ?? ""} alt="" className="size-full object-cover" />
                  ) : null}
                </button>
              )
            : undefined
        }
      />
      {withPictures ? null : <PictureField value={page.picture} onChange={(id) => edit(undefined, (d) => void (d.picture = id))} />}
      <div className="flex flex-col">
        <Toggle id={`${page.id}-multiple`} label={panel.choice.multiple} checked={page.multiple} onChange={(v) => edit(undefined, (d) => void (d.multiple = v))} />
        <Toggle id={`${page.id}-pictures`} label={panel.choice.pictures} checked={withPictures} onChange={(v) => setAnswerPictures(page.id, v)} />
      </div>
      <RequiredRow checked={page.required} onChange={(v) => edit(undefined, (d) => void (d.required = v))} />
    </>
  );
}
