"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHASES } from "./content";

/**
 * Desktop: phases scroll on the left while a sticky photo stage on the right
 * crossfades to the active phase and a rail fills with scroll progress.
 * Mobile: plain stacked cards (no sticky), each with its own photo.
 */
export default function HowItWorks() {
    const [active, setActive] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const railRef = useRef<HTMLDivElement>(null);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
                }
            },
            { rootMargin: "-48% 0px -48% 0px" }
        );
        stepRefs.current.forEach((el) => el && io.observe(el));

        let raf = 0;
        const update = () => {
            raf = 0;
            const list = listRef.current;
            const rail = railRef.current;
            if (!list || !rail) return;
            const r = list.getBoundingClientRect();
            const p = (window.innerHeight / 2 - r.top) / r.height;
            rail.style.transform = `scaleY(${Math.min(1, Math.max(0, p)).toFixed(4)})`;
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            io.disconnect();
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    const phase = PHASES[active];

    return (
        <section id="how" data-loop className="relative py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-6">
                <div className="max-w-3xl">
                    <span data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E8F7A]">
                        How it works
                    </span>
                    <h2 data-reveal="lines" className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                        <span className="hn-line">
                            <span>Your reset in</span>
                        </span>
                        <span className="hn-line">
                            <span style={{ "--d": "100ms" } as React.CSSProperties}>
                                <span className="hn-serif text-[1.05em] lowercase text-[#3E8F7A]">four simple</span> phases
                            </span>
                        </span>
                    </h2>
                    <p data-reveal className="mt-6 max-w-xl text-lg text-[#155F4A] md:text-xl" style={{ "--d": "150ms" } as React.CSSProperties}>
                        No extremes, no guesswork. Each phase builds on the last, so your body keeps responding.
                    </p>
                </div>

                <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-2 lg:gap-20">
                    {/* Phase list */}
                    <div ref={listRef} className="relative">
                        <div aria-hidden className="absolute bottom-0 left-[27px] top-0 hidden w-[2px] rounded-full bg-[#0F4D3A]/10 lg:block">
                            <div ref={railRef} className="h-full w-full origin-top rounded-full bg-gradient-to-b from-[#3E8F7A] to-[#0F4D3A]" style={{ transform: "scaleY(0)" }} />
                        </div>

                        {PHASES.map((p, i) => {
                            const isActive = active === i;
                            return (
                                <div
                                    key={p.n}
                                    ref={(el) => {
                                        stepRefs.current[i] = el;
                                    }}
                                    data-index={i}
                                    data-reveal
                                    className="relative flex items-center py-6 lg:min-h-[64vh] lg:py-0"
                                >
                                    <article
                                        className={`w-full rounded-[2rem] bg-white p-5 shadow-[0_30px_60px_-40px_rgba(15,77,58,0.45)] transition-opacity duration-700 lg:bg-transparent lg:p-0 lg:pl-24 lg:shadow-none ${isActive ? "lg:opacity-100" : "lg:opacity-30"}`}
                                    >
                                        {/* Rail node */}
                                        <span
                                            aria-hidden
                                            className={`absolute left-0 top-1/2 hidden h-14 w-14 -translate-y-1/2 place-items-center rounded-full border-2 text-sm font-black transition-all duration-500 lg:grid ${isActive
                                                ? "scale-110 border-[#0F4D3A] bg-[#C9F84B] text-[#0F4D3A] shadow-[0_0_0_8px_rgba(201,248,75,0.25)]"
                                                : i < active
                                                    ? "border-[#0F4D3A] bg-[#0F4D3A] text-[#C9F84B]"
                                                    : "border-[#0F4D3A]/15 bg-[#DFF3EC] text-[#0F4D3A]/50"
                                                }`}
                                        >
                                            {p.n}
                                        </span>

                                        {/* Mobile photo */}
                                        <div className="relative mb-6 aspect-[5/4] overflow-hidden rounded-3xl lg:hidden">
                                            <Image
                                                src={p.image}
                                                alt={p.alt}
                                                fill
                                                sizes="(min-width: 640px) 90vw, 100vw"
                                                className="object-cover"
                                                style={{ objectPosition: p.focus }}
                                            />
                                            <span className="absolute left-4 top-4 rounded-full bg-[#C9F84B] px-3 py-1 text-xs font-black text-[#0F4D3A]">
                                                Phase {p.n}
                                            </span>
                                        </div>

                                        <span className="inline-block rounded-full border border-[#0F4D3A]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#3E8F7A]">
                                            {p.tag}
                                        </span>
                                        <h3 className="mt-4 text-4xl font-black uppercase leading-[0.92] tracking-tighter md:text-5xl">{p.title}</h3>
                                        <p className="mt-4 max-w-md text-lg leading-relaxed text-[#155F4A]">{p.body}</p>
                                    </article>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sticky stage */}
                    <div className="hidden lg:block">
                        <div className="sticky top-[14vh] h-[72vh]">
                            <div className="relative h-full overflow-hidden rounded-[2.5rem] bg-[#0F4D3A] shadow-[0_50px_100px_-40px_rgba(15,77,58,0.6)]">
                                {PHASES.map((p, i) => (
                                    <Image
                                        key={p.n}
                                        src={p.image}
                                        alt={active === i ? p.alt : ""}
                                        fill
                                        sizes="(min-width: 1280px) 600px, 45vw"
                                        data-active={active === i}
                                        className="hn-phase-img object-cover"
                                        style={{ objectPosition: p.focus }}
                                    />
                                ))}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A3326]/85 via-[#0A3326]/10 to-transparent" />

                                {/* Segmented progress */}
                                <div className="absolute inset-x-6 top-6 flex gap-2">
                                    {PHASES.map((p, i) => (
                                        <span key={p.n} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25">
                                            <span
                                                className="block h-full w-full origin-left rounded-full bg-[#C9F84B] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                                style={{ transform: `scaleX(${i <= active ? 1 : 0})` }}
                                            />
                                        </span>
                                    ))}
                                </div>

                                {/* Spinning badge */}
                                <span aria-hidden className="absolute right-6 top-12 h-24 w-24 rounded-full bg-[#0A3326]/55" />
                                <svg aria-hidden viewBox="0 0 100 100" className="hn-spin absolute right-6 top-12 h-24 w-24" style={{ "--dur": "14s" } as React.CSSProperties}>
                                    <defs>
                                        <path id="hn-badge-path" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
                                    </defs>
                                    <text fill="#DFF3EC" fontSize="10.5" fontWeight="800" letterSpacing="2.4">
                                        <textPath href="#hn-badge-path">BODY RESET • BODY RESET •</textPath>
                                    </text>
                                    <circle cx="50" cy="50" r="6" fill="#C9F84B" />
                                </svg>

                                {/* Caption */}
                                <div className="absolute inset-x-8 bottom-8 text-white">
                                    <div key={phase.n} className="hn-swap-in flex items-end justify-between gap-6">
                                        <div>
                                            <span className="rounded-full bg-[#C9F84B] px-3 py-1 text-xs font-black uppercase tracking-wider text-[#0F4D3A]">
                                                Phase {phase.n}
                                            </span>
                                            <p className="mt-3 text-4xl font-black uppercase leading-none tracking-tighter">{phase.title}</p>
                                        </div>
                                        <p className="text-7xl font-black leading-none tracking-tighter text-white/20">
                                            {phase.n}
                                            <span className="text-3xl">/0{PHASES.length}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
