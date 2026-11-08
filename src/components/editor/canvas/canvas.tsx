"use client";

import { useMemo } from "react";
import { TopBar } from "@/components/quiz-runtime/blocks";
import { PageView, type ViewContext } from "@/components/quiz-runtime/page-views";
import { canvas } from "@/content/dashboard/editor";
import { themeVars } from "@/lib/quiz/theme";
import { useEditor } from "../editor-context";
import { useMedia } from "../media-context";

const noop = () => undefined;

/**
 * The middle column: the selected page as people see it, in a phone frame. It draws the very same page views the real quiz
 * uses (one runtime, three uses: the public quiz, Try it and this canvas), only with nothing clickable.
 */
export function Canvas() {
  const doc = useEditor((s) => s.doc);
  const selectedId = useEditor((s) => s.selectedId);
  const answerPictures = useEditor((s) => s.answerPictures);
  const media = useMedia();
  const index = Math.max(0, doc.pages.findIndex((p) => p.id === selectedId));
  const page = doc.pages[index];
  const showProgress = index > 0 && index < doc.pages.length - 1;

  const ctx = useMemo<ViewContext>(
    () => ({
      doc,
      pictures: Object.fromEntries(media.items.map((item) => [item.id, item.src])),
      answers: {},
      problem: null,
      saving: false,
      saveFailed: false,
      showPoweredBy: true,
      answerPicturesOn: answerPictures,
      setAnswer: noop,
      next: noop,
      retry: noop,
    }),
    [doc, media.items, answerPictures],
  );

  return (
    <main className="flex min-w-0 flex-[999_1_380px] flex-col items-center gap-4">
      <div className="text-center">
        <h2 className="m-0 text-lg font-bold">{canvas.title(index + 1)}</h2>
        <span className="text-sm text-mute">{canvas.hint}</span>
      </div>
      <div
        style={themeVars(null)}
        className="@container relative flex h-[660px] w-[360px] max-w-full flex-col overflow-y-auto rounded-[28px] border border-line bg-quiz-bg font-inter text-quiz-fg shadow-[0_10px_30px_rgba(51,65,85,0.08)]"
      >
        {/* Nothing in here can be clicked or tabbed to: this is a picture of the page, not the page */}
        <div inert className="flex min-h-full flex-col">
          {showProgress ? <TopBar progress={index / (doc.pages.length - 1)} onBack={noop} /> : null}
          {page ? <PageView page={page} ctx={ctx} /> : null}
        </div>
      </div>
    </main>
  );
}
