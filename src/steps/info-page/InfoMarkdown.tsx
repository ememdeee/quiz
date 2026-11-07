"use client";

import React from "react";
import ReactMarkdown from "react-markdown";

// The only react-markdown consumer in the taker bundle — loaded via
// next/dynamic from InfoStep (and warmed at idle by QuizPageClient) so the
// markdown pipeline stays out of the route's first-load JS.

/** Markdown components for normal (non-card) text */
const normalComponents = {
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-3 last:mb-0">{children}</p>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="space-y-2 mb-3 last:mb-0 ml-0.5">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside space-y-1.5 mb-3 last:mb-0 ml-1">{children}</ol>,
    li: ({ children }: { children?: React.ReactNode }) => (
        <li className="flex items-start gap-2.5 text-[15px] leading-relaxed list-none">
            <span className="w-2 h-2 rounded-full bg-quiz-primary mt-[7px] shrink-0"></span>
            <span>{children}</span>
        </li>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
    h2: ({ children }: { children?: React.ReactNode }) => <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">{children}</h2>,
    h3: ({ children }: { children?: React.ReactNode }) => <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1.5">{children}</h3>,
};

/** Markdown components for card content — lists show check icons */
const cardComponents = {
    p: ({ children }: { children?: React.ReactNode }) => <p className="mb-2 last:mb-0">{children}</p>,
    ul: ({ children }: { children?: React.ReactNode }) => <ul className="space-y-2 mb-2 last:mb-0">{children}</ul>,
    ol: ({ children }: { children?: React.ReactNode }) => <ol className="list-decimal list-inside space-y-1.5 mb-2 last:mb-0">{children}</ol>,
    li: ({ children }: { children?: React.ReactNode }) => (
        <li className="flex items-start gap-2.5 text-[15px] leading-relaxed list-none">
            <span className="material-symbols-outlined text-[18px] text-quiz-primary mt-[2px] shrink-0">check_circle</span>
            <span>{children}</span>
        </li>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>,
    em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
};

interface InfoMarkdownProps {
    content: string;
    variant: 'normal' | 'card';
}

export default function InfoMarkdown({ content, variant }: InfoMarkdownProps) {
    return (
        <ReactMarkdown components={variant === 'card' ? cardComponents : normalComponents}>
            {content}
        </ReactMarkdown>
    );
}
