import { pageTypes } from "../page-types";
import { newId } from "../ids";
import { FORMAT, type Page, type QuizDocument } from "../schema";
import { contactForm } from "./contact-form";
import { feedback } from "./feedback";
import { quizWithResult } from "./quiz-with-result";

export type QuizTemplate = {
  id: string;
  name: string;
  /** Short line on the New quiz dialog */
  summary: string;
  /** Line under the name in "What each template contains" */
  tagline: string;
  document: QuizDocument;
};

/** The starting templates (board TemplateContents). Each one is a complete, publishable quiz document. */
export const quizTemplates: readonly QuizTemplate[] = [
  { id: "contact-form", name: "Contact form", summary: "Name, email, message", tagline: "Let people get in touch.", document: contactForm },
  { id: "feedback", name: "Feedback", summary: "Rate and comment", tagline: "Rate something and say why.", document: feedback },
  { id: "quiz-with-result", name: "Quiz with a result", summary: "Questions, then a result", tagline: "Ask questions, then show an ending.", document: quizWithResult },
];

/** A blank quiz: a Start page with the quiz name as its title, and an End page. Nothing else. */
export function blankQuiz(name: string): QuizDocument {
  return {
    format: FORMAT,
    name,
    pages: [{ ...pageTypes.welcome.create(newId()), title: name }, pageTypes.end.create(newId())],
  };
}

/** A new quiz from a template, under the person's own name for it. */
export function templateQuiz(templateId: string, name: string): QuizDocument | null {
  const template = quizTemplates.find((t) => t.id === templateId);
  return template ? { ...structuredClone(template.document), name } : null;
}

/** "Number · 0 to 10", "End page · message only": how a page is described in the template reference. */
export const describePage = (page: Page) => ({ title: pageTypes[page.type].title(page as never), kind: pageTypes[page.type].summaryLabel(page as never) });
