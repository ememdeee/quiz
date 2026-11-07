"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { NAV_LINKS } from "./content";

type Indicator = { left: number; width: number; visible: boolean };

export default function SiteNavbar({ quizUrl }: { quizUrl: string }) {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [indicator, setIndicator] = useState<Indicator>({ left: 0, width: 0, visible: false });
    const progressRef = useRef<HTMLDivElement>(null);
    const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

    // Compact state + scroll progress line (rAF-throttled, writes straight to the DOM)
    useEffect(() => {
        let raf = 0;
        const update = () => {
            raf = 0;
            const y = window.scrollY;
            setScrolled(y > 24);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            if (progressRef.current) {
                progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
            }
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    // Scrollspy: the nav section crossing the middle band of the viewport is
    // "active"; none while the band is over a section without a nav link
    useEffect(() => {
        const inBand = new Set<string>();
        const io = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) inBand.add(entry.target.id);
                    else inBand.delete(entry.target.id);
                }
                setActive(NAV_LINKS.find((l) => inBand.has(l.id))?.id ?? null);
            },
            { rootMargin: "-45% 0px -50% 0px" }
        );
        NAV_LINKS.forEach((l) => {
            const el = document.getElementById(l.id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, []);

    // Lime pill follows the hovered link, else the active section's link
    const target = hovered ?? active;
    useLayoutEffect(() => {
        const el = target ? linkRefs.current[target] : null;
        if (!el) {
            setIndicator((prev) => ({ ...prev, visible: false }));
            return;
        }
        setIndicator({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    }, [target]);

    // Mobile menu: lock scroll + close on Escape
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const close = useCallback(() => setOpen(false), []);

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-3 md:px-6 pt-3 md:pt-4">
            <nav
                aria-label="Main"
                className={`relative mx-auto flex items-center justify-between rounded-full transition-[max-width,background-color,box-shadow,padding,border-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] border ${scrolled && !open
                    ? "max-w-5xl bg-white/85 backdrop-blur-xl border-[#0F4D3A]/10 shadow-[0_10px_40px_-12px_rgba(15,77,58,0.25)] pl-3 pr-2 py-2"
                    : "max-w-7xl bg-transparent border-transparent pl-2 pr-1 py-3"
                    }`}
            >
                {/* Logo */}
                <Link
                    href="/"
                    onClick={close}
                    className={`group relative z-[60] flex items-center gap-2.5 font-black uppercase tracking-tighter text-lg md:text-xl transition-colors duration-500 ${open ? "text-[#DFF3EC]" : "text-[#0F4D3A]"}`}
                >
                    <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-[#0F4D3A]/10 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[360deg]">
                        <Image src="/logo/logo-180.png" alt="" width={26} height={26} priority />
                    </span>
                    <span>
                        <span className={open ? "text-[#C9F84B]" : "text-[#155F4A]"}>Quiz</span>                    </span>
                </Link>

                {/* Desktop links */}
                <div
                    className="relative hidden lg:flex items-center"
                    onMouseLeave={() => setHovered(null)}
                >
                    <span
                        aria-hidden
                        className="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-[#C9F84B] transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                        style={{ left: indicator.left, width: indicator.width, opacity: indicator.visible ? 1 : 0 }}
                    />
                    {NAV_LINKS.map((link) => (
                        <a
                            key={link.id}
                            ref={(el) => {
                                linkRefs.current[link.id] = el;
                            }}
                            href={`#${link.id}`}
                            onMouseEnter={() => setHovered(link.id)}
                            onFocus={() => setHovered(link.id)}
                            onBlur={() => setHovered(null)}
                            aria-current={active === link.id ? "true" : undefined}
                            className="relative z-10 px-4 py-2 text-[13px] font-bold uppercase tracking-[0.14em] text-[#155F4A] transition-colors hover:text-[#0F4D3A] aria-[current=true]:text-[#0F4D3A] focus-visible:outline-none"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                {/* Desktop CTA */}
                <div className="hidden lg:block">
                    <MagneticButton href={quizUrl} size="md">
                        Take the Quiz
                    </MagneticButton>
                </div>

                {/* Mobile toggle */}
                <button
                    type="button"
                    aria-expanded={open}
                    aria-controls="hn-mobile-menu"
                    aria-label={open ? "Close menu" : "Open menu"}
                    onClick={() => setOpen((o) => !o)}
                    className={`hn-burger lg:hidden relative z-[60] h-11 w-11 rounded-full transition-colors duration-500 ${open ? "bg-[#C9F84B] text-[#0F4D3A]" : "bg-[#0F4D3A] text-white"}`}
                >
                    <span />
                    <span />
                </button>

                {/* Scroll progress */}
                <div
                    aria-hidden
                    className={`absolute inset-x-6 -bottom-px h-[2px] overflow-hidden rounded-full transition-opacity duration-500 ${scrolled && !open ? "opacity-100" : "opacity-0"}`}
                >
                    <div
                        ref={progressRef}
                        className="h-full w-full origin-left bg-gradient-to-r from-[#3E8F7A] to-[#C9F84B]"
                        style={{ transform: "scaleX(0)" }}
                    />
                </div>
            </nav>

            {/* Mobile menu — circular reveal from the toggle button */}
            <div
                id="hn-mobile-menu"
                data-open={open}
                className="hn-menu lg:hidden fixed inset-0 z-[55] flex flex-col overflow-y-auto overscroll-contain bg-[#0F4D3A] px-6 pt-28 pb-10"
            >
                <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(201,248,75,0.35),transparent_65%)]" />
                <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(62,143,122,0.5),transparent_65%)]" />

                <ul className="relative flex flex-col gap-1">
                    {NAV_LINKS.map((link, i) => (
                        <li key={link.id} data-stagger style={{ "--i": i } as React.CSSProperties}>
                            <a
                                href={`#${link.id}`}
                                onClick={close}
                                tabIndex={open ? 0 : -1}
                                className="group flex items-center justify-between border-b border-white/10 py-4 text-4xl font-black uppercase tracking-tighter text-[#DFF3EC] transition-colors active:text-[#C9F84B]"
                            >
                                <span className="flex items-baseline gap-3">
                                    <span className="text-xs font-bold tracking-widest text-[#C9F84B]">0{i + 1}</span>
                                    {link.label}
                                </span>
                                <ArrowUpRight className="text-[#C9F84B] transition-transform group-active:rotate-45" size={28} />
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="relative mt-auto pt-10" data-stagger style={{ "--i": NAV_LINKS.length } as React.CSSProperties}>
                    <p className="mb-4 text-sm text-[#DFF3EC]/70">
                        Answer a few questions and get a plan built around your body.
                    </p>
                    <MagneticButton href={quizUrl} variant="lime" size="lg" className="w-full" onClick={close}>
                        Take the Free Quiz
                    </MagneticButton>
                </div>
            </div>
        </header>
    );
}
