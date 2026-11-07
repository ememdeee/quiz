/** Words on the full-page messages: not found, server error, maintenance. */
export const statusPages = {
  notFound: {
    title: "We can’t find that page",
    text: "The link may be wrong, or the page may have moved. Let’s get you back on track.",
    primary: "Go to home",
    secondary: "Go to my quizzes",
  },
  serverError: {
    title: "Something went wrong on our side",
    text: "It’s not you. We’re looking into it. Please try again in a moment.",
    primary: "Try again",
    secondary: "Contact us",
  },
  maintenance: {
    title: "We’ll be right back",
    text: "Quiz is being updated. This usually takes a few minutes. Your quizzes and answers are safe.",
    primary: "Check again",
    secondary: "Email us",
  },
} as const;
