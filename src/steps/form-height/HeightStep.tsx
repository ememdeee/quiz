"use client";

import React, { useState, useEffect } from "react";
import type { Step } from "@/types/quiz";
import { CM_PER_INCH, cmToFtIn, ftInToCm } from "@/lib/units";
import { BigNumberInput } from "@/components/quiz/steps/BigNumberInput";
import { RangeHint } from "@/components/quiz/steps/RangeHint";
import { HEIGHT_MIN_CM, HEIGHT_MAX_CM } from "./constants";

interface HeightStepProps {
    step: Step;
    selectedValue?: unknown;
    onAnswer: (value: unknown) => void;
}

export function HeightStep({ selectedValue, onAnswer }: HeightStepProps) {
    const min = HEIGHT_MIN_CM;
    const max = HEIGHT_MAX_CM;

    const parsed = parseExistingValue(selectedValue, 'cm');
    const [unit, setUnit] = useState<'cm' | 'ft'>(parsed.unit);
    const [value, setValue] = useState<string>(parsed.value);
    const [inches, setInches] = useState<string>(parsed.inches);

    function parseExistingValue(val: unknown, fallbackUnit: 'cm' | 'ft') {
        let parsedVal = { value: '', unit: fallbackUnit, inches: '' };

        if (typeof val === 'object' && val !== null) {
            const obj = val as any;
            if (obj.height !== undefined || obj.value !== undefined) {
                const hObj = obj.height || obj;
                parsedVal.unit = hObj.unit === 'ft' ? 'ft' : 'cm';
                parsedVal.value = String(hObj.value || '');
                if (parsedVal.unit === 'ft') {
                    parsedVal.inches = String(hObj.inches ?? '');
                }
            }
        } else if (typeof val === 'number') {
            parsedVal.value = String(val);
        } else if (typeof val === 'string' && val) {
            parsedVal.value = val;
        }
        return parsedVal;
    }

    // Auto-report changes to parent
    useEffect(() => {
        if (!value) return;

        const answerObj: any = {};
        if (unit === 'ft') {
            answerObj.unit = 'ft';
            answerObj.value = parseInt(value) || 0;
            answerObj.inches = parseInt(inches || '0') || 0;
        } else {
            answerObj.unit = 'cm';
            answerObj.value = parseInt(value) || 0;
        }

        onAnswer(answerObj);
    }, [value, inches, unit]);

    const handleCmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = e.target.value.replace(/[^0-9]/g, '');
        setValue(sanitized);
    };

    const handleFeetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = e.target.value.replace(/[^0-9]/g, '');
        setValue(sanitized);
    };

    const handleInchesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = e.target.value.replace(/[^0-9]/g, '');
        if (parseInt(sanitized) > 11) return;
        setInches(sanitized);
    };

    const handleUnitSwitch = (newUnit: 'cm' | 'ft') => {
        if (newUnit === unit) return;

        if (newUnit === 'ft' && value) {
            const cm = parseInt(value);
            if (!isNaN(cm)) {
                const { feet, inches: remainingInches } = cmToFtIn(cm);
                setValue(String(feet));
                setInches(String(remainingInches));
                setUnit('ft');
                return;
            }
        }

        if (newUnit === 'cm' && value) {
            const feet = parseInt(value);
            const inch = parseInt(inches || '0');
            if (!isNaN(feet)) {
                const totalCm = ftInToCm(feet, inch);
                setValue(String(totalCm));
                setInches('');
                setUnit('cm');
                return;
            }
        }

        setUnit(newUnit);
        setValue('');
        setInches('');
    };

    // Validation
    const getCmValue = () => {
        if (unit === 'cm') return parseInt(value) || 0;
        const ft = parseInt(value) || 0;
        const inch = parseInt(inches || '0') || 0;
        return ftInToCm(ft, inch);
    };

    const cmValue = getCmValue();
    const isValid = value !== '' && cmValue >= min && cmValue <= max;

    return (
        <div className="flex-1 w-full flex flex-col justify-start">
            <div className="px-6 pt-8 pb-4 w-full max-w-md mx-auto flex flex-col items-center gap-6">

                {/* Height Section */}
                <h1 className="text-2xl md:text-3xl font-bold text-center text-quiz-fg dark:text-white tracking-tight">
                    How tall are you?
                </h1>

                {/* Unit Toggle */}
                <div className="flex justify-center">
                    <div className="bg-black/5 dark:bg-white/5 p-1 rounded-full flex relative w-48 h-10 shadow-inner">
                        <label className="flex-1 text-center relative z-10 cursor-pointer">
                            <input
                                type="radio"
                                name="height_unit"
                                value="ft"
                                className="peer sr-only"
                                checked={unit === 'ft'}
                                onChange={() => handleUnitSwitch('ft')}
                            />
                            <span className="flex items-center justify-center w-full h-full rounded-full text-sm font-semibold text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-[#162e2a] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm transition-all duration-200 select-none">
                                ft / in
                            </span>
                        </label>
                        <label className="flex-1 text-center relative z-10 cursor-pointer">
                            <input
                                type="radio"
                                name="height_unit"
                                value="cm"
                                className="peer sr-only"
                                checked={unit === 'cm'}
                                onChange={() => handleUnitSwitch('cm')}
                            />
                            <span className="flex items-center justify-center w-full h-full rounded-full text-sm font-semibold text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-[#162e2a] peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm transition-all duration-200 select-none">
                                cm
                            </span>
                        </label>
                    </div>
                </div>

                {/* Height Inputs */}
                <div className="flex justify-center items-center gap-4 mt-2">
                    {unit === 'cm' ? (
                        <BigNumberInput
                            value={value}
                            onChange={handleCmChange}
                            inputMode="numeric"
                            invalid={!(isValid || !value)}
                            boxClassName="w-32 h-32 text-6xl rounded-[2rem]"
                            unitLabel="cm"
                            unitLabelBottom="bottom-4"
                        />
                    ) : (
                        <>
                            <BigNumberInput
                                value={value}
                                onChange={handleFeetChange}
                                inputMode="numeric"
                                invalid={!(isValid || !value)}
                                boxClassName="w-28 h-28 text-5xl rounded-2xl"
                                unitLabel="ft"
                                unitLabelBottom="bottom-3"
                            />
                            <BigNumberInput
                                value={inches}
                                onChange={handleInchesChange}
                                inputMode="numeric"
                                invalid={false}
                                boxClassName="w-28 h-28 text-5xl rounded-2xl"
                                unitLabel="in"
                                unitLabelBottom="bottom-3"
                            />
                        </>
                    )}
                </div>

                {/* Range hint / Error message */}
                {unit === 'cm' ? (
                    <RangeHint show={!!(value && !isValid)}>
                        Please enter a value between {min} and {max} cm
                    </RangeHint>
                ) : (
                    <RangeHint show={!!(value && !isValid)}>
                        Please enter a value between {Math.floor(min / CM_PER_INCH / 12)}&apos;{Math.round((min / CM_PER_INCH) % 12)}&quot; and {Math.floor(max / CM_PER_INCH / 12)}&apos;{Math.round((max / CM_PER_INCH) % 12)}&quot;
                    </RangeHint>
                )}
            </div>
        </div>
    );
}
