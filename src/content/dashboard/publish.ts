import { pageTypes } from "@/lib/quiz/page-types";
import type { Page } from "@/lib/quiz/schema";
import type { Problem } from "@/lib/quiz/validate";

/** Words of publishing, problems and sharing (boards Publish, PublishProblems, Share, ShareQuiz). All fixed English. */
export const publishDialog = {
  title: "Publish your changes?",
  titleFirst: "Publish your quiz?",
  text: "Everyone who opens the quiz will see the new version right away.",
  changed: (count: number) => `You changed ${count} ${count === 1 ? "page" : "pages"} since the last time you published.`,
  /** The first publish has nothing to compare with (no board: gap G18). */
  firstTime: (pages: number) => `Your quiz has ${pages} pages.`,
  notYet: "Not yet",
  publish: "Publish",
  publishing: "Publishing…",
} as const;

export const problemsDialog = {
  title: (count: number) => `Fix ${count} ${count === 1 ? "thing" : "things"} before you publish`,
  text: "Your changes are saved. People still see the last published version until these are fixed.",
  goToPage: "Go to page",
  close: "Close",
  noQuestion: {
    title: "Add a question first",
    text: "A quiz needs at least one question before people can answer it.",
    notNow: "Not now",
    add: "Add a question",
  },
  fixThis: "Fix this",
  untitledPage: "Untitled page",
  pageWithoutQuestion: "Page without a question",
} as const;

export const shareDialog = {
  liveTitle: "Your quiz is live",
  liveText: "Share this link with anyone.",
  title: "Share your quiz",
  text: "Anyone with this link can answer. They don’t need an account.",
  linkLabel: "Quiz link",
  copy: "Copy link",
  copied: "Link copied",
  close: "Close",
  open: "Open the quiz",
} as const;

const count = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/** What is wrong with one field, as shown under it. Wording marked (G18) has no board yet. */
export function fieldMessage(code: Problem["code"]): string {
  switch (code) {
    case "question_missing":
      return "Write your question.";
    case "answers_too_few":
      return "A multiple-choice page needs at least 2 answers.";
    case "answer_empty":
      return "Write an answer, or remove it.";
    case "link_invalid":
      return "The button needs a link that starts with https://";
    case "title_missing":
      return "Write a title.";
    case "message_missing":
      return "Write a message.";
    case "step_empty":
      return "Write this step, or remove it.";
    case "range_invalid":
      return "The smallest number can’t be bigger than the largest.";
    case "button_text_missing":
      return "Write the text for the button.";
    case "rule_invalid":
      return "A condition looks at a page that comes later.";
    default:
      return "Something needs fixing on this page.";
  }
}

/** The line for one problem in the "Fix N things" list. */
export function problemLine(problem: Problem, page: Page | undefined): string {
  if (problem.code === "answers_too_few" && page?.type === "choice") {
    const real = page.answers.filter((a) => a.text.trim() !== "").length;
    return `Has ${count(real, "answer")}. Add at least 2.`;
  }
  return fieldMessage(problem.code);
}

/** The name of a page in a list: its own title, or "Untitled page" (in the problems list a question page says what it lacks). */
export function pageLabel(page: Page, inProblems = false): string {
  const title = pageTypes[page.type].title(page as never).trim();
  if (title) return title;
  return inProblems && pageTypes[page.type].isQuestion ? problemsDialog.pageWithoutQuestion : problemsDialog.untitledPage;
}
