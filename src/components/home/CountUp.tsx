"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts from `from` to `to` (up or down) the first time it scrolls into view.
 * Server HTML shows the final value; it only rewinds to `from` when the number
 * is still below the fold, so nothing visible ever jumps backwards.
 */
export default function CountUp({
    from,
    to,
    suffix = "",
    duration = 1800,
}: {
    from: number;
    to: number;
    suffix?: string;
    duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [value, setValue] = useState(to);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        if (el.getBoundingClientRect().top < window.innerHeight) return;

        setValue(from);
        let raf = 0;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                const start = performance.now();
                const step = (now: number) => {
                    const t = Math.min(1, (now - start) / duration);
                    const eased = 1 - Math.pow(1 - t, 4);
                    setValue(Math.round(from + (to - from) * eased));
                    if (t < 1) raf = requestAnimationFrame(step);
                };
                raf = requestAnimationFrame(step);
            },
            { threshold: 0.6 }
        );
        io.observe(el);
        return () => {
            io.disconnect();
            cancelAnimationFrame(raf);
        };
    }, [from, to, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {value}
            {suffix}
        </span>
    );
}
