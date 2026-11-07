"use client";

import React, { useEffect, useState, useMemo } from "react";
import type { Step, ResultPageContent } from "@/types/quiz";
import Image from "next/image";
import { Check, Clock } from "lucide-react";
import { useUserProfileStore } from "@/store/userProfileStore";
import { buildHealthInsights, getGoalLabel, estimateBodyFat, getBodyFatLabel } from "@/lib/healthCalculations";
import { kgToLbs } from "@/lib/units";
import { pushEvent } from "@/lib/gtm";
import { track } from "@/lib/tracking";
import { TestimonialSlider } from "@/components/quiz/TestimonialSlider";
import { MascotSVG } from "@/steps/image-options/MascotSVG";
import { getMascotBasePath } from "@/steps/image-options/mascotRegistry";

/* ─── Body Mascot Mapping ─── */
// Maps quiz answer values to vector mascot variant IDs
const PHYSICAL_BUILD_MASCOTS: Record<string, string> = {
    thin:  'vector-maya-body-thin',
    mid:   'vector-maya-body-mid-sized',
    curvy: 'vector-maya-body-curvy',
    plus:  'vector-maya-body-plus-sized',
};

const DREAM_BODY_MASCOTS: Record<string, string> = {
    slim:      'vector-maya-body-slim',
    fit:       'vector-maya-body-fit',
    hourglass: 'vector-maya-body-hourglass',
    average:   'vector-maya-body-average',
};

// Both GET MY PLAN CTAs fire the same GTM + Pixel pair, differing only in
// the location param. Business-critical — keep names/params exactly as-is.
function fireCheckout(location: 'offer_card' | 'sticky_header') {
    pushEvent('checkout_initiated', { location });
    track.initiateCheckout(location);
}

const DEFAULT_CURRENT_MASCOT = 'vector-maya-body-mid-sized';
const DEFAULT_GOAL_MASCOT    = 'vector-maya-body-fit';

/* ─── FAQ Data ─── */
const faqItems = [
    {
        q: "How does the BodyReset plan work?",
        a: "The BodyReset plan uses a science-backed approach to optimize your metabolic pathways through targeted nutrition, helping your body burn fat more efficiently without extreme dieting.",
    },
    {
        q: "Is the plan suitable for beginners?",
        a: "Absolutely! The plan is designed with easy step-by-step instructions that anyone can follow, regardless of their fitness or nutrition experience.",
    },
    {
        q: "What if it doesn't work for me?",
        a: "We offer a full 60-day money-back guarantee. If you're not satisfied with your results, simply contact our support team for a complete refund — no questions asked.",
    },
    {
        q: "Do I need to buy special foods or supplements?",
        a: "No! The plan uses everyday superfoods that you can find at any grocery store. No expensive supplements required.",
    },
];

