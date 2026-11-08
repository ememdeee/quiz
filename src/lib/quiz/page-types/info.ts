import { isBlank, type PageTypeDefinition } from "./types";

export const info: PageTypeDefinition<"info"> = {
  type: "info",
  label: "Info page",
  description: "Text and a picture, no question",
  group: "show",
  isQuestion: false,
  listLabel: () => "Info page",
  summaryLabel: () => "Info page",
  title: (page) => page.title,
  create: (id) => ({ id, type: "info", title: "", text: "", picture: null }),
  problems: (page) => (isBlank(page.title) ? [{ field: "title", code: "title_missing" }] : []),
};
