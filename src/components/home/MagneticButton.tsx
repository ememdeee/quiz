"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const VARIANTS = {
    dark: {
        button: "bg-[#0F4D3A] text-white shadow-[0_18px_40px_-12px_rgba(15,77,58,0.55)] hover:bg-[#155F4A]",
        arrow: "bg-[#C9F84B] text-[#0F4D3A]",
    },
    lime: {
        button: "bg-[#C9F84B] text-[#0F4D3A] shadow-[0_0_50px_rgba(201,248,75,0.35)] hover:bg-white",
        arrow: "bg-[#0F4D3A] text-[#C9F84B]",
    },
} as const;

const SIZES = {
    md: { button: "pl-6 pr-2 py-2 text-sm gap-3", arrow: "h-9 w-9", icon: 18 },
    lg: { button: "pl-6 md:pl-7 pr-2.5 py-2.5 text-[15px] md:text-lg gap-4", arrow: "h-11 w-11 md:h-12 md:w-12", icon: 20 },
    xl: { button: "pl-8 md:pl-10 pr-3 py-3 text-lg md:text-2xl gap-5", arrow: "h-12 w-12 md:h-16 md:w-16", icon: 24 },
} as const;

/**
 * Pill CTA that leans toward the cursor, with a looping shine sweep and an
 * arrow that slides out/in on hover. Renders a next/link, so the quiz route
 * is prefetched when the button scrolls into view.
 */
export default function MagneticButton({
    href,
    children,
    variant = "dark",
    size = "lg",
    className = "",
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    variant?: keyof typeof VARIANTS;
    size?: keyof typeof SIZES;
    className?: string;
    onClick?: () => void;
}) {
    const ref = useRef<HTMLAnchorElement>(null);
    const v = VARIANTS[variant];
    const s = SIZES[size];

    const onPointerMove = (e: React.PointerEvent) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const x = e.clientX - (r.left + r.width / 2);
        const y = e.clientY - (r.top + r.height / 2);
        ref.current.style.setProperty("--tx", `${(x * 0.25).toFixed(1)}px`);
        ref.current.style.setProperty("--ty", `${(y * 0.35).toFixed(1)}px`);
    };
    const onPointerLeave = () => {
        ref.current?.style.setProperty("--tx", "0px");
        ref.current?.style.setProperty("--ty", "0px");
    };

    return (
        <Link
            ref={ref}
            href={href}
            onClick={onClick}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={`group hn-magnet hn-shine inline-flex items-center justify-between rounded-full font-black uppercase tracking-wide active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9F84B]/60 ${v.button} ${s.button} ${className}`}
        >
            <span className="whitespace-nowrap">{children}</span>
            <span className={`hn-arrow shrink-0 rounded-full ${v.arrow} ${s.arrow}`} aria-hidden>
                <ArrowRight size={s.icon} strokeWidth={2.6} />
                <ArrowRight size={s.icon} strokeWidth={2.6} />
            </span>
        </Link>
    );
}
