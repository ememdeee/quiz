"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FieldError, Textarea } from "@/components/ui/field";
import { feedbackDialog as words } from "@/content/feedback";
import type { ErrorCode } from "@/lib/errors";
import { FEEDBACK_MAX } from "@/lib/feedback";
import { sendFeedbackAction } from "@/server/actions/feedback";

const problemFor = (code: ErrorCode) => (code === "rate_limited" ? words.errors.rateLimited : code === "logged_out" ? words.errors.loggedOut : words.errors.generic);

/** "Send feedback" (gap G30, no board): a message box that goes to the owner. Shows its own thank-you, so it works anywhere the account menu does. */
export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const send = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setProblem(null);
    const result = await sendFeedbackAction(message);
    setSending(false);
    if (result.ok) setSent(true);
    else setProblem(problemFor(result.error));
  };

  if (sent) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()} title={words.sentTitle} description={words.sentText} className="max-w-[460px] gap-5 p-8" actions={<Button shape="box" onClick={onClose}>{words.close}</Button>} />
    );
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !sending && onClose()}
      title={words.title}
      description={words.text}
      className="max-w-[520px] gap-5 p-8"
      actions={
        <>
          <Button shape="box" variant="secondary" disabled={sending} onClick={onClose}>
            {words.cancel}
          </Button>
          <Button shape="box" loading={sending} disabled={!message.trim()} className="px-[26px]" onClick={() => void send()}>
            {words.send}
          </Button>
        </>
      }
    >
      <label htmlFor="feedback-message" className="sr-only">
        {words.label}
      </label>
      <Textarea id="feedback-message" shape="box" rows={6} maxLength={FEEDBACK_MAX} value={message} onChange={(event) => setMessage(event.target.value)} placeholder={words.placeholder} autoFocus />
      {problem ? <FieldError>{problem}</FieldError> : null}
    </Dialog>
  );
}
