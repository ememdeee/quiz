"use client";

import React from "react";
import type {
    Step,
    VisibilityRules,
    VisibilityRule,
    VisibilityOperator,
} from "@/types/quiz";
import { getOptionsForStep, stepDisplayLabel } from "./stepAnswerHelpers";

interface Props {
    /** All steps in the quiz, in order. Used to determine which steps precede the current one. */
    allSteps: Step[];
    /** The step currently being edited. */
    currentStep: Step;
    /** Persist visibility config back to the step (undefined = always show). */
    onChange: (visibility: VisibilityRules | undefined) => void;
}

const OPERATOR_OPTIONS: { value: VisibilityOperator; label: string }[] = [
    { value: "equals", label: "is" },
    { value: "not_equals", label: "is not" },
    { value: "contains", label: "contains" },
    { value: "is_empty", label: "is empty" },
    { value: "is_not_empty", label: "is not empty" },
];

/** Operators that don't take a value input. */
const VALUELESS_OPERATORS = new Set<VisibilityOperator>(["is_empty", "is_not_empty"]);

export function VisibilityEditor({ allSteps, currentStep, onChange }: Props) {
    const currentIndex = allSteps.findIndex((s) => s.id === currentStep.id);
    const precedingSteps = currentIndex > 0 ? allSteps.slice(0, currentIndex) : [];

    const visibility = currentStep.visibility;
    const isConditional = Boolean(visibility);

    // First step (or step at index 0) can't have conditions — nothing precedes it.
    if (precedingSteps.length === 0) {
        return (
            <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Visibility
                </label>
                <div className="p-3 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-slate-500 mt-0.5">
                            info
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            The first step can&apos;t be conditional — there are no preceding answers to check.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const setMode = (conditional: boolean) => {
        if (conditional) {
            // Seed with one empty rule referencing the first preceding step
            onChange({
                match: "all",
                rules: [{ stepId: precedingSteps[0].id, operator: "equals", value: "" }],
            });
        } else {
            onChange(undefined);
        }
    };

    const updateRules = (next: VisibilityRules) => onChange(next);

    const updateRule = (idx: number, updates: Partial<VisibilityRule>) => {
        if (!visibility) return;
        const rules = visibility.rules.map((r, i) => (i === idx ? { ...r, ...updates } : r));
        updateRules({ ...visibility, rules });
    };

    const removeRule = (idx: number) => {
        if (!visibility) return;
        const rules = visibility.rules.filter((_, i) => i !== idx);
        if (rules.length === 0) {
            // No rules left = always show
            onChange(undefined);
        } else {
            updateRules({ ...visibility, rules });
        }
    };

    const addRule = () => {
        if (!visibility) return;
        updateRules({
            ...visibility,
            rules: [
                ...visibility.rules,
                { stepId: precedingSteps[0].id, operator: "equals", value: "" },
            ],
        });
    };

    return (
        <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Visibility
            </label>

            {/* Mode toggle */}
            <div className="flex bg-dashboard-surface-dark p-1 rounded-lg border border-dashboard-border-dark mb-4">
                <button
                    onClick={() => setMode(false)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${!isConditional
                            ? "bg-dashboard-primary/20 text-dashboard-primary"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                >
                    Always show
                </button>
                <button
                    onClick={() => setMode(true)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer ${isConditional
                            ? "bg-dashboard-primary/20 text-dashboard-primary"
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                >
                    Show only when…
                </button>
            </div>

            {isConditional && visibility && (
                <div className="space-y-3">
                    {/* Match all/any toggle — only useful with multiple rules */}
                    {visibility.rules.length > 1 && (
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>Match</span>
                            <select
                                value={visibility.match}
                                onChange={(e) =>
                                    updateRules({ ...visibility, match: e.target.value as "all" | "any" })
                                }
                                className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded px-2 py-1 text-xs text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none cursor-pointer"
                            >
                                <option value="all">all</option>
                                <option value="any">any</option>
                            </select>
                            <span>of the following:</span>
                        </div>
                    )}

                    {visibility.rules.map((rule, idx) => (
                        <RuleRow
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
            )}
        </div>
    );
}

interface RuleRowProps {
    rule: VisibilityRule;
    precedingSteps: Step[];
    onChange: (updates: Partial<VisibilityRule>) => void;
    onRemove: () => void;
}

function RuleRow({ rule, precedingSteps, onChange, onRemove }: RuleRowProps) {
    const sourceStep = precedingSteps.find((s) => s.id === rule.stepId);
    const sourceOptions = sourceStep ? getOptionsForStep(sourceStep) : null;
    const showValueInput = !VALUELESS_OPERATORS.has(rule.operator);

    return (
        <div className="bg-dashboard-surface-dark p-3 rounded-lg border border-dashboard-border-dark space-y-2 group hover:border-dashboard-primary/40 transition-colors">
            <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                    {/* Step picker */}
                    <div className="relative">
                        <select
                            value={rule.stepId}
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

                    {/* Operator + value row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={rule.operator}
                                onChange={(e) =>
                                    onChange({ operator: e.target.value as VisibilityOperator })
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
