/** Words shared by every dashboard screen: save status, errors, the phone message. All fixed English. */
export const saveStatusText = {
  saving: "Saving…",
  saved: "All changes saved",
  error: "Couldn’t save",
  retry: "Try again",
} as const;

export const dashErrors = {
  offline: { title: "You’re offline.", text: "Your changes will save when you’re back online." },
  loggedOut: {
    title: "You’ve been logged out",
    text: "For your security, please log in again. Everything you did was saved.",
    logIn: "Log in",
  },
  suspended: {
    title: "Your account is suspended",
    text: "You can’t edit or publish right now. If you think this is a mistake, contact us. Your quizzes and answers are safe.",
    logOut: "Log out",
    contact: "Contact us",
  },
  quizNotFound: {
    title: "We can’t find this quiz",
    text: "It may have been deleted, or the link is wrong.",
    back: "Back to all quizzes",
  },
  /** A change that did not go through for a reason the design has no special screen for. */
  generic: "Something went wrong. Please try again.",
} as const;

export const dashPhone = {
  title: "The dashboard works best on a computer",
  text: "Open Quiz on a computer to build quizzes and read your answers. Your quizzes themselves work great on phones.",
  emailLink: "Email me a link",
  linkSent: "Check your email",
  backHome: "Back to home",
} as const;

/** Small labels used by the dashboard shell. */
export const dashLabels = {
  mainContent: "Dashboard",
  loading: "Loading",
} as const;
