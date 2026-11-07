"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export interface Testimonial {
    name: string;
    quote: string;
    location?: string;
    daysAgo?: number;
}

interface TestimonialSliderProps {
    testimonials?: Testimonial[];
    intervalMs?: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
    { name: "Brenda", location: "Austin, TX", daysAgo: 3, quote: "This Metabolism-Boosting Plan is a game-changer! It's super easy to follow, and trust me — you'll see awesome results in no time!" },
    { name: "Jess", location: "Manchester, UK", daysAgo: 8, quote: "After trying for years, I assumed nothing would work anymore. But this kickstarted my metabolism and the pounds started melting away." },
    { name: "Stefanie", location: "Toronto, CA", daysAgo: 14, quote: "The step-by-step support made it so easy. I've lost 18 pounds and have more energy than I've had in years!" },
];

function formatTimeAgo(days?: number): string | null {
    if (!days || days < 1) return null;
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (days < 30) {
        const w = Math.round(days / 7);
        return `${w} week${w === 1 ? '' : 's'} ago`;
    }
    const m = Math.round(days / 30);
    return `${m} month${m === 1 ? '' : 's'} ago`;
}

export function TestimonialSlider({
    testimonials = DEFAULT_TESTIMONIALS,
    intervalMs = 4500,
}: TestimonialSliderProps) {
    const [index, setIndex] = useState(0);
    const [paused, setPaused] = useState(false);
    const count = testimonials.length;

    useEffect(() => {
        if (paused || count <= 1) return;
        const id = setInterval(() => {
            setIndex((i) => (i + 1) % count);
        }, intervalMs);
        return () => clearInterval(id);
    }, [paused, count, intervalMs]);

    return (
        <div
            className="w-full"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={() => setPaused(true)}
            onTouchEnd={() => setPaused(false)}
        >
            {/* Trust header */}
            <div className="flex items-center justify-center gap-3 mb-3">
                <Image
                    src="/trust-pilot-stacked-black.svg"
                    alt="Trustpilot"
                    width={64}
                    height={30}
                    className="h-7 w-auto object-contain dark:invert dark:brightness-0 dark:contrast-200"
                />
                <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1">
                        <span className="text-[13px] font-bold text-slate-900 dark:text-white leading-none">Excellent</span>
                        <div className="flex gap-0.5 text-[#00b67a]">
                            {[...Array(5)].map((_, i) => (
                                <span key={i} className="text-[11px] leading-none">★</span>
                            ))}
                        </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Based on 4,800+ reviews</span>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-xl">
                <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {testimonials.map((t) => {
                        const timeAgo = formatTimeAgo(t.daysAgo);
                        return (
                            <div key={t.name} className="w-full flex-shrink-0 px-0.5">
                                <div className="bg-white dark:bg-[#162e2a] rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-9 h-9 rounded-full flex-shrink-0 bg-gradient-to-br from-quiz-primary/20 to-emerald-500/20 ring-2 ring-quiz-primary/30 flex items-center justify-center">
                                            <span className="text-sm font-bold text-quiz-primary dark:text-quiz-primary">{t.name[0]}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{t.name}</p>
                                                <span className="material-symbols-outlined text-[14px] text-emerald-500" title="Verified review">verified</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex gap-0.5 text-[#00b67a]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className="text-[12px] leading-none">★</span>
                                                    ))}
                                                </div>
                                                {t.location && (
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">· {t.location}</span>
                                                )}
                                            </div>
                                        </div>
                                        {timeAgo && (
                                            <span className="ml-auto text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap">{timeAgo}</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {count > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-3">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            aria-label={`Show testimonial ${i + 1}`}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === index
                                    ? 'w-5 bg-quiz-primary'
                                    : 'w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
