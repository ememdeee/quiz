"use client";

import { useState, type FormEvent } from "react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Field, Input } from "@/components/ui/field";
import { InfoIcon, TrashIcon } from "@/components/ui/icons";
import { responseLimits, responsesDelete } from "@/content/dashboard/responses";
import { routes } from "@/lib/routes";
import Link from "next/link";

/** "Delete Response 128?" (board ResponsesDelete). There is no Undo, so it asks first. */
export function DeleteOneDialog({ number, onConfirm, onClose }: { number: number; onConfirm: () => Promise<void>; onClose: () => void }) {
  const words = responsesDelete.one;
  const [pending, setPending] = useState(false);
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !pending && onClose()}
      title={words.title(number)}
      description={words.text}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
            {words.keep}
          </Button>
          <Button
            shape="box"
            size="sm"
            variant="danger"
            loading={pending}
            className="gap-2"
            onClick={async () => {
              setPending(true);
              await onConfirm();
              setPending(false);
            }}
          >
            <TrashIcon size={16} />
            {words.confirm}
          </Button>
        </>
      }
    />
  );
}

/** "Delete all 128 responses?": the red button works only when DELETE is typed exactly. */
export function DeleteAllDialog({ count, onDownload, onConfirm, onClose }: { count: number; onDownload: () => void; onConfirm: () => Promise<void>; onClose: () => void }) {
  const words = responsesDelete.all;
  const [typed, setTyped] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (typed !== words.word || pending) return;
    setPending(true);
    await onConfirm();
    setPending(false);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && !pending && onClose()} title={words.title(count)} description={words.text}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <button type="button" onClick={onDownload} className="self-start rounded-md text-[15px] font-semibold text-slate underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate">
          {words.download}
        </button>
        <Field label={words.confirmLabel} htmlFor="delete-all-confirm">
          <Input id="delete-all-confirm" shape="box" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus />
        </Field>
        <div className="flex justify-end gap-2.5">
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
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

/** The banner at 450 of 500 finished responses, and the red one when the quiz is full (board LimitStates). */
export function ResponseLimitBanner({ finished, max }: { finished: number; max: number }) {
  const words = responseLimits;
  const link = (
    <Link href={routes.contact} className="font-bold text-current underline">
      {words.contact}
    </Link>
  );
  if (finished >= max) {
    return (
      <Banner tone="error">
        <strong>{words.fullTitle}</strong> {words.fullText(max)} {link} {words.fullEnd}
      </Banner>
    );
  }
  if (finished >= Math.ceil(max * 0.9)) {
    return (
      <Banner icon={<InfoIcon />}>
        <strong>{words.nearTitle(finished, max)}</strong> {words.nearText} {link} {words.nearEnd}
      </Banner>
    );
  }
  return null;
}
