"use client";

import { useEffect } from "react";

/**
 * Drives every scroll-based effect on the home page from one place, so the
 * sections themselves can stay server components:
 *  - [data-reveal]  → gets `data-in` once it scrolls into view (one shared observer;
 *                     an attribute, not a class, so React re-renders never strip it)
 *  - [data-loop]    → gets `data-paused` while off-screen, pausing its CSS loops
 *  - --hn-vel on <html> → smoothed scroll velocity, used by `.hn-skew`
 * Renders nothing.
 */
export default function MotionDirector() {
    useEffect(() => {
        const html = document.documentElement;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const revealEls = document.querySelectorAll<HTMLElement>("[data-reveal]");
        const reveal = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (!entry.isIntersecting) continue;
                    entry.target.setAttribute("data-in", "");
                    reveal.unobserve(entry.target);
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
        );
        revealEls.forEach((el) => (reduce ? el.setAttribute("data-in", "") : reveal.observe(el)));

        const loops = new IntersectionObserver((entries) => {
            for (const entry of entries) entry.target.toggleAttribute("data-paused", !entry.isIntersecting);
        });
        document.querySelectorAll("[data-loop]").forEach((el) => loops.observe(el));

        let raf = 0;
        let lastY = window.scrollY;
        let vel = 0;
        const tick = () => {
            const y = window.scrollY;
            const target = Math.max(-8, Math.min(8, (y - lastY) * 0.25));
            lastY = y;
            vel += (target - vel) * 0.2;
            if (Math.abs(vel) < 0.02 && target === 0) {
                vel = 0;
                html.style.setProperty("--hn-vel", "0");
                raf = 0;
                return;
            }
            html.style.setProperty("--hn-vel", vel.toFixed(2));
            raf = requestAnimationFrame(tick);
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(tick);
        };
        if (!reduce) window.addEventListener("scroll", onScroll, { passive: true });

        return () => {
            reveal.disconnect();
            loops.disconnect();
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
            html.style.removeProperty("--hn-vel");
        };
    }, []);

    return null;
}
