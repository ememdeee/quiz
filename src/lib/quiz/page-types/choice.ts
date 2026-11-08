import { MIN_ANSWERS } from "../schema";
import { newId } from "../ids";
import { isBlank, type FieldProblem, type PageTypeDefinition } from "./types";

export const choice: PageTypeDefinition<"choice"> = {
  type: "choice",
  label: "Multiple choice",
  description: "Pick from a list of answers, with or without pictures",
  group: "ask",
  isQuestion: true,
  listLabel: () => "Multiple choice",
  summaryLabel: (page) => {
    const answers = page.answers.map((a) => a.text).filter((text) => !isBlank(text));
    return answers.length > 0 ? `Multiple choice · ${answers.join(", ")}` : "Multiple choice";
  },
  title: (page) => page.question,
  create: (id) => ({
    id,
    type: "choice",
    question: "",
    answers: [
      { id: newId(), text: "", picture: null },
      { id: newId(), text: "", picture: null },
    ],
    multiple: false,
    required: true,
    picture: null,
  }),
  problems: (page) => {
    const problems: FieldProblem[] = [];
    if (isBlank(page.question)) problems.push({ field: "question", code: "question_missing" });
    if (page.answers.filter((a) => !isBlank(a.text)).length < MIN_ANSWERS) problems.push({ field: "answers", code: "answers_too_few" });
    for (const answer of page.answers) if (isBlank(answer.text)) problems.push({ field: `answers.${answer.id}`, code: "answer_empty" });
    return problems;
  },
};
