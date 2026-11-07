"use client";

import { useState } from "react";
import { BatteryLow, Check, Clock, Cookie, Footprints, HeartPulse, RotateCcw, Shirt, Target } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { PAINS, type PainIcon } from "./content";

const ICONS: Record<PainIcon, typeof Target> = {
    rotate: RotateCcw,
    target: Target,
    battery: BatteryLow,
    clock: Clock,
    heart: HeartPulse,
    cookie: Cookie,
    shirt: Shirt,
    footprints: Footprints,
};

// 8 particles flying out in a ring when a card is ticked
const BURST = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return { "--bx": `${Math.round(Math.cos(a) * 38)}px`, "--by": `${Math.round(Math.sin(a) * 38)}px` } as React.CSSProperties;
});

const RING = 2 * Math.PI * 52;

function verdict(count: number) {
    if (count === 0) return "Tap what feels like you — we'll show you what's really going on.";
    if (count <= 2) return "That's more common after 40 than you'd think — and it's fixable.";
    if (count <= 5) return "Classic signs your body needs a different approach — not more restriction.";
    return "Your body isn't broken. It's been getting the wrong advice.";
}

/**
 * "Sound familiar?" — a quick, self-contained warm-up before the quiz. Purely
 * local state: nothing is stored or sent, and the quiz itself is untouched.
 */
export default function PainPicker({ quizUrl }: { quizUrl: string }) {
    const [selected, setSelected] = useState<string[]>([]);
    const [lastOn, setLastOn] = useState<string | null>(null);
    const [pulse, setPulse] = useState<{ id: string; n: number } | null>(null);

    const toggle = (id: string) => {
        const on = !selected.includes(id);
        setSelected((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));
        setPulse((p) => ({ id, n: (p?.n ?? 0) + 1 }));
        if (on) setLastOn(id);
        else if (lastOn === id) setLastOn(selected.filter((x) => x !== id).at(-1) ?? null);
    };

    const count = selected.length;
    const insight = PAINS.find((p) => p.id === lastOn);
    const InsightIcon = insight ? ICONS[insight.icon] : null;

    return (
        <section id="check" className="relative px-4 py-20 md:px-6 md:py-28">
            <div className="mx-auto grid max-w-7xl gap-8 rounded-[2.5rem] bg-white p-6 shadow-[0_40px_80px_-40px_rgba(15,77,58,0.35)] ring-1 ring-[#0F4D3A]/5 sm:p-10 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-8 lg:p-14">
                {/* Heading */}
                <div className="lg:col-span-5 lg:row-start-1">
                    <span data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E8F7A]">
                        30-second gut check
                    </span>
                    <h2 data-reveal="lines" className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-6xl">
                        <span className="hn-line">
                            <span>Sound</span>
                        </span>
                        <span className="hn-line">
                            <span className="hn-serif text-[1.08em] lowercase text-[#3E8F7A]" style={{ "--d": "120ms" } as React.CSSProperties}>
                                familiar?
                            </span>
                        </span>
                    </h2>
                    <p data-reveal className="mt-5 max-w-md text-lg text-[#155F4A]" style={{ "--d": "150ms" } as React.CSSProperties}>
                        Tap everything that feels like you. Nothing is saved — it&apos;s just a quick check before your quiz.
                    </p>
                </div>

                {/* Cards */}
                <ul className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:content-stretch lg:gap-4">
                    {PAINS.map((pain, i) => {
                        const on = selected.includes(pain.id);
                        const Icon = ICONS[pain.icon];
                        const popping = pulse?.id === pain.id;
                        return (
                            <li key={pain.id} data-reveal style={{ "--d": `${(i % 2) * 80 + Math.floor(i / 2) * 60}ms` } as React.CSSProperties}>
                                <button
                                    type="button"
                                    aria-pressed={on}
                                    onClick={() => toggle(pain.id)}
                                    className={`group relative flex h-full w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition-[background-color,border-color,color,box-shadow,translate] duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#C9F84B]/70 md:p-5 ${on
                                        ? "border-[#0F4D3A] bg-[#0F4D3A] text-white shadow-[0_18px_30px_-16px_rgba(15,77,58,0.7)]"
                                        : "border-[#0F4D3A]/10 bg-[#F6FBF9] text-[#0F4D3A] hover:-translate-y-0.5 hover:border-[#0F4D3A]/40 hover:bg-white"
                                        }`}
                                >
                                    <span
                                        key={popping ? `icon-${pulse.n}` : "icon"}
                                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors ${popping ? "hn-pop" : ""} ${on ? "bg-[#C9F84B] text-[#0F4D3A]" : "bg-[#DFF3EC] text-[#0F4D3A] group-hover:bg-[#C9F84B]"}`}
                                    >
                                        <Icon size={20} />
                                    </span>
                                    <span className="flex-1 text-[15px] font-bold leading-snug md:text-base">{pain.label}</span>
                                    <span
                                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${on ? "scale-100 border-[#C9F84B] bg-[#C9F84B] text-[#0F4D3A]" : "scale-90 border-[#0F4D3A]/20 text-transparent"}`}
                                    >
                                        <Check size={14} strokeWidth={3.5} />
                                    </span>
                                    {popping && on && (
                                        <span key={`burst-${pulse.n}`} className="hn-burst" style={{ "--ox": "2.6rem" } as React.CSSProperties} aria-hidden>
                                            {BURST.map((style, k) => (
                                                <i key={k} style={style} />
                                            ))}
                                        </span>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Live result — under the heading on desktop, after the cards on mobile */}
                <div
                    data-reveal
                    className="flex flex-col self-start rounded-3xl bg-[#0F4D3A] p-6 text-[#DFF3EC] md:p-7 lg:col-span-5 lg:row-start-2"
                    style={{ "--d": "250ms" } as React.CSSProperties}
                    aria-live="polite"
                >
                    <div className="flex items-center gap-5">
                        <div className="relative h-24 w-24 shrink-0">
                            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
                                <circle cx="60" cy="60" r="52" fill="none" stroke="#DFF3EC" strokeOpacity="0.12" strokeWidth="10" />
                                <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="none"
                                    stroke="#C9F84B"
                                    strokeWidth="10"
                                    strokeLinecap="round"
                                    strokeDasharray={RING}
                                    strokeDashoffset={RING * (1 - count / PAINS.length)}
                                    style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)" }}
                                />
                            </svg>
                            <div className="absolute inset-0 grid place-items-center text-center">
                                <span>
                                    <span key={count} className="hn-swap-in block text-3xl font-black leading-none text-white">
                                        {count}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFF3EC]/60">
                                        of {PAINS.length}
                                    </span>
                                </span>
                            </div>
                        </div>
                        <p key={verdict(count)} className="hn-swap-in text-lg font-bold leading-snug text-white md:text-xl">
                            {verdict(count)}
                        </p>
                    </div>

                    <div className="mt-5 min-h-[4.5rem]">
                        {insight && InsightIcon && (
                            <p key={insight.id} className="hn-swap-in flex gap-3 rounded-2xl bg-white/[0.07] p-4 text-sm leading-relaxed text-[#DFF3EC]/85">
                                <InsightIcon size={18} className="mt-0.5 shrink-0 text-[#C9F84B]" />
                                {insight.insight}
                            </p>
                        )}
                    </div>

                    <MagneticButton href={quizUrl} variant="lime" size="lg" className="mt-6 w-full">
                        {count > 0 ? "Get my reset plan" : "Take the Free Quiz"}
                    </MagneticButton>
                </div>
            </div>
        </section>
    );
}
