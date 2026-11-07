"use client";

import { ArrowRight, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Newsletter() {
    const [focused, setFocused] = useState(false);
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        // Simulate API call
        setTimeout(() => {
            setStatus("success");
            setEmail("");
        }, 1500);
    };

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0F4D3A] px-6 py-16 md:px-16 md:py-20 text-center shadow-2xl">
            {/* Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#155F4A] blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 rounded-full bg-[#C9F84B] blur-3xl opacity-20" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <div className="p-4 bg-white/10 w-fit mx-auto rounded-full backdrop-blur-sm text-[#C9F84B] mb-6">
                    <Mail size={32} />
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
                    Join the Movement
                </h2>
                <p className="text-[#DFF3EC]/80 text-lg">
                    Get exclusive workout tips, nutrition guides, and early access to new features delivered to your inbox.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
                    <div
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-full border border-white/20 p-2 overflow-hidden gap-2 sm:gap-0 transition-all duration-200 ${focused ? "scale-[1.02] shadow-[0_0_0_4px_rgba(201,248,75,0.3)]" : ""}`}
                    >
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/70 px-6 py-3 font-medium w-full text-center sm:text-left"
                            onFocus={() => setFocused(true)}
                            onBlur={() => setFocused(false)}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            disabled={status === "loading" || status === "success"}
                            className="bg-[#C9F84B] text-[#0F4D3A] p-3 rounded-xl sm:rounded-full hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center w-full sm:w-auto"
                        >
                            {status === "loading" ? (
                                <div className="w-5 h-5 border-2 border-[#0F4D3A] border-t-transparent rounded-full animate-spin" />
                            ) : status === "success" ? (
                                <ArrowRight size={20} className="rotate-0 transition-transform" />
                            ) : (
                                <ArrowRight size={20} />
                            )}
                        </button>
                    </div>
                    {status === "success" && (
                        <p
                            className="absolute -bottom-8 left-0 right-0 text-[#C9F84B] text-sm font-bold animate-fade-in-up"
                        >
                            Welcome to the team! Check your inbox.
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
