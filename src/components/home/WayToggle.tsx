"use client";

import { useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { NEW_WAY, OLD_WAY } from "./content";

type Mode = "old" | "new";

/**
 * "Old advice vs Body Reset" switch. Starts on the old advice and flips itself
 * once when it scrolls into view (unless the visitor already touched it).
 */
export default function WayToggle() {
    const [mode, setMode] = useState<Mode>("old");
    const touched = useRef(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        let timer = 0;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                io.disconnect();
                timer = window.setTimeout(() => {
                    if (!touched.current) setMode("new");
                }, 1400);
            },
            { threshold: 0.6 }
        );
        io.observe(el);
        return () => {
            io.disconnect();
            window.clearTimeout(timer);
        };
    }, []);

    const pick = (m: Mode) => {
        touched.current = true;
        setMode(m);
    };

    const isNew = mode === "new";
    const items = isNew ? NEW_WAY : OLD_WAY;

    return (
        <div ref={ref} className="flex h-full flex-col">
            {/* Switch */}
            <div role="tablist" aria-label="Compare approaches" className="relative grid w-full max-w-sm grid-cols-2 rounded-full bg-black/25 p-1.5">
                <span
                    aria-hidden
                    className={`absolute inset-y-1.5 left-1.5 w-[calc(50%-0.375rem)] rounded-full transition-[translate,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isNew ? "translate-x-full bg-[#C9F84B]" : "translate-x-0 bg-white/90"}`}
                />
                {(["old", "new"] as const).map((m) => (
                    <button
                        key={m}
                        type="button"
                        role="tab"
                        aria-selected={mode === m}
                        onClick={() => pick(m)}
                        className={`relative z-10 rounded-full py-2.5 text-xs font-black uppercase tracking-[0.14em] transition-colors duration-300 ${mode === m ? "text-[#0F4D3A]" : "text-[#DFF3EC]/70 hover:text-white"}`}
                    >
                        {m === "old" ? "Old advice" : "Body Reset"}
                    </button>
                ))}
            </div>

            <div className="mt-8 grid flex-1 items-center gap-8 md:grid-cols-2">
                <div>
                    <p key={mode} className="hn-swap-in text-4xl font-black uppercase leading-[0.92] tracking-tighter text-white md:text-5xl">
                        {isNew ? (
                            <>
                                Add more.
                                <br />
                                <span className="text-[#C9F84B]">Stress less.</span>
                            </>
                        ) : (
                            <>
                                Eat less.
                                <br />
                                <span className="text-white/50">Move more.</span>
                            </>
                        )}
                    </p>

                    <ul className="mt-6 space-y-3">
                        {items.map((item, i) => (
                            <li
                                key={`${mode}-${item}`}
                                className="hn-swap-in flex items-center gap-3 text-base font-semibold md:text-lg"
                                style={{ animationDelay: `${i * 70}ms` }}
                            >
                                <span
                                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${isNew ? "bg-[#C9F84B] text-[#0F4D3A]" : "bg-white/10 text-[#FF9C85]"}`}
                                >
                                    {isNew ? <Check size={15} strokeWidth={3.5} /> : <X size={15} strokeWidth={3.5} />}
                                </span>
                                <span className={isNew ? "text-white" : "text-white/60 line-through decoration-[#FF9C85]/70 decoration-2"}>
                                    {item}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Illustrative curve: yo-yo vs steady */}
                <div className="relative rounded-3xl bg-black/20 p-5">
                    <svg viewBox="0 0 240 140" className="h-auto w-full" aria-hidden>
                        {[35, 70, 105].map((y) => (
                            <line key={y} x1="0" x2="240" y1={y} y2={y} stroke="#DFF3EC" strokeOpacity="0.08" />
                        ))}
                        <path
                            key={mode}
                            d={
                                isNew
                                    ? "M6 118 C 50 112, 70 96, 100 84 S 160 52, 190 38 S 225 22, 234 18"
                                    : "M6 70 C 22 30, 38 30, 52 74 S 80 120, 98 62 S 128 18, 146 78 S 176 122, 194 56 S 222 40, 234 86"
                            }
                            fill="none"
                            stroke={isNew ? "#C9F84B" : "#FF9C85"}
                            strokeWidth="4"
                            strokeLinecap="round"
                            pathLength={1}
                            strokeDasharray="1"
                            style={{ animation: "hn-draw 1.4s cubic-bezier(0.16,1,0.3,1) both" }}
                        />
                    </svg>
                    <p key={`l-${mode}`} className="hn-swap-in mt-3 text-xs font-bold uppercase tracking-[0.16em] text-[#DFF3EC]/70">
                        {isNew ? "Steady momentum" : "The yo-yo cycle"}
                    </p>
                </div>
            </div>
        </div>
    );
}
