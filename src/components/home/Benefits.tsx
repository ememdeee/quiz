import { Apple, Carrot, Cherry, Citrus, Dumbbell, Egg, Fish, Salad, Timer } from "lucide-react";
import TiltCard from "./TiltCard";
import WayToggle from "./WayToggle";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

const ORBIT = [Apple, Carrot, Fish, Egg, Citrus, Cherry];

function Tile({
    title,
    body,
    children,
    delay,
    className = "",
}: {
    title: string;
    body: string;
    children: React.ReactNode;
    delay: number;
    className?: string;
}) {
    return (
        <div data-reveal style={{ "--d": `${delay}ms` } as Vars} className={className}>
            <TiltCard className="h-full rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 transition-colors hover:border-[#C9F84B]/50 md:p-7">
                <div className="relative grid h-32 place-items-center overflow-hidden rounded-2xl bg-black/15">{children}</div>
                <h3 className="mt-6 text-2xl font-black uppercase leading-none tracking-tighter text-white">{title}</h3>
                <p className="mt-2 leading-relaxed text-[#DFF3EC]/70">{body}</p>
            </TiltCard>
        </div>
    );
}

export default function Benefits() {
    return (
        <section id="benefits" data-loop className="relative mx-2 overflow-hidden rounded-[2.5rem] bg-[#0F4D3A] py-20 text-white md:mx-4 md:rounded-[3.5rem] md:py-32">
            {/* Ambient */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="hn-drift absolute -right-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,rgba(201,248,75,0.16),transparent_62%)]" />
                <div className="hn-drift absolute -bottom-60 -left-40 h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,rgba(62,143,122,0.45),transparent_62%)]" style={{ "--d": "-8s" } as Vars} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(223,243,236,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(223,243,236,0.04)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-5 md:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-3xl">
                        <span data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-[#C9F84B]">
                            Why it works
                        </span>
                        <h2 data-reveal="lines" className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                            <span className="hn-line">
                                <span>Built for the body</span>
                            </span>
                            <span className="hn-line">
                                <span style={{ "--d": "100ms" } as Vars}>
                                    you have <span className="hn-serif text-[1.08em] lowercase text-[#C9F84B]">now</span>
                                </span>
                            </span>
                        </h2>
                    </div>
                    <p data-reveal className="max-w-sm text-lg text-[#DFF3EC]/75" style={{ "--d": "150ms" } as Vars}>
                        Outdated advice says eat less and do more cardio. After 40, your body needs support — not punishment.
                    </p>
                </div>

                <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                    {/* Big compare tile */}
                    <div data-reveal="scale" className="md:col-span-2 lg:row-span-2">
                        <div className="h-full rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#155F4A] to-[#0F4D3A] p-6 md:p-9">
                            <WayToggle />
                        </div>
                    </div>

                    <Tile title="Food-first, not food-fear" body="Learn what to add to your meals — not just what to cut." delay={80}>
                        <div className="relative h-28 w-28">
                            <div className="absolute inset-0 rounded-full border border-dashed border-[#C9F84B]/40" />
                            <div className="hn-spin absolute inset-0" style={{ "--dur": "18s" } as Vars}>
                                {ORBIT.map((Icon, i) => {
                                    const a = (i / ORBIT.length) * Math.PI * 2;
                                    return (
                                        <span
                                            key={i}
                                            className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#0F4D3A] ring-1 ring-white/15"
                                            style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
                                        >
                                            {/* counter-rotates so the icon stays upright while orbiting */}
                                            <Icon size={15} className="hn-spin-rev text-[#C9F84B]" style={{ "--dur": "18s" } as Vars} />
                                        </span>
                                    );
                                })}
                            </div>
                            <span className="absolute inset-[30%] grid place-items-center rounded-full bg-[#C9F84B] text-[#0F4D3A] shadow-[0_0_30px_rgba(201,248,75,0.5)]">
                                <Salad size={22} />
                            </span>
                        </div>
                    </Tile>

                    <Tile title="Hormone-aware" body="Guidance built around the changes that come after 40." delay={160}>
                        <div className="relative h-20 w-full overflow-hidden">
                            {[
                                { c: "#C9F84B", y: 0, dur: "3.2s", w: 3 },
                                { c: "#3E8F7A", y: 14, dur: "4.6s", w: 3 },
                                { c: "#DFF3EC", y: -12, dur: "6s", w: 1.5 },
                            ].map((wave) => (
                                <svg
                                    key={wave.c}
                                    viewBox="0 0 400 80"
                                    preserveAspectRatio="none"
                                    className="hn-wave absolute left-0 h-full w-[200%]"
                                    style={{ "--dur": wave.dur, top: wave.y } as Vars}
                                >
                                    <path
                                        d="M0 40 Q 25 10 50 40 T 100 40 T 150 40 T 200 40 T 250 40 T 300 40 T 350 40 T 400 40"
                                        fill="none"
                                        stroke={wave.c}
                                        strokeOpacity={wave.c === "#DFF3EC" ? 0.4 : 1}
                                        strokeWidth={wave.w}
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                </svg>
                            ))}
                        </div>
                    </Tile>

                    <Tile title="Zero equipment" body="Everything works in your living room. No gym, no gadgets." delay={80}>
                        <div className="relative grid h-24 w-24 place-items-center">
                            <span className="hn-ping-soft absolute inset-3 rounded-full border-2 border-[#C9F84B]/60" />
                            <span className="hn-ping-soft absolute inset-3 rounded-full border-2 border-[#C9F84B]/60" style={{ "--d": "-1.2s" } as Vars} />
                            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-white/10 text-white">
                                <Dumbbell size={28} />
                                <span className="absolute h-[3px] w-14 rotate-[-35deg] rounded-full bg-[#C9F84B] shadow-[0_0_10px_rgba(201,248,75,0.8)]" />
                            </span>
                        </div>
                    </Tile>

                    <Tile title="Short & low-impact" body="Routines that fit busy days and are kind to your joints." delay={160}>
                        <div className="relative grid h-24 w-24 place-items-center">
                            <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90" aria-hidden>
                                <circle cx="28" cy="28" r="24" fill="none" stroke="#DFF3EC" strokeOpacity="0.12" strokeWidth="5" />
                                <circle className="hn-timer" cx="28" cy="28" r="24" fill="none" stroke="#C9F84B" strokeWidth="5" strokeLinecap="round" />
                            </svg>
                            <Timer size={28} className="text-white" />
                        </div>
                    </Tile>

                    <Tile title="Beginner friendly" body="Start where you are. Every step is simple to follow." delay={240}>
                        <div className="flex h-20 items-end gap-2">
                            {[0, 1, 2, 3, 4].map((i) => (
                                <span
                                    key={i}
                                    className="hn-bar w-5 rounded-t-lg bg-gradient-to-t from-[#3E8F7A] to-[#C9F84B]"
                                    style={{ height: `${36 + i * 16}%`, "--d": `${i * -0.25}s` } as Vars}
                                />
                            ))}
                        </div>
                    </Tile>
                </div>
            </div>
        </section>
    );
}
