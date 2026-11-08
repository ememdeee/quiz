"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A panel that slides in from the right edge and holds a form (board Settings). Same focus and Escape rules as a dialog. */
export function Drawer({
  title,
  headerEnd,
  footer,
  onClose,
  className,
  children,
}: {
  title: string;
  headerEnd?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 animate-[appear_0.2s_ease-out] bg-scrim" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[460px] max-w-full animate-[drawer_0.25s_var(--ease-enter)] flex-col bg-white text-slate shadow-[-10px_0_40px_rgba(29,42,36,0.25)] focus:outline-none",
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <DialogPrimitive.Title className="m-0 text-xl font-bold">{title}</DialogPrimitive.Title>
            {headerEnd}
          </div>
          <div className="flex grow flex-col gap-[26px] overflow-y-auto p-6">{children}</div>
          {footer ? <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">{footer}</div> : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
