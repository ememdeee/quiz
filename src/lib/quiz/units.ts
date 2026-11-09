import type { PageOf } from "./schema";

/** What "Number or date" means for each kind: which units exist and which range goes with them (handover 5.2). */
export type NumberKind = PageOf<"number">["kind"];

type Range = { min: number; max: number };

export const AGE = { unit: "years", min: 18, max: 99 } as const;

export const HEIGHT_UNITS = ["cm", "in"] as const;
export const WEIGHT_UNITS = ["kg", "lb"] as const;

const RANGES: Record<string, Range> = {
  cm: { min: 120, max: 230 },
  in: { min: 48, max: 90 },
  kg: { min: 30, max: 300 },
  lb: { min: 70, max: 660 },
};

/** The units a kind lets the owner pick between. Empty means the unit is fixed, free text or not used. */
export function unitChoices(kind: NumberKind): readonly string[] {
  if (kind === "height") return HEIGHT_UNITS;
  if (kind === "weight") return WEIGHT_UNITS;
  return [];
}

/** The unit, minimum and maximum a page gets when its kind is chosen (or when the unit is switched). */
export function defaultsFor(kind: NumberKind, unit?: string): { unit: string | null; min: number | null; max: number | null } {
  if (kind === "age") return { ...AGE };
  if (kind === "height" || kind === "weight") {
    const choices = unitChoices(kind);
    const chosen = unit && choices.includes(unit) ? unit : choices[0];
    return { unit: chosen, ...RANGES[chosen] };
  }
  return { unit: null, min: null, max: null };
}

/**
 * The question a "Number or date" page starts with for each kind (no board: built by Code, listed in the "not designed yet" list).
 * The owner can change it. When the kind is switched, the question follows only while it is still one of these.
 */
export const NUMBER_QUESTIONS: Record<NumberKind, string> = {
  age: "How old are you?",
  height: "How tall are you?",
  weight: "How much do you weigh?",
  number: "Enter a number",
  date: "Pick a date",
};

/** The question to show after the kind changes: a new default only if the old one was never edited. */
export function questionAfterKindChange(current: string, oldKind: NumberKind, newKind: NumberKind): string {
  return current.trim() === "" || current === NUMBER_QUESTIONS[oldKind] ? NUMBER_QUESTIONS[newKind] : current;
}
