import { LucideIcon } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    delay?: number; // Delay multiplier
}

export default function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
    const { ref, hasTriggered } = useInView();

    return (
        <div
            ref={ref}
            className={`transform transition-all duration-700 cubic-[0.16,1,0.3,1] ${hasTriggered ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}
            style={{ transitionDelay: `${delay * 100}ms` }}
        >
            <div
                className="p-8 rounded-2xl bg-white border border-[#0F4D3A]/5 shadow-xl hover:shadow-2xl hover:border-[#C9F84B] transition-all duration-300 group relative overflow-hidden transform-gpu h-full"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#DFF3EC] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#DFF3EC] text-[#0F4D3A] group-hover:bg-[#0F4D3A] group-hover:text-[#C9F84B] transition-colors duration-300">
                        <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-[#0F4D3A] transition-colors duration-300">
                        {title}
                    </h3>
                    <p className="text-[#3E8F7A] leading-relaxed text-sm">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
