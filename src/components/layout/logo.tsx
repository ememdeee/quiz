import Link from "next/link";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

/** The Quiz wordmark (design board "Logo"). Pass href={null} to draw it without a link. */
export function Logo({
  height = 34,
  href = routes.home,
  className,
  tone = "dark",
}: {
  height?: number;
  href?: string | null;
  className?: string;
  tone?: "dark" | "light";
}) {
  const svg = (
    <svg
      height={height}
      viewBox="0 -10 180 76"
      fill="none"
      role="img"
      aria-label="quiz"
      style={{ display: "block", overflow: "visible" }}
    >
      <circle cx="26" cy="28" r="15" stroke="currentColor" strokeWidth="8" />
      <circle cx="26" cy="28" r="5.5" fill="#7F93B2" />
      <path d="M41 28V60" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <text
        x="52"
        y="47"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="800"
        fontSize="62"
        letterSpacing="-2.6"
        fill="currentColor"
      >
        uiz
      </text>
    </svg>
  );
  const color = tone === "dark" ? "text-slate" : "text-white";
  if (href === null) return <span className={cn("inline-flex items-center", color, className)}>{svg}</span>;
  return (
    <Link
      href={href}
      aria-label="Quiz home"
      className={cn(
        "inline-flex items-center rounded-lg no-underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-slate",
        color,
        className,
      )}
    >
      {svg}
    </Link>
  );
}
