"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { adminDialogs } from "@/content/admin";
import type { AdminPerson } from "@/lib/admin/types";
import { quizCount, responseCount } from "@/lib/admin/people";

/** "Suspend Maria Gomez?" (board AdminDialogs). Says plainly what happens and that nothing is deleted. */
export function SuspendDialog({ person, onConfirm, onClose }: { person: AdminPerson; onConfirm: () => Promise<boolean>; onClose: () => void }) {
  const words = adminDialogs.suspend;
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    setPending(true);
    setFailed(false);
    const done = await onConfirm();
    setPending(false);
    if (!done) setFailed(true);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !pending && onClose()}
      title={words.title(person.name)}
      description={words.text(quizCount(person))}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" disabled={pending} onClick={onClose}>
            {words.cancel}
          </Button>
          <Button shape="box" size="sm" variant="danger" loading={pending} onClick={confirm}>
            {words.confirm}
          </Button>
        </>
      }
    >
      {failed ? (
        <p role="alert" className="m-0 text-sm text-danger">
          {adminDialogs.failed}
        </p>
      ) : null}
    </Dialog>
  );
}

/** "Delete Maria Gomez's account?": shows what goes with it and asks for their email (board AdminDialogs). */
export function DeletePersonDialog({ person, onConfirm, onClose }: { person: AdminPerson; onConfirm: (typed: string) => Promise<boolean>; onClose: () => void }) {
  const words = adminDialogs.remove;
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const matches = typed.trim().toLowerCase() === person.email.toLowerCase();

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!matches || pending) return;
    setPending(true);
    setFailed(false);
    const done = await onConfirm(typed);
    if (!done) {
      setPending(false);
      setFailed(true);
    }
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !pending && onClose()}
      title={words.title(person.name)}
      description={
        <>
          {words.before} <strong>{words.quizzes(quizCount(person))}</strong> {words.and} <strong>{words.responses(responseCount(person))}</strong> {words.after}
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label={words.label} htmlFor="delete-person-email" error={failed ? adminDialogs.failed : undefined}>
          <Input id="delete-person-email" shape="box" value={typed} onChange={(event) => setTyped(event.target.value)} autoComplete="off" placeholder={person.email} autoFocus />
        </Field>
        <div className="flex justify-end gap-2.5">
          <Button shape="box" size="sm" variant="secondary" disabled={pending} onClick={onClose}>
            {words.cancel}
          </Button>
          <Button shape="box" size="sm" variant="danger" type="submit" disabled={!matches} loading={pending}>
            {words.confirm}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
