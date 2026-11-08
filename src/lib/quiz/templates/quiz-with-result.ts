import { FORMAT, type PageOf, type QuizDocument } from "../schema";

const question = (id: string, text: string): PageOf<"choice"> => ({
  id,
  type: "choice",
  question: text,
  answers: [
    { id: `${id}-a`, text: "Answer 1", picture: null },
    { id: `${id}-b`, text: "Answer 2", picture: null },
  ],
  multiple: false,
  required: true,
  picture: null,
});

export const quizWithResult: QuizDocument = {
  format: FORMAT,
  name: "Quiz with a result",
  pages: [
    { id: "start", type: "welcome", title: "Take the quiz", text: "Answer a few questions to see your result.", picture: null },
    question("q1", "Question 1"),
    question("q2", "Question 2"),
    question("q3", "Question 3"),
    { id: "working", type: "loading", message: "Working out your result…", steps: ["Checking your answers", "Putting it together"], seconds: 5 },
    {
      id: "end",
      type: "end",
      style: "button",
      title: "Your result",
      text: "Here is what your answers say.",
      picture: null,
      buttonText: "Visit our website",
      link: "https://yourwebsite.com",
    },
  ],
};
