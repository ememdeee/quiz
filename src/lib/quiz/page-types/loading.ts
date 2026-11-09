import { isBlank, type FieldProblem, type PageTypeDefinition } from "./types";

export const DEFAULT_LOADING_SECONDS = 5;

export const loading: PageTypeDefinition<"loading"> = {
  type: "loading",
  label: "Loading screen",
  description: "“Building your plan…”",
  group: "show",
  isQuestion: false,
  listLabel: () => "Loading screen",
  summaryLabel: () => "Loading screen",
  title: (page) => page.message,
  create: (id) => ({ id, type: "loading", message: "Getting your results ready", steps: ["Checking your answers"], seconds: DEFAULT_LOADING_SECONDS }),
  problems: (page) => {
    const problems: FieldProblem[] = [];
    if (isBlank(page.message)) problems.push({ field: "message", code: "message_missing" });
    page.steps.forEach((step, index) => {
      if (isBlank(step)) problems.push({ field: `steps.${index}`, code: "step_empty" });
    });
    return problems;
  },
};
