"use client";

import React, { useMemo } from "react";
import type { Step, WeightSummaryContent } from "@/types/quiz";
import { StepHeader } from "@/components/quiz/steps/StepHeader";
import { useUserProfileStore } from "@/store/userProfileStore";
import { buildHealthInsights } from "@/lib/healthCalculations";
import { createWarmLazy } from "@/lib/lazyWarm";

// Code-split: keeps recharts/d3 out of the route's first-load JS.
// QuizPageClient calls preloadWeightChart() at idle; the warmed module
// renders synchronously on mount, and a cold mount's null fallback sits
// inside a fixed-height (h-44) container, so nothing shifts either way
// (see lazyWarm.tsx for why next/dynamic is not used here).
const WeightChart = createWarmLazy(() => import("./WeightChart"));
export const preloadWeightChart = WeightChart.preload;

interface WeightSummaryStepProps {
    step: Step;
}

export function WeightSummaryStep({ step }: WeightSummaryStepProps) {
    const content = step.content as WeightSummaryContent;
    const profile = useUserProfileStore();

    const insights = useMemo(() => {
        return buildHealthInsights(profile.getProfile());
    }, [profile]);

    // Fallback values when data is not yet available
    const weightKg = profile.weightKg ?? 80;
    const targetWeightKg = profile.targetWeightKg ?? 70;
    const unit = 'kg'; // Always display in kg from store

    const chartData = insights?.weightProjection ?? [
        { name: 'Now', weight: weightKg },
        { name: 'Month 1', weight: +(weightKg * 0.968).toFixed(1) },
        { name: 'Month 3', weight: +(weightKg * 0.904).toFixed(1) },
    ];

    const projectedLossKg = insights?.projectedLossKg ?? +(weightKg - targetWeightKg).toFixed(1);
    const projectedLossPercent = insights?.projectedLossPercent ?? Math.round(((weightKg - targetWeightKg) / weightKg) * 100);
    const metabolicAge = insights?.metabolicAge ?? 0;
    const bmi = insights?.bmi ?? 0;
    const dailyBurn = insights?.dailyBurn ?? 0;
    const timelineLabel = insights?.timelineLabel ?? '3 Months';

    return (
        <div className="flex-1 w-full flex flex-col">
            <div className="px-4 pt-6 pb-4 space-y-6">
                {/* Header */}
                <div className="text-center">
                    <StepHeader
                        content={content}
                        heading={content.title || "Your Weight Loss Projection"}
                        subtitleClassName="text-sm"
                    />
                </div>

                {/* Projection Card */}
                <div className="bg-white dark:bg-[#162e2a] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-5 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-end justify-between mb-5">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                                Projected Weight Loss
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    -{projectedLossKg} {unit}
                                </span>
                                <span className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    -{projectedLossPercent}%
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-1">Timeline</p>
                            <p className="text-base font-bold text-quiz-primary">{timelineLabel}</p>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="relative h-44 w-full -ml-[10px] mt-2">
                        <WeightChart chartData={chartData} unit={unit} />
                        {/* Grid lines */}
                        <div className="absolute inset-x-4 inset-y-0 flex flex-col justify-between pointer-events-none z-[-1]">
                            <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-700 mt-2"></div>
                            <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-700"></div>
                            <div className="w-full h-px border-t border-dashed border-slate-200 dark:border-slate-700 mb-8"></div>
                        </div>
                    </div>
                </div>

                {/* Key Health Insights */}
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3 px-1">
                        Key Health Insights
                    </h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 px-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {/* Card 1: Metabolic Age */}
                        <div className="flex-none w-32 bg-white dark:bg-[#162e2a] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start gap-2">
                            <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">Metabolic Age</span>
                                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                                    {metabolicAge > 0 ? `${metabolicAge} yrs` : '—'}
                                </span>
                            </div>
                        </div>
                        {/* Card 2: BMI */}
                        <div className="flex-none w-32 bg-white dark:bg-[#162e2a] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start gap-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">monitor_weight</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">Current BMI</span>
                                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                                    {bmi > 0 ? bmi : '—'}
                                </span>
                            </div>
                        </div>
                        {/* Card 3: Daily Calorie Burn (TDEE) — replaces Hydration */}
                        <div className="flex-none w-32 bg-white dark:bg-[#162e2a] p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-start gap-2">
                            <div className="p-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                                <span className="material-symbols-outlined text-[20px]">whatshot</span>
                            </div>
                            <div>
                                <span className="block text-xs text-slate-500 dark:text-slate-400">Daily Burn</span>
                                <span className="block text-lg font-bold text-slate-900 dark:text-white">
                                    {dailyBurn > 0 ? `${dailyBurn.toLocaleString()} kcal` : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
