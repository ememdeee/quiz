"use client";

import React from "react";
import type { BaseStepContent } from "@/types/quiz";

interface StepHeaderProps {
    /** The content object — reads question, title, subtitle, textAlign */
    content: BaseStepContent;
    /** Explicit heading text — overrides content.question/title lookup */
    heading?: string;
    /** Optional icon name (Material Symbols), rendered above the title */
    icon?: string;
    /** Fallback subtitle text when no subtitle is set */
    fallbackSubtitle?: string;
    /** Additional className for the title h1 */
    titleClassName?: string;
    /** Additional className for the subtitle p */
    subtitleClassName?: string;
    /** Bottom margin class, defaults to "mb-4" */
    subtitleMargin?: string;
}

/**
 * Shared step header renderer.
 * Renders icon (optional) + question/title + subtitle with textAlign support.
 * Used by MultipleChoiceStep, CheckboxStep, ImageOptionsStep, InfoStep, etc.
 */
export function StepHeader({
    content,
    heading: headingProp,
    icon,
    fallbackSubtitle,
    titleClassName = '',
    subtitleClassName = '',
    subtitleMargin = 'mb-4',
}: StepHeaderProps) {
    const alignClass = content.textAlign === 'left' ? 'text-left' : content.textAlign === 'right' ? 'text-right' : 'text-center';
    const iconJustify = content.textAlign === 'right' ? 'justify-end' : content.textAlign === 'left' ? 'justify-start' : 'justify-center';
    const heading = headingProp ?? content.question ?? content.title ?? '';
    const subtitle = content.subtitle || fallbackSubtitle || '';

    return (
        <>
            {/* Icon */}
            {icon && (
                <div className={`mb-4 flex ${iconJustify}`}>
                    <div className="h-14 w-14 rounded-2xl bg-quiz-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[28px] text-quiz-primary">
                            {icon}
                        </span>
                    </div>
                </div>
            )}

            {/* Title / Question */}
            {heading && (
                <h1 className={`text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white ${subtitle ? 'mb-2' : subtitleMargin} leading-tight ${alignClass} ${titleClassName}`}>
                    {heading}
                </h1>
            )}

            {/* Subtitle */}
            {subtitle && (
                <p className={`text-slate-500 dark:text-slate-400 ${subtitleMargin} leading-relaxed ${alignClass} ${subtitleClassName}`}>
                    {subtitle}
                </p>
            )}
        </>
    );
}
