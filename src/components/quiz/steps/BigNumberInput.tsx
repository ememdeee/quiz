"use client";

import React from "react";

// The big rounded number input used by the weight / height / age steps.
// Class strings are verbatim from the original inline JSX — only the size
// box, unit-label offset, and wrapper vary per call site.

interface BigNumberInputProps {
    id?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    inputMode: 'decimal' | 'numeric';
    /** Drives the red border. Sites pass their exact original condition. */
    invalid: boolean;
    /** Size/shape classes, e.g. "w-40 h-40 text-7xl rounded-[2rem]". */
    boxClassName: string;
    /** Small uppercase label inside the box ("kg", "cm", "years", ...). */
    unitLabel: string;
    /** Vertical offset of the unit label: "bottom-3" | "bottom-4" | "bottom-5". */
    unitLabelBottom: string;
    /** The original sites wrap in "relative group" (age uses "relative"). */
    wrapperClassName?: string;
}

export function BigNumberInput({
    id,
    value,
    onChange,
    onBlur,
    inputMode,
    invalid,
    boxClassName,
    unitLabel,
    unitLabelBottom,
    wrapperClassName = "relative group",
}: BigNumberInputProps) {
    return (
        <div className={wrapperClassName}>
            <input
                id={id}
                type="number"
                inputMode={inputMode}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder="0"
                className={`${boxClassName} text-center font-bold bg-white dark:bg-[#162e2a] border-2 shadow-sm outline-none transition-all placeholder-slate-200 dark:placeholder-slate-700 text-slate-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${invalid ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-quiz-primary dark:focus:border-quiz-primary'}`}
            />
            <span className={`absolute ${unitLabelBottom} left-0 right-0 text-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider pointer-events-none`}>
                {unitLabel}
            </span>
        </div>
    );
}
