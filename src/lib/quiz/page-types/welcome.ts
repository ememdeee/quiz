import { isBlank, type PageTypeDefinition } from "./types";

export const welcome: PageTypeDefinition<"welcome"> = {
  type: "welcome",
  label: "Start page",
  description: "The first page people see",
  group: null,
  isQuestion: false,
  listLabel: () => "Start page",
  summaryLabel: () => "Start page",
  title: (page) => page.title,
  create: (id) => ({ id, type: "welcome", title: "Welcome", text: "", picture: null }),
  problems: (page) => (isBlank(page.title) ? [{ field: "title", code: "title_missing" }] : []),
};
