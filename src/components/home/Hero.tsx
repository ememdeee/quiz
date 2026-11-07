import Image from "next/image";
import { ArrowDown, Check, Flame, Salad, Sparkles } from "lucide-react";
import MagneticButton from "./MagneticButton";
import PointerField from "./PointerField";
import StrikeRotator from "./StrikeRotator";
import { STRIKE_WORDS } from "./content";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

export default function Hero({ quizUrl }: { quizUrl: string }) {
    return (
        <section data-loop className="relative isolate">
            <PointerField className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-20 md:pt-32">
                {/* Background: dot grid, drifting glows, cursor spotlight */}
                <div aria-hidden className="absolute inset-0 -z-10">
                    <div className="hn-dots absolute inset-0 [mask-image:radial-gradient(ellipse_at_70%_45%,black_5%,transparent_70%)]" />
                    <div className="hn-drift absolute -top-48 -left-40 h-[38rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(201,248,75,0.5),transparent_65%)]" />
                    <div
                        className="hn-drift absolute top-1/4 -right-48 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,rgba(62,143,122,0.3),transparent_65%)]"
                        style={{ "--d": "-7s", "--dur": "22s" } as Vars}
                    />
                    <div className="hn-cursor-glow hidden md:block" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#DFF3EC] to-transparent" />
                </div>

                <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-6 lg:grid-cols-12 lg:gap-8">
                    {/* Copy */}
                    <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
                        <p
                            className="hn-load text-base font-semibold text-[#3E8F7A]"
                            style={{ "--d": "50ms" } as Vars}
                        >
                            Body Reset · Boost your metabolism
                        </p>

                        <h1 className="mt-6 text-[clamp(3rem,5.7vw,5.6rem)] font-black uppercase leading-[0.88] tracking-tighter">
                            <span className="hn-load-line">
                                <span style={{ "--d": "120ms" } as Vars}>Simple</span>
                            </span>
                            <span className="hn-load-line">
                                <span className="hn-grad-text" style={{ "--d": "220ms" } as Vars}>
                                    Body Reset
                                </span>
                            </span>
                            <span className="flex flex-wrap items-center justify-center gap-x-[0.22em] lg:justify-start">
                                <span className="hn-load-line">
                                    <span style={{ "--d": "320ms" } as Vars}>for Women</span>
                                </span>
                                <span
                                    className="hn-stamp rounded-[0.22em] bg-[#C9F84B] px-[0.16em] pb-[0.04em] text-[#0F4D3A] shadow-[0_10px_30px_-8px_rgba(201,248,75,0.9)]"
                                    style={{ "--d": "750ms" } as Vars}
                                >
                                    40+
                                </span>
                            </span>
                        </h1>

                        <p
                            className="hn-load mt-7 text-2xl font-bold tracking-tight md:text-[2rem]"
                            style={{ "--d": "520ms" } as Vars}
                        >
                            <span className="hn-serif mr-2 text-[1.15em] text-[#155F4A]">without</span>
                            <span className="inline-block overflow-hidden rounded-full bg-[#0F4D3A] px-4 py-1.5 align-middle text-[#DFF3EC] md:px-5">
                                <StrikeRotator words={STRIKE_WORDS} />
                            </span>
                        </p>

                        <p
                            className="hn-load mt-6 max-w-xl text-lg font-medium leading-relaxed text-[#155F4A] md:text-xl"
                            style={{ "--d": "640ms" } as Vars}
                        >
                            A food-first plan that supports your metabolism and hormones, with short at-home routines
                            that fit real life. Answer a few questions — get a plan built around your body.
                        </p>

                        <div
                            className="hn-load mt-9 flex w-full flex-col items-center gap-5 sm:w-auto sm:flex-row"
                            style={{ "--d": "760ms" } as Vars}
                        >
                            <MagneticButton href={quizUrl} size="lg" className="w-full sm:w-auto">
                                Take the Free Quiz
                            </MagneticButton>
                            <a
                                href="#how"
                                className="group inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.14em] text-[#0F4D3A]"
                            >
                                <span className="grid h-11 w-11 place-items-center rounded-full border border-[#0F4D3A]/20 bg-white/50 transition-colors group-hover:bg-[#C9F84B]">
                                    <ArrowDown size={18} className="transition-transform duration-500 group-hover:translate-y-0.5" />
                                </span>
                                How it works
                            </a>
                        </div>

                        <ul
                            className="hn-load mt-9 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-semibold text-[#155F4A] lg:justify-start"
                            style={{ "--d": "880ms" } as Vars}
                        >
                            {["Free quiz", "Personalized to you", "No equipment needed"].map((t) => (
                                <li key={t} className="flex items-center gap-2">
                                    <span className="grid h-5 w-5 place-items-center rounded-full bg-[#C9F84B] text-[#0F4D3A]">
                                        <Check size={12} strokeWidth={3.5} />
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Visual */}
                    <div className="hn-load lg:col-span-5" style={{ "--d": "300ms" } as Vars}>
                        <HeroVisual />
                    </div>
                </div>

                {/* Scroll cue */}
                <div aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
                    <div className="flex h-10 w-6 justify-center rounded-full border-2 border-[#0F4D3A]/30 pt-2">
                        <div className="h-2.5 w-1 animate-bounce rounded-full bg-[#0F4D3A]" />
                    </div>
                </div>
            </PointerField>
        </section>
    );
}

function HeroVisual() {
    return (
        <div className="relative mx-auto aspect-square w-full max-w-[19rem] sm:max-w-[26rem] lg:max-w-[34rem]">
            {/* Orbit rings */}
            <svg aria-hidden viewBox="0 0 200 200" className="hn-spin absolute -inset-[4%] h-[108%] w-[108%]" style={{ "--dur": "60s" } as Vars}>
                <circle cx="100" cy="100" r="98" fill="none" stroke="#0F4D3A" strokeOpacity="0.2" strokeWidth="0.6" strokeDasharray="1.5 5" />
                <circle cx="100" cy="2" r="2.4" fill="#0F4D3A" />
            </svg>
            <svg aria-hidden viewBox="0 0 200 200" className="hn-spin-rev absolute inset-[5%] h-[90%] w-[90%]" style={{ "--dur": "36s" } as Vars}>
                <circle cx="100" cy="100" r="98" fill="none" stroke="#3E8F7A" strokeOpacity="0.45" strokeWidth="0.8" strokeDasharray="44 16" />
                <circle cx="198" cy="100" r="3" fill="#C9F84B" stroke="#0F4D3A" strokeWidth="0.8" />
            </svg>

            {/* Lime blob */}
            <div className="hn-par absolute inset-[9%]" style={{ "--depth": "-16px" } as Vars}>
                <div className="hn-blob-md h-full w-full bg-gradient-to-br from-[#C9F84B] via-[#A8E86A] to-[#3E8F7A] opacity-90" style={{ "--d": "-4s" } as Vars} />
            </div>

            {/* Photo */}
            <div className="hn-par absolute inset-[15%]" style={{ "--depth": "10px" } as Vars}>
                <div className="hn-blob-md relative h-full w-full overflow-hidden border-[6px] border-white/70 shadow-[0_30px_60px_-20px_rgba(15,77,58,0.55)]">
                    <Image
                        src="/images/body-reset/hero-woman-40-plus.jpg"
                        alt="Confident, smiling woman in her 50s in activewear at home"
                        fill
                        priority
                        sizes="(min-width: 1024px) 24rem, (min-width: 640px) 19rem, 14rem"
                        className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F4D3A]/35 via-transparent to-transparent" />
                </div>
            </div>

            {/* Floating chips */}
            <Chip className="left-0 top-[12%] lg:-left-[8%] lg:top-[8%]" depth="26px" delay="0s">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#C9F84B] text-[#0F4D3A]">
                    <Flame size={18} />
                </span>
                <span className="min-w-[6.5rem]">
                    <span className="block text-xs font-black uppercase tracking-wider">Metabolism</span>
                    <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-[#0F4D3A]/10">
                        <span className="hn-fill block h-full w-full rounded-full bg-gradient-to-r from-[#3E8F7A] to-[#C9F84B]" />
                    </span>
                </span>
            </Chip>

            <Chip className="right-0 -top-[4%] lg:-right-[6%] lg:top-[38%]" depth="34px" delay="-2s">
                <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#0F4D3A]">
                    <svg viewBox="0 0 72 24" className="hn-wave absolute left-0 h-6 w-[72px]" style={{ "--dur": "2.4s" } as Vars} aria-hidden>
                        <path
                            d="M0 12 Q 4.5 2 9 12 T 18 12 T 27 12 T 36 12 T 45 12 T 54 12 T 63 12 T 72 12"
                            fill="none"
                            stroke="#C9F84B"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                        />
                    </svg>
                </span>
                <span>
                    <span className="block text-xs font-black uppercase tracking-wider">Hormone-aware</span>
                    <span className="block text-[11px] font-medium text-[#3E8F7A]">Built for 40+</span>
                </span>
            </Chip>

            <Chip className="bottom-[12%] left-[2%] lg:-left-[4%]" depth="20px" delay="-3.5s">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#DFF3EC] text-[#0F4D3A]">
                    <Salad size={18} />
                </span>
                <span>
                    <span className="block text-xs font-black uppercase tracking-wider">Food-first</span>
                    <span className="block text-[11px] font-medium text-[#3E8F7A]">Add, don&apos;t cut</span>
                </span>
            </Chip>

            <Chip className="bottom-0 right-[6%]" depth="40px" delay="-1s">
                <span className="relative grid h-9 w-9 place-items-center">
                    <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden>
                        <circle cx="28" cy="28" r="24" fill="none" stroke="#0F4D3A" strokeOpacity="0.12" strokeWidth="5" />
                        <circle className="hn-timer" cx="28" cy="28" r="24" fill="none" stroke="#3E8F7A" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                    <Sparkles size={14} className="text-[#0F4D3A]" />
                </span>
                <span>
                    <span className="block text-xs font-black uppercase tracking-wider">Short routines</span>
                    <span className="block text-[11px] font-medium text-[#3E8F7A]">At home, no gym</span>
                </span>
            </Chip>

            {/* Sparkles */}
            {[
                { c: "left-[18%] top-[2%]", d: "0s", s: 18 },
                { c: "right-[14%] top-[14%]", d: "-1.2s", s: 12 },
                { c: "left-[44%] bottom-[2%]", d: "-2.1s", s: 14 },
            ].map((sp) => (
                <svg
                    key={sp.c}
                    aria-hidden
                    viewBox="0 0 24 24"
                    width={sp.s}
                    height={sp.s}
                    className={`hn-twinkle absolute ${sp.c} text-[#0F4D3A]`}
                    style={{ "--d": sp.d } as Vars}
                >
                    <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill="currentColor" />
                </svg>
            ))}
        </div>
    );
}

function Chip({
    children,
    className,
    depth,
    delay,
}: {
    children: React.ReactNode;
    className: string;
    depth: string;
    delay: string;
}) {
    return (
        <div className={`hn-par absolute z-10 ${className}`} style={{ "--depth": depth } as Vars}>
            <div
                className="hn-bob flex items-center gap-2.5 rounded-2xl border border-white bg-white/95 px-2.5 py-2 pr-4 text-[#0F4D3A] shadow-[0_18px_40px_-14px_rgba(15,77,58,0.45)] scale-[0.82] sm:scale-100 origin-center"
                style={{ "--d": delay } as Vars}
            >
                {children}
            </div>
        </div>
    );
}
