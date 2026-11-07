"use client";

import React from "react";
import type { Step, InfoPageContent } from "@/types/quiz";

import { StepHeader } from "@/components/quiz/steps/StepHeader";
import { StepImage } from "@/components/quiz/steps/StepImage";
import { createWarmLazy } from "@/lib/lazyWarm";

// Code-split: keeps react-markdown out of the route's first-load JS.
// QuizPageClient calls preloadInfoMarkdown() right after hydration, so the
// warmed module renders synchronously on mount (see lazyWarm.tsx for why
// next/dynamic is not used here).
const InfoMarkdown = createWarmLazy(() => import("./InfoMarkdown"));
export const preloadInfoMarkdown = InfoMarkdown.preload;

interface InfoStepProps {
    step: Step;
    onAnswer?: (value: unknown) => void;
}

/**
 * Parse description text, splitting by {{ }} card blocks.
 * Returns an array of segments: { type: 'text' | 'card', content: string }
 */
function parseCardBlocks(text: string): { type: 'text' | 'card'; content: string }[] {
    const segments: { type: 'text' | 'card'; content: string }[] = [];
    const regex = /\{\{([\s\S]*?)\}\}/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
        // Text before the card block
        if (match.index > lastIndex) {
            const before = text.slice(lastIndex, match.index).trim();
            if (before) segments.push({ type: 'text', content: before });
        }
        // Card block content
        segments.push({ type: 'card', content: match[1].trim() });
        lastIndex = match.index + match[0].length;
    }

    // Remaining text after last card
    if (lastIndex < text.length) {
        const remaining = text.slice(lastIndex).trim();
        if (remaining) segments.push({ type: 'text', content: remaining });
    }

    return segments;
}

export function InfoStep({ step }: InfoStepProps) {
    const content = step.content as InfoPageContent;
    const imagePosition = content.imagePosition || 'above';

    const segments = content.description ? parseCardBlocks(content.description) : [];

    return (
        <div className="flex-1 w-full flex flex-col">
            <div className="px-6 pt-8 pb-4">
                {/* Image above */}
                {imagePosition === 'above' && (
                    <StepImage
                        src={content.image}
                        imageFit={content.imageFit}
                        coverMaxHeight="max-h-56"
                        wrapperClassName="w-full rounded-2xl overflow-hidden mb-5"
                    />
                )}

                {/* StepHeader: icon + title + subtitle */}
                <StepHeader
                    content={content}
                    heading={content.title}
                    icon={content.icon}
                    subtitleClassName="text-base font-medium"
                />

                {/* Description — rendered as Markdown with card blocks */}
                {segments.length > 0 && (
                    <div className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed space-y-4">
                        {segments.map((segment, index) => {
                            if (segment.type === 'card') {
                                return (
                                    <div
                                        key={index}
                                        className="rounded-2xl border border-quiz-primary/30 bg-quiz-primary/5 dark:bg-quiz-primary/[0.07] p-5"
                                    >
                                        <InfoMarkdown variant="card" content={segment.content} />
                                    </div>
                                );
                            }
                            return (
                                <div key={index}>
                                    <InfoMarkdown variant="normal" content={segment.content} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Image below */}
                {imagePosition === 'below' && (
                    <div className="mt-5">
                        <StepImage
                            src={content.image}
                            imageFit={content.imageFit}
                            coverMaxHeight="max-h-56"
                            wrapperClassName="w-full rounded-2xl overflow-hidden mb-5"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}


