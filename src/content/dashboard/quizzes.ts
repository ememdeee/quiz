import type { QuizStatus } from "@/lib/quizzes/list";

/** Words of the quiz list: header, cards, menu, dialogs, empty states. All fixed English. */
export const quizList = {
  title: "Your quizzes",
  subtitle: "Pick a quiz to edit, or start a new one.",
  newQuiz: "New quiz",
  createTile: "Create a new quiz",
  usage: (used: number, max: number, plan: string) => `${used} of ${max} quizzes · ${plan} plan`,
  searchLabel: "Search quizzes",
  sortLabel: "Sort",
  loadFailed: { title: "We couldn’t load your quizzes", text: "Check your connection and try again.", retry: "Try again" },
  empty: { title: "No quizzes yet", text: "Create your first quiz. It takes a few minutes.", action: "New quiz" },
  noResults: {
    title: (query: string) => `No quizzes match “${query}”`,
    text: "Try a different word, or clear the search.",
    action: "Clear search",
  },
} as const;

export const quizCard = {
  status: { open: "Open", closed: "Closed", not_published: "Not published" } satisfies Record<QuizStatus, string>,
  description: {
    open: "People can take this quiz right now.",
    closed: "Closed. People see a message that it is closed.",
    not_published: "Only you can see this. Publish it to share.",
  } satisfies Record<QuizStatus, string>,
  options: "Quiz options",
  edit: "Edit",
  publish: "Publish",
  copyLink: "Copy link",
  responses: (count: number) => (count > 0 ? `Responses (${count.toLocaleString("en-US")})` : "Responses"),
} as const;

export const quizMenu = {
  copyLink: "Copy link",
  rename: "Rename",
  duplicate: "Duplicate",
  close: "Close the quiz",
  open: "Open the quiz",
  delete: "Delete",
} as const;

export const newQuizDialog = {
  title: "Create a new quiz",
  nameLabel: "Quiz name",
  namePlaceholder: "For example: Customer feedback",
  startFrom: "Start from",
  blank: { title: "A blank quiz", text: "Add your own pages." },
  template: { title: "A template", text: "A ready-made quiz you can change." },
  copy: { title: "A copy of a quiz I already have", text: "Good when the new quiz is almost the same.", pick: "Quiz to copy" },
  cancel: "Cancel",
  create: "Create quiz",
} as const;

export const templateContents = {
  title: "What each template contains",
  subtitle: "The pages a new quiz starts with. Everything can be changed or deleted.",
} as const;

export const renameDialog = { title: "Rename quiz", nameLabel: "Quiz name", cancel: "Cancel", save: "Save" } as const;

export const deleteDialog = {
  title: (name: string) => `Delete “${name}”?`,
  text: "This also deletes its responses. You can’t undo this.",
  confirmLabel: "Type the quiz name to confirm",
  keep: "Keep it",
  confirm: "Delete quiz",
} as const;

export const quizToasts = {
  linkCopied: "Link copied",
  renamed: "Quiz renamed",
  duplicated: "Quiz duplicated",
  closed: "Quiz closed",
  opened: "Quiz opened",
  deleted: "Quiz deleted",
} as const;

export const quizLimitDialog = {
  title: (max: number) => `You’ve reached ${max} quizzes`,
  text: "That’s the most the Free plan allows. Delete a quiz you don’t need, or contact us for a bigger plan.",
  back: "Back to my quizzes",
  contact: "Contact us",
} as const;

export const usageMeter = {
  quizzes: { label: "Quizzes", used: (used: number, max: number) => `${used} of ${max} used`, plan: (plan: string) => `${plan} plan.`, seePlans: "See plans" },
} as const;

/** The page for one quiz is the editor (next slice); until then it shows only the name and a way back. */
export const quizPlaceholder = { back: "All quizzes" } as const;
