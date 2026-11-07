"use client";

import React, { useEffect, useRef, useState } from "react";
import type { Step } from "@/types/quiz";
import { useSettingsStore } from "@/store/settingsStore";
import { TestimonialSlider } from "@/components/quiz/TestimonialSlider";

interface LoadingStepProps {
    step: Step;
}

export function LoadingStep({ step }: LoadingStepProps) {
    // Both LOADING and TIMED_SLIDE use this step.
    const content = step.content as { message?: string; duration?: number };
    const duration = content.duration || 3000; // Default 3 seconds

    const projectName = useSettingsStore((s) => s.projectName);
    const logoUrl = useSettingsStore((s) => s.logoUrl);

    const [displayProgress, setDisplayProgress] = useState(0);
    const circleRef = useRef<SVGCircleElement>(null);

    // SVG Circle Math — constant values
    const radius = 52;
    const circumference = 2 * Math.PI * radius;

    // Animate progress 0 -> 100 using rAF with direct DOM update for the circle
    useEffect(() => {
        const startTime = performance.now();

        const animate = (now: number) => {
            const elapsed = now - startTime;
            const p = Math.min(100, (elapsed / duration) * 100);
            const rounded = Math.round(p);

            // Update display number (batched by React)
            setDisplayProgress(rounded);

            // Update circle directly via ref for perfectly synced rendering
            if (circleRef.current) {
                const offset = p >= 100 ? 0 : circumference - (p / 100) * circumference;
                circleRef.current.style.strokeDashoffset = String(offset);
            }

            if (p < 100) {
                requestAnimationFrame(animate);
            }
        };

        const frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, [duration, circumference]);

    return (
        <div className="relative flex flex-col h-full w-full max-w-md mx-auto overflow-hidden">

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between p-6">
                <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-default opacity-0 pointer-events-none">
                    {/* Hidden back button placeholder for layout balance */}
                    <span className="material-symbols-outlined text-slate-900 dark:text-white text-[24px]">arrow_back</span>
                </button>
                <div className="flex items-center gap-2">
                    {logoUrl && (
                        <img
                            src={logoUrl}
                            alt={projectName}
                            className="h-6 w-auto object-contain"
                        />
                    )}
                    <span className="font-bold text-lg tracking-tight">{projectName}</span>
                </div>
                <div className="w-10"></div> {/* Spacer for centering */}
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full">

                {/* Progress Section */}
                <div className="relative flex items-center justify-center mb-10 w-64 h-64">
                    {/* Outer Glow Ring */}
                    <div className="absolute inset-0 bg-quiz-primary/10 rounded-full animate-[pulse-ring_3s_infinite_ease-in-out]"></div>

                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full -rotate-90 origin-center" viewBox="0 0 120 120">
                        {/* Background Circle */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="transparent"
                            strokeWidth="6"
                            className="stroke-slate-200 dark:stroke-slate-800"
                        />
                        {/* Progress Circle — no CSS transition, driven by rAF */}
                        <circle
                            ref={circleRef}
                            cx="60"
                            cy="60"
                            r={radius}
                            fill="transparent"
                            strokeWidth="6"
                            strokeLinecap="round"
                            style={{
                                stroke: 'var(--quiz-primary)',
                                strokeDasharray: circumference,
                                strokeDashoffset: circumference,
                            }}
                        />
                    </svg>

                    {/* Inner Content */}
                    <div className="absolute flex flex-col items-center justify-center text-center inset-0">
                        <span className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
                            {displayProgress}<span className="text-2xl text-slate-400 align-top">%</span>
                        </span>
                        <span className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">
                            Complete
                        </span>
                    </div>
                </div>

                {/* Dynamic Status Text */}
                <div className="text-center space-y-3 mb-8 animate-[fadeInUp_0.8s_ease-out_forwards] opacity-0" style={{ animationFillMode: 'forwards' }}>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                        {content.message || 'Analyzing your answers...'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
                        Identifying metabolic patterns & nutrient needs
                    </p>
                </div>

                {/* Testimonials */}
                <div className="w-full mb-6">
                    <TestimonialSlider />
                </div>

                {/* Trust/Feature Grid */}
                <div className="w-full grid grid-cols-3 gap-3">
                    {/* Card 1 */}
                    <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 transition-transform hover:scale-[1.02]">
                        <div className="p-2 rounded-full bg-quiz-primary/10 text-quiz-primary">
                            <span className="material-symbols-outlined text-[24px]">lock</span>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">AES-256</p>
                            <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">Encrypted Data</p>
                        </div>
                    </div>
                    {/* Card 2 */}
                    <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 transition-transform hover:scale-[1.02]">
                        <div className="p-2 rounded-full bg-quiz-primary/10 text-quiz-primary">
                            <span className="material-symbols-outlined text-[24px]">verified_user</span>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Verified</p>
                            <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">Doctor Approved</p>
                        </div>
                    </div>
                    {/* Card 3 */}
                    <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/10 transition-transform hover:scale-[1.02]">
                        <div className="p-2 rounded-full bg-quiz-primary/10 text-quiz-primary">
                            <span className="material-symbols-outlined text-[24px]">science</span>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">Scientific</p>
                            <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">Proven Method</p>
                        </div>
                    </div>
                </div>

            </main>

            {/* Footer Security Note */}
            <footer className="p-6 text-center relative z-10 w-full mb-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400">
                    <span className="material-symbols-outlined text-[16px]">shield_lock</span>
                    <span className="text-xs font-medium">Your personal health data is secure and private.</span>
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulse-ring {
                    0% { transform: scale(0.95); opacity: 0.5; }
                    50% { transform: scale(1.05); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.5; }
                }
                @keyframes fadeInUp {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
            `}} />
        </div>
    );
}
