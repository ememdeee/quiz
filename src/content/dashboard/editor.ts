import type { QuizStatus } from "@/lib/quizzes/list";

/** Words of the quiz editor (boards Main, EditorStates, AddPage, PageMenu, Type*). All fixed English. */
export const editorHeader = {
  back: "All quizzes",
  sections: "Quiz sections",
  edit: "Edit",
  responses: "Responses",
  undo: "Undo",
  settings: "Quiz settings",
  share: "Share",
  tryIt: "Try it",
  publish: "Publish",
  publishChanges: "Publish changes",
  published: "Published",
  saved: "Saved",
  notPublished: (count: number) => `${count} ${count === 1 ? "change" : "changes"} not published`,
  everythingPublished: "Everything is published",
  status: { open: "Open", closed: "Closed", not_published: "Not published" } satisfies Record<QuizStatus, string>,
} as const;

export const pageList = {
  title: "Pages",
  count: (used: number, max: number) => `${used} of ${max} · in this order`,
  add: "Add a page",
  addFirst: "Add your first question",
  onlySome: "Only some",
  startNote: "Start page",
  locked: "Locked: always in this place",
  dragHandle: "Drag to move this page",
  options: "Page options",
  untitled: "Untitled",
  ai: { title: "Edit with AI", text: "Change many pages at once" },
} as const;

export const canvas = {
  title: (n: number) => `What people see on page ${n}`,
  hint: "Changes show here as you type. Everyone sees this mobile view, on any device.",
  startQuiz: "Start the quiz",
  continue: "Continue",
  typeAnswer: "Type your answer",
  pickDate: "Day / Month / Year",
  yourPicture: "Your picture",
} as const;

export const addPageDialog = {
  title: "What do you want to add?",
  subtitle: "Pick one. You can change everything afterwards.",
  close: "Close",
  ask: "Ask a question",
  show: "Show something",
  note: "Every quiz already has a Start page and an End page. A new page goes just before the End page, and you can drag it anywhere in between.",
  cancel: "Cancel",
  add: "Add this page",
} as const;

export const pageMenu = {
  duplicate: "Duplicate page",
  moveUp: "Move up",
  moveDown: "Move down",
  delete: "Delete page",
} as const;

export const pageDialogs = {
  deletePage: {
    title: "Delete this page?",
    text: (count: number) =>
      count === 1
        ? "1 page uses its answers in its display conditions. That condition will be removed, and the page will show to everyone."
        : `${count} pages use its answers in their display conditions. Those conditions will be removed, and the pages will show to everyone.`,
    keep: "Keep it",
    confirm: "Delete page",
  },
  removeAnswer: {
    title: "Remove this answer?",
    text: (count: number, answer: string) =>
      count === 1
        ? `1 page uses “${answer}” in its display conditions. That condition will be removed, and the page will show to everyone.`
        : `${count} pages use “${answer}” in their display conditions. Those conditions will be removed, and the pages will show to everyone.`,
    keep: "Keep it",
    confirm: "Remove answer",
  },
  pageLimit: {
    title: (max: number) => `This quiz has ${max} pages`,
    text: "That’s the most the Free plan allows in one quiz. Delete a page to add another, or contact us for more.",
    back: "Back to the editor",
    contact: "Contact us",
  },
} as const;

export const editorToasts = {
  pageDeleted: "Page deleted",
  undo: "Undo",
  /** The design has no text for a blocked move yet (gap G4). */
  moveBlocked: "That move would make a condition look at a later page.",
} as const;

export const panel = {
  title: (n: number) => `Edit page ${n}`,
  titleLast: "Edit last page",
  question: "Your question",
  title1: "Title",
  shortText: "Short text",
  text: "Text",
  message: "Message",
  picture: "Picture",
  optional: "(optional)",
  addPicture: "Add a picture",
  required: "People must answer to continue",
  welcomeNote: "The line “Takes about 1 minute” and the button are added for you. The time comes from how many questions the quiz has.",
  choice: {
    answers: "Answers people can pick",
    answer: (n: number) => `Answer ${n}`,
    answerLabel: (n: number) => `Label ${n}`,
    remove: (n: number) => `Remove answer ${n}`,
    add: "Add an answer",
    multiple: "Let people pick more than one answer",
    pictures: "Add pictures to the answers",
  },
  text1: {
    typing: "What are they typing?",
    any: "Any text",
    email: "Email",
    phone: "Phone number",
    note: "Email and phone check that the answer looks right.",
    hint: "Hint inside the box",
  },
  number: {
    enter: "What should they enter?",
    age: "Age",
    height: "Height",
    weight: "Weight",
    number: "Any number",
    date: "A date",
    unit: "Unit",
    unitShown: "Unit shown next to the number",
    ageUnit: "Always “years” for age.",
    switching: (to: string, min: number, max: number) => `Switching to ${to} fills in a new range for you (${min} to ${max}).`,
    heightNote: "People type one number, like 172 or 68.",
    anyNote: "For ratings, quantities, anything else.",
    dateNote: "People pick a day, month and year. There is no unit and no range to set.",
    dateNote2: "Answers show as a date in Responses, and the summary groups them by month.",
    allowed: "Allowed numbers",
    smallest: "Smallest",
    largest: "Largest",
    to: "to",
    rangeNote: "People can’t continue with a number outside this range.",
  },
  loading: {
    message: "Message",
    steps: "Steps shown one by one",
    step: (n: number) => `Step ${n}`,
    remove: (n: number) => `Remove step ${n}`,
    add: "Add a step",
    duration: "How long it shows",
    seconds: "seconds, then it moves on by itself",
  },
  end: {
    style: "Style",
    thanks: "Message only",
    button: "Message + button",
    offer: "Result + offer",
    thanksNote: "Just say thank you. Nothing else.",
    buttonNote: "A thank-you message and one button that opens any link.",
    offerNote: "Show the result, a price and a buy button.",
    buttonText: "Button text",
    link: "Where the button goes",
    linkNote: "Paste the link to any page.",
    linkNoteOffer: "Paste the link to your checkout or any page.",
    price: "Price",
    priceNote: "Small text under the price",
    note: "Note under the button",
  },
} as const;
