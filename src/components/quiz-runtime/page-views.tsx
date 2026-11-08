"use client";

import { useEffect, useRef, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { CheckIcon } from "@/components/ui/icons";
import { quizErrors, quizText } from "@/content/quiz";
import type { Answers } from "@/lib/quiz/conditions";
import type { AnswerProblem } from "@/lib/quiz/runner";
import { showsAnswerPictures } from "@/lib/quiz/pictures";
import type { Page, PageOf, PageType, QuizDocument } from "@/lib/quiz/schema";
import { estimateMinutes, takesAbout } from "@/lib/quiz/time-estimate";
import { cn } from "@/lib/utils";
import { Body, FieldError, Footer, Heading, Lead, MainButton, MainLink, Picture, PoweredBy, SaveError } from "./blocks";
import { DateField } from "./date-field";

/** What a page needs from the quiz screen to be answered. The editor canvas passes inert versions of these. */
export type ViewContext = {
  doc: QuizDocument;
  pictures: Record<string, string>;
  answers: Answers;
  problem: AnswerProblem | null;
  saving: boolean;
  saveFailed: boolean;
  showPoweredBy: boolean;
  /** Pages whose answers are shown as picture tiles although no answer has a picture yet (the editor's "Add pictures to the answers") */
  answerPicturesOn?: Record<string, boolean>;
  setAnswer: (pageId: string, value: Answers[string], moveOn?: boolean) => void;
  next: () => void;
  retry: () => void;
};

type ViewProps<T extends PageType> = { page: PageOf<T>; ctx: ViewContext };

const errorId = (page: Page) => `error-${page.id}`;
const picture = (ctx: ViewContext, id: string | null) => (id ? ctx.pictures[id] : undefined);

/** A page with a Continue button. Enter in a box presses it. */
function Question({ ctx, children, showContinue = true }: { ctx: ViewContext; children: ReactNode; showContinue?: boolean }) {
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ctx.saveFailed) ctx.retry();
    else ctx.next();
  };
  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
      <Body>{children}</Body>
      {ctx.saveFailed ? <SaveError>{quizErrors.saveFailed}</SaveError> : null}
      {showContinue || ctx.saveFailed ? (
        <Footer className={ctx.saveFailed ? "pt-0" : undefined}>
          <MainButton type="submit">{ctx.saveFailed ? quizText.tryAgain : quizText.continue}</MainButton>
        </Footer>
      ) : null}
    </form>
  );
}

function WelcomeView({ page, ctx }: ViewProps<"welcome">) {
  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (ctx.saveFailed) ctx.retry();
        else ctx.next();
      }}
      className="flex flex-1 flex-col"
    >
      <Body className="gap-5 pb-4 pt-10 @md:px-12 @md:pb-8">
        <Picture
          src={picture(ctx, page.picture)}
          className="h-[280px] @md:-mx-12 @md:-mt-10 @md:h-[240px] @md:w-[calc(100%+6rem)] @md:max-w-none @md:rounded-b-none @md:rounded-t-3xl"
        />
        <Heading size="lg">{page.title}</Heading>
        {page.text ? <Lead>{page.text}</Lead> : null}
      </Body>
      {ctx.saveFailed ? <SaveError>{quizErrors.saveFailed}</SaveError> : null}
      <Footer>
        <MainButton type="submit">{ctx.saveFailed ? quizText.tryAgain : quizText.startQuiz}</MainButton>
        <span className="text-center text-sm text-quiz-muted">{takesAbout(estimateMinutes(ctx.doc))}</span>
        <span className="text-center text-[13px] text-quiz-muted">{quizText.sharedNote}</span>
        {ctx.showPoweredBy ? <PoweredBy withPrivacy /> : null}
      </Footer>
    </form>
  );
}

const optionBase =
  "flex min-h-14 w-full items-center gap-3 rounded-[14px] border-2 bg-quiz-bg px-[18px] text-left text-[17px] font-medium text-quiz-fg focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-quiz-primary";

