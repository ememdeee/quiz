/** Words of the Responses pages (boards Report, Responses, ResponsesDelete, Empty, LimitStates). All fixed English. */
export const responsesPage = {
  title: "Responses",
  subtitleSummary: "How your quiz is doing.",
  subtitleIndividual: (finished: number) => `${finished.toLocaleString("en-US")} ${finished === 1 ? "person" : "people"} finished this quiz.`,
  dateRange: "Date range",
  tabs: { summary: "Summary", individual: "Individual" },
  edit: "Edit",
  responsesTab: "Responses",
  sections: "Quiz sections",
  back: "All quizzes",
  export: "Export",
  exportAll: "Export all",
  moreActions: "More actions",
  deleteAll: "Delete all responses…",
  loadFailed: { title: "We couldn’t load the responses", text: "Check your connection and try again.", retry: "Try again" },
} as const;

export const exportMenu = {
  title: "Download as",
  csv: { name: "CSV", badge: "Most popular", text: "Opens in Excel and Google Sheets" },
  xlsx: { name: "Excel (.xlsx)", text: "A ready-to-use spreadsheet" },
  json: { name: "JSON", text: "For developers and other tools" },
  note: (count: number) => `One row per person, one column per question. Includes the ${count.toLocaleString("en-US")} responses in this list. Questions you removed keep their column at the end.`,
  failed: "The file could not be made. Please try again.",
} as const;

export const summaryWords = {
  opened: "People who opened it",
  started: "People who started",
  finished: "People who finished",
  rate: "Finish rate",
  leaveTitle: "Where people leave",
  leaveText: "Share of people still going at each page",
  drop: (from: string, to: string) => `The biggest drop is between “${from}” and ${to === "the result" ? "the result" : `“${to}”`}.`,
  answeredTitle: "What people answered",
  pickQuestion: "Pick a question",
  everyTitle: "Every question",
  everyText: "Each question gets a summary that fits its type.",
  kinds: { choice: "Multiple choice", number: "Number", date: "Date", text: "Text answer" },
  average: "Average",
  range: "Lowest and highest",
  answered: "Answered",
  earliest: "Earliest",
  latest: "Latest",
  wrote: "People wrote something",
  skipped: "Skipped",
  seeAll: (count: number) => `See all ${count} answers`,
  responseLine: (number: number, date: string) => `Response ${number} · ${date}`,
  peopleAnswered: (count: number) => `${count} answered`,
  /** The design says nothing about where answers to deleted questions are summarized (gap G21). */
  removedTitle: "Removed questions",
  removedText: "Answers to questions you deleted stay here.",
  removedCount: (count: number) => `${count} answered`,
} as const;

export const individualWords = {
  search: "Search answers",
  includeUnfinished: "Include unfinished",
  response: (number: number) => `Response ${number}`,
  leftAt: (page: number) => `Left at page ${page}`,
  showing: (shown: number, total: number) => `Showing ${shown} of ${total}`,
  previous: "Previous",
  next: "Next",
  finishedIn: (minutes: number) => `Finished in ${minutes} min`,
  of: (index: number, total: number) => `${index} of ${total}`,
  previousPerson: "Previous person",
  nextPerson: "Next person",
  delete: "Delete",
  noAnswer: "No answer",
  removedQuestion: "Removed question",
  removedNote: "This page was deleted after this person answered. The answer is kept.",
  /** No board for a search with no match (gap G21). */
  noMatch: { title: (query: string) => `No responses match “${query}”`, text: "Try a different word, or clear the search.", action: "Clear search" },
} as const;

export const responsesEmpty = {
  title: "No responses yet",
  text: "When someone finishes your quiz, their answers show up here.",
  action: "Copy quiz link",
} as const;

export const responsesDelete = {
  one: {
    title: (number: number) => `Delete Response ${number}?`,
    text: "This removes this person’s answers for good. You can’t undo it. Download your responses first if you may need them.",
    keep: "Keep it",
    confirm: "Delete response",
    toast: (number: number) => `Response ${number} deleted`,
    toastNote: "Gone for good",
  },
  all: {
    title: (count: number) => `Delete all ${count.toLocaleString("en-US")} responses?`,
    text: "This removes every response for good, including unfinished ones. The quiz and its link stay as they are. You can’t undo this.",
    download: "Download your responses first",
    confirmLabel: "Type DELETE to confirm",
    word: "DELETE",
    keep: "Keep them",
    confirm: "Delete all",
    toast: "All responses deleted",
  },
} as const;

export const responseLimits = {
  nearTitle: (count: number, max: number) => `${count.toLocaleString("en-US")} of ${max.toLocaleString("en-US")} finished responses.`,
  nearText: "When it’s full, the quiz stops accepting answers. Unfinished ones don’t count. Download your answers any time, or",
  nearEnd: "for a bigger plan.",
  fullTitle: "This quiz is full.",
  fullText: (max: number) => `It reached ${max.toLocaleString("en-US")} responses and now shows “This quiz is closed”. Download your answers, or`,
  fullEnd: "to continue.",
  contact: "contact us",
} as const;
