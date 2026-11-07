"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A dialog (board UIFeedback). Focus moves into it and returns when it closes. Escape and a click
 * outside close it, unless `dismissible` is false (for messages the person must answer, like "Your account is
 * suspended"). The safe choice goes on the left of `actions`, the main one on the right.
 */
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  actions,
  dismissible = true,
  className,
  children,
}: {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  dismissible?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  const keep = (event: Event) => {
    if (!dismissible) event.preventDefault();
  };
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-[appear_0.2s_ease-out] bg-scrim" />
        <DialogPrimitive.Content
          onEscapeKeyDown={keep}
          onPointerDownOutside={keep}
          onInteractOutside={keep}
          {...(description ? {} : { "aria-describedby": undefined })}
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 animate-[appear_0.2s_ease-out] flex-col gap-4 overflow-y-auto rounded-[20px] bg-white p-7 text-slate shadow-[0_16px_40px_rgba(51,65,85,0.18)] focus:outline-none",
            className,
          )}
        >
          <div>
            <DialogPrimitive.Title className="m-0 text-xl font-bold leading-7 text-ink">{title}</DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="m-0 mt-1.5 text-[15px] leading-[23px] text-ink-2">{description}</DialogPrimitive.Description>
            ) : null}
          </div>
          {children}
          {actions ? <div className="flex flex-wrap justify-end gap-2.5">{actions}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
