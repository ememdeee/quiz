"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { FAQS } from "./content";

export default function Faq({ quizUrl }: { quizUrl: string }) {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="relative px-2 py-4 md:px-4">
            <div className="rounded-[2.5rem] bg-white py-20 md:rounded-[3.5rem] md:py-28">
                <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-12 lg:gap-16">
                    <div className="lg:col-span-5">
                        <div className="lg:sticky lg:top-32">
                            <span data-reveal className="text-xs font-bold uppercase tracking-[0.2em] text-[#3E8F7A]">
                                FAQ
                            </span>
                            <h2 data-reveal="lines" className="mt-4 text-5xl font-black uppercase leading-[0.9] tracking-tighter md:text-6xl">
                                <span className="hn-line">
                                    <span>You asked,</span>
                                </span>
                                <span className="hn-line">
                                    <span style={{ "--d": "100ms" } as React.CSSProperties}>
                                        we <span className="hn-serif text-[1.08em] lowercase text-[#3E8F7A]">answered</span>
                                    </span>
                                </span>
                            </h2>

                            <div data-reveal className="mt-10 rounded-[2rem] bg-[#DFF3EC] p-7" style={{ "--d": "180ms" } as React.CSSProperties}>
                                <p className="text-2xl font-black uppercase leading-none tracking-tighter">Still not sure?</p>
                                <p className="mt-3 text-[#155F4A]">
                                    The quiz is free and takes just a few minutes. See your plan before you decide anything.
                                </p>
                                <MagneticButton href={quizUrl} size="md" className="mt-6">
                                    Take the Quiz
                                </MagneticButton>
                            </div>
                        </div>
                    </div>

                    <ul className="lg:col-span-7">
                        {FAQS.map((item, i) => {
                            const isOpen = open === i;
                            return (
                                <li key={item.q} data-reveal style={{ "--d": `${i * 50}ms` } as React.CSSProperties} className="border-b border-[#0F4D3A]/10">
                                    <h3>
                                        <button
                                            type="button"
                                            id={`faq-q-${i}`}
                                            aria-expanded={isOpen}
                                            aria-controls={`faq-a-${i}`}
                                            onClick={() => setOpen(isOpen ? null : i)}
                                            className="group flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-none"
                                        >
                                            <span className={`text-lg font-bold transition-colors md:text-xl ${isOpen ? "text-[#0F4D3A]" : "text-[#155F4A] group-hover:text-[#0F4D3A]"}`}>
                                                {item.q}
                                            </span>
                                            <span
                                                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-focus-visible:ring-4 group-focus-visible:ring-[#C9F84B]/70 ${isOpen ? "rotate-[135deg] bg-[#0F4D3A] text-[#C9F84B]" : "bg-[#DFF3EC] text-[#0F4D3A] group-hover:bg-[#C9F84B]"}`}
                                            >
                                                <Plus size={20} strokeWidth={2.6} />
                                            </span>
                                        </button>
                                    </h3>
                                    <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} data-open={isOpen} className="hn-acc">
                                        <div>
                                            <p className="max-w-2xl pb-7 pr-14 text-base leading-relaxed text-[#155F4A] md:text-lg">{item.a}</p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
