/** Words of "Send feedback" in the account menu. No board (gap G30): built by Code, listed in the "not designed yet" list. */
export const feedbackDialog = {
  title: "Send feedback",
  text: "Tell us what is confusing, what is missing, or what you like. We read every message and may reply by email.",
  label: "Your message",
  placeholder: "For example: “I could not find where to…”",
  send: "Send",
  cancel: "Cancel",
  close: "Close",
  sentTitle: "Thank you",
  sentText: "Your feedback was sent. We read every message.",
  errors: {
    generic: "We couldn’t send your feedback. Please try again in a minute.",
    rateLimited: "You sent a few messages already. Please try again in an hour.",
    loggedOut: "Please log in again to send feedback.",
  },
} as const;
