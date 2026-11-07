/**
 * The three starting templates (board TemplateContents). The editor slice builds each one as a real
 * quiz document; the page lists here then come from those documents instead of being written by hand.
 */
export type TemplatePage = { title: string; kind: string };

export type QuizTemplate = {
  id: string;
  name: string;
  /** Short line on the New quiz dialog */
  summary: string;
  /** Line under the name in "What each template contains" */
  tagline: string;
  pages: readonly TemplatePage[];
};

export const quizTemplates: readonly QuizTemplate[] = [
  {
    id: "contact-form",
    name: "Contact form",
    summary: "Name, email, message",
    tagline: "Let people get in touch.",
    pages: [
      { title: "Get in touch", kind: "Start page" },
      { title: "What is your name?", kind: "Text answer" },
      { title: "What is your email?", kind: "Text answer · email" },
      { title: "How can we help?", kind: "Text answer" },
      { title: "Thank you!", kind: "End page · message only" },
    ],
  },
  {
    id: "feedback",
    name: "Feedback",
    summary: "Rate and comment",
    tagline: "Rate something and say why.",
    pages: [
      { title: "Tell us what you think", kind: "Start page" },
      { title: "How was your experience?", kind: "Multiple choice · Great, Good, Okay, Poor" },
      { title: "How likely are you to recommend us?", kind: "Number · 0 to 10" },
      { title: "Anything else you’d like to add?", kind: "Text answer" },
      { title: "Thank you!", kind: "End page · message only" },
    ],
  },
  {
    id: "quiz-with-result",
    name: "Quiz with a result",
    summary: "Questions, then a result",
    tagline: "Ask questions, then show an ending.",
    pages: [
      { title: "Take the quiz", kind: "Start page" },
      { title: "Question 1", kind: "Multiple choice" },
      { title: "Question 2", kind: "Multiple choice" },
      { title: "Question 3", kind: "Multiple choice" },
      { title: "Working out your result…", kind: "Loading screen" },
      { title: "Your result", kind: "End page · message + button" },
    ],
  },
];

/** A blank quiz is a Start page and an End page. */
export const BLANK_PAGE_COUNT = 2;
