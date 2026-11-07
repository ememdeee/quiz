"use client";

import React from "react";
import type { Step, MultipleChoiceContent } from "@/types/quiz";
import { StepHeader } from "@/components/quiz/steps/StepHeader";
import { StepImage } from "@/components/quiz/steps/StepImage";

interface MultipleChoiceStepProps {
    step: Step;
    selectedValue?: string;
    onAnswer: (value: string) => void;
}

export function MultipleChoiceStep({ step, selectedValue, onAnswer }: MultipleChoiceStepProps) {
    const content = step.content as MultipleChoiceContent;
    const imagePosition = content.imagePosition || 'above';

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
                        const isSelected = selectedValue === option.value;
                        return (
                            <label key={option.value} className="block group cursor-pointer relative">
                                <input
                                    type="radio"
                                    name="goal"
                                    className="option-radio sr-only"
                                    checked={isSelected}
                                    onChange={() => onAnswer(option.value)}
                                />
                                <div className={`flex items-center p-5 rounded-[20px] bg-white dark:bg-[#152e2a] border-2 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-all duration-300 ease-out group-hover:border-quiz-border dark:group-hover:border-slate-700 ${isSelected ? 'border-quiz-primary bg-quiz-primary/5 shadow-[0_0_0_1px] shadow-quiz-primary' : 'border-transparent'}`}>
                                    {option.icon && (
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-5 transition-colors duration-300 shrink-0 ${isSelected ? 'bg-quiz-primary text-quiz-primary-fg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                                            <span className="material-symbols-outlined text-[24px]">
                                                {option.icon}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-quiz-fg dark:text-white leading-tight">
                                            {option.label}
                                        </h3>
                                        {option.subLabel && (
                                            <p className="text-sm text-quiz-muted-fg dark:text-slate-400 mt-0.5 leading-snug font-medium">
                                                {option.subLabel}
                                            </p>
                                        )}
                                    </div>
                                    <div className={`h-6 w-6 shrink-0 rounded-full bg-quiz-primary text-quiz-primary-fg flex items-center justify-center transition-all duration-300 ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
                                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
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
