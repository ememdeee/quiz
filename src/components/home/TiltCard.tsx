"use client";

import { useRef } from "react";

/** Card that tilts toward the cursor with a lime spotlight under it (mouse only). */
export default function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);

    const onPointerMove = (e: React.PointerEvent) => {
        const el = ref.current;
        if (e.pointerType !== "mouse" || !el) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--ry", `${((x - 0.5) * 10).toFixed(2)}deg`);
        el.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
        el.style.setProperty("--px", `${(x * 100).toFixed(1)}%`);
        el.style.setProperty("--py", `${(y * 100).toFixed(1)}%`);
    };
    const onPointerLeave = () => {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
    };

    return (
        <div ref={ref} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} className={`hn-tilt ${className}`}>
            {children}
        </div>
    );
}
