"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { PlusIcon, SparklesIcon } from "@/components/ui/icons";
import { pageList } from "@/content/dashboard/editor";
import { pageTypes } from "@/lib/quiz/page-types";
import { isLocked } from "@/lib/quiz/ops";
import { cn } from "@/lib/utils";
import { useEditor, useEditorUi } from "../editor-context";
import { PageRow } from "./page-row";

/** The left column (board Main): every page in order, drag to reorder, add a page. */
export function PageList({ maxPages }: { maxPages: number }) {
  const pages = useEditor((s) => s.doc.pages);
  const selectedId = useEditor((s) => s.selectedId);
  const { requestAddPage, requestMove, requestAi } = useEditorUi();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const noQuestions = !pages.some((p) => pageTypes[p.type].isQuestion);
  const movable = pages.filter((p) => !isLocked(p)).map((p) => p.id);

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const to = pages.findIndex((p) => p.id === over.id);
    if (to !== -1) requestMove(String(active.id), to);
  };

  const addButton = (
    <Button
      shape="box"
      onClick={requestAddPage}
      className={cn("min-h-[52px] w-full text-base", noQuestions && "pulse-ring")}
      variant={noQuestions ? "primary" : "secondary"}
    >
      <PlusIcon />
      {noQuestions ? pageList.addFirst : pageList.add}
    </Button>
  );

  return (
    <aside className="flex min-w-0 flex-1 basis-[280px] flex-col gap-3 self-start lg:max-w-[320px]">
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 text-lg font-bold">{pageList.title}</h2>
        <span className="text-sm text-mute">{pageList.count(pages.length, maxPages)}</span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={movable} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {pages.map((page, index) => (
              <div key={page.id} className="contents">
                {noQuestions && index === pages.length - 1 ? addButton : null}
                <PageRow page={page} position={index + 1} selected={page.id === selectedId} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {noQuestions ? null : addButton}

      <button
        type="button"
        onClick={requestAi}
        className="mt-2 flex min-h-14 items-center gap-3 rounded-xl border border-line-strong bg-white px-3.5 py-2 text-left text-slate transition-colors duration-200 hover:bg-dash focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate"
      >
        <SparklesIcon size={22} />
        <span>
          <span className="block text-[15px] font-semibold">{pageList.ai.title}</span>
          <span className="block text-[13px] text-mute">{pageList.ai.text}</span>
        </span>
      </button>
    </aside>
  );
}
