import Image from "next/image";
import MagneticButton from "./MagneticButton";
import PointerField from "./PointerField";

type Vars = React.CSSProperties & Record<`--${string}`, string | number>;

export default function FinalCta({ quizUrl }: { quizUrl: string }) {
    return (
        <section data-loop className="relative px-2 py-4 md:px-4">
            <PointerField className="relative isolate overflow-hidden rounded-[2.5rem] bg-[#0F4D3A] px-6 py-24 text-center text-white md:rounded-[3.5rem] md:py-36">
                {/* Ripples */}
                <div aria-hidden className="absolute inset-0 -z-10 grid place-items-center">
                    {[0, -1.25, -2.5, -3.75].map((d) => (
                        <span
                            key={d}
                            className="hn-ripple absolute h-[44rem] w-[44rem] rounded-full border border-[#C9F84B]/40"
                            style={{ "--d": `${d}s` } as Vars}
                        />
                    ))}
                    <div className="absolute h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle,rgba(201,248,75,0.22),transparent_65%)]" />
                    <div className="hn-cursor-glow hidden opacity-60 md:block" />
                </div>

                {/* Floating photos */}
                <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 hidden lg:block">
                    <div className="hn-par absolute left-[6%] top-[16%]" style={{ "--depth": "-24px" } as Vars}>
                        <div className="hn-bob relative h-44 w-44 overflow-hidden rounded-full border-4 border-[#C9F84B] shadow-2xl">
                            <Image src="/images/body-reset/cta-wellness-portrait.jpg" alt="" fill sizes="176px" className="object-cover object-center" />
                        </div>
                    </div>
                    <div className="hn-par absolute bottom-[12%] right-[7%]" style={{ "--depth": "30px" } as Vars}>
                        <div className="hn-bob relative h-52 w-52 overflow-hidden rounded-[38%] border-4 border-white/80 shadow-2xl" style={{ "--d": "-3s" } as Vars}>
                            <Image src="/images/body-reset/phase-01-food-first-reset.jpg" alt="" fill sizes="208px" className="object-cover object-[50%_45%]" />
                        </div>
                    </div>
                </div>

                {/* Rotating badge */}
                <div aria-hidden className="relative mx-auto mb-10 grid h-28 w-28 place-items-center md:h-32 md:w-32" data-reveal="scale">
                    <svg viewBox="0 0 100 100" className="hn-spin absolute inset-0 h-full w-full" style={{ "--dur": "16s" } as Vars}>
                        <defs>
                            <path id="hn-cta-path" d="M50 50 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0" />
                        </defs>
                        <text fill="#C9F84B" fontSize="9.6" fontWeight="800" letterSpacing="2.2">
                            <textPath href="#hn-cta-path">TAKE THE QUIZ • GET YOUR PLAN • </textPath>
                        </text>
                    </svg>
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-[#C9F84B] text-2xl font-black text-[#0F4D3A] md:h-14 md:w-14">
                        ✦
                    </span>
                </div>

                <h2 data-reveal="lines" className="mx-auto max-w-5xl text-5xl font-black uppercase leading-[0.88] tracking-tighter sm:text-6xl md:text-8xl">
                    <span className="hn-line">
                        <span>Ready to feel</span>
                    </span>
                    <span className="hn-line">
                        <span style={{ "--d": "100ms" } as Vars}>
                            like <span className="hn-serif text-[1.08em] lowercase text-[#C9F84B]">yourself</span>
                        </span>
                    </span>
                    <span className="hn-line">
                        <span style={{ "--d": "200ms" } as Vars}>again?</span>
                    </span>
                </h2>
                <p data-reveal className="mx-auto mt-8 max-w-xl text-lg text-[#DFF3EC]/75 md:text-xl" style={{ "--d": "250ms" } as Vars}>
                    Your personalized Body Reset plan starts with a few simple questions about your body, habits and goals.
                </p>
                <div data-reveal className="mt-12 flex justify-center" style={{ "--d": "350ms" } as Vars}>
                    <MagneticButton href={quizUrl} variant="lime" size="xl">
                        Start My Body Quiz
                    </MagneticButton>
                </div>
                <p data-reveal className="mt-6 text-sm font-medium text-white/40" style={{ "--d": "420ms" } as Vars}>
                    Free · No credit card required for the quiz
                </p>
            </PointerField>
        </section>
    );
}
