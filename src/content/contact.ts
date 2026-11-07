/** All words on the contact page and its two result states (boards Contact, ContactSent, ContactError). */
export const contactTopics = ["Your own domain", "Your colors and logo", "A custom quiz page", "Something else"] as const;

export const contact = {
  eyebrow: "Contact",
  titleLines: ["Let’s talk about", "your quiz."],
  lede: "Want your own domain, colors or a custom quiz page? Tell us what you need and we’ll reply by email.",
  form: {
    topicsLabel: "What do you need?",
    name: "Your name",
    email: "Email",
    message: "Message",
    messagePlaceholder: "Tell us a little about your brand and what the quiz is for.",
    send: "Send message",
    sending: "Sending",
  },
  errors: {
    banner: "We couldn’t send your message. Check the details below and try again.",
    email: "Please enter a valid email.",
    message: "Please write a short message.",
  },
  email: { title: "Prefer email?", text: "Write to us directly." },
  next: {
    title: "What happens next",
    steps: ["We read your message.", "We reply by email with a few questions and a price.", "We build it together and you go live."],
  },
  sent: {
    title: "Message sent",
    text: "Thank you. We’ll reply to your email soon.",
    button: "Back to home",
  },
} as const;
