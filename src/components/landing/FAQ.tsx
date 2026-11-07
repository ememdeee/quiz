"use client";

import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
    {
        question: "Do I need any equipment?",
        answer: "No! Most of our workouts are bodyweight-only. For advanced tracks, we recommend a simple set of dumbbells, but they are not required to start."
    },
    {
        question: "How long are the workouts?",
        answer: "We focus on efficiency. Sessions range from 15 to 45 minutes. Our AI customizes the duration based on your schedule for the day."
    },
    {
        question: "Is this suitable for beginners?",
        answer: "Absolutely. Every exercise has modifications for different fitness levels. Our onboarding quiz ensures you start at the right intensity."
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes, we believe in freedom. You can pause or cancel your subscription instantly from your account settings with no hidden fees."
    }
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    return (
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="border-b border-[#155F4A]/20 last:border-0"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="flex items-center justify-between w-full py-6 text-left group cursor-pointer relative z-10"
                    >
                        <span className={`text-xl font-bold transition-colors ${openIndex === index ? "text-[#0F4D3A]" : "text-[#155F4A] hover:text-[#0F4D3A]"}`}>
                            {faq.question}
                        </span>
                        <div className={`p-2 rounded-full transition-all duration-300 ${openIndex === index ? "bg-[#C9F84B] rotate-180" : "bg-[#DFF3EC] group-hover:bg-[#C9F84B]"}`}>
                            {openIndex === index ? <Minus size={20} className="text-[#0F4D3A]" /> : <Plus size={20} className="text-[#0F4D3A]" />}
                        </div>
                    </button>

                    {openIndex === index && (
                        <div
                            className="pb-6 text-[#3E8F7A] leading-relaxed animate-fade-in"
                        >
                            {faq.answer}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
