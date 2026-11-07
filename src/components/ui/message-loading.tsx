interface MessageLoadingProps {
    /** Pixel size of the square loader box (default 24) */
    size?: number;
    /** Dot color comes from CSS `currentColor` — set a text-* class here (e.g. text-quiz-primary) */
    className?: string;
}

/**
 * Three bouncing dots. CSS-keyframe driven (not SMIL) so the animation runs
 * from the first paint instead of waiting for the document load event, and
 * negative delays start the wave mid-motion — visible even if the loader
 * only shows for a few milliseconds.
 */
export function MessageLoading({ size = 24, className }: MessageLoadingProps) {
    const dotSize = size / 6;

    return (
        <div
            role="status"
            aria-label="Loading"
            className={`flex items-center justify-center ${className ?? ""}`}
            style={{ width: size, height: size, gap: dotSize, "--bounce": `${size / 4}px` } as React.CSSProperties}
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="rounded-full bg-current animate-[message-loading-bounce_1.05s_ease-in-out_infinite]"
                    style={{ width: dotSize, height: dotSize, animationDelay: `${i * 100 - 250}ms` }}
                />
            ))}
        </div>
    );
}
