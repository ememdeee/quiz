"use client";

import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { deleteDialog, quizLimitDialog, renameDialog } from "@/content/dashboard/quizzes";
import type { QuizSummary } from "@/lib/quizzes/types";
import { routes } from "@/lib/routes";

/** "Rename quiz". Only the name changes; the web address stays as it is. */
export function RenameDialog({ quiz, onSave, onClose }: { quiz: QuizSummary; onSave: (name: string) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(quiz.name);
  const [pending, setPending] = useState(false);
  const canSave = name.trim() !== "" && !pending;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSave) return;
    setPending(true);
    await onSave(name);
    setPending(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={renameDialog.title}>
      <form onSubmit={submit} className="flex flex-col gap-[18px]">
        <Field label={renameDialog.nameLabel} htmlFor="rename-quiz">
          <Input id="rename-quiz" shape="box" value={name} onChange={(e) => setName(e.target.value)} autoFocus onFocus={(e) => e.target.select()} />
        </Field>
        <div className="flex justify-end gap-3">
          <Button shape="box" variant="secondary" onClick={onClose}>
            {renameDialog.cancel}
          </Button>
          <Button shape="box" type="submit" disabled={!canSave} loading={pending}>
            {renameDialog.save}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** "Delete “name”?" The person types the quiz name before the red button works (board States). */
export function DeleteDialog({ quiz, onConfirm, onClose }: { quiz: QuizSummary; onConfirm: () => Promise<void>; onClose: () => void }) {
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const matches = typed.trim() === quiz.name.trim();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!matches || pending) return;
    setPending(true);
    await onConfirm();
    setPending(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={deleteDialog.title(quiz.name)} description={deleteDialog.text}>
      <form onSubmit={submit} className="flex flex-col gap-[18px]">
        <Field label={deleteDialog.confirmLabel} htmlFor="delete-quiz">
          <Input id="delete-quiz" shape="box" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus />
        </Field>
        <div className="flex justify-end gap-3">
          <Button shape="box" variant="secondary" onClick={onClose}>
            {deleteDialog.keep}
          </Button>
          <Button shape="box" variant="danger" type="submit" disabled={!matches} loading={pending}>
            {deleteDialog.confirm}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** "You've reached 5 quizzes": shown instead of New quiz and Duplicate when the plan is full (board LimitStates). */
export function QuizLimitDialog({ max, onClose }: { max: number; onClose: () => void }) {
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={quizLimitDialog.title(max)}
      description={quizLimitDialog.text}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
            {quizLimitDialog.back}
          </Button>
          <ButtonLink shape="box" size="sm" href={routes.contact}>
            {quizLimitDialog.contact}
          </ButtonLink>
        </>
      }
    />
  );
}
