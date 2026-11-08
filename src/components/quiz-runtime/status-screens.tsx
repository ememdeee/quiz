"use client";

import type { ReactNode } from "react";
import { AlertCircleIcon, CheckIcon, ClockIcon, HistoryIcon, LockIcon, SearchIcon } from "@/components/ui/icons";
import { quizScreens, quizText } from "@/content/quiz";
import { Body, Footer, Heading, Lead, MainButton, OutlineButton } from "./blocks";

/** A centered message with a round icon: the quiz cannot be opened, or the person is coming back (boards FEClosed to FEError, FEResume, FEAlreadyDone). */
function Message({ icon, title, text, children, footer }: { icon: ReactNode; title: string; text: string; children?: ReactNode; footer?: ReactNode }) {
  return (
    <>
      <Body className="items-center justify-center gap-3.5 px-7 text-center @md:min-h-[420px]">
        {icon}
        <Heading className="mt-2 text-[26px] leading-8">{title}</Heading>
        <Lead>{text}</Lead>
        {children}
      </Body>
      {footer ? <Footer>{footer}</Footer> : null}
    </>
  );
}

const SoftIcon = ({ children }: { children: ReactNode }) => (
  <span className="grid size-[72px] place-items-center rounded-full bg-soft text-slate">{children}</span>
);

export const ClosedScreen = () => <Message icon={<SoftIcon><LockIcon size={34} /></SoftIcon>} {...quizScreens.closed} />;
export const NotPublishedScreen = () => <Message icon={<SoftIcon><ClockIcon size={34} /></SoftIcon>} {...quizScreens.notPublished} />;
export const NotFoundScreen = () => <Message icon={<SoftIcon><SearchIcon size={34} /></SoftIcon>} {...quizScreens.notFound} />;

export const ErrorScreen = ({ onRetry }: { onRetry: () => void }) => (
  <Message icon={<SoftIcon><AlertCircleIcon size={34} /></SoftIcon>} {...quizScreens.error}>
    <MainButton onClick={onRetry} className="mt-3.5 w-auto px-9">
      {quizText.tryAgain}
    </MainButton>
  </Message>
);

/** "Welcome back": they stopped part way on this browser (board FEResume). */
export function ResumeScreen({ page, total, progress, onContinue, onStartOver }: { page: number; total: number; progress: number; onContinue: () => void; onStartOver: () => void }) {
  return (
    <Message
      icon={<SoftIcon><HistoryIcon size={34} /></SoftIcon>}
      title={quizScreens.resume.title}
      text={quizScreens.resume.text(page, total)}
      footer={
        <>
          <MainButton onClick={onContinue}>{quizScreens.resume.continue}</MainButton>
          <OutlineButton onClick={onStartOver}>{quizScreens.resume.startOver}</OutlineButton>
        </>
      }
    >
      <div role="progressbar" aria-label={quizText.progress} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)} className="mt-2.5 h-1.5 w-full rounded-full bg-quiz-line">
        <div className="h-1.5 rounded-full bg-quiz-primary" style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>
    </Message>
  );
}

/** They finished this quiz on this browser already (board FEAlreadyDone). */
export const AlreadyDoneScreen = ({ onAgain }: { onAgain: () => void }) => (
  <Message
    icon={
      <span className="grid size-[72px] place-items-center rounded-full bg-quiz-primary text-quiz-on-primary">
        <CheckIcon size={36} />
      </span>
    }
    {...quizScreens.alreadyDone}
    footer={<OutlineButton onClick={onAgain}>{quizText.takeAgain}</OutlineButton>}
  />
);
