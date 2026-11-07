"use client";

import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Sarah M.",
        role: "Lost 10lbs in 4 weeks",
        text: "The home workouts completely changed my routine. I don't need a gym anymore to see real results.",
        rating: 5,
    },
    {
        name: "Jessica K.",
        role: "Toned & Stronger",
        text: "I was skeptical about home fitness, but the science-backed approach here is undeniable. Highly recommend!",
        rating: 5,
    },
    {
        name: "Emily R.",
        role: "Busy Mom Approved",
        text: "Finally a program that fits into my crazy schedule. 20 minutes a day and I feel amazing.",
        rating: 5,
    },
    {
        name: "Rachel P.",
        role: "Yoga Enthusiast",
        text: "The flexibility modules are top notch. My posture has improved significantly in just a month.",
        rating: 5,
    },
];

export default function TestimonialSlider() {
    return (
        <div className="overflow-hidden py-10 relative group">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#DFF3EC] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#DFF3EC] to-transparent z-10 pointer-events-none" />

            <div
                className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]"
            >
                {[...testimonials, ...testimonials].map((t, i) => (
                    <div
                        key={i}
                        className="w-[300px] md:w-[400px] p-8 rounded-2xl bg-white border border-[#0F4D3A]/10 shadow-lg shrink-0 flex flex-col gap-4"
                    >
                        <div className="flex gap-1 text-[#C9F84B]">
                            {Array.from({ length: t.rating }).map((_, i) => (
                                <Star key={i} size={16} fill="currentColor" />
                            ))}
                        </div>
                        <p className="text-[#0F4D3A] italic text-lg leading-relaxed">"{t.text}"</p>
                        <div className="mt-auto flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#155F4A] to-[#0F4D3A]" />
                            <div>
                                <h4 className="text-[#0F4D3A] font-bold text-sm uppercase tracking-wide">{t.name}</h4>
                                <span className="text-[#3E8F7A] text-xs">{t.role}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
