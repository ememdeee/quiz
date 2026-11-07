"use client";

import { CopyIcon, DotsIcon, LinkIcon, LockIcon, PencilIcon, TrashIcon, UnlockIcon } from "@/components/ui/icons";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { quizCard, quizMenu } from "@/content/dashboard/quizzes";
import { quizStatus } from "@/lib/quizzes/list";
import type { QuizSummary } from "@/lib/quizzes/types";

export type QuizActions = {
  copyLink: (quiz: QuizSummary) => void;
  rename: (quiz: QuizSummary) => void;
  duplicate: (quiz: QuizSummary) => void;
  toggleOpen: (quiz: QuizSummary) => void;
  remove: (quiz: QuizSummary) => void;
};

/** The three dots on a quiz card and the menu they open (board QuizMenu). */
export function QuizMenu({ quiz, actions, full }: { quiz: QuizSummary; actions: QuizActions; full: boolean }) {
  const status = quizStatus(quiz);
  const published = status !== "not_published";
  return (
    <Menu>
      <MenuTrigger asChild>
        <button
          type="button"
          aria-label={quizCard.options}
          className="grid size-11 place-items-center rounded-[10px] bg-soft text-slate transition-colors duration-200 hover:bg-line focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate data-[state=open]:bg-line"
        >
          <DotsIcon />
        </button>
      </MenuTrigger>
      <MenuContent>
        {published ? (
          <MenuItem icon={<LinkIcon size={18} />} onSelect={() => actions.copyLink(quiz)}>
            {quizMenu.copyLink}
          </MenuItem>
        ) : null}
        <MenuItem icon={<PencilIcon />} onSelect={() => actions.rename(quiz)}>
          {quizMenu.rename}
        </MenuItem>
        <MenuItem icon={<CopyIcon />} onSelect={() => actions.duplicate(quiz)}>
          {quizMenu.duplicate}
        </MenuItem>
        {published && !full ? (
          <MenuItem icon={status === "open" ? <LockIcon /> : <UnlockIcon />} onSelect={() => actions.toggleOpen(quiz)}>
            {status === "open" ? quizMenu.close : quizMenu.open}
          </MenuItem>
        ) : null}
        <MenuSeparator />
        <MenuItem danger icon={<TrashIcon />} onSelect={() => actions.remove(quiz)}>
          {quizMenu.delete}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}
