import { cn } from "@/lib/utils";

/** Small caps label, big heading and optional sentence under it. */
export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "left",
  tone = "light",
  className,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("scroll-rise", align === "center" && "text-center", className)}>
      <span className={cn("text-sm font-bold uppercase tracking-[0.06em]", tone === "dark" ? "text-on-dark-6" : "text-mute")}>
        {eyebrow}
      </span>
      <h2 className="mt-2.5 text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.1] tracking-[-0.03em]">{title}</h2>
      {sub ? (
        <p className={cn("mt-3.5 max-w-[560px] text-lg leading-7", tone === "dark" ? "text-on-dark-3" : "text-mute", align === "center" && "mx-auto")}>
          {sub}
        </p>
      ) : null}
    </div>
  );
}
