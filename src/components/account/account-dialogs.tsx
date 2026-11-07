"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { deleteAccountDialog, disconnectGoogleDialog, passwordDialog } from "@/content/dashboard/account";
import { PASSWORD_MIN_LENGTH } from "@/lib/validation";

/**
 * "Change your password" (board AccountPassword). A person who logs in with Google only has no current password,
 * so for them the same dialog just sets one.
 */
export function PasswordDialog({
  hasPassword,
  onSave,
  onClose,
}: {
  hasPassword: boolean;
  onSave: (input: { current?: string; next: string }) => Promise<"ok" | "wrong_password" | "failed">;
  onClose: () => void;
}) {
  const words = passwordDialog;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<"wrong" | "mismatch" | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (next !== confirm) return setError("mismatch");
    setError(null);
    setPending(true);
    const result = await onSave({ current: hasPassword ? current : undefined, next });
    setPending(false);
    if (result === "wrong_password") setError("wrong");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()} title={hasPassword ? words.title : words.titleSet} className="max-w-[460px]">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {hasPassword ? (
          <Field label={words.current} htmlFor="pw-current" error={error === "wrong" ? words.wrongCurrent : undefined}>
            <Input id="pw-current" shape="box" type="password" autoComplete="current-password" value={current} invalid={error === "wrong"} onChange={(e) => setCurrent(e.target.value)} autoFocus required />
          </Field>
        ) : null}
        <Field label={words.next} htmlFor="pw-next" hint={words.nextHint}>
          <Input id="pw-next" shape="box" type="password" autoComplete="new-password" minLength={PASSWORD_MIN_LENGTH} value={next} onChange={(e) => setNext(e.target.value)} autoFocus={!hasPassword} required />
        </Field>
        <Field label={words.confirm} htmlFor="pw-confirm" error={error === "mismatch" ? words.mismatch : undefined}>
          <Input id="pw-confirm" shape="box" type="password" autoComplete="new-password" value={confirm} invalid={error === "mismatch"} onChange={(e) => setConfirm(e.target.value)} required />
        </Field>
        <p className="m-0 rounded-xl bg-soft px-3.5 py-3 text-sm leading-[21px] text-ink">{words.note}</p>
        <div className="flex justify-end gap-3">
          <Button shape="box" variant="secondary" onClick={onClose}>
            {words.cancel}
          </Button>
          <Button shape="box" type="submit" loading={pending}>
            {words.update}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

/** "Disconnect Google?" (no board, gap G6): one question, nothing to type. */
export function DisconnectGoogleDialog({ onConfirm, onClose }: { onConfirm: () => Promise<boolean>; onClose: () => void }) {
  const words = disconnectGoogleDialog;
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  const confirm = async () => {
    setPending(true);
    setFailed(false);
    const done = await onConfirm();
    setPending(false);
    setFailed(!done);
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !pending && onClose()}
      title={words.title}
      description={words.text}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" disabled={pending} onClick={onClose}>
            {words.keep}
          </Button>
          <Button shape="box" size="sm" loading={pending} onClick={confirm}>
            {words.confirm}
          </Button>
        </>
      }
    >
      {failed ? (
        <p role="alert" className="m-0 text-sm text-danger">
          {words.failed}
        </p>
      ) : null}
    </Dialog>
  );
}

/** "Delete your account?" (board AccountDelete): type DELETE, with a way to download the responses first. */
export function DeleteAccountDialog({ onDownload, onConfirm, onClose }: { onDownload: () => void; onConfirm: () => Promise<void>; onClose: () => void }) {
  const words = deleteAccountDialog;
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (typed !== words.word || pending) return;
    setPending(true);
    await onConfirm();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !pending && onClose()}
      title={words.title}
      description={
        <>
          {words.before} <strong>{words.quizzes}</strong> {words.and} <strong>{words.responses}</strong>
          {words.after}
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <button type="button" onClick={onDownload} className="self-start rounded-md text-[15px] font-semibold text-slate underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate">
          {words.download}
        </button>
        <Field label={words.confirmLabel} htmlFor="delete-account-confirm">
          <Input id="delete-account-confirm" shape="box" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus />
        </Field>
        <div className="flex justify-end gap-3">
          <Button shape="box" size="sm" variant="secondary" disabled={pending} onClick={onClose}>
            {words.keep}
          </Button>
          <Button shape="box" size="sm" variant="danger" type="submit" disabled={typed !== words.word} loading={pending}>
            {words.confirm}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
