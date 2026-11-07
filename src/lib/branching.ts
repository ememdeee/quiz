import type { ConditionGroup, ConditionRule, Step, StepBranch } from '@/types/quiz';
import { isEmptyValue, matchesEquals, matchesContains } from '@/lib/conditionHelpers';

/**
 * Minimal structural type satisfied by both the browser's URLSearchParams
 * and Next.js's ReadonlyURLSearchParams, without depending on next/navigation.
 */
export interface QueryParamsLike {
    get(key: string): string | null;
}

/**
 * Evaluate a single condition rule. Pure — no side effects.
 */
export function evaluateCondition(
    rule: ConditionRule,
    answers: Record<string, unknown>,
    queryParams?: QueryParamsLike,
): boolean {
    const raw = rule.source === 'queryParam'
        ? queryParams?.get(rule.param ?? '') ?? undefined
        : answers[rule.stepId ?? ''];
    const target = rule.value ?? '';

    switch (rule.operator) {
        case 'is_empty':
            return isEmptyValue(raw);
        case 'is_not_empty':
            return !isEmptyValue(raw);
        case 'equals':
            return matchesEquals(raw, target);
        case 'not_equals':
            return !matchesEquals(raw, target);
        case 'contains':
            return matchesContains(raw, target);
        case 'greater_than': {
            const a = Number(raw);
            const b = Number(target);
            return Number.isFinite(a) && Number.isFinite(b) && a > b;
        }
        case 'less_than': {
            const a = Number(raw);
            const b = Number(target);
            return Number.isFinite(a) && Number.isFinite(b) && a < b;
        }
        default:
            return false;
    }
}

/** Evaluate a full condition group (AND/OR). An empty rule set never matches. */
export function evaluateConditionGroup(
    conditions: ConditionGroup | undefined,
    answers: Record<string, unknown>,
    queryParams?: QueryParamsLike,
): boolean {
    if (!conditions || conditions.rules.length === 0) return false;
    if (conditions.match === 'all') {
        return conditions.rules.every((r) => evaluateCondition(r, answers, queryParams));
    }
    return conditions.rules.some((r) => evaluateCondition(r, answers, queryParams));
}

/** First branch (top-to-bottom) whose conditions match, or null if none do. */
export function resolveActiveBranch(
    step: Step,
    answers: Record<string, unknown>,
    queryParams?: QueryParamsLike,
): StepBranch | null {
    for (const branch of step.branches ?? []) {
        if (evaluateConditionGroup(branch.conditions, answers, queryParams)) return branch;
    }
    return null;
}

/**
 * Resolve the step as it should actually render: the base step, or a shallow
 * copy with content/type overridden by the first matching branch. Never
 * changes `id`, so answers/tracking stay keyed to the same step.
 */
export function resolveEffectiveStep(
    step: Step,
    answers: Record<string, unknown>,
    queryParams?: QueryParamsLike,
): Step {
    const active = resolveActiveBranch(step, answers, queryParams);
    if (!active) return step;
    return {
        ...step,
        type: active.type ?? step.type,
        content: active.content,
    };
}
