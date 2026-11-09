import { isBlank, type PageTypeDefinition } from "./types";

const inputWords = { any: "", email: " · email", phone: " · phone" } as const;

export const text: PageTypeDefinition<"text"> = {
  type: "text",
  label: "Text answer",
  description: "Name, email or anything typed",
  group: "ask",
  isQuestion: true,
  listLabel: () => "Text answer",
  summaryLabel: (page) => `Text answer${inputWords[page.input]}`,
  title: (page) => page.question,
  create: (id) => ({ id, type: "text", question: "Question", input: "any", hint: "", required: true }),
  problems: (page) => (isBlank(page.question) ? [{ field: "question", code: "question_missing" }] : []),
};
