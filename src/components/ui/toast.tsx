"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { AlertCircleIcon } from "./icons";

/**
 * Toasts (boards UIFeedback and States). A confirmation fades after 5 seconds, one with Undo stays
 * for 8, an error stays until it is dealt with. They sit at the bottom centre and never block the page.
 */
export const TOAST_SECONDS = { confirm: 5, undo: 8 } as const;

export type ToastInput = {
  message: string;
  tone?: "default" | "error";
  action?: { label: string; onSelect: () => void };
  /** Seconds before it goes away. Left out: 5 for a normal one, never for an error. */
  seconds?: number;
};

type ToastItem = ToastInput & { id: number };

const ToastContext = createContext<{ show: (toast: ToastInput) => number; dismiss: (id: number) => void } | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast needs a ToastProvider above it");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => setItems((all) => all.filter((t) => t.id !== id)), []);
  const show = useCallback((toast: ToastInput) => {
    const id = ++counter.current;
    setItems((all) => [...all, { ...toast, id }]);
    return id;
  }, []);
  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-6 z-[60] flex flex-col items-center gap-3">
        {items.map((item) => (
          <ToastView key={item.id} item={item} onDone={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastView({ item, onDone }: { item: ToastItem; onDone: (id: number) => void }) {
  const isError = item.tone === "error";
  const seconds = item.seconds ?? (isError ? null : TOAST_SECONDS.confirm);

  useEffect(() => {
    if (seconds === null) return;
    const timer = setTimeout(() => onDone(item.id), seconds * 1000);
    return () => clearTimeout(timer);
  }, [item.id, seconds, onDone]);

  return (
    <div
      role={isError ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-[560px] animate-[appear_0.25s_ease-out] items-center justify-between gap-4 rounded-[14px] px-[18px] py-3.5 shadow-[0_12px_32px_rgba(51,65,85,0.25)]",
        isError ? "border-2 border-danger bg-white text-ink" : "bg-slate text-white",
      )}
    >
      <span className="inline-flex items-center gap-3 text-base font-semibold">
        {isError ? <AlertCircleIcon size={22} className="flex-none text-danger" /> : null}
        {item.message}
      </span>
      {item.action ? (
        <Button
          shape="box"
          size="sm"
          variant={isError ? "secondary" : "ghost"}
          className={cn(!isError && "border border-white text-white hover:bg-white/10 focus-visible:outline-white")}
          onClick={() => {
            item.action?.onSelect();
            onDone(item.id);
          }}
        >
          {item.action.label}
        </Button>
      ) : null}
    </div>
  );
}