/* ─── Animated Progress Bar ─── */
function AnimatedBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const timeout = setTimeout(() => setWidth((value / max) * 100), 100 + delay);
        return () => clearTimeout(timeout);
    }, [value, max, delay]);

    return (
        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
            <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${width}%`, background: color }}
            />
        </div>
    );
}

/* ─── Shared Sub-components ─── */

function OfferCard({ timeLeft, ctaLink }: { timeLeft: number; ctaLink: string }) {
    return (
        <div className="flex flex-col items-center gap-5">
            {/* Urgency strip — restrained, professional */}
            <div className="w-full rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/50">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
                        <div className="flex flex-col leading-tight">
                            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-rose-700 dark:text-rose-300">
                                Offer ends in
                            </span>
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                                Plan reserved for you
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end gap-1.5">
                        <div className="flex flex-col items-center">
                            <span className="text-rose-700 dark:text-rose-200 font-bold text-2xl tabular-nums leading-none tracking-tight">
                                {Math.floor(timeLeft / 60).toString().padStart(2, "0")}
                            </span>
                            <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500 mt-1">
                                Min
                            </span>
                        </div>
                        <span className="text-rose-400/70 dark:text-rose-700 font-bold text-2xl leading-none tracking-tight pb-[18px]">
                            :
                        </span>
                        <div className="flex flex-col items-center">
                            <span className="text-rose-700 dark:text-rose-200 font-bold text-2xl tabular-nums leading-none tracking-tight">
                                {(timeLeft % 60).toString().padStart(2, "0")}
                            </span>
                            <span className="text-[8px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500 mt-1">
                                Sec
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card */}
            <div className="w-full bg-white dark:bg-[#162e2a] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
                {/* Badge */}
                <div className="bg-quiz-primary text-quiz-primary-fg text-center py-3 px-4">
                    <span className="text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                        <span className="bg-quiz-primary-fg text-quiz-primary px-2.5 py-0.5 rounded-md text-lg font-extrabold shadow-lg">
                            90%
                        </span>
                        <span className="text-lg font-extrabold opacity-90">
                            OFF
                        </span>
                        <span className="text-lg font-semibold opacity-80">
                            +
                        </span>
                        <span className="bg-quiz-primary-fg text-quiz-primary px-2.5 py-0.5 rounded-md text-lg font-extrabold shadow-lg">
                            FREE
                        </span>
                        <span className="text-lg font-extrabold opacity-90">
                            BONUSES
                        </span>
                    </span>
                </div>

                <div className="p-6 flex flex-col items-center gap-4">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">BodyReset Plan</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">$29</span>
                        <span className="text-lg font-medium text-slate-400 dark:text-slate-500 line-through">$342</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">One-time payment</p>

                    {/* CTA */}
                    <a
                        href={ctaLink}
                        onClick={() => fireCheckout('offer_card')}
                        className="w-full bg-quiz-primary hover:brightness-90 text-quiz-primary-fg font-extrabold py-4 px-6 rounded-full shadow-quiz-primary/40 hover:shadow-quiz-primary/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer text-base tracking-tight"
                    >
                        <span className="material-symbols-outlined text-[20px]">lock</span>
                        GET MY PLAN
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                    </a>

                    {/* Trust bullets */}
                    <ul className="w-full space-y-2 mt-1">
                        {[
                            "One-Time Payment",
                            "No Subscriptions",
                            "No Hidden Fees",
                            "60-Day Money Back Guarantee",
                            "24/7 Customer Support",
                        ].map((item) => (
                            <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-600 dark:text-slate-300">
                                <span className="flex-shrink-0 w-[18px] h-[18px] rounded-full bg-quiz-primary flex items-center justify-center">
                                    <Check className="w-3 h-3 text-quiz-primary-fg" strokeWidth={3.5} />
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>

                    {/* Payment icons */}
                    <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 w-full mt-1">
                        {[
                            { src: "/visa.svg", alt: "Visa" },
                            { src: "/master-card.svg", alt: "Mastercard" },
                            { src: "/amex.svg", alt: "Amex" },
                            { src: "/discover.svg", alt: "Discover" },
                        ].map((card) => (
                            <Image
                                key={card.alt}
                                src={card.src}
                                alt={card.alt}
                                width={55}
                                height={35}
                                className="object-contain"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FaqAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="space-y-2">
            {faqItems.map((item, i) => (
                <div key={i} className="bg-white dark:bg-[#162e2a] rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <button
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left cursor-pointer"
                        onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    >
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 pr-4">{item.q}</span>
                        <span className={`material-symbols-outlined text-[20px] text-slate-400 dark:text-slate-500 transition-transform duration-200 flex-shrink-0 ${openIndex === i ? "rotate-180" : ""}`}>
                            expand_more
                        </span>
                    </button>
                    <div className={`transition-all duration-200 ease-out overflow-hidden ${openIndex === i ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
                        <p className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ─── Main Step Component ─── */

interface ResultPageStepProps {
    step: Step;
    quizId?: string;
    totalSteps?: number;
}

export function ResultPageStep({ step, quizId, totalSteps }: ResultPageStepProps) {
    const content = step.content as ResultPageContent;
    const ctaLink = content.ctaLink || "#";
    const profile = useUserProfileStore();

    // Compute dynamic data from user profile
    const insights = useMemo(() => buildHealthInsights(profile.getProfile()), [profile]);

    const goalLabel = getGoalLabel(profile.mainGoal);

    // Target weight: use the user's actual target weight, then the projection endpoint
    const rawTargetKg = profile.targetWeightKg
        ?? insights?.weightProjection[insights.weightProjection.length - 1].weight
        ?? 70;

    // Display in the same unit the user chose during the weight step
    const displayUnit = profile.weightUnit || 'kg';
    const targetWeightDisplay = displayUnit === 'lbs'
        ? `${kgToLbs(rawTargetKg)} lbs`
        : `${Math.round(rawTargetKg)} kg`;

    // ── Body fat estimation ──
    // Uses the Deurenberg formula as a proxy. Not a medical diagnostic.
    const currentBodyFat = (insights && profile.gender && profile.age)
        ? estimateBodyFat(insights.bmi, profile.age, profile.gender)
        : 35;
    const currentBodyFatLabel = getBodyFatLabel(currentBodyFat);
    // Bar scale: bodyFat × 2 gives good visual spread (0-100 range)
    const currentBodyFatBar = Math.min(100, currentBodyFat * 2);

    // After body fat: AGGRESSIVE MARKETING formula.
    // We intentionally show an aspirational "goal" body fat, NOT a medical prediction.
    // Formula: halve current body fat, ensure at least 10% gap, floor at 16%.
    // Do NOT replace this with a Deurenberg calculation — it's too conservative
    // for high-BMI users and kills the selling point.
    let afterBodyFatRaw = currentBodyFat * 0.5;
    afterBodyFatRaw = Math.min(afterBodyFatRaw, currentBodyFat - 10);
    afterBodyFatRaw = Math.max(afterBodyFatRaw, 16);

    const afterBodyFatLabel = getBodyFatLabel(afterBodyFatRaw);
    const afterBodyFatBar = Math.min(100, afterBodyFatRaw * 2);

    // Mascot variants derived from profile answers
    const currentMascot = PHYSICAL_BUILD_MASCOTS[profile.physicalBuild ?? ''] || DEFAULT_CURRENT_MASCOT;
    const goalMascot    = DREAM_BODY_MASCOTS[profile.dreamBody ?? '']         || DEFAULT_GOAL_MASCOT;

    // Countdown timer (starts at 14:59)
    const [timeLeft, setTimeLeft] = useState(14 * 60 + 59);

    useEffect(() => {
        track.viewOffer();
        if (quizId) {
            pushEvent('quiz_completed', { quiz_id: quizId, total_steps: totalSteps ?? 0 });
        }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-quiz-bg dark:bg-[#10221f] text-quiz-fg dark:text-slate-100 font-display flex flex-col antialiased selection:bg-quiz-primary selection:text-quiz-fg">
            {/* ── 1. Sticky Top Promo Bar ── */}
            <header className="sticky top-0 z-50 bg-quiz-bg/90 dark:bg-[#10221f]/90 backdrop-blur-md border-b border-quiz-border/50 dark:border-slate-800/50 px-4 py-2.5">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-red-500 dark:text-red-400 animate-pulse">alarm</span>
                        <div className="flex items-baseline gap-1">
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{Math.floor(timeLeft / 60).toString().padStart(2, "0")}</span>
                                <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-0.5">min</span>
                            </div>
                            <span className="text-lg font-bold text-slate-400 dark:text-slate-500 -mt-3">:</span>
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">{(timeLeft % 60).toString().padStart(2, "0")}</span>
                                <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider -mt-0.5">sec</span>
                            </div>
                        </div>
                    </div>
                    <a
                        href={ctaLink}
                        onClick={() => fireCheckout('sticky_header')}
                        className="bg-quiz-primary hover:brightness-90 text-quiz-primary-fg font-bold text-xs px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                        GET MY PLAN
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </a>
                </div>
            </header>

            <main className="flex-1 flex flex-col w-full max-w-md mx-auto pb-10">
                {/* ── 2. Hero Section ── */}
                <section className="px-5 pt-8 pb-2 text-center">
                    <h1 className="text-2xl font-extrabold tracking-tight leading-tight mb-3 text-slate-900 dark:text-white">
                        Your Metabolism-Boosting<br />Plan is Ready!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed px-4">
                        Based on your answers, we&apos;ve created a personalized plan to supercharge your metabolism and help you reach your goals.
                    </p>
                </section>

                {/* ── Before / After Transformation ── */}
                <section className="px-4 pb-4 pt-4">
                    <div className="grid grid-cols-2 gap-3">
                        {/* Before — Now */}
                        <div className="bg-white dark:bg-[#162e2a] rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col items-center gap-3 shadow-sm">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 dark:text-red-400 bg-red-500/10 px-3 py-0.5 rounded-full">Now</span>
                            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                                <MascotSVG variant={currentMascot} basePath={getMascotBasePath(currentMascot)} preserveAspectRatio="xMidYMin slice" />
                            </div>
                            <div className="w-full space-y-3 text-left">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Body fat</span>
                                        <span className="text-[10px] font-extrabold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">{currentBodyFatLabel}</span>
                                    </div>
                                    <AnimatedBar value={currentBodyFatBar} max={100} color="linear-gradient(90deg, #f87171, #ef4444)" delay={0} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Metabolism</span>
                                        <span className="text-[10px] font-extrabold text-red-500 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">Sluggish</span>
                                    </div>
                                    <AnimatedBar value={25} max={100} color="linear-gradient(90deg, #f87171, #ef4444)" delay={200} />
                                </div>
                            </div>
                        </div>

                        {/* After — Your Goal */}
                        <div className="bg-white dark:bg-[#162e2a] rounded-2xl border-2 border-quiz-primary/60 p-4 flex flex-col items-center gap-3 relative overflow-hidden shadow-sm" style={{ boxShadow: '0 4px 14px -6px color-mix(in srgb, var(--quiz-primary) 50%, transparent)' }}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-quiz-primary bg-quiz-primary/10 px-3 py-0.5 rounded-full">Your Goal</span>
                            <div className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                                <MascotSVG variant={goalMascot} basePath={getMascotBasePath(goalMascot)} preserveAspectRatio="xMidYMin slice" />
                            </div>
                            <div className="w-full space-y-3 text-left">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Body fat</span>
                                        <span className="text-[10px] font-extrabold text-quiz-primary bg-quiz-primary/10 px-2 py-0.5 rounded-full uppercase">{afterBodyFatLabel}</span>
                                    </div>
                                    <AnimatedBar value={afterBodyFatBar} max={100} color={`linear-gradient(90deg, var(--quiz-primary, #13ecc8), #10b981)`} delay={400} />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Metabolism</span>
                                        <span className="text-[10px] font-extrabold text-quiz-primary bg-quiz-primary/10 px-2 py-0.5 rounded-full uppercase">Supercharged</span>
                                    </div>
                                    <AnimatedBar value={92} max={100} color={`linear-gradient(90deg, var(--quiz-primary, #13ecc8), #10b981)`} delay={600} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Goal Summary + Offer ── */}
                <section className="px-5 pb-6">
                    <div className="text-center mb-5">
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">Start Losing Weight Right Now</h2>
                        <div className="flex items-center justify-center gap-3">
                            <div className="flex items-center gap-2 bg-white dark:bg-[#162e2a] border border-slate-100 dark:border-slate-800 rounded-full px-4 py-2.5 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px] text-emerald-500">restaurant</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Goal</span>
                                    <span className="block text-sm font-bold text-slate-900 dark:text-white leading-tight">{goalLabel}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-white dark:bg-[#162e2a] border border-slate-100 dark:border-slate-800 rounded-full px-4 py-2.5 shadow-sm">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-[18px] text-blue-500">flag</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">Target</span>
                                    <span className="block text-sm font-bold text-slate-900 dark:text-white leading-tight">{targetWeightDisplay}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <OfferCard timeLeft={timeLeft} ctaLink={ctaLink} />
                </section>

                {/* ── 3. Money-Back Guarantee ── */}
                <section className="px-4 pb-8">
                    <div className="bg-white dark:bg-[#162e2a] rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center shadow-sm">
                        <div className="flex justify-center mb-4">
                            <Image
                                src="/moneyback-60.webp"
                                alt="60 Day Money Back Guarantee"
                                width={120}
                                height={120}
                                className="object-contain"
                            />
                        </div>
                        <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                            100% Money-Back Guarantee
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            Try the BodyReset plan risk-free. If you&apos;re not completely satisfied within 60 days, we&apos;ll give you a full refund — no questions asked. Simply follow the plan and see the results for yourself.
                        </p>
                    </div>
                </section>

                {/* ── 4. BodyReset Connection ── */}
                <section className="px-4 pb-8">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3 px-1">BodyReset Connection</h3>
                    <div className="bg-white dark:bg-[#162e2a] rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <div className="flex items-start gap-3 mb-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-quiz-primary/15 text-quiz-primary flex items-center justify-center text-xs font-extrabold">1</div>
                            <div>
                                <h4 className="text-base font-bold text-slate-900 dark:text-white">BodyReset Metabolic Flush</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                                    A simple 1-day jumpstart plan designed to boost your inefficient metabolic pathways and kickstart your transformation.
                                </p>
                            </div>
                        </div>
                        <div className="w-full aspect-[16/10] rounded-lg mt-3 overflow-hidden bg-slate-100 dark:bg-slate-700">
                            <Image
                                src="/step-1.webp"
                                alt="BodyReset Metabolic Flush"
                                width={640}
                                height={400}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* ── 5. Plan Highlights ── */}
                <section className="px-4 pb-8">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3 px-1">Highlights of your Plan</h3>
                    <div className="bg-white dark:bg-[#162e2a] rounded-xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                        <ul className="space-y-3">
                            {[
                                { icon: "local_fire_department", text: "Lose weight with personalized metabolism foods" },
                                { icon: "favorite", text: "Eat foods you love" },
                                { icon: "nutrition", text: "5 metabolism superfoods" },
                                { icon: "restaurant_menu", text: "Personalized meal recommendations" },
                                { icon: "checklist", text: "Easy step-by-step structure" },
                                { icon: "menu_book", text: "Hundreds of recipes" },
                            ].map((item) => (
                                <li key={item.text} className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-quiz-primary/10 text-quiz-primary flex items-center justify-center mt-0.5">
                                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                    </span>
                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                {/* ── 6. As Featured In ── */}
                <section className="px-4 pb-8">
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-4 px-1 text-center">As featured in:</p>
                    <div className="flex items-center justify-center gap-5 flex-wrap">
                        {[
                            { src: "/forbes-logo.webp", alt: "Forbes" },
                            { src: "/ny-times-logo.webp", alt: "NY Times" },
                            { src: "/vogue-logo.webp", alt: "Vogue" },
                            { src: "/womens-health-logo.webp", alt: "Women's Health" },
                        ].map((logo) => (
                            <Image
                                key={logo.alt}
                                src={logo.src}
                                alt={logo.alt}
                                width={80}
                                height={28}
                                className="opacity-50 object-contain brightness-0 dark:invert"
                            />
                        ))}
                    </div>
                </section>

                {/* ── 7. FAQ Accordion ── */}
                <section className="px-4 pb-8">
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 px-1">People Often Ask</h3>
                    <FaqAccordion />
                </section>

                {/* ── 8. Testimonials ── */}
                <section className="px-4 pb-8">
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 px-1">Users Love Our Plan</h3>
                    <TestimonialSlider />
                </section>

                {/* ── 9. Final CTA Section ── */}
                <section className="px-5 pb-10">
                    <div className="text-center mb-5">
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Start Losing Weight Right Now</h2>
                    </div>
                    <OfferCard timeLeft={timeLeft} ctaLink={ctaLink} />
                </section>
            </main>
        </div>
    );
}
