import { MARQUEE_A, MARQUEE_B } from "./content";

function Star({ className = "" }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={`hn-spin h-6 w-6 shrink-0 md:h-8 md:w-8 ${className}`} style={{ "--dur": "8s" } as React.CSSProperties} aria-hidden>
            <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z" fill="currentColor" />
        </svg>
    );
}

function Track({ items, reverse, starClass }: { items: string[]; reverse?: boolean; starClass: string }) {
    // Rendered twice so translating by -50% loops seamlessly
    const run = [...items, ...items];
    return (
        <div className="hn-skew">
            <div className="hn-marquee-track" data-dir={reverse ? "rev" : undefined} style={{ "--dur": "38s" } as React.CSSProperties}>
                {run.map((text, i) => (
                    <span key={i} className="flex items-center gap-6 px-3 md:gap-10 md:px-5" aria-hidden={i >= items.length}>
                        <span className="whitespace-nowrap text-2xl font-black uppercase tracking-tighter md:text-5xl">{text}</span>
                        <Star className={starClass} />
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function MarqueeBands() {
    return (
        <section data-loop aria-label="What Body Reset is about" className="relative z-10 overflow-hidden py-14 md:py-20">
            <div className="relative -mx-[6vw] -rotate-2 bg-[#0F4D3A] py-4 text-[#DFF3EC] shadow-[0_20px_40px_-20px_rgba(15,77,58,0.6)] md:py-6">
                <Track items={MARQUEE_A} starClass="text-[#C9F84B]" />
            </div>
            <div className="relative -mx-[6vw] -mt-3 rotate-[1.5deg] bg-[#C9F84B] py-4 text-[#0F4D3A] md:py-6">
                <Track items={MARQUEE_B} reverse starClass="text-[#0F4D3A]" />
            </div>
        </section>
    );
}
