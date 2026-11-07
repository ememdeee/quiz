"use client";

import React from "react";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { QuizContent } from "@/components/quiz/QuizContent";
import type { QuizTheme, Step } from "@/types/quiz";
import { DEFAULT_QUIZ_THEME } from "@/types/quiz";

export function LivePreview() {
    const { quiz, selectedStepId, selectedBranchId } = useQuizBuilderStore();
    const selectedStep = quiz?.steps.find((s) => s.id === selectedStepId);
    const selectedBranch = selectedBranchId
        ? selectedStep?.branches?.find((b) => b.id === selectedBranchId)
        : undefined;

    // Preview the branch's content/type as-if-matched when one is selected.
    const previewStep: Step | undefined = selectedBranch
        ? { ...selectedStep!, type: selectedBranch.type ?? selectedStep!.type, content: selectedBranch.content }
        : selectedStep;

    const currentIndex = selectedStep
        ? quiz?.steps.findIndex((s) => s.id === selectedStepId) ?? 0
        : 0;
    const totalSteps = quiz?.steps.length ?? 0;
    const progress = totalSteps > 0 ? ((currentIndex + 1) / totalSteps) * 100 : 0;
    const hasVisibilityRule = Boolean(
        selectedStep?.visibility && selectedStep.visibility.rules.length > 0,
    );

    const theme: QuizTheme = (quiz?.meta.theme && typeof quiz.meta.theme === 'object')
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
        <aside className="w-[420px] bg-dashboard-surface-dark border-l border-dashboard-border-dark flex flex-col shrink-0 relative overflow-hidden">
            {/* Background pattern for style */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage:
                        "radial-gradient(#282839 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                }}
            ></div>
            <div className="p-4 border-b border-dashboard-border-dark flex justify-between items-center z-10 bg-dashboard-surface-dark/95 backdrop-blur">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[18px]">
                        smartphone
                    </span>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Live Preview
                    </h3>
                </div>
                <span className="text-[10px] text-slate-500">
                    Step {totalSteps > 0 ? currentIndex + 1 : 0} of {totalSteps}
                </span>
            </div>
            {selectedBranch ? (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 z-10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">
                        alt_route
                    </span>
                    <p className="text-[10px] text-amber-300/90 leading-tight">
                        Previewing conditional branch — shown as-if its conditions matched.
                    </p>
                </div>
            ) : hasVisibilityRule && (
                <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 z-10 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px] text-amber-400">
                        filter_alt
                    </span>
                    <p className="text-[10px] text-amber-300/90 leading-tight">
                        This step has visibility rules. Preview always shows it; rules apply at runtime.
                    </p>
                </div>
            )}
            <div className="flex-1 flex items-center justify-center p-8 z-10 overflow-y-auto scrollbar-custom">
                {/* Phone Frame */}
                <div className="relative w-[320px] h-[720px] bg-black rounded-[40px] phone-mockup-shadow border-[8px] border-[#2d2d3a] overflow-hidden flex flex-col">
                    {/* Notch Area */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#2d2d3a] rounded-b-xl z-20"></div>
                    {/* Phone Screen Content - uses EXACT same layout as real quiz */}
                    <div style={themeVars} className="flex-1 bg-quiz-bg dark:bg-[#10221f] text-quiz-fg dark:text-slate-100 flex flex-col overflow-y-auto relative font-sans scrollbar-custom">
                        {/* Status Bar Mock */}
                        <div className="h-10 w-full flex justify-between items-center px-6 pt-2 shrink-0">
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200">9:41</span>
                            <div className="flex gap-1.5">
                                <span className="material-symbols-outlined text-[12px] text-slate-800 dark:text-slate-200">
                                    signal_cellular_alt
                                </span>
                                <span className="material-symbols-outlined text-[12px] text-slate-800 dark:text-slate-200">
                                    wifi
                                </span>
                                <span className="material-symbols-outlined text-[12px] text-slate-800 dark:text-slate-200">
                                    battery_full
                                </span>
                            </div>
                        </div>

                        {/* Quiz Content - shared component */}
                        {previewStep && quiz ? (
                            <QuizContent
                                quiz={quiz}
                                currentStep={previewStep}
                                currentStepIndex={currentIndex}
                                totalSteps={totalSteps}
                                progress={progress}
                                isPreview={true}
                                canGoBack={currentIndex > 0}
                            />
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-center">
                                <p className="text-slate-400">Select a step to preview</p>
                            </div>
                        )}
                    </div>
                    {/* Home Bar */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black rounded-full z-20"></div>
                </div>
            </div>
        </aside>
    );
}