function ChoiceView({ page, ctx }: ViewProps<"choice">) {
  const chosen = (Array.isArray(ctx.answers[page.id]) ? ctx.answers[page.id] : []) as string[];
  const problem = ctx.problem === "pick_one";
  const pictures = showsAnswerPictures(page) || ctx.answerPicturesOn?.[page.id] === true;

  const toggle = (id: string) => {
    if (!page.multiple) return ctx.setAnswer(page.id, [id], true);
    ctx.setAnswer(page.id, chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id]);
  };

  return (
    <Question ctx={ctx} showContinue={page.multiple || !page.required}>
      <Picture src={picture(ctx, page.picture)} className="h-[150px]" />
      <Heading>{page.question}</Heading>
      {page.multiple ? <p className="-mt-2 mb-0 text-base text-quiz-muted">{quizText.pickMany}</p> : null}
      <div
        role={page.multiple ? "group" : "radiogroup"}
        aria-label={page.question}
        aria-describedby={problem ? errorId(page) : undefined}
        className={cn(pictures ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3")}
      >
        {page.answers.map((answer) => {
          const on = chosen.includes(answer.id);
          const border = problem ? "border-danger" : on ? "border-quiz-primary" : "border-quiz-line";
          if (pictures) {
            return (
              <button
                key={answer.id}
                type="button"
                role={page.multiple ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => toggle(answer.id)}
                className={cn("relative overflow-hidden rounded-2xl border-2 bg-quiz-bg p-0 text-quiz-fg focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-quiz-primary", border)}
              >
                {picture(ctx, answer.picture) ? (
                  // eslint-disable-next-line @next/next/no-img-element -- library pictures are small data URLs or static files
                  <img src={picture(ctx, answer.picture)} alt="" className="block h-[120px] w-full object-cover" />
                ) : (
                  <span className="block h-[120px] bg-soft" />
                )}
                <span className="block p-3 text-center text-base font-semibold">{answer.text}</span>
                {on ? (
                  <span className="absolute right-2 top-2 grid size-[26px] place-items-center rounded-full bg-quiz-primary text-quiz-on-primary">
                    <CheckIcon size={14} strokeWidth={3.5} />
                  </span>
                ) : null}
              </button>
            );
          }
          return (
            <button
              key={answer.id}
              type="button"
              role={page.multiple ? "checkbox" : "radio"}
              aria-checked={on}
              onClick={() => toggle(answer.id)}
              className={cn(optionBase, border, on && "bg-quiz-primary/[0.08]")}
            >
              {page.multiple ? (
                <span className={cn("grid size-[22px] flex-none place-items-center rounded-md border-2", on ? "border-quiz-primary bg-quiz-primary text-quiz-on-primary" : "border-ctrl bg-white")}>
                  {on ? <CheckIcon size={14} strokeWidth={3.5} /> : null}
                </span>
              ) : (
                <span className={cn("size-[22px] flex-none rounded-full border-2 bg-white", on ? "border-[7px] border-quiz-primary" : "border-ctrl")} />
              )}
              {answer.text}
            </button>
          );
        })}
      </div>
      {problem ? <FieldError id={errorId(page)}>{quizErrors.pickOne}</FieldError> : null}
    </Question>
  );
}

const textProblem = (problem: AnswerProblem | null) =>
  problem === "email" ? quizErrors.email : problem === "phone" ? quizErrors.phone : problem === "write_something" ? quizErrors.writeSomething : null;

function TextView({ page, ctx }: ViewProps<"text">) {
  const value = typeof ctx.answers[page.id] === "string" ? (ctx.answers[page.id] as string) : "";
  const message = textProblem(ctx.problem);
  return (
    <Question ctx={ctx}>
      <label htmlFor={`field-${page.id}`}>
        <Heading>{page.question}</Heading>
      </label>
      <div className="flex flex-col gap-2">
        <input
          id={`field-${page.id}`}
          value={value}
          onChange={(event) => ctx.setAnswer(page.id, event.target.value)}
          type={page.input === "email" ? "email" : page.input === "phone" ? "tel" : "text"}
          inputMode={page.input === "email" ? "email" : page.input === "phone" ? "tel" : "text"}
          autoComplete={page.input === "email" ? "email" : page.input === "phone" ? "tel" : "off"}
          placeholder={page.hint || quizText.typeAnswer}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId(page) : undefined}
          className={cn(
            "min-h-14 w-full rounded-[14px] border-2 bg-quiz-bg px-4 text-lg text-quiz-fg outline-none placeholder:text-quiz-muted focus:border-quiz-primary",
            message ? "border-danger" : "border-quiz-line",
          )}
        />
        {message ? <FieldError id={errorId(page)}>{message}</FieldError> : null}
      </div>
    </Question>
  );
}

