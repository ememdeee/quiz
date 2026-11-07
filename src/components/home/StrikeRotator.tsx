"use client";

import { useEffect, useState } from "react";

/**
 * Cycles through phrases; each one slides in and gets a lime line drawn
 * through it (timing lives in `.hn-strike` keyframes). All phrases share one
 * grid cell, so the box is as wide as the longest and never reflows.
 */
export default function StrikeRotator({ words, interval = 2800 }: { words: string[]; interval?: number }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const id = window.setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
        return () => window.clearInterval(id);
    }, [words.length, interval]);

    return (
        <>
            <span className="sr-only">{words.join(", ")}</span>
            <span className="hn-strike" aria-hidden>
                {words.map((word, i) => (
                    <span key={word} className={i === index ? "is-active" : undefined}>
                        {word}
                    </span>
                ))}
            </span>
        </>
    );
}
