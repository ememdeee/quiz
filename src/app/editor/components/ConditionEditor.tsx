"use client";

import React from "react";
import type {
    Step,
    ConditionGroup,
    ConditionRule,
    ConditionSource,
    ConditionOperator,
} from "@/types/quiz";
import { getOptionsForStep, stepDisplayLabel } from "./stepAnswerHelpers";

interface Props {
    /** All steps in the quiz, in order. Used for the "quiz answer" source's step picker. */
    allSteps: Step[];
    /** The step this branch belongs to. Determines which steps precede it. */
    currentStep: Step;
    conditions: ConditionGroup;
    onChange: (next: ConditionGroup) => void;
}

const SOURCE_OPTIONS: { value: ConditionSource; label: string }[] = [
    { value: "queryParam", label: "Query Parameter" },
    { value: "answer", label: "Quiz Answer" },
];

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "greater_than", label: "is greater than" },
    { value: "less_than", label: "is less than" },
    { value: "contains", label: "contains" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
];

/** Operators that don't take a value input. */
const VALUELESS_OPERATORS = new Set<ConditionOperator>(["is_empty", "is_not_empty"]);

export function ConditionEditor({ allSteps, currentStep, conditions, onChange }: Props) {
    const currentIndex = allSteps.findIndex((s) => s.id === currentStep.id);
    const precedingSteps = currentIndex > 0 ? allSteps.slice(0, currentIndex) : [];

    const updateRule = (idx: number, updates: Partial<ConditionRule>) => {
        const rules = conditions.rules.map((r, i) => (i === idx ? { ...r, ...updates } : r));
        onChange({ ...conditions, rules });
    };

    const removeRule = (idx: number) => {
        onChange({ ...conditions, rules: conditions.rules.filter((_, i) => i !== idx) });
    };

    const addRule = () => {
        onChange({
            ...conditions,
            rules: [
                ...conditions.rules,
                { source: "queryParam", param: "", operator: "equals", value: "" },
            ],
        });
    };

    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Conditions
            </label>

            <div className="space-y-3">
                {conditions.rules.length > 1 && (
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>Match</span>
                        <select
                            value={conditions.match}
                            onChange={(e) =>
                                onChange({ ...conditions, match: e.target.value as "all" | "any" })
                            }
                            className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded px-2 py-1 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none cursor-pointer"
                        >
                            <option value="all">all</option>
                            <option value="any">any</option>
                        </select>
                        <span>of the following:</span>
                    </div>
                )}

                {conditions.rules.map((rule, idx) => (
                    <ConditionRuleRow
                        key={idx}
                        rule={rule}
                        precedingSteps={precedingSteps}
                        onChange={(updates) => updateRule(idx, updates)}
                        onRemove={() => removeRule(idx)}
                    />
                ))}

                <button
                    onClick={addRule}
                    className="text-xs text-dashboard-primary font-medium hover:text-dashboard-primary/80 flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[14px]">add</span>
                    Add condition
                </button>
            </div>
        </div>
    );
}

interface RuleRowProps {
    rule: ConditionRule;
    precedingSteps: Step[];
    onChange: (updates: Partial<ConditionRule>) => void;
    onRemove: () => void;
}

function ConditionRuleRow({ rule, precedingSteps, onChange, onRemove }: RuleRowProps) {
    const sourceStep = rule.source === "answer" ? precedingSteps.find((s) => s.id === rule.stepId) : undefined;
    const sourceOptions = sourceStep ? getOptionsForStep(sourceStep) : null;
    const showValueInput = !VALUELESS_OPERATORS.has(rule.operator);

    return (
        <div className="bg-dashboard-surface-dark p-3 rounded-lg border border-dashboard-border-dark space-y-2 group hover:border-dashboard-primary/40 transition-colors">
            <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                    {/* Source picker */}
                    <div className="relative">
                        <select
                            value={rule.source}
                            onChange={(e) => {
                                const source = e.target.value as ConditionSource;
                                if (source === "answer") {
                                    onChange({ source, stepId: precedingSteps[0]?.id, param: undefined });
                                } else {
                                    onChange({ source, param: "", stepId: undefined });
                                }
                            }}
                            className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 pl-2 pr-7 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none cursor-pointer appearance-none truncate"
                        >
                            {SOURCE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-2 top-1.5 text-slate-500 material-symbols-outlined text-[14px] pointer-events-none">
                            expand_more
                        </span>
                    </div>

                    {/* Source detail: preceding-step picker or query param name */}
                    {rule.source === "answer" ? (
                        precedingSteps.length > 0 ? (
                            <div className="relative">
                                <select
                                    value={rule.stepId ?? ""}
                                    onChange={(e) => onChange({ stepId: e.target.value })}
                                    className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 pl-2 pr-7 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none cursor-pointer appearance-none truncate"
                                >
                                    {precedingSteps.map((step, idx) => (
                                        <option key={step.id} value={step.id}>
                                            {stepDisplayLabel(step, idx)}
                                        </option>
                                    ))}
                                </select>
                                <span className="absolute right-2 top-1.5 text-slate-500 material-symbols-outlined text-[14px] pointer-events-none">
                                    expand_more
                                </span>
                            </div>
                        ) : (
                            <p className="text-[11px] text-slate-500 leading-relaxed py-1.5">
                                No preceding steps to reference.
                            </p>
                        )
                    ) : (
                        <input
                            type="text"
                            value={rule.param ?? ""}
                            onChange={(e) => onChange({ param: e.target.value })}
                            placeholder="utm_content"
                            className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 px-2 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none placeholder-slate-600 font-mono"
                        />
                    )}

                    {/* Operator + value row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={rule.operator}
                                onChange={(e) =>
                                    onChange({ operator: e.target.value as ConditionOperator })
                                }
                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 pl-2 pr-7 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none cursor-pointer appearance-none"
                            >
                                {OPERATOR_OPTIONS.map((op) => (
                                    <option key={op.value} value={op.value}>
                                        {op.label}
                                    </option>
                                ))}
                            </select>
                            <span className="absolute right-2 top-1.5 text-slate-500 material-symbols-outlined text-[14px] pointer-events-none">
                                expand_more
                            </span>
                        </div>

                        {showValueInput && (
                            <div className="flex-1 relative">
                                {sourceOptions ? (
                                    <>
                                        <select
                                            value={rule.value ?? ""}
                                            onChange={(e) => onChange({ value: e.target.value })}
                                            className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 pl-2 pr-7 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none cursor-pointer appearance-none"
                                        >
                                            <option value="">Select value...</option>
                                            {sourceOptions.map((opt) => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="absolute right-2 top-1.5 text-slate-500 material-symbols-outlined text-[14px] pointer-events-none">
                                            expand_more
                                        </span>
                                    </>
                                ) : (
                                    <input
                                        type="text"
                                        value={rule.value ?? ""}
                                        onChange={(e) => onChange({ value: e.target.value })}
                                        placeholder="value"
                                        className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 px-2 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none placeholder-slate-600"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={onRemove}
                    className="text-slate-500 hover:text-red-400 p-1 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity mt-0.5"
                    title="Remove condition"
                >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
            </div>
        </div>
    );
}
