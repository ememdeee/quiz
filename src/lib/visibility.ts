import type { Step, VisibilityRule, VisibilityRules } from '@/types/quiz';
import { isEmptyValue, matchesEquals, matchesContains } from '@/lib/conditionHelpers';

/**
 * Evaluate a single rule against the answer map. Pure — no side effects.
 */
export function evaluateRule(
    rule: VisibilityRule,
    answers: Record<string, unknown>,
): boolean {
    const answer = answers[rule.stepId];
    const target = rule.value ?? '';

    switch (rule.operator) {
        case 'is_empty':
            return isEmptyValue(answer);
        case 'is_not_empty':
            return !isEmptyValue(answer);
        case 'equals':
            return matchesEquals(answer, target);
        case 'not_equals':
            return !matchesEquals(answer, target);
        case 'contains':
            return matchesContains(answer, target);
        default:
            return true;
    }
}

/** Evaluate a full rule group (AND/OR). No rules = pass. */
export function evaluateRules(
    visibility: VisibilityRules | undefined,
    answers: Record<string, unknown>,
): boolean {
    if (!visibility || visibility.rules.length === 0) return true;
    if (visibility.match === 'all') {
        return visibility.rules.every((r) => evaluateRule(r, answers));
    }
    return visibility.rules.some((r) => evaluateRule(r, answers));
}

/** Is this step currently visible given the user's answers so far? */
export function isStepVisible(step: Step, answers: Record<string, unknown>): boolean {
    return evaluateRules(step.visibility, answers);
}

/**
 * Find the next visible step index strictly after `from`.
 * Returns -1 if no more visible steps remain.
 */
export function nextVisibleIndex(
    steps: Step[],
    from: number,
    answers: Record<string, unknown>,
): number {
    for (let i = from + 1; i < steps.length; i++) {
        if (isStepVisible(steps[i], answers)) return i;
    }
    return -1;
}

/**
 * Find the previous visible step index strictly before `from`.
 * Returns -1 if there is no earlier visible step.
 */
export function prevVisibleIndex(
    steps: Step[],
    from: number,
    answers: Record<string, unknown>,
): number {
    for (let i = from - 1; i >= 0; i--) {
        if (isStepVisible(steps[i], answers)) return i;
    }
    return -1;
}

/** All currently-visible steps, preserving original order. */
export function visibleSteps(
    steps: Step[],
    answers: Record<string, unknown>,
): Step[] {
    return steps.filter((s) => isStepVisible(s, answers));
}

/**
 * After an answer changes, some downstream steps may have become hidden.
 * Returns the ids of steps that have an answer but are no longer visible —
 * the caller should clear those answers to keep state consistent.
 */
export function findOrphanedAnswers(
    steps: Step[],
    answers: Record<string, unknown>,
): string[] {
    const orphans: string[] = [];
    for (const step of steps) {
        if (step.id in answers && !isStepVisible(step, answers)) {
            orphans.push(step.id);
        }
    }
    return orphans;
}
