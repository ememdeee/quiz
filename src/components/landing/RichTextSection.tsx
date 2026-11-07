import Image from "next/image";
import { useInView } from "@/hooks/useInView";

interface RichTextSectionProps {
    title: string;
    description: string;
    imageSrc: string;
    imageAlt: string;
    reverse?: boolean;
}

export default function RichTextSection({ title, description, imageSrc, imageAlt, reverse = false }: RichTextSectionProps) {
    const { ref: textRef, hasTriggered: textTriggered } = useInView({ threshold: 0.2 });
    const { ref: imageRef, hasTriggered: imageTriggered } = useInView({ threshold: 0.2 });

    return (
        <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-12 md:gap-20`}>
            <div
                ref={textRef}
                className={`flex-1 space-y-6 text-center md:text-left transform transition-all duration-700 cubic-[0.16,1,0.3,1] ${textTriggered ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-8 blur-sm'}`}
            >
                <h2 className="text-3xl md:text-5xl font-black text-[#0F4D3A] uppercase tracking-tighter leading-[0.95]">
                    {title}
                </h2>
                <div className="h-1 w-20 bg-[#C9F84B] rounded-full mx-auto md:mx-0" />
                <p className="text-lg text-[#3E8F7A] leading-relaxed">
                    {description}
                </p>
            </div>

            <div
                ref={imageRef}
                className={`flex-1 w-full transform transition-all duration-1000 cubic-[0.16,1,0.3,1] ${imageTriggered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            >
                <div className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl group">
                    {/* Abstract placeholder effect if image fails to load or for prototype */}
                    <div className="absolute inset-0 bg-[#DFF3EC] animate-pulse" />

                    {/* Using placeholder images for now if src not provided, but ideally this uses actual images */}
                    <Image
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F4D3A]/50 to-transparent opacity-60 mix-blend-multiply" />
                </div>
            </div>
        </div>
    );
}
