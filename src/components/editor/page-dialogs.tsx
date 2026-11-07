"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { pageDialogs } from "@/content/dashboard/editor";
import { routes } from "@/lib/routes";

/** "Delete this page?" when other pages' conditions look at it (board DashErrors). Pages nobody depends on are deleted at once, with Undo. */
export function DeletePageDialog({ count, onConfirm, onClose }: { count: number; onConfirm: () => void; onClose: () => void }) {
  const words = pageDialogs.deletePage;
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={words.title}
      description={words.text(count)}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
            {words.keep}
          </Button>
          <Button shape="box" size="sm" variant="danger" onClick={onConfirm}>
            {words.confirm}
          </Button>
        </>
      }
    />
  );
}

export function RemoveAnswerDialog({ count, answer, onConfirm, onClose }: { count: number; answer: string; onConfirm: () => void; onClose: () => void }) {
  const words = pageDialogs.removeAnswer;
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={words.title}
      description={words.text(count, answer)}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
            {words.keep}
          </Button>
          <Button shape="box" size="sm" variant="danger" onClick={onConfirm}>
            {words.confirm}
          </Button>
        </>
      }
    />
  );
}

/** "This quiz has 15 pages": shown instead of the Add page dialog and Duplicate when the plan is full (board LimitStates). */
export function PageLimitDialog({ max, onClose }: { max: number; onClose: () => void }) {
  const words = pageDialogs.pageLimit;
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={words.title(max)}
      description={words.text}
      actions={
        <>
          <Button shape="box" size="sm" variant="secondary" onClick={onClose}>
            {words.back}
          </Button>
          <ButtonLink shape="box" size="sm" href={routes.contact}>
            {words.contact}
          </ButtonLink>
        </>
      }
    />
  );
}
