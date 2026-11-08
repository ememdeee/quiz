import { pageSchema, type PageType } from "@/lib/quiz/schema";

/**
 * The text "Copy for AI" puts on the clipboard (board AiFormat). The field list is built from the same schema that
 * checks the AI's answer, so what the AI is told and what we accept can never drift apart.
 */
const HIDDEN_FIELDS = new Set(["id", "type", "show"]);

/** Every page type with the fields an AI may write, in the order the editor shows them. */
export function pageFieldList(): { type: PageType; fields: string[] }[] {
  return pageSchema.options.map((option) => ({
    type: option.shape.type.value as PageType,
    fields: Object.keys(option.shape).filter((key) => !HIDDEN_FIELDS.has(key)),
  }));
}

const fieldLines = () => pageFieldList().map(({ type, fields }) => `${type.padEnd(8)} ${fields.join(", ")}`).join("\n");

export const PAGE_LIMIT_TOKEN = "{PAGE_LIMIT}";
export const QUIZ_DATA_TOKEN = "{QUIZ_DATA}";

export const promptTemplate = `You are helping me edit a quiz. My quiz is below as data.

How to answer
- Change the quiz the way I ask in "My request" at the bottom.
- Reply with the WHOLE quiz as data in one code block, in
  exactly the same format. No other text in the code block.
- Keep everything I did not ask to change exactly as it is.
- Keep the "id" of every page and answer you keep. Give new
  pages and answers a new id like "new-1", "new-2".
- The first page is the "welcome" page and the last page is
  the "end" page. There is exactly one of each. Put new pages
  between them. Welcome and end pages never have "show".
- "show" decides who sees a page. "match" is "all" or "any".
  A rule can only look at a question that comes earlier.
- A choice page has 2 to 8 answers.
- Never make up pictures. Keep each "picture" as it is,
  or use null.
- Write plain, friendly words for people who are not experts.
- Keep the quiz to ${PAGE_LIMIT_TOKEN} pages or fewer.

Page types and their fields
${"{FIELDS}"}

My quiz
${QUIZ_DATA_TOKEN}

My request
`;

/** The instructions with the person's page limit and the quiz data filled in, ending on an empty "My request". */
export function buildPrompt(quizData: string, pageLimit: number): string {
  return promptTemplate.replace("{FIELDS}", fieldLines()).replace(PAGE_LIMIT_TOKEN, String(pageLimit)).replace(QUIZ_DATA_TOKEN, quizData);
}
