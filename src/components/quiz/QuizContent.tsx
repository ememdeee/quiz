"use client";

import React from "react";
import type { Step, QuizConfig, QuizTheme } from "@/types/quiz";
import { DEFAULT_QUIZ_THEME } from "@/types/quiz";
import { getStepDef } from "@/steps/registry";
import { GenericStep } from "@/components/quiz/steps/GenericStep";

interface QuizContentProps {
    quiz: QuizConfig;
    currentStep: Step;
    currentStepIndex: number;
    totalSteps: number;
    progress: number;
    // Interactive mode props
    selectedValue?: unknown;
    selectedValues?: string[];
    onAnswer?: (value: unknown) => void;
    onContinue?: () => void;
    onBack?: () => void;
    canGoBack?: boolean;
    // Validation
    isFormValid?: boolean;
    // Weight step phase control
    weightPhase?: 'current' | 'target';
    onWeightPhaseBack?: () => void;
    // Preview mode disables interaction
    isPreview?: boolean;
}

/**
 * Shared QuizContent component used by both:
 * - LivePreview (in editor)
 * - Quiz page (public facing)
 * 
 * This ensures 100% visual consistency between preview and real quiz.
 */
export function QuizContent({
    quiz,
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    selectedValue,
    selectedValues = [],
    onAnswer = () => { },
    onContinue,
    onBack,
    canGoBack = false,
    isFormValid = true,
    weightPhase = 'current',
    onWeightPhaseBack,
    isPreview = false,
}: QuizContentProps) {
    // ── Theme ──
    const theme: QuizTheme = (quiz.meta.theme && typeof quiz.meta.theme === 'object')
        ? quiz.meta.theme
        : DEFAULT_QUIZ_THEME;

    const themeVars = {
        '--quiz-primary': theme.primary,
        '--quiz-primary-fg': theme.primaryForeground,
        '--quiz-bg': theme.background,
        '--quiz-fg': theme.foreground,
        '--quiz-muted-fg': theme.mutedForeground,
        '--quiz-border': theme.border,
    } as React.CSSProperties;

    // ── Behavioral flags from registry ──
    const def = getStepDef(currentStep.type);
    const showNavigation = def?.showNavigation !== false;
    const showCTA = def?.showCTA !== false;
    const requiresValidation = def?.requiresValidation ?? false;
    const isContinueDisabled = requiresValidation && !isFormValid;

    // ── Render step component from registry ──
    function renderStep() {
        if (!def) return <GenericStep step={currentStep} />;

        const StepComponent = def.component;
        return (
            <StepComponent
                step={currentStep}
                selectedValue={selectedValue}
                selectedValues={selectedValues}
                onAnswer={onAnswer}
                phase={weightPhase}
                onPhaseBack={onWeightPhaseBack}
                isPreview={isPreview}
                quizId={quiz.quizId}
                totalSteps={totalSteps}
            />
        );
    }

    return (
        <div style={themeVars} className={`flex flex-col h-full bg-quiz-bg dark:bg-[#10221f] text-quiz-fg dark:text-slate-100 font-display ${isPreview ? '' : 'min-h-dvh'}`}>
            {/* Top Navigation / Progress Area - sticky at top */}
            {showNavigation && (
                <header className="sticky top-0 z-20 bg-quiz-bg/95 dark:bg-[#10221f]/95 backdrop-blur-sm px-6 pt-3 pb-2 w-full">
                    <div className="flex items-center gap-3 max-w-md mx-auto h-8">
                        {/* Back Button — only rendered when visible, so progress bar fills full width otherwise */}
                        {currentStep.navigation?.showBack !== false && canGoBack && (
                            <button
                                onClick={isPreview ? undefined : onBack}
                                className="w-8 h-8 shrink-0 rounded-full hover:bg-quiz-border dark:hover:bg-slate-800 transition-colors text-quiz-muted-fg dark:text-slate-400 cursor-pointer flex items-center justify-center"
                                aria-label="Go back"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </button>
                        )}

                        {/* Progress Bar - fills available space */}
                        {quiz.settings.showProgressBar && (
                            <div className="flex-1 h-1 bg-quiz-border dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-quiz-primary rounded-full shadow-[0_0_10px_var(--quiz-primary)] shadow-quiz-primary/50 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}

                        {/* Step Count Text */}
                        {quiz.settings.showProgressBar && (
                            <span className="text-xs font-medium tracking-wide text-quiz-muted-fg dark:text-slate-500 whitespace-nowrap shrink-0">
                                {currentStepIndex + 1}/{totalSteps}
                            </span>
                        )}
                    </div>
                </header>
            )}

            {/* Step Content Area — fade transition on step change */}
            <main
                key={currentStep.id}
                className={`flex-1 w-full max-w-md mx-auto flex flex-col animate-[stepFadeIn_0.3s_ease-out] ${currentStep.type === 'quiz-landing' ? 'justify-center p-0 max-w-none' : 'px-0 pb-2'}`}
            >
                {renderStep()}
            </main>

            {/* Sticky Bottom CTA - only show for steps that need manual continue */}
            {showCTA && (
                <div className="sticky bottom-0 w-full max-w-md mx-auto z-10 bg-quiz-bg dark:bg-[#10221f]">
                    <div className="px-6 pt-4 pb-5">
                        <button
                            onClick={isPreview || isContinueDisabled ? undefined : onContinue}
                            disabled={isContinueDisabled}
                            className={`w-full h-14 font-bold text-lg rounded-full shadow-quiz-primary/25 transition-all flex items-center justify-center group ${isContinueDisabled
                                ? 'bg-quiz-border dark:bg-slate-700 text-quiz-muted-fg dark:text-slate-500 cursor-not-allowed shadow-none'
                                : 'bg-quiz-primary text-quiz-primary-fg hover:brightness-90 hover:scale-[1.01] active:scale-[0.98] cursor-pointer'
                                }`}
                        >
                            Continue
                            <span className="material-symbols-outlined ml-2 transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
