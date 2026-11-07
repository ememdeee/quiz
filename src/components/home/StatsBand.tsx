import CountUp from "./CountUp";
import { STATS } from "./content";

export default function StatsBand() {
    return (
        <section aria-label="Body Reset at a glance" className="relative px-2 py-4 md:px-4">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#C9F84B] md:rounded-[3.5rem]">
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.12] bg-[repeating-linear-gradient(-45deg,#0F4D3A_0_2px,transparent_2px_22px)]"
                />
                <dl className="relative mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat, i) => (
                        <div
                            key={stat.label}
                            data-reveal
                            style={{ "--d": `${i * 90}ms` } as React.CSSProperties}
                            className={`flex flex-col-reverse items-center gap-2 px-4 py-10 text-center md:py-14 ${i % 2 === 0 ? "border-r" : "lg:border-r"} ${i < 2 ? "border-b lg:border-b-0" : ""} border-[#0F4D3A]/15 last:border-r-0`}
                        >
                            <dt className="max-w-[12rem] text-xs font-bold uppercase tracking-[0.16em] text-[#0F4D3A]/75 md:text-sm">
                                {stat.label}
                            </dt>
                            <dd className="text-6xl font-black leading-none tracking-tighter text-[#0F4D3A] md:text-8xl">
                                <CountUp from={stat.from} to={stat.to} suffix={stat.suffix} />
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>
        </section>
    );
}
