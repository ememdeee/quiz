"use client";

import { canvas } from "@/content/dashboard/editor";
import { useEditor } from "../editor-context";
import { PageView } from "./page-views";

/** The middle column: the selected page as people see it, in a 340 px phone frame. */
export function Canvas() {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const index = Math.max(0, doc.pages.findIndex((p) => p.id === selectedId));
  const page = doc.pages[index];
  const showProgress = index > 0 && index < doc.pages.length - 1;

  return (
    <main className="flex min-w-0 flex-[999_1_380px] flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="m-0 text-lg font-bold">{canvas.title(index + 1)}</h2>
        <span className="text-sm text-mute">{canvas.hint}</span>
      </div>
      <div className="flex w-[340px] max-w-full flex-col gap-[18px] rounded-[28px] border border-line bg-white px-[22px] pb-7 pt-8 shadow-[0_10px_30px_rgba(51,65,85,0.08)]">
        {showProgress ? (
          <div className="h-1.5 rounded-full bg-line" aria-hidden="true">
            <div className="h-1.5 rounded-full bg-slate" style={{ width: `${(index / (doc.pages.length - 1)) * 100}%` }} />
          </div>
        ) : null}
        {page ? <PageView page={page} doc={doc} /> : null}
      </div>
    </main>
  );
}
