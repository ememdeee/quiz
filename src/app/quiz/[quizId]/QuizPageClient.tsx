"use client";

import React, { useEffect } from "react";
import { useQuizFlow, type ServerQuizData } from "@/hooks/useQuizFlow";
import { QuizContent } from "@/components/quiz/QuizContent";
import { MessageLoading } from "@/components/ui/message-loading";
import type { QuizTheme } from "@/types/quiz";
import { DEFAULT_QUIZ_THEME } from "@/types/quiz";

export function QuizPageClient({ serverData }: { serverData: ServerQuizData }) {
    // Warm the lazy step chunks so users never see the loading fallbacks.
    // The markdown body is reachable 2 clicks after hydration (fastest
    // measured path ~1.1s), so it preloads immediately; the chart
    // (weight-summary, step 27) has minutes of slack and waits for idle.
    useEffect(() => {
        import("@/steps/info-page/InfoStep").then((m) => m.preloadInfoMarkdown());
        const warmChart = () => {
            import("@/steps/weight-summary/WeightSummaryStep").then((m) => m.preloadWeightChart());
        };
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(warmChart, { timeout: 3000 });
            return () => window.cancelIdleCallback(id);
        }
        const t = setTimeout(warmChart, 1500);
        return () => clearTimeout(t);
    }, []);

    const {
        quiz,
        isLoading,
        error,
        currentStep,
        currentStepIndex,
        progress,
        answer,
        isFormValid,
        weightPhase,
        visibleTotal,
        currentVisiblePosition,
        handleAnswer,
        handleContinue,
        handleBack,
        handleWeightPhaseBack,
    } = useQuizFlow(serverData);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-quiz-bg dark:bg-[#10221f] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <MessageLoading size={48} className="text-quiz-primary" />
                    <p className="text-quiz-muted-fg dark:text-slate-500 text-sm font-medium">Loading quiz...</p>
                </div>
            </div>
        );
    }

    // Error state (includes draft protection)
    if (error || !quiz || !currentStep) {
        const isDraftError = error === 'This quiz is not published yet.';

        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center">
                <div className="text-center max-w-md px-6">
                    <span className="material-symbols-outlined text-6xl text-red-400 mb-4 block">
                        {isDraftError ? 'lock' : 'error'}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {isDraftError ? 'Quiz Not Available' : 'Quiz Not Found'}
                    </h2>
                    <p className="text-slate-500 mb-6">{error || 'The quiz you are looking for does not exist.'}</p>
                    <div className="flex flex-col gap-3">
                        <a
                            href="/"
                            className="inline-block px-6 py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition-colors"
                        >
                            Go Home
                        </a>
                        {isDraftError && (
                            <a
                                href="/login"
                                className="inline-block px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-full hover:bg-slate-300 transition-colors"
                            >
                                Admin Login
                            </a>
                        )}
                    </div>
                </div>
            </div>
        );
    }

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

    return (
        <div style={themeVars} className="bg-quiz-bg dark:bg-[#10221f] min-h-dvh">
            <div className="mx-auto min-h-dvh flex flex-col">
                <QuizContent
                    quiz={quiz}
                    currentStep={currentStep}
                    currentStepIndex={Math.max(0, currentVisiblePosition - 1)}
                    totalSteps={visibleTotal}
                    progress={progress}
                    selectedValue={answer}
                    selectedValues={Array.isArray(answer) ? answer as string[] : []}
                    onAnswer={handleAnswer}
                    onContinue={handleContinue}
                    onBack={handleBack}
                    canGoBack={currentStepIndex > 0}
                    isFormValid={isFormValid}
                    weightPhase={weightPhase}
                    onWeightPhaseBack={handleWeightPhaseBack}
                    isPreview={false}
                />
            </div>
        </div>
    );
}
