import { AGE } from "../units";
import { isBlank, type FieldProblem, type PageTypeDefinition } from "./types";

export const number: PageTypeDefinition<"number"> = {
  type: "number",
  label: "Number or date",
  description: "Age, height, weight, a goal date or any number",
  group: "ask",
  isQuestion: true,
  listLabel: (page) => (page.kind === "date" ? "Asks for a date" : "Asks for a number"),
  summaryLabel: (page) => {
    if (page.kind === "date") return "Date";
    const range = page.min !== null && page.max !== null ? ` · ${page.min} to ${page.max}` : "";
    return `Number${range}`;
  },
  title: (page) => page.question,
  create: (id) => ({ id, type: "number", question: "", kind: "age", unit: AGE.unit, min: AGE.min, max: AGE.max, required: true }),
  problems: (page) => {
    const problems: FieldProblem[] = [];
    if (isBlank(page.question)) problems.push({ field: "question", code: "question_missing" });
    if (page.min !== null && page.max !== null && page.min > page.max) problems.push({ field: "range", code: "range_invalid" });
    return problems;
  },
};
