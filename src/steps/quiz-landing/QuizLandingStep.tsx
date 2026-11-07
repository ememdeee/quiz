"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import type { Step, LandingContent } from "@/types/quiz";

interface QuizLandingStepProps {
    step: Step;
    onAnswer: (value: unknown) => void;
    isPreview?: boolean;
}

export function QuizLandingStep({ step, onAnswer, isPreview = false }: QuizLandingStepProps) {
    const content = step.content as LandingContent;
    // Treat any legacy value other than 'none' as overlay-on
    const hasOverlay = (content.overlayTone ?? 'overlay') !== 'none';

    const scrimStyle: React.CSSProperties = hasOverlay
        ? { background: 'linear-gradient(to top, color-mix(in srgb, var(--quiz-fg) 90%, transparent) 0%, color-mix(in srgb, var(--quiz-fg) 55%, transparent) 35%, color-mix(in srgb, var(--quiz-fg) 18%, transparent) 65%, color-mix(in srgb, var(--quiz-fg) 4%, transparent) 100%)' }
        : {};

    return (
        /* Outer shell — full viewport, base color fills desktop gutter */
        <div
            className={`${isPreview ? "absolute" : "fixed"} inset-0 z-0 overflow-hidden overscroll-none`}
            style={{ backgroundColor: 'var(--quiz-fg)', ...(isPreview ? {} : { touchAction: "manipulation" }) }}
        >
            {/* Desktop gutter: blurred version of the same image, md+ only */}
            {content.backgroundImage && (
                <div className="absolute inset-0 z-0 hidden md:block pointer-events-none">
                    <div
                        className="w-full h-full bg-cover bg-center scale-110 blur-2xl opacity-40"
                        style={{ backgroundImage: `url('${content.backgroundImage}')` }}
                    />
                    <div className="absolute inset-0" style={{ backgroundColor: 'color-mix(in srgb, var(--quiz-fg) 60%, transparent)' }} />
                </div>
            )}

            {/* Mobile column — sharp bg + all content, constrained to ~448px */}
            <div className="relative z-10 mx-auto flex h-full w-full max-w-md flex-col overflow-hidden md:shadow-2xl md:shadow-black/50">

                {/* Sharp background image — only as wide as this column */}
                <div className="absolute inset-0 z-0 bg-slate-900 pointer-events-none">
                    {content.backgroundImage && (
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url('${content.backgroundImage}')` }}
                        />
                    )}
                    <div className="absolute inset-0" style={scrimStyle} />
                </div>

                {/* Content — exactly fills the column, no scroll */}
                <div
                    className="relative z-10 flex flex-col flex-1 w-full px-6 py-safe font-display antialiased selection:bg-quiz-primary selection:text-slate-900"
                    style={isPreview ? { height: '100%', maxHeight: '100%' } : { height: '100svh', maxHeight: '100svh' }}
                >
                    {/* Spacer — pushes content down */}
                    <div className="flex-1 min-h-0" />

                    {/* Main Content Area — bottom aligned */}
                    <div className="flex flex-col items-center w-full shrink-0">
                        {/* Headline Group */}
                        <div className="text-center mb-6 w-full animate-fade-in-up">
                            {content.eyebrow && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white/90">
                                    <span className="w-1.5 h-1.5 rounded-full bg-quiz-primary animate-pulse" />
                                    {content.eyebrow}
                                </div>
                            )}

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-[1.2] tracking-tight mb-3 drop-shadow-lg">
                                {content.title ? (
                                    <span dangerouslySetInnerHTML={{ __html: content.title.replace('Body Type Needs', '<span style="color: var(--quiz-primary)">Body Type Needs</span>') }} />
                                ) : (
                                    <>
                                        Discover Your <br />
                                        <span className="text-quiz-primary">Body Type Needs</span> <br />
                                        to Lose Weight
                                    </>
                                )}
                            </h1>
                            <p className="text-slate-300 text-sm sm:text-base max-w-[280px] mx-auto leading-relaxed">
                                {content.subtitle || "Take the 1-minute quiz to create your personalized nutrition & workout plan."}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full flex flex-col gap-3 mb-5">
                            {content.options?.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => onAnswer(option.value)}
                                    className="group relative w-full h-14 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all duration-200 rounded-full overflow-hidden shadow-quiz-primary/15 cursor-pointer"
                                >
                                    {/* Label — always dead-center in the button */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center">
                                            <span className="text-slate-900 font-bold text-base tracking-wide">{option.label}</span>
                                            {option.subLabel && (
                                                <span className="block text-slate-500 text-xs font-medium mt-0.5">{option.subLabel}</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Icon — left side */}
                                    {option.icon && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-quiz-primary/20 transition-colors">
                                            <span className="material-symbols-outlined text-slate-600 group-hover:text-quiz-primary transition-colors text-[20px] leading-none">
                                                {option.icon}
                                            </span>
                                        </div>
                                    )}
                                    {/* Arrow — right side, appears on hover */}
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                                        <ArrowRight className="w-[22px] h-[22px] text-quiz-primary" strokeWidth={2.5} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Trust Badges / Footer */}
                        <div className="w-full pt-4 border-t border-white/10 pb-4">
                            <p className="text-xs text-center text-slate-400 mb-3 font-medium uppercase tracking-wider">As seen on</p>
                            <div className="overflow-hidden opacity-50 [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
                                <div className="flex w-max animate-[marquee_20s_linear_infinite] gap-10">
                                    {[0, 1].map((copy) => (
                                        <div key={copy} className="flex items-center gap-10 shrink-0">
                                            <img src="/womens-health-logo.webp" alt="Women's Health" className="h-4 w-auto brightness-0 invert object-contain" />
                                            <img src="/vogue-logo.webp" alt="Vogue" className="h-4 w-auto brightness-0 invert object-contain" />
                                            <img src="/ny-times-logo.webp" alt="NY Times" className="h-4 w-auto brightness-0 invert object-contain" />
                                            <img src="/forbes-logo.webp" alt="Forbes" className="h-4 w-auto brightness-0 invert object-contain" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-slate-500">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">lock</span>
                                    <span>256-Bit SSL Secure</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">verified_user</span>
                                    <span>Privacy Protected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
