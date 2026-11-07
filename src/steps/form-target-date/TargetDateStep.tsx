"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import type { Step, FormTargetDateContent } from "@/types/quiz";
import { StepHeader } from "@/components/quiz/steps/StepHeader";

interface TargetDateStepProps {
    step: Step;
    selectedValue?: unknown;
    onAnswer: (value: unknown) => void;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function TargetDateStep({ step, selectedValue, onAnswer }: TargetDateStepProps) {
    const content = step.content as FormTargetDateContent;

    const existingDate = typeof selectedValue === 'string' ? selectedValue : '';
    const [selectedDate, setSelectedDate] = useState<string>(existingDate);
    const [showCalendar, setShowCalendar] = useState(false);
    const calendarRef = useRef<HTMLDivElement>(null);

    const now = useMemo(() => new Date(), []);

    const [viewYear, setViewYear] = useState(() => {
        if (existingDate) return new Date(existingDate + 'T00:00:00').getFullYear();
        return now.getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
        if (existingDate) return new Date(existingDate + 'T00:00:00').getMonth();
        return now.getMonth();
    });

    // Close calendar on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
                setShowCalendar(false);
            }
        };
        if (showCalendar) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showCalendar]);

    // Quick select presets
    const presets = useMemo(() => {
        const makePreset = (months: number, label: string) => {
            const d = new Date(now);
            d.setMonth(d.getMonth() + months);
            return { label, date: d.toISOString().split('T')[0] };
        };
        return [
            makePreset(1, '1 month'),
            makePreset(3, '3 months'),
            makePreset(6, '6 months'),
            makePreset(12, '1 year'),
        ];
    }, [now]);

    const selectDate = (dateStr: string) => {
        setSelectedDate(dateStr);
        onAnswer(dateStr);
        setShowCalendar(false);
    };

    // Calendar helpers
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

    const isFutureDate = (year: number, month: number, day: number): boolean => {
        return new Date(year, month, day) > now;
    };

    const toDateStr = (year: number, month: number, day: number): string => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    // Generate year options (current year through +5 years)
    const yearOptions = useMemo(() => {
        const years: number[] = [];
        for (let y = now.getFullYear(); y <= now.getFullYear() + 5; y++) {
            years.push(y);
        }
        return years;
    }, [now]);

    // Date display
    const dateDisplay = useMemo(() => {
        if (!selectedDate) return null;
        const d = new Date(selectedDate + 'T00:00:00');
        if (isNaN(d.getTime())) return null;
        const diffMs = d.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonthsCalc = Math.floor(diffDays / 30);
        return {
            formatted: `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
            daysAway: diffDays,
            weeksAway: diffWeeks,
            monthsAway: diffMonthsCalc,
        };
    }, [selectedDate, now]);

    const defaultQuestion = content.question || content.title || "When would you like to reach your goal weight?";
    const defaultSubtitle = content.subtitle || "We'll build your personalized BodyReset plan around this target date.";

    // Theme-derived colors for the dark confirmation card (see plan/project.md § Quiz Theming)
    const insightAccent = 'color-mix(in srgb, var(--quiz-primary) 55%, white)';
    const insightCardBg = 'linear-gradient(to bottom right, color-mix(in srgb, var(--quiz-primary) 10%, var(--quiz-fg)), color-mix(in srgb, var(--quiz-primary) 22%, var(--quiz-fg)))';

    return (
        <div className="flex-1 w-full flex flex-col justify-start">
            <div className="px-6 pt-6 pb-4 w-full max-w-md mx-auto flex flex-col items-center gap-6">
                {/* Header */}
                <div className="text-center">
                    <StepHeader
                        content={{ ...content, question: defaultQuestion, subtitle: defaultSubtitle }}
                        heading={defaultQuestion}
                        subtitleClassName="text-sm"
                    />
                </div>

                {/* Quick Select Presets */}
                <div className="w-full flex flex-wrap justify-center gap-2">
                    {presets.map((preset) => (
                        <button
                            key={preset.label}
                            onClick={() => selectDate(preset.date)}
                            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer border
                                ${selectedDate === preset.date
                                    ? 'bg-quiz-primary text-quiz-primary-fg border-quiz-primary shadow-quiz-primary/30'
                                    : 'bg-white dark:bg-[#162e2a] text-slate-700 dark:text-slate-300 border-quiz-border dark:border-slate-700 hover:border-quiz-primary/50 hover:shadow-sm'
                                }`}
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full px-4">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">or pick a date</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
                </div>

                {/* Date Picker Button + Calendar Popup */}
                <div className="w-full relative" ref={calendarRef}>
                    <button
                        onClick={() => setShowCalendar(!showCalendar)}
                        className={`w-full bg-white dark:bg-[#162e2a] border-2 rounded-2xl py-4 pl-12 pr-4 text-left text-base font-semibold transition-all cursor-pointer flex items-center ${showCalendar ? 'border-quiz-primary' : 'border-quiz-border dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}
                    >
                        <span className="absolute left-4 text-slate-400 dark:text-slate-500 material-symbols-outlined text-[22px]">calendar_month</span>
                        {selectedDate ? (
                            <span className="text-slate-900 dark:text-white">{dateDisplay?.formatted}</span>
                        ) : (
                            <span className="text-slate-400 dark:text-slate-500">Select a date...</span>
                        )}
                        <span className={`material-symbols-outlined text-[20px] text-slate-400 ml-auto transition-transform ${showCalendar ? 'rotate-180' : ''}`}>expand_more</span>
                    </button>

                    {/* Calendar Dropdown */}
                    {showCalendar && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#162e2a] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 p-4 animate-[stepFadeIn_0.2s_ease-out]">
                            {/* Month & Year Selectors */}
                            <div className="flex items-center gap-2 mb-4">
                                <select
                                    value={viewMonth}
                                    onChange={(e) => setViewMonth(parseInt(e.target.value))}
                                    className="flex-1 bg-slate-50 dark:bg-[#1a3a34] border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-quiz-primary cursor-pointer appearance-none"
                                >
                                    {MONTH_NAMES.map((m, i) => (
                                        <option key={m} value={i}>{m}</option>
                                    ))}
                                </select>
                                <select
                                    value={viewYear}
                                    onChange={(e) => setViewYear(parseInt(e.target.value))}
                                    className="w-24 bg-slate-50 dark:bg-[#1a3a34] border border-slate-200 dark:border-slate-600 rounded-lg py-2 px-3 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-quiz-primary cursor-pointer appearance-none"
                                >
                                    {yearOptions.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => {
                                            if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
                                            else setViewMonth(viewMonth - 1);
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
                                            else setViewMonth(viewMonth + 1);
                                        }}
                                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                    </button>
                                </div>
                            </div>

                            {/* Weekday Headers */}
                            <div className="grid grid-cols-7 gap-1 mb-1">
                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                    <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider py-1">
                                        {d}
                                    </div>
                                ))}
                            </div>

                            {/* Day Grid */}
                            <div className="grid grid-cols-7 gap-1">
                                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                                    <div key={`empty-${i}`} />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = toDateStr(viewYear, viewMonth, day);
                                    const isFuture = isFutureDate(viewYear, viewMonth, day);
                                    const isSelected = dateStr === selectedDate;
                                    const isToday = viewYear === now.getFullYear() && viewMonth === now.getMonth() && day === now.getDate();

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => isFuture && selectDate(dateStr)}
                                            disabled={!isFuture}
                                            className={`w-full aspect-square rounded-full flex items-center justify-center text-sm font-medium transition-all
                                                ${isSelected
                                                    ? 'bg-quiz-primary text-quiz-primary-fg font-bold shadow-quiz-primary/30'
                                                    : isFuture
                                                        ? 'text-slate-700 dark:text-slate-200 hover:bg-quiz-primary/10 cursor-pointer'
                                                        : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                }
                                                ${isToday && !isSelected ? 'ring-1 ring-slate-300 dark:ring-slate-600' : ''}
                                            `}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Selected Date Display Card */}
                {dateDisplay && (
                    <div className="w-full animate-[stepFadeIn_0.3s_ease-out]">
                        <div className="rounded-2xl p-5 border border-white/10 shadow-lg" style={{ background: insightCardBg }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[22px]" style={{ color: insightAccent }}>event_available</span>
                                </div>
                                <div>
                                    <p className="text-white text-base font-bold">{dateDisplay.formatted}</p>
                                    <p className="text-slate-400 text-xs">
                                        {dateDisplay.monthsAway > 0
                                            ? `${dateDisplay.monthsAway} month${dateDisplay.monthsAway !== 1 ? 's' : ''} from now`
                                            : `${dateDisplay.weeksAway} week${dateDisplay.weeksAway !== 1 ? 's' : ''} from now`
                                        }
                                        {' · '}{dateDisplay.daysAway} days
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="material-symbols-outlined text-[16px]" style={{ color: insightAccent }}>check_circle</span>
                                <p className="text-sm text-slate-300">
                                    We&apos;ll create a plan tailored to this timeline
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
