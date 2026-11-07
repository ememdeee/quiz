import Image from "next/image";
import { Star } from "lucide-react";
import { REVIEWS, type Review } from "./content";

function Card({ review }: { review: Review }) {
    const initials = review.name
        .split(" ")
        .map((p) => p[0])
        .join("");
    return (
        <figure className="mx-2.5 flex w-[19rem] shrink-0 flex-col rounded-[2rem] border border-[#0F4D3A]/10 bg-white p-7 shadow-[0_24px_50px_-30px_rgba(15,77,58,0.45)] transition-transform duration-500 hover:-translate-y-1.5 md:mx-3 md:w-[25rem]">
            <div className="flex items-center justify-between">
                <div className="flex gap-1 text-[#0F4D3A]">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                    ))}
                </div>
                <span aria-hidden className="hn-serif text-6xl leading-none text-[#C9F84B] [-webkit-text-stroke:1px_#0F4D3A]">
                    &rdquo;
                </span>
            </div>
            <blockquote className="mt-2 flex-1 text-lg font-medium leading-relaxed text-[#0F4D3A]">{review.text}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
                {review.photo ? (
                    <Image
                        src={review.photo}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-[#C9F84B] ring-offset-2"
                    />
                ) : (
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#C9F84B] to-[#3E8F7A] text-sm font-black text-[#0F4D3A]">
                        {initials}
                    </span>
                )}
                <span>
                    <span className="block text-sm font-black uppercase tracking-wide">{review.name}</span>
                    <span className="block text-xs font-semibold text-[#3E8F7A]">{review.tag}</span>
                </span>
            </figcaption>
        </figure>
    );
}

function Row({ items, reverse }: { items: Review[]; reverse?: boolean }) {
    // Two copies of a doubled list: wide enough to never show a gap on big screens
    const set = [...items, ...items];
    return (
        <div className="hn-marquee hn-fade-edges overflow-hidden py-4">
            <div className="hn-marquee-track" data-pausable data-dir={reverse ? "rev" : undefined} style={{ "--dur": "70s" } as React.CSSProperties}>
                {[...set, ...set].map((review, i) => (
                    <div key={i} aria-hidden={i >= items.length}>
                        <Card review={review} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Reviews() {
    return (
        <section id="reviews" data-loop className="relative py-20 md:py-32">
            <div className="mx-auto max-w-7xl px-6 text-center">
                <span data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E8F7A]">
                    Reviews
                </span>
                <h2 data-reveal="lines" className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-7xl">
                    <span className="hn-line">
                        <span>In their</span>
                    </span>
                    <span className="hn-line">
                        <span className="hn-serif text-[1.08em] lowercase text-[#3E8F7A]" style={{ "--d": "100ms" } as React.CSSProperties}>
                            own words
                        </span>
                    </span>
                </h2>
            </div>
            <div data-reveal className="mt-12 md:mt-16" style={{ "--d": "150ms" } as React.CSSProperties}>
                <Row items={REVIEWS} />
                <Row items={[...REVIEWS].reverse()} reverse />
            </div>
        </section>
    );
}
