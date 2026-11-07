"use client";

import React from "react";
import type { Step, ImageOptionsContent } from "@/types/quiz";
import { StepHeader } from "@/components/quiz/steps/StepHeader";
import { MascotSVG } from "./MascotSVG";
import { getMascotBasePath } from "./mascotRegistry";

interface ImageOptionsStepProps {
    step: Step;
    selectedValue?: string;
    onAnswer: (value: string) => void;
}

export function ImageOptionsStep({ step, selectedValue, onAnswer }: ImageOptionsStepProps) {
    const content = step.content as ImageOptionsContent;

    const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuB0YY8hPET2B5Lk7zrpdGV10N-XQBt_-8QilTOj4CBhw0gzE2KTKQDzajfaId77aM9ZqPeNXxJGi8YJ9J4W76U9S3KuvrhXmFVzUhO6aKuE6bXhS1TRbtzRcflSMGM3xyPvYxfKMa4yYV6t20PPGcXl6VhLr6bRL_FlXsO-6gJyuYclD_3ywLluYE5OCEs-dAjVpJtHcf2QT-gcgFHpa-orLfgJC-GzI2DfqF_ls61196dmoSYrIaaE04DqYblN33sabbhJTSWVFZqG";

    // Dynamic sizing based on option count
    const optionCount = content.optionsImg?.length || 0;

    const getImageAspect = () => {
        if (optionCount <= 4) return 'aspect-square';
        if (optionCount <= 6) return 'aspect-[4/3]';
        if (optionCount <= 8) return 'aspect-[3/2]';
        return 'aspect-[2/1]';
    };

    const getGridGap = () => {
        if (optionCount <= 4) return 'gap-3';
        if (optionCount <= 6) return 'gap-2.5';
        return 'gap-2';
    };

    const getPadding = () => {
        if (optionCount <= 4) return 'p-2.5';
        if (optionCount <= 6) return 'p-2';
        return 'p-1.5';
    };

    const getLabelSize = () => {
        if (optionCount <= 4) return 'text-sm';
        if (optionCount <= 6) return 'text-xs';
        return 'text-[11px]';
    };

    return (
        <div className="flex-1 flex flex-col px-4 pt-4 pb-2 overflow-y-auto no-scrollbar">
            {/* Header Text */}
            <div className="mb-4">
                <StepHeader
                    content={content}
                    subtitleClassName="text-sm"
                    subtitleMargin="mb-0"
                />
            </div>

            {/* Selection Grid */}
            <div className={`grid grid-cols-2 ${getGridGap()} w-full max-w-md mx-auto`}>
                {content.optionsImg?.map((option) => {
                    const isSelected = selectedValue === option.value;
                    const imageUrl = option.image || fallbackImage;

                    return (
                        <label key={option.value} className="group relative cursor-pointer block h-full">
                            <input
                                type="radio"
                                name="image_option"
                                className="peer sr-only"
                                checked={isSelected}
                                onChange={() => onAnswer(option.value)}
                            />
                            <div className={`flex flex-col h-full items-center ${getPadding()} bg-white dark:bg-[#1a3632] rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border-2 transition-all duration-300 hover:scale-[1.02] ${isSelected ? 'border-quiz-primary shadow-quiz-primary/30 bg-quiz-primary/5' : 'border-transparent'}`}>
                                <div className={`w-full ${getImageAspect()} mb-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden relative shrink-0`}>
                                    {option.mascot ? (
                                        <MascotSVG variant={option.mascot} basePath={getMascotBasePath(option.mascot)} className="absolute inset-0" />
                                    ) : (
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{ backgroundImage: `url('${imageUrl}')` }}
                                        ></div>
                                    )}
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <span className={`${getLabelSize()} font-bold text-center leading-tight transition-colors ${isSelected ? 'text-quiz-primary dark:text-quiz-primary' : 'text-slate-800 dark:text-slate-100'}`}>
                                        {option.label}
                                    </span>
                                </div>

                                {/* Checkmark Badge */}
                                <div className={`absolute top-2 right-2 bg-quiz-primary text-white rounded-full p-0.5 transition-all duration-300 shadow-sm flex items-center justify-center ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                                    <span className="material-symbols-outlined text-sm font-bold block">check</span>
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}
