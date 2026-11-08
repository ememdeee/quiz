"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { CloseIcon, InfoIcon } from "@/components/ui/icons";
import { addPageDialog } from "@/content/dashboard/editor";
import { addablePageTypes, pageTypes } from "@/lib/quiz/page-types";
import type { PageType } from "@/lib/quiz/schema";
import { cn } from "@/lib/utils";

/** "What do you want to add?" (board AddPage): five kinds of page in two groups. Start and End are never offered. */
export function AddPageDialog({ onAdd, onClose }: { onAdd: (type: PageType) => void; onClose: () => void }) {
  const [type, setType] = useState<PageType>("choice");

  const group = (title: string, kind: "ask" | "show", extra?: React.ReactNode) => (
    <div role="radiogroup" aria-label={title} className="flex flex-col gap-2.5">
      <h3 className="m-0 text-sm font-bold uppercase tracking-[0.04em] text-mute">{title}</h3>
      {addablePageTypes(kind).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={type === value}
          onClick={() => setType(value)}
          className={cn(
            "flex min-h-[72px] flex-col items-start justify-center rounded-xl px-4 py-3 text-left text-slate transition-colors duration-150 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
            type === value ? "border-2 border-slate bg-soft px-[15px]" : "border border-line bg-white hover:bg-dash",
          )}
        >
          <span className="text-base font-semibold">{pageTypes[value].label}</span>
          <span className="mt-0.5 text-sm text-mute">{pageTypes[value].description}</span>
        </button>
      ))}
      {extra}
    </div>
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={addPageDialog.title} description={addPageDialog.subtitle} className="max-w-[820px] gap-6 p-8">
      <Button shape="box" variant="secondary" aria-label={addPageDialog.close} onClick={onClose} className="absolute right-6 top-6 size-11 px-0">
        <CloseIcon size={18} />
      </Button>
      <div className="grid gap-8 md:grid-cols-2">
        {group(addPageDialog.ask, "ask")}
        {group(
          addPageDialog.show,
          "show",
          <div className="mt-1.5 flex items-start gap-2.5 rounded-xl border border-line bg-soft px-3.5 py-3 text-sm leading-[21px] text-ink">
            <InfoIcon size={18} className="mt-0.5 flex-none" />
            <span>{addPageDialog.note}</span>
          </div>,
        )}
      </div>
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <Button shape="box" variant="secondary" onClick={onClose}>
          {addPageDialog.cancel}
        </Button>
        <Button shape="box" className="px-[26px]" onClick={() => onAdd(type)}>
          {addPageDialog.add}
        </Button>
      </div>
    </Dialog>
  );
}
