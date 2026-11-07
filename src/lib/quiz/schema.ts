import { z } from "zod";

/**
 * The shape of a quiz (`quiz-v1`). One document holds every page, so the editor, the database, Edit with AI and
 * the tests all speak the same thing. This schema is lenient on purpose: a draft may be half finished (an empty
 * question, one answer). `validate.ts` holds the strict rules that must pass before publishing.
 */
export const FORMAT = "quiz-v1" as const;

const id = z.string().regex(/^[A-Za-z0-9_-]{1,40}$/);
/** The id of a picture in the owner's library. */
const mediaRef = z.string().min(1).nullable();

export const ruleSchema = z.object({
  /** An EARLIER page of the same quiz */
  page: id,
  op: z.enum(["is", "is not", "more than", "less than"]),
  value: z.union([z.string(), z.number()]),
});

export const showRuleSchema = z.object({
  match: z.enum(["all", "any"]),
  rules: z.array(ruleSchema).min(1).max(10),
});

const common = { id, show: showRuleSchema.optional() };

export const answerSchema = z.object({ id, text: z.string().max(150), picture: mediaRef });

export const pageSchema = z.discriminatedUnion("type", [
  z.object({ ...common, type: z.literal("welcome"), title: z.string().max(120), text: z.string().max(500), picture: mediaRef }),
  z.object({
    ...common,
    type: z.literal("choice"),
    question: z.string().max(300),
    answers: z.array(answerSchema).max(8),
    multiple: z.boolean(),
    required: z.boolean(),
    picture: mediaRef,
  }),
  z.object({
    ...common,
    type: z.literal("text"),
    question: z.string().max(300),
    input: z.enum(["any", "email", "phone"]),
    hint: z.string().max(100),
    required: z.boolean(),
  }),
  z.object({
    ...common,
    type: z.literal("number"),
    question: z.string().max(300),
    kind: z.enum(["age", "height", "weight", "number", "date"]),
    unit: z.string().max(20).nullable(),
    min: z.number().nullable(),
    max: z.number().nullable(),
    required: z.boolean(),
  }),
  z.object({ ...common, type: z.literal("info"), title: z.string().max(120), text: z.string().max(1000), picture: mediaRef }),
  z.object({
    ...common,
    type: z.literal("loading"),
    message: z.string().max(120),
    steps: z.array(z.string().max(80)).max(6),
    seconds: z.number().int().min(2).max(15),
  }),
  z.object({
    ...common,
    type: z.literal("end"),
    style: z.enum(["thanks", "button", "offer"]),
    title: z.string().max(120),
    text: z.string().max(500),
    picture: mediaRef,
    buttonText: z.string().max(40).optional(),
    link: z.string().optional(),
    price: z.string().max(40).optional(),
    priceNote: z.string().max(60).optional(),
    note: z.string().max(120).optional(),
  }),
]);

export const quizDocumentSchema = z.object({
  format: z.literal(FORMAT),
  /** The private quiz name. Kept for context; ignored when an AI edit is pasted back. */
  name: z.string().max(200),
  pages: z.array(pageSchema).max(200),
});

export type Rule = z.infer<typeof ruleSchema>;
export type ShowRule = z.infer<typeof showRuleSchema>;
export type Answer = z.infer<typeof answerSchema>;
export type Page = z.infer<typeof pageSchema>;
export type PageType = Page["type"];
export type QuizDocument = z.infer<typeof quizDocumentSchema>;
export type PageOf<T extends PageType> = Extract<Page, { type: T }>;

export const MAX_ANSWERS = 8;
export const MIN_ANSWERS = 2;
export const MAX_STEPS = 6;
export const MAX_RULES = 10;
