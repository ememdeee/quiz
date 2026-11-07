/** Words of the quiz settings drawer (board Settings) and the picture dialog (board AddPicture). All fixed English. */
export const settings = {
  title: "Quiz settings",
  close: "Close",
  name: "Quiz name",
  nameNote: "Only you see this name.",
  address: "Web address",
  addressPrefix: "/quiz/",
  addressNote: "If you change this, links you already shared will stop working.",
  /** The design has one address error (taken); the others have no wording yet (gap G19). */
  addressErrors: {
    taken: "That address is already taken. Try another one.",
    invalid: "Use 3 to 60 letters, numbers or single hyphens, with no hyphen at either end.",
    reserved: "That address is kept for the website. Try another one.",
  },
  addressOk: "That address is free.",
  accepting: "Accepting responses",
  acceptingNote: "When this is off, people see a message that the quiz is closed.",
  colorsHeading: "Colors and look",
  colors: { title: "Custom colors", note: "Using the standard look." },
  poweredBy: { title: "Hide “Powered by Quiz”", note: "Shown on the first and last page." },
  customPlan: "Custom plan",
  deleteQuiz: "Delete quiz",
  saved: "All changes saved",
} as const;

export const pictureDialog = {
  title: "Add a picture",
  upload: "Upload",
  mine: "My pictures",
  drop: "Drop a picture here",
  or: "or",
  choose: "Choose a file",
  rules: "JPG, PNG or WebP. Up to 5 MB.",
  tooBig: "That file is too big. Pick one under 5 MB.",
  /** No wording in the design for a file that is not a picture (gap G19). */
  wrongType: "Pick a JPG, PNG or WebP picture.",
  uploading: "Adding your picture…",
  empty: "You have no pictures yet. Upload one first.",
  cancel: "Cancel",
  use: "Use this picture",
  pictureAlt: (n: number) => `Picture ${n}`,
  remove: "Remove picture",
  change: "Change picture",
} as const;
