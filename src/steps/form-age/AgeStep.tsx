"use client";

import React, { useState } from "react";
import type { Step, FormAgeContent } from "@/types/quiz";
import { BigNumberInput } from "@/components/quiz/steps/BigNumberInput";
import { RangeHint } from "@/components/quiz/steps/RangeHint";
import { AGE_MIN_DEFAULT, AGE_MAX_DEFAULT } from "./constants";

interface AgeStepProps {
    step: Step;
    selectedValue?: unknown;
    onAnswer: (value: unknown) => void;
}

export function AgeStep({ step, selectedValue, onAnswer }: AgeStepProps) {
    const content = step.content as FormAgeContent;
    const min = content.validation?.min ?? AGE_MIN_DEFAULT;
    const max = content.validation?.max ?? AGE_MAX_DEFAULT;

    const parseInitial = (val: unknown): string => {
        if (typeof val === 'number' && val > 0) return String(val);
        if (typeof val === 'string' && val && val !== '0') return val;
        return '';
    };

    const [ageStr, setAgeStr] = useState<string>(parseInitial(selectedValue));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^0-9]/g, '');
        // Remove leading zeros
        const cleaned = raw.replace(/^0+/, '');
        const val = parseInt(cleaned);
        if (!isNaN(val)) {
            const clamped = Math.min(max, val);
            setAgeStr(String(clamped));
            onAnswer(clamped);
        } else {
            setAgeStr('');
            onAnswer(0);
        }
    };

    const handleBlur = () => {
        const val = parseInt(ageStr);
        if (isNaN(val) || val < min) {
            // Don't force a value on blur if empty — let validation handle it
        }
    };

    const adjustAge = (amount: number) => {
        const current = parseInt(ageStr) || 0;
        const newAge = Math.max(min, Math.min(max, current + amount));
        setAgeStr(String(newAge));
        onAnswer(newAge);
    };

    const numericAge = parseInt(ageStr) || 0;
    const hasValue = ageStr !== '';
    const isValid = hasValue && numericAge >= min && numericAge <= max;

    return (
        <div className="flex-1 w-full flex flex-col justify-start">
            <div className="px-6 pt-8 pb-4 w-full max-w-md mx-auto flex flex-col items-center gap-6">
                {/* Question */}
                <h1 className="text-2xl md:text-3xl font-bold text-center text-quiz-fg dark:text-white tracking-tight">
                    {content.question || 'How old are you?'}
                </h1>

                {content.subtitle && (
                    <p className="text-quiz-muted-fg dark:text-slate-400 text-sm text-center">
                        {content.subtitle}
                    </p>
                )}

                {/* Age Input with +/- buttons */}
                <div className="flex justify-center items-center mt-4">
                    <div className="relative w-full max-w-[180px]">
                        <button
                            onClick={() => adjustAge(-1)}
                            aria-label="Decrease age"
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4 text-quiz-primary opacity-60 hover:opacity-100 transition-opacity disabled:opacity-20 active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-4xl">remove</span>
                        </button>

                        <BigNumberInput
                            value={ageStr}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            inputMode="numeric"
                            invalid={!(isValid || !hasValue)}
                            boxClassName="w-full h-32 text-6xl rounded-3xl"
                            unitLabel="years"
                            unitLabelBottom="bottom-3"
                            wrapperClassName="relative"
                        />

                        <button
                            onClick={() => adjustAge(1)}
                            aria-label="Increase age"
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-4 text-quiz-primary opacity-60 hover:opacity-100 transition-opacity active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-4xl">add</span>
                        </button>
                    </div>
                </div>

                {/* Range hint / Error message */}
                <RangeHint show={hasValue && !isValid}>
                    Please enter an age between {min} and {max}
                </RangeHint>
            </div>
        </div>
    );
}
