import Image from "next/image";
import Link from "next/link";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SOCIALS } from "./content";

const SOCIAL_ICONS: Record<(typeof SOCIALS)[number]["name"], React.ReactNode> = {
    Instagram: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    ),
    Facebook: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H8v3h2.5V21h3z" />
        </svg>
    ),
    TikTok: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M16.6 3c.4 2 1.7 3.4 3.9 3.6v3c-1.4.1-2.7-.3-3.9-1.1v6.3c0 3.4-2.6 5.7-5.7 5.7a5.6 5.6 0 0 1-5.6-5.6c0-3.4 2.9-6 6.4-5.5v3.1c-1.6-.4-3.2.7-3.2 2.4 0 1.4 1.1 2.5 2.5 2.5 1.5 0 2.6-1 2.6-2.9V3h3z" />
        </svg>
    ),
    YouTube: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M21.6 7.2c-.2-.9-.9-1.6-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4c-.9.2-1.6.9-1.8 1.8C2 8.8 2 12 2 12s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z" />
        </svg>
    ),
};

const WORDMARK = "Quiz";

export default function SiteFooter({ quizUrl }: { quizUrl: string }) {
    return (
        <footer className="relative mt-4 overflow-hidden bg-[#0A3326] text-[#DFF3EC]">
            <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(201,248,75,0.12),transparent_65%)]" />

            <div className="relative mx-auto max-w-7xl px-6 pt-20 md:pt-24">
                <div className="grid gap-12 md:grid-cols-12">
                    {/* Brand */}
                    <div className="md:col-span-5">
                        <Link href="/" className="group inline-flex items-center gap-3 text-2xl font-black uppercase tracking-tighter">
                            <span className="grid h-11 w-11 place-items-center rounded-full bg-white transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:rotate-[360deg]">
                                <Image src="/logo/logo-180.png" alt="" width={30} height={30} />
                            </span>
                            <span>
                                <span className="text-[#C9F84B]">Quiz</span>
                            </span>
                        </Link>
                        <p className="mt-6 max-w-sm leading-relaxed text-[#DFF3EC]/65">
                            Simple body transformation for busy women 40+ — through metabolism support, realistic nutrition
                            and short home routines.
                        </p>
                        <Link
                            href={quizUrl}
                            className="group mt-8 inline-flex items-center gap-3 rounded-full border border-[#C9F84B]/40 py-2 pl-5 pr-2 text-sm font-black uppercase tracking-wider text-[#C9F84B] transition-colors hover:bg-[#C9F84B] hover:text-[#0F4D3A]"
                        >
                            Take the Free Quiz
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#C9F84B] text-[#0F4D3A] transition-transform duration-500 group-hover:rotate-45">
                                <ArrowUpRight size={16} strokeWidth={2.6} />
                            </span>
                        </Link>
                    </div>

                    {/* Explore */}
                    <nav aria-label="Footer" className="md:col-span-3">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFF3EC]/45">Explore</h4>
                        <ul className="mt-5 space-y-3">
                            {NAV_LINKS.map((link) => (
                                <li key={link.id}>
                                    <a href={`#${link.id}`} className="group inline-flex items-center font-semibold transition-colors hover:text-[#C9F84B]">
                                        <span className="h-px w-0 bg-[#C9F84B] transition-[width,margin] duration-500 group-hover:mr-2 group-hover:w-4" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Social */}
                    <div className="md:col-span-4">
                        <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#DFF3EC]/45">Follow along</h4>
                        <ul className="mt-5 flex flex-wrap gap-3">
                            {SOCIALS.map((s) => (
                                <li key={s.name}>
                                    <a
                                        href={s.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Quiz on ${s.name}`}
                                        className="grid h-12 w-12 place-items-center rounded-full border border-white/15 transition-all duration-300 hover:-translate-y-1 hover:border-[#C9F84B] hover:bg-[#C9F84B] hover:text-[#0F4D3A]"
                                    >
                                        {SOCIAL_ICONS[s.name]}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-8 text-xs leading-relaxed text-[#DFF3EC]/45">
                            Results vary from person to person. Body Reset is not a substitute for professional medical
                            advice — check with your doctor before starting a new nutrition or exercise plan.
                        </p>
                    </div>
                </div>

                {/* Giant wordmark — letters light up lime on hover */}
                <div aria-hidden className="mt-16 select-none overflow-hidden md:mt-20">
                    <p className="whitespace-nowrap text-center text-[10.5vw] font-black uppercase leading-[0.8] tracking-tighter xl:text-[9rem]">
                        {WORDMARK.split("").map((ch, i) => (
                            <span key={i} className="inline-block text-[#DFF3EC]/[0.07] transition-[color,translate] duration-300 hover:-translate-y-3 hover:text-[#C9F84B]">
                                {ch}
                            </span>
                        ))}
                    </p>
                </div>

                <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-8 text-sm text-[#DFF3EC]/50 md:flex-row">
                    <p>© {new Date().getFullYear()} Quiz. All rights reserved.</p>
                    <div className="flex items-center gap-6">
                        <a href="#" className="transition-colors hover:text-[#C9F84B]">
                            Privacy
                        </a>
                        <a href="#" className="transition-colors hover:text-[#C9F84B]">
                            Terms
                        </a>
                        <a
                            href="#top"
                            className="group inline-flex items-center gap-2 font-bold uppercase tracking-wider text-[#DFF3EC]/80 transition-colors hover:text-[#C9F84B]"
                        >
                            Back to top
                            <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full border border-white/20">
                                <ArrowUp size={14} className="transition-transform duration-500 group-hover:-translate-y-0.5" />
                            </span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
