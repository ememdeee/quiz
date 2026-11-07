"use client";

import type { ComponentType, ReactNode } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { canvas } from "@/content/dashboard/editor";
import { pageTypes } from "@/lib/quiz/page-types";
import { estimateMinutes, takesAbout } from "@/lib/quiz/time-estimate";
import type { Page, PageOf, PageType, QuizDocument } from "@/lib/quiz/schema";
import { cn } from "@/lib/utils";
import { useEditor } from "../editor-context";
import { useMedia } from "../media-context";

/**
 * What a person sees on each kind of page, drawn still (the live quiz comes with the quiz-runtime slice).
 * Colors follow the quiz theme: the same slate set the design shows by default.
 */
type ViewProps<T extends PageType> = { page: PageOf<T>; doc: QuizDocument };

const Title = ({ children, size = "md" }: { children: ReactNode; size?: "md" | "lg" }) => (
  <h3 className={cn("m-0 mt-2 text-center font-bold", size === "lg" ? "text-[26px] leading-8" : "text-2xl leading-[30px]")}>{children}</h3>
);
const Text = ({ children }: { children: ReactNode }) => <p className="m-0 text-center text-base leading-6 text-ink-2">{children}</p>;
const Cta = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("flex min-h-[52px] items-center justify-center rounded-[14px] bg-slate text-[17px] font-semibold text-white", className)}>{children}</div>
);
const Hint = ({ children }: { children: ReactNode }) => <span className="text-center text-sm text-mute">{children}</span>;
function Picture({ id }: { id: string | null }) {
  const src = useMedia().srcOf(id);
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- library pictures are small data URLs or static files
    <img src={src} alt="" className="h-[150px] w-full rounded-2xl object-cover" />
  ) : (
    <div className="grid h-[150px] place-items-center rounded-2xl bg-soft text-sm text-mute">{canvas.yourPicture}</div>
  );
}

function WelcomeView({ page, doc }: ViewProps<"welcome">) {
  return (
    <>
      {page.picture ? <Picture id={page.picture} /> : null}
      <Title size="lg">{page.title}</Title>
      {page.text ? <Text>{page.text}</Text> : null}
      <Cta>{canvas.startQuiz}</Cta>
      <Hint>{doc.pages.some((p) => pageTypes[p.type].isQuestion) ? takesAbout(estimateMinutes(doc)) : canvas.sharedNote}</Hint>
    </>
  );
}

function AnswerPicture({ id }: { id: string | null }) {
  const src = useMedia().srcOf(id);
  // eslint-disable-next-line @next/next/no-img-element -- library pictures are small data URLs or static files
  return src ? <img src={src} alt="" className="h-24 w-full object-cover" /> : <div className="h-24 bg-soft" />;
}

function ChoiceView({ page }: ViewProps<"choice">) {
  const withPictures = useEditor((s) => s.answerPictures[page.id] === true);
  return (
    <>
      {page.picture ? <Picture id={page.picture} /> : null}
      <Title>{page.question}</Title>
      {withPictures ? (
        <div className="grid grid-cols-2 gap-3">
          {page.answers.map((answer) => (
            <div key={answer.id} className="overflow-hidden rounded-[14px] border-2 border-line">
              <AnswerPicture id={answer.picture} />
              <div className="px-3 py-2.5 text-center text-[15px] font-semibold">{answer.text}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {page.answers.map((answer) => (
            <div key={answer.id} className="flex min-h-[52px] items-center rounded-[14px] border-2 border-line px-4 text-base font-medium">
              {answer.text}
            </div>
          ))}
        </div>
      )}
      {page.multiple ? <Cta>{canvas.continue}</Cta> : null}
    </>
  );
}

function TextView({ page }: ViewProps<"text">) {
  return (
    <>
      <Title>{page.question}</Title>
      <div className="flex min-h-[52px] items-center rounded-[14px] border-2 border-slate px-4 text-base text-mute">{page.hint || canvas.typeAnswer}</div>
      <Cta>{canvas.continue}</Cta>
    </>
  );
}

function NumberView({ page }: ViewProps<"number">) {
  return (
    <>
      <Title>{page.question}</Title>
      {page.kind === "date" ? (
        <div className="flex min-h-[52px] items-center rounded-[14px] border-2 border-slate px-4 text-base text-mute">{canvas.pickDate}</div>
      ) : (
        <div className="flex items-baseline justify-center gap-2 border-b-2 border-slate py-6">
          <span className="text-5xl font-bold leading-[56px]">{page.min ?? 0}</span>
          {page.unit ? <span className="text-lg text-mute">{page.unit}</span> : null}
        </div>
      )}
      <Cta>{canvas.continue}</Cta>
    </>
  );
}

function InfoView({ page }: ViewProps<"info">) {
  return (
    <>
      {page.picture ? <Picture id={page.picture} /> : null}
      <Title>{page.title}</Title>
      {page.text ? <Text>{page.text}</Text> : null}
      <Cta>{canvas.continue}</Cta>
    </>
  );
}

function LoadingView({ page }: ViewProps<"loading">) {
  const last = page.steps.length - 1;
  return (
    <>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-hidden="true" className="mx-auto">
        <circle cx="36" cy="36" r="30" stroke="var(--color-fill)" strokeWidth="8" />
        <path d="M36 6a30 30 0 0 1 30 30" stroke="var(--color-slate)" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <Title>{page.message}</Title>
      <div className="flex flex-col gap-3 pt-2">
        {page.steps.map((step, index) => (
          <div key={index} className={cn("flex items-center gap-2.5 text-base", index === last && last > 0 && "text-mute")}>
            {index === last && last > 0 ? (
              <span className="size-[22px] flex-none rounded-full border-2 border-dashline" />
            ) : (
              <span className="grid size-[22px] flex-none place-items-center rounded-full bg-slate text-white">
                <CheckIcon size={14} />
              </span>
            )}
            {step}
          </div>
        ))}
      </div>
    </>
  );
}

function EndView({ page }: ViewProps<"end">) {
  return (
    <>
      {page.style !== "offer" ? (
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-slate text-white">
          <CheckIcon size={30} />
        </span>
      ) : null}
      <Title size="lg">{page.title}</Title>
      {page.text ? <Text>{page.text}</Text> : null}
      {page.style === "offer" ? (
        <div className="flex flex-col gap-1 rounded-2xl border-2 border-slate p-4 text-center">
          <span className="text-[32px] font-bold leading-10">{page.price}</span>
          <span className="text-sm text-mute">{page.priceNote}</span>
        </div>
      ) : null}
      {page.style !== "thanks" ? <Cta className={page.style === "offer" ? "uppercase" : undefined}>{page.buttonText}</Cta> : null}
      {page.style === "offer" && page.note ? <Hint>{page.note}</Hint> : null}
    </>
  );
}

const views: { [T in PageType]: ComponentType<ViewProps<T>> } = {
  welcome: WelcomeView,
  choice: ChoiceView,
  text: TextView,
  number: NumberView,
  info: InfoView,
  loading: LoadingView,
  end: EndView,
};

/** One page as people see it, inside the phone frame. */
export function PageView({ page, doc }: { page: Page; doc: QuizDocument }) {
  const View = views[page.type] as ComponentType<ViewProps<PageType>>;
  return <View page={page as never} doc={doc} />;
}