const allowedNumber = /^-?\d*\.?\d*$/;

function numberHint(page: PageOf<"number">): string | null {
  if (page.min !== null && page.max !== null) return quizText.between(page.min, page.max);
  if (page.min !== null) return quizText.atLeast(page.min);
  if (page.max !== null) return quizText.atMost(page.max);
  return null;
}

function NumberView({ page, ctx }: ViewProps<"number">) {
  const raw = ctx.answers[page.id];
  const value = raw === undefined ? "" : String(raw);
  const isDate = page.kind === "date";
  const message = ctx.problem === "date_needed" ? quizErrors.dateNeeded : ctx.problem === "number_needed" ? quizErrors.numberNeeded : ctx.problem === "range" ? quizErrors.range(page.min, page.max) : null;
  const hint = numberHint(page);

  return (
    <Question ctx={ctx}>
      <label htmlFor={`field-${page.id}`}>
        <Heading>{page.question}</Heading>
      </label>
      {isDate ? (
        <div className="flex flex-col gap-2.5">
          <DateField value={value} onChange={(next) => ctx.setAnswer(page.id, next)} invalid={message !== null} describedBy={message ? errorId(page) : undefined} />
          {message ? <FieldError id={errorId(page)}>{message}</FieldError> : null}
        </div>
      ) : (
        <>
          <div className={cn("mt-6 flex items-baseline justify-center gap-2.5 border-b-[3px] pb-3 pt-8", message ? "border-danger" : "border-quiz-primary")}>
            <input
              id={`field-${page.id}`}
              value={value}
              onChange={(event) => allowedNumber.test(event.target.value) && ctx.setAnswer(page.id, event.target.value)}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0"
              aria-invalid={message ? true : undefined}
              aria-describedby={message ? errorId(page) : undefined}
              style={{ width: `${Math.max(2, value.length + 0.5)}ch` }}
              className="max-w-full bg-transparent p-0 text-center text-[64px] font-bold leading-[72px] text-quiz-fg outline-none placeholder:text-quiz-line"
            />
            {page.unit ? <span className="text-xl text-quiz-muted">{page.unit}</span> : null}
          </div>
          {message ? (
            <FieldError id={errorId(page)} className="justify-center">
              {message}
            </FieldError>
          ) : hint ? (
            <span className="text-center text-[15px] text-quiz-muted">{hint}</span>
          ) : null}
        </>
      )}
    </Question>
  );
}

function InfoView({ page, ctx }: ViewProps<"info">) {
  return (
    <Question ctx={ctx}>
      <Picture src={picture(ctx, page.picture)} className="h-[240px]" />
      <Heading>{page.title}</Heading>
      {page.text ? <Lead>{page.text}</Lead> : null}
    </Question>
  );
}

