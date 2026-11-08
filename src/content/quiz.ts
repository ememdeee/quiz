/**
 * Everything the quiz people see says on its own, in English (board BehaviorRules, "Language"). The owner's own
 * words (titles, questions, answers) never come from here. The editor canvas uses the same words.
 */
export const quizText = {
  startQuiz: "Start the quiz",
  continue: "Continue",
  back: "Go back",
  progress: "Quiz progress",
  sharedNote: "Your answers are shared with the quiz owner.",
  poweredBy: "Powered by Quiz",
  privacy: "Privacy",
  typeAnswer: "Type your answer",
  pickDate: "Pick a date",
  yourPicture: "Your picture",
  pickMany: "Pick all that apply.",
  tryAgain: "Try again",
  takeAgain: "Take it again",
  between: (low: number, high: number) => `Between ${low} and ${high}`,
  atLeast: (low: number) => `${low} or more`,
  atMost: (high: number) => `${high} or less`,
  calendar: { previous: "Previous month", next: "Next month", open: "Open the calendar", weekdays: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] },
} as const;

/** Messages under a field. The wording follows the boards ChoiceError, TextError, NumberError and DateError. */
export const quizErrors = {
  pickOne: "Please pick at least one answer.",
  writeSomething: "Please write an answer to continue.",
  email: "Please enter a valid email address.",
  phone: "Please enter a valid phone number.",
  numberNeeded: "Please enter a number to continue.",
  range: (low: number | null, high: number | null) =>
    low !== null && high !== null ? `Please enter a number between ${low} and ${high}.` : low !== null ? `Please enter a number of ${low} or more.` : `Please enter a number of ${high} or less.`,
  dateNeeded: "Please pick a date to continue.",
  saveFailed: "We couldn’t save your answer. Check your connection and try again.",
} as const;

export const quizScreens = {
  resume: {
    title: "Welcome back",
    text: (page: number, total: number) => `You stopped on page ${page} of ${total}. Do you want to pick up where you left off?`,
    continue: "Continue",
    startOver: "Start over",
  },
  alreadyDone: { title: "You already finished this quiz", text: "Thank you for taking part. Your answers are saved." },
  closed: { title: "This quiz is closed", text: "It is not accepting responses right now." },
  notPublished: { title: "This quiz isn’t open yet", text: "The owner hasn’t published it yet. Please check back later." },
  notFound: { title: "We can’t find this quiz", text: "The link may be wrong or the quiz was removed. Check the link and try again." },
  error: { title: "Something went wrong", text: "We couldn’t load this page. Please try again in a moment." },
  preview: { note: "Preview · your answers aren’t saved", close: "Close preview" },
} as const;
