"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { AlertCircleIcon, ArrowLeftIcon } from "@/components/ui/icons";
import { quizScreens, quizText } from "@/content/quiz";
import { quizHref, routes } from "@/lib/routes";
import { themeVars, type QuizTheme } from "@/lib/quiz/theme";
import { cn } from "@/lib/utils";

/** The building blocks of every quiz page (board FEShell). Colors come only from the six `--quiz-*` theme variables. */

const focus = "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-quiz-primary";

/** The page behind the quiz: the whole screen on a phone, a centered card on a computer (boards FEDesktop, FEDesktopStart). */
export function QuizFrame({ theme, previewOf, children }: { theme: QuizTheme | null; previewOf?: string; children: ReactNode }) {
  return (
    <div style={themeVars(theme) as CSSProperties} className="flex min-h-dvh flex-col bg-quiz-bg font-inter text-quiz-fg sm:bg-stage">
      {previewOf ? <PreviewBar quizId={previewOf} /> : null}
      <div className="flex flex-1 sm:items-center sm:justify-center sm:p-6">
        <div className="relative flex w-full flex-1 flex-col bg-quiz-bg sm:max-w-[520px] sm:flex-none sm:rounded-3xl sm:shadow-[0_1px_2px_rgba(51,65,85,0.06),0_16px_48px_rgba(51,65,85,0.12)]">
          {children}
        </div>
      </div>
    </div>
  );
}

/** "Preview · your answers aren't saved", pinned at the top of Try it (board FEPreview). */
function PreviewBar({ quizId }: { quizId: string }) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-ink py-1.5 pl-4 pr-2 text-[13px] font-semibold text-white">
      <span>{quizScreens.preview.note}</span>
      <Link
        href={quizHref.edit(quizId)}
        className="inline-flex min-h-9 items-center rounded-lg border border-white/50 px-3 text-white no-underline focus-visible:outline-[3px] focus-visible:outline-white"
      >
        {quizScreens.preview.close}
      </Link>
    </div>
  );
}

/** Back button and the thin progress bar. Both are hidden on the first and last page (the caller does not render this then). */
export function TopBar({ progress, onBack }: { progress: number; onBack?: () => void }) {
  const percent = Math.round(progress * 100);
  return (
    <div className={cn("flex min-h-[60px] items-center gap-2 pb-1 pt-3", onBack ? "pl-2 pr-6" : "px-6")}>
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={quizText.back}
          className={cn("grid size-11 flex-none place-items-center rounded-full text-quiz-fg", focus)}
        >
          <ArrowLeftIcon size={22} strokeWidth={2.2} />
        </button>
      ) : null}
      <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-1.5 flex-1 rounded-full bg-quiz-line">
        <div className="h-1.5 rounded-full bg-quiz-primary transition-[width] duration-300 ease-out" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export const Body = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("flex min-h-0 flex-1 flex-col gap-5 px-6 py-4", className)}>{children}</div>
);

export const Footer = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("flex flex-col gap-3 px-6 pb-7 pt-3", className)}>{children}</div>
);

const buttonBase = "flex min-h-14 w-full items-center justify-center rounded-[14px] px-6 text-lg font-semibold no-underline disabled:cursor-default";

export function MainButton({ children, onClick, type = "button", className }: { children: ReactNode; onClick?: () => void; type?: "button" | "submit"; className?: string }) {
  return (
    <button type={type} onClick={onClick} className={cn(buttonBase, "bg-quiz-primary text-quiz-on-primary", focus, className)}>
      {children}
    </button>
  );
}

export function MainLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    // The owner's own link, opened in a new tab (handover 8.7)
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn(buttonBase, "bg-quiz-primary text-quiz-on-primary", focus, className)}>
      {children}
    </a>
  );
}

export function OutlineButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn(buttonBase, "border-2 border-quiz-line bg-quiz-bg text-quiz-fg", focus)}>
      {children}
    </button>
  );
}

/** The red line under a field that cannot be accepted yet. */
export function FieldError({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <span id={id} role="alert" className={cn("flex items-center gap-1.5 text-[15px] text-danger", className)}>
      <AlertCircleIcon size={18} className="flex-none" />
      {children}
    </span>
  );
}

/** "We couldn't save your answer" above the Try again button (board FESaveError). */
export function SaveError({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="mx-6 mb-3 flex items-start gap-3 rounded-[14px] border border-danger-line bg-danger-soft px-4 py-3.5 text-[15px] leading-[22px] text-danger-ink">
      <AlertCircleIcon size={20} className="mt-px flex-none" />
      <span>{children}</span>
    </div>
  );
}

/** "Powered by Quiz · Privacy". On a computer it hangs below the card instead of inside it. */
export function PoweredBy({ withPrivacy = false }: { withPrivacy?: boolean }) {
  return (
    <p className="m-0 text-center text-[13px] text-quiz-muted sm:absolute sm:inset-x-0 sm:top-full sm:pt-5 sm:text-sm">
      {quizText.poweredBy}
      {withPrivacy ? (
        <>
          {" · "}
          <Link href={routes.privacy} className="text-quiz-muted underline-offset-2 hover:underline focus-visible:outline-[3px] focus-visible:outline-quiz-primary">
            {quizText.privacy}
          </Link>
        </>
      ) : null}
    </p>
  );
}

export const Heading = ({ children, size = "md", className }: { children: ReactNode; size?: "md" | "lg"; className?: string }) => (
  <h1
    tabIndex={-1}
    className={cn("m-0 font-bold outline-none", size === "lg" ? "text-[30px] leading-9 sm:text-[32px] sm:leading-10" : "text-[28px] leading-[34px] sm:text-[30px] sm:leading-[38px]", className)}
  >
    {children}
  </h1>
);

export const Lead = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("m-0 whitespace-pre-line text-[17px] leading-[26px] text-quiz-muted", className)}>{children}</p>
);

/** A picture the owner added. Nothing shows when the picture is missing from the library. */
export function Picture({ src, className }: { src: string | undefined; className?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element -- library pictures are small data URLs or static files
  return <img src={src} alt="" className={cn("w-full flex-none rounded-[20px] object-cover", className)} />;
}