/** The spinner and the steps ticking off one by one; the next page comes by itself when the time is up (board FELoading). */
function LoadingView({ page, ctx }: ViewProps<"loading">) {
  const [done, setDone] = useState(0);
  const next = useRef(ctx.next);
  next.current = ctx.next;

  useEffect(() => {
    const each = (page.seconds * 1000) / page.steps.length;
    const timers = page.steps.map((_, index) => window.setTimeout(() => setDone(index + 1), each * (index + 1)));
    const finish = window.setTimeout(() => next.current(), page.seconds * 1000 + 300);
    return () => {
      timers.forEach(window.clearTimeout);
      window.clearTimeout(finish);
    };
  }, [page.id, page.seconds, page.steps]);

  return (
    <Body className="items-center justify-center gap-5 px-8 @md:min-h-[420px]">
      <svg width="80" height="80" viewBox="0 0 72 72" fill="none" aria-hidden="true" className="animate-spin">
        <circle cx="36" cy="36" r="30" stroke="var(--color-fill)" strokeWidth="8" />
        <path d="M36 6a30 30 0 0 1 30 30" stroke="var(--color-quiz-primary)" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <Heading className="text-center">{page.message}</Heading>
      <ul role="status" className="m-0 flex list-none flex-col gap-3.5 self-stretch p-0 px-6 pt-2">
        {page.steps.map((step, index) => (
          <li key={index} className={cn("flex items-center gap-3 text-[17px]", index >= done && "text-quiz-muted")}>
            {index < done ? (
              <span className="grid size-6 flex-none place-items-center rounded-full bg-quiz-primary text-quiz-on-primary">
                <CheckIcon size={14} strokeWidth={3.5} />
              </span>
            ) : (
              <span className="size-6 flex-none rounded-full border-2 border-dashline" />
            )}
            {step}
          </li>
        ))}
      </ul>
    </Body>
  );
}

const isHttps = (link: string | undefined): link is string => !!link && /^https:\/\//i.test(link);

/** The End page in its three styles. Only what the owner filled in appears (board FEEndThanks, FEEndButton, FEEndOffer). */
function EndView({ page, ctx }: ViewProps<"end">) {
  const offer = page.style === "offer";
  const hasButton = page.style !== "thanks" && !!page.buttonText && isHttps(page.link);
  return (
    <>
      <Body className={cn("items-center text-center", offer ? "justify-start gap-5 pb-4 pt-12" : "justify-center gap-4 px-8 @md:min-h-[420px]")}>
        {offer ? null : (
          <span className="mb-2 grid size-[72px] place-items-center rounded-full bg-quiz-primary text-quiz-on-primary">
            <CheckIcon size={36} />
          </span>
        )}
        <Heading size="lg">{page.title}</Heading>
        {page.text ? <Lead>{page.text}</Lead> : null}
        <Picture src={picture(ctx, page.picture)} className={cn("h-[180px] rounded-[18px]", offer ? "" : "mt-2")} />
        {offer && (page.price || page.priceNote) ? (
          <div className="flex w-full flex-col gap-1 rounded-[18px] border-2 border-quiz-primary p-5">
            {page.price ? <span className="text-[40px] font-bold leading-[48px]">{page.price}</span> : null}
            {page.priceNote ? <span className="text-[15px] text-quiz-muted">{page.priceNote}</span> : null}
          </div>
        ) : null}
      </Body>
      <Footer className="gap-3 pt-3">
        {hasButton ? (
          <MainLink href={page.link!} className={offer ? "uppercase" : undefined}>
            {page.buttonText}
          </MainLink>
        ) : null}
        {offer && page.note ? <span className="text-center text-sm text-quiz-muted">{page.note}</span> : null}
        {ctx.showPoweredBy ? <PoweredBy /> : null}
      </Footer>
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

/** One page of the quiz as people see and answer it. */
export function PageView({ page, ctx }: { page: Page; ctx: ViewContext }) {
  const View = views[page.type] as ComponentType<ViewProps<PageType>>;
  return <View page={page as never} ctx={ctx} />;
}
