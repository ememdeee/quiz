import { isBlank, type FieldProblem, type PageTypeDefinition } from "./types";

const styleWords = { thanks: "message only", button: "message + button", offer: "result + offer" } as const;

export const isHttpsLink = (value: string | undefined) => {
  try {
    return value !== undefined && new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export const end: PageTypeDefinition<"end"> = {
  type: "end",
  label: "End page",
  description: "The last page people see",
  group: null,
  isQuestion: false,
  listLabel: () => "End page",
  summaryLabel: (page) => `End page · ${styleWords[page.style]}`,
  title: (page) => page.title,
  create: (id) => ({
    id,
    type: "end",
    style: "thanks",
    title: "Thank you!",
    text: "We got your answers. You can close this page now.",
    picture: null,
  }),
  problems: (page) => {
    const problems: FieldProblem[] = [];
    if (isBlank(page.title)) problems.push({ field: "title", code: "title_missing" });
    if (page.style !== "thanks") {
      if (isBlank(page.buttonText)) problems.push({ field: "buttonText", code: "button_text_missing" });
      if (!isHttpsLink(page.link)) problems.push({ field: "link", code: "link_invalid" });
    }
    return problems;
  },
};
