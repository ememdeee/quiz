import { FORMAT, type QuizDocument } from "../schema";

export const contactForm: QuizDocument = {
  format: FORMAT,
  name: "Contact form",
  pages: [
    { id: "start", type: "welcome", title: "Get in touch", text: "Tell us how to reach you and what you need.", picture: null },
    { id: "name", type: "text", question: "What is your name?", input: "any", hint: "Your name", required: true },
    { id: "email", type: "text", question: "What is your email?", input: "email", hint: "you@example.com", required: true },
    { id: "help", type: "text", question: "How can we help?", input: "any", hint: "Type your message", required: true },
    { id: "end", type: "end", style: "thanks", title: "Thank you!", text: "We got your message and will get back to you soon.", picture: null },
  ],
};
