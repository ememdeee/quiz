"use client";

import React from "react";
import type { Step, CheckboxContent } from "@/types/quiz";
import { StepHeader } from "@/components/quiz/steps/StepHeader";
import { StepImage } from "@/components/quiz/steps/StepImage";

interface CheckboxStepProps {
    step: Step;
    selectedValues?: string[];
    onAnswer: (values: string[]) => void;
}

export function CheckboxStep({ step, selectedValues = [], onAnswer }: CheckboxStepProps) {
    const content = step.content as CheckboxContent;
    const imagePosition = content.imagePosition || 'above';

    const toggleOption = (value: string) => {
        const newValues = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onAnswer(newValues);
    };

    return (
        <div className="flex-1 w-full flex flex-col justify-between">
            <div className="px-6 pt-8 pb-4">
                <StepHeader
                    content={content}
                    subtitleMargin="mb-6"
                    subtitleClassName="text-base"
                />

                {/* Image above options */}
                {imagePosition === 'above' && (
                    <StepImage src={content.image} imageFit={content.imageFit} />
                )}

                {/* Options Stack */}
                <div className="space-y-4 pb-4">
                    {content.options?.map((option) => {
                        const isSelected = selectedValues.includes(option.value);
                        return (
                            <label key={option.value} className="block group cursor-pointer relative">
                                <input
                                    type="checkbox"
                                    name="focus_area"
                                    className="peer sr-only"
                                    checked={isSelected}
                                    onChange={() => toggleOption(option.value)}
                                />
                                <div className={`flex items-center p-5 rounded-[20px] bg-white dark:bg-[#152e2a] border-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 ease-out group-hover:border-quiz-border dark:group-hover:border-slate-700 ${isSelected ? 'border-quiz-primary shadow-quiz-primary/15 bg-quiz-primary/5' : 'border-transparent'}`}>
                                    {option.icon && (
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-5 transition-colors duration-300 shrink-0 ${isSelected ? 'bg-quiz-primary/10 text-quiz-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                            <span className="material-symbols-outlined text-[24px]">
                                                {option.icon}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className={`font-bold text-lg leading-tight transition-colors ${isSelected ? 'text-quiz-primary dark:text-quiz-primary' : 'text-quiz-fg dark:text-white'}`}>
                                            {option.label}
                                        </h3>
                                        {option.subLabel && (
                                            <p className={`text-sm mt-0.5 leading-snug font-medium transition-colors ${isSelected ? 'text-quiz-primary/70' : 'text-quiz-muted-fg dark:text-slate-400'}`}>
                                                {option.subLabel}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-quiz-primary border-quiz-primary scale-110' : 'border-slate-300 dark:border-slate-600'}`}>
                                        <span className={`material-symbols-outlined text-[16px] font-bold text-quiz-primary-fg transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>check</span>
                                    </div>
                                </div>
                            </label>
                        );
                    })}
                </div>

                {/* Image below options */}
                {imagePosition === 'below' && (
                    <StepImage src={content.image} imageFit={content.imageFit} />
                )}
            </div>
        </div>
    );
}
