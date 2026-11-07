"use client";

import React, { useState, useEffect } from "react";
import type { Step, FormWeightContent } from "@/types/quiz";
import { LBS_PER_KG } from "@/lib/units";
import { BigNumberInput } from "@/components/quiz/steps/BigNumberInput";
import { RangeHint } from "@/components/quiz/steps/RangeHint";
import { WEIGHT_MIN, WEIGHT_MAX } from "./constants";

/** Digits + at most one dot + at most one decimal digit (was inlined twice). */
function sanitizeDecimal(raw: string): string {
    let v = raw.replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length > 2) v = parts[0] + '.' + parts.slice(1).join('');
    if (parts.length > 1 && parts[1].length > 1) v = parts[0] + '.' + parts[1].charAt(0);
    return v;
}

interface WeightStepProps {
    step: Step;
    selectedValue?: unknown;
    onAnswer: (value: unknown) => void;
    /** Phase controlled by parent: 'current' = first question, 'target' = second question */
    phase?: 'current' | 'target';
    /** Called when user wants to go back to Phase 1 from Phase 2 */
    onPhaseBack?: () => void;
}

export function WeightStep({ step, selectedValue, onAnswer, phase = 'current', onPhaseBack }: WeightStepProps) {
    const content = step.content as FormWeightContent;
    const min = WEIGHT_MIN;
    const max = WEIGHT_MAX;

    const parsed = parseExistingValue(selectedValue, 'kg');
    const [unit, setUnit] = useState<'kg' | 'lbs'>(parsed.unit);
    const [value, setValue] = useState<string>(parsed.value);
    const [targetValue, setTargetValue] = useState<string>(parsed.targetWeight);
    const [showInsight, setShowInsight] = useState(parsed.targetWeight !== '');

    function parseExistingValue(val: unknown, fallbackUnit: 'kg' | 'lbs') {
        if (typeof val === 'object' && val !== null && 'value' in val) {
            const obj = val as { value: number; unit: string; targetWeight?: number };
            return {
                value: String(obj.value || ''),
                unit: obj.unit as 'kg' | 'lbs',
                targetWeight: obj.targetWeight ? String(obj.targetWeight) : '',
            };
        }
        if (typeof val === 'number') return { value: String(val), unit: fallbackUnit, targetWeight: '' };
        if (typeof val === 'string' && val) return { value: val, unit: fallbackUnit, targetWeight: '' };
        return { value: '', unit: fallbackUnit, targetWeight: '' };
    }

    // When parent transitions to Phase 1, clear target data
    useEffect(() => {
        if (phase === 'current') {
            setTargetValue('');
            setShowInsight(false);
            const numVal = parseFloat(value);
            if (!isNaN(numVal) && numVal > 0) {
                onAnswer({ value: numVal, unit });
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase]);

    // Focus target input when transitioning to phase 2
    useEffect(() => {
        if (phase === 'target') {
            const timeout = setTimeout(() => {
                const input = document.getElementById('target-weight-input');
                if (input) input.focus();
            }, 400);
            return () => clearTimeout(timeout);
        }
    }, [phase]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = sanitizeDecimal(e.target.value);
        setValue(newValue);
        const numVal = parseFloat(newValue);
        if (!isNaN(numVal)) {
            const existingTarget = parseFloat(targetValue);
            if (!isNaN(existingTarget)) {
                onAnswer({ value: numVal, unit, targetWeight: existingTarget });
            } else {
                onAnswer({ value: numVal, unit });
            }
        } else if (newValue === '') {
            onAnswer('');
        }
    };

    const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = sanitizeDecimal(e.target.value);
        setTargetValue(newValue);
        const numVal = parseFloat(newValue);
        const currentWeight = parseFloat(value);
        if (!isNaN(numVal) && !isNaN(currentWeight)) {
            onAnswer({ value: currentWeight, unit, targetWeight: numVal });
            setShowInsight(numVal > 0 && numVal < currentWeight);
        }
    };

    const toggleUnit = () => {
        const newUnit = unit === 'kg' ? 'lbs' : 'kg';
        const convert = (v: string) => {
            if (!v || v === '0' || v === '0.') return v;
            const num = parseFloat(v);
            if (isNaN(num)) return v;
            let converted = newUnit === 'lbs' ? (num * LBS_PER_KG).toFixed(1) : (num / LBS_PER_KG).toFixed(1);
            if (converted.endsWith('.0')) converted = converted.slice(0, -2);
            return converted;
        };

        const convertedValue = convert(value);
        const convertedTarget = convert(targetValue);
        setUnit(newUnit);
        setValue(convertedValue);
        setTargetValue(convertedTarget);

        const numVal = parseFloat(convertedValue);
        const targetNum = parseFloat(convertedTarget);
        if (!isNaN(numVal)) {
            if (!isNaN(targetNum)) {
                onAnswer({ value: numVal, unit: newUnit, targetWeight: targetNum });
            } else {
                onAnswer({ value: numVal, unit: newUnit });
            }
        }
    };

    const numericValue = parseFloat(value) || 0;
    const numericTarget = parseFloat(targetValue) || 0;
    const isCurrentValid = value !== '' && value !== '0' && value !== '0.' && numericValue >= min && numericValue <= max;
    const displayMin = unit === 'lbs' ? Math.round(min * LBS_PER_KG) : min;
    const displayMax = unit === 'lbs' ? Math.round(max * LBS_PER_KG) : max;

    const weightLossPercent = numericValue > 0 && numericTarget > 0
        ? Math.round(((numericValue - numericTarget) / numericValue) * 100)
        : 0;

    const isTargetValid = targetValue !== '' && numericTarget > 0 && numericTarget < numericValue && numericTarget >= min;
    const targetErrorMessage = numericTarget > 0 && numericTarget < min
        ? `Target weight must be at least ${displayMin} ${unit}`
        : numericTarget >= numericValue && numericValue > 0
            ? "Target weight must be below your current weight"
            : "Please enter a valid target weight";
    const targetWeightQuestion = content.targetWeightQuestion || "And how much would you like to weigh?";

    // Theme-derived colors for the dark insight card (see plan/project.md § Quiz Theming)
    const insightAccent = 'color-mix(in srgb, var(--quiz-primary) 55%, white)';
    const insightCardBg = 'linear-gradient(to bottom right, color-mix(in srgb, var(--quiz-primary) 10%, var(--quiz-fg)), color-mix(in srgb, var(--quiz-primary) 22%, var(--quiz-fg)))';

    return (
        <div className="flex-1 w-full flex flex-col justify-start">
            <div className="px-6 pt-8 pb-4 w-full max-w-md mx-auto flex flex-col items-center gap-6">
                {/* Phase 1: Current Weight */}
                <div className={`w-full flex flex-col items-center gap-6 transition-all duration-500 ease-out ${phase === 'target' ? 'opacity-0 max-h-0 overflow-hidden pointer-events-none' : 'opacity-100 max-h-[600px]'}`}>
                    <h1 className="text-2xl md:text-3xl font-bold text-center text-quiz-fg dark:text-white leading-tight">
                        {content.question ? (
                            <span dangerouslySetInnerHTML={{
                                __html: content.question.replace(
                                    'weight',
                                    '<span style="color: var(--quiz-primary)">weight</span>'
                                )
                            }} />
                        ) : (
                            <>What is your <br className="hidden md:block" /> current <span style={{ color: 'var(--quiz-primary)' }}>weight</span>?</>
                        )}
                    </h1>

                    <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 w-32 shadow-inner mx-auto">
                        <button onClick={() => unit !== 'kg' && toggleUnit()} className={`flex-1 text-center py-1.5 px-3 rounded-full text-sm font-semibold transition-all duration-200 z-10 cursor-pointer ${unit === 'kg' ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>kg</button>
                        <button onClick={() => unit !== 'lbs' && toggleUnit()} className={`flex-1 text-center py-1.5 px-3 rounded-full text-sm font-semibold transition-all duration-200 z-10 cursor-pointer ${unit === 'lbs' ? 'text-slate-900 dark:text-white bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>lbs</button>
                    </div>

                    <BigNumberInput
                        value={value}
                        onChange={handleChange}
                        inputMode="decimal"
                        invalid={!(isCurrentValid || !value)}
                        boxClassName="w-40 h-40 text-7xl rounded-[2rem]"
                        unitLabel={unit}
                        unitLabelBottom="bottom-5"
                    />

                    <RangeHint show={!!(value && !isCurrentValid && value !== '0' && value !== '0.' && value !== '')}>
                        Please enter a value between {displayMin} and {displayMax}
                    </RangeHint>
                </div>

                {/* Phase 2: Target Weight */}
                <div className={`w-full flex flex-col items-center gap-6 transition-all duration-500 ease-out ${phase === 'target' ? 'opacity-100 max-h-[800px]' : 'opacity-0 max-h-0 overflow-hidden pointer-events-none'}`}>
                    <h1 className="text-2xl md:text-3xl font-bold text-center text-quiz-fg dark:text-white leading-tight">
                        <span dangerouslySetInnerHTML={{
                            __html: targetWeightQuestion.replace(
                                'weigh',
                                '<span style="color: var(--quiz-primary)">weigh</span>'
                            )
                        }} />
                    </h1>

                    {/* Clickable current weight badge with edit icon */}
                    <button
                        onClick={onPhaseBack}
                        className="flex items-center gap-2 bg-white dark:bg-[#162e2a] border border-slate-100 dark:border-slate-800 rounded-full px-4 py-2 shadow-sm hover:border-quiz-primary/50 transition-colors cursor-pointer group"
                    >
                        <span className="material-symbols-outlined text-[16px] text-quiz-muted-fg">monitor_weight</span>
                        <span className="text-sm text-quiz-muted-fg dark:text-slate-400">Current:</span>
                        <span className="text-sm font-bold text-quiz-fg dark:text-white">{value} {unit}</span>
                        <span className="material-symbols-outlined text-[14px] text-quiz-muted-fg group-hover:text-quiz-primary transition-colors">edit</span>
                    </button>

                    <BigNumberInput
                        id="target-weight-input"
                        value={targetValue}
                        onChange={handleTargetChange}
                        inputMode="decimal"
                        invalid={!(isTargetValid || !targetValue)}
                        boxClassName="w-40 h-40 text-7xl rounded-[2rem]"
                        unitLabel={unit}
                        unitLabelBottom="bottom-5"
                    />

                    <RangeHint show={!!(targetValue && !isTargetValid)}>
                        {targetErrorMessage}
                    </RangeHint>

                    {/* Insight Card */}
                    <div className={`w-full transition-all duration-500 ease-out ${showInsight && isTargetValid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        <div className="rounded-2xl p-5 border border-white/10 shadow-lg" style={{ background: insightCardBg }}>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]" style={{ color: insightAccent }}>target</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: insightAccent }}>Your Goal</span>
                            </div>
                            <p className="text-white text-sm leading-relaxed mb-3">
                                Your goal is to lose <span className="font-extrabold text-base" style={{ color: insightAccent }}>{weightLossPercent}%</span> of your current weight — excellent!
                            </p>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                Losing 10% or more of your body weight can significantly improve your health. Studies show it reduces the risk of heart attacks, lowers blood sugar levels, and decreases inflammation in your blood vessels.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
