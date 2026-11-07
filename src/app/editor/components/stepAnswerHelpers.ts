import type { Step, Option, ImageOption } from "@/types/quiz";

/** Pull selectable values from a step's content (single-select, image options, landing). */
export function getOptionsForStep(step: Step): { value: string; label: string }[] | null {
    const content = step.content as Record<string, unknown>;
    const opts = content.options as Option[] | undefined;
    if (Array.isArray(opts)) {
        return opts.map((o) => ({ value: o.value, label: o.label }));
    }
    const optsImg = content.optionsImg as ImageOption[] | undefined;
    if (Array.isArray(optsImg)) {
        return optsImg.map((o) => ({ value: o.value, label: o.label }));
    }
    return null;
}

export function stepDisplayLabel(step: Step, index: number): string {
    const content = step.content as Record<string, unknown>;
    const text = (content.question as string) || (content.title as string) || step.id;
    return `${index + 1}. ${text}`;
}
