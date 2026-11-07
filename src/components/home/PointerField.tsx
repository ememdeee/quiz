"use client";

import { useEffect, useRef } from "react";

/**
 * Wrapper that exposes the pointer position to CSS as custom properties:
 * --mx/--my (-1..1 from the center) for `.hn-par` parallax layers and
 * --cx/--cy (px) for `.hn-cursor-glow`. Children can stay server-rendered.
 * Fine pointers only — touch devices get the static layout.
 */
export default function PointerField({
    children,
    className = "",
    id,
}: {
    children: React.ReactNode;
    className?: string;
    id?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!window.matchMedia("(pointer: fine)").matches) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let raf = 0;
        let px = 0;
        let py = 0;
        const apply = () => {
            raf = 0;
            const r = el.getBoundingClientRect();
            const x = px - r.left;
            const y = py - r.top;
            el.style.setProperty("--mx", ((x / r.width) * 2 - 1).toFixed(3));
            el.style.setProperty("--my", ((y / r.height) * 2 - 1).toFixed(3));
            el.style.setProperty("--cx", `${x.toFixed(0)}px`);
            el.style.setProperty("--cy", `${y.toFixed(0)}px`);
        };
        const onMove = (e: PointerEvent) => {
            px = e.clientX;
            py = e.clientY;
            if (!raf) raf = requestAnimationFrame(apply);
        };
        const onLeave = () => {
            el.style.setProperty("--mx", "0");
            el.style.setProperty("--my", "0");
        };
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
        return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <div ref={ref} id={id} className={className}>
            {children}
        </div>
    );
}
