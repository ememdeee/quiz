"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripIcon, LockIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { pageList } from "@/content/dashboard/editor";
import { pageTypes } from "@/lib/quiz/page-types";
import type { Page, PageType } from "@/lib/quiz/schema";
import { isLocked } from "@/lib/quiz/ops";
import { cn } from "@/lib/utils";
import { useEditorActions } from "../editor-context";
import { PageMenu } from "./page-menu";

/** One page in the left-hand list (boards Main and PageMenu). Start and End show a lock; the others have a drag handle. */
export function PageRow({ page, position, selected }: { page: Page; position: number; selected: boolean }) {
  const { select } = useEditorActions();
  const locked = isLocked(page);
  const sortable = useSortable({ id: page.id, disabled: locked });
  const definition = pageTypes[page.type as PageType] as { title: (p: Page) => string; listLabel: (p: Page) => string };

  return (
    <div
      ref={sortable.setNodeRef}
      style={{ transform: CSS.Transform.toString(sortable.transform), transition: sortable.transition }}
      className={cn(
        "flex min-h-14 items-center gap-2.5 rounded-xl px-3 py-2",
        selected ? "border-2 border-slate bg-soft px-[11px]" : "border border-line bg-white",
        sortable.isDragging && "relative z-10 opacity-90 shadow-[0_12px_32px_rgba(51,65,85,0.18)]",
      )}
    >
      {locked ? (
        <span role="img" aria-label={pageList.locked} className="grid size-5 flex-none place-items-center text-ctrl">
          <LockIcon />
        </span>
      ) : (
        <button
          type="button"
          aria-label={pageList.dragHandle}
          className="grid size-7 flex-none cursor-grab touch-none place-items-center rounded-md text-ctrl focus-visible:outline-[3px] focus-visible:outline-slate active:cursor-grabbing"
          {...sortable.attributes}
          {...sortable.listeners}
        >
          <GripIcon />
        </button>
      )}
      <button
        type="button"
        aria-current={selected ? "true" : undefined}
        onClick={() => select(page.id)}
        className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
      >
        <span className={cn("grid size-7 flex-none place-items-center rounded-full text-[13px] font-semibold", selected ? "bg-slate text-white" : "bg-soft")}>{position}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">{definition.title(page) || pageTypes[page.type].label}</span>
          <span className={cn("block truncate text-[13px]", selected ? "text-ink-2" : "text-mute")}>{definition.listLabel(page)}</span>
        </span>
        {page.show ? <Pill className="flex-none px-2 py-0.5 text-xs">{pageList.onlySome}</Pill> : null}
      </button>
      {selected && !locked ? <PageMenu pageId={page.id} /> : null}
    </div>
  );
}
