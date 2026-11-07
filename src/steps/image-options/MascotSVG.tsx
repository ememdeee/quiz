"use client";

import { useId } from "react";

interface MascotSVGProps {
    /** Variant id — must match an entry in mascotRegistry. */
    variant: string;
    /** Base URL folder for the PNGs, e.g. '/mascot/vector'. Defaults to '/mascot'. */
    basePath?: string;
    clothingColor?: string;
    /**
     * SVG preserveAspectRatio. Use "xMidYMin slice" for object-cover-top behaviour
     * (fills the container and clips overflow, aligned to top). Default: "xMidYMid meet".
     */
    preserveAspectRatio?: string;
    className?: string;
}

export function MascotSVG({ variant, basePath = "/mascot", clothingColor = "var(--quiz-primary)", preserveAspectRatio = "xMidYMid meet", className }: MascotSVGProps) {
    const uid = useId().replace(/:/g, "");
    const maskId = `mascotShirtMask-${uid}`;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 500 500"
            preserveAspectRatio={preserveAspectRatio}
            className={className}
            style={{ display: "block", width: "100%", height: "100%" }}
        >
            <image width="500" height="500" href={`${basePath}/${variant}-body.webp`} />
            <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="500" height="500">
                <image width="500" height="500" href={`${basePath}/${variant}-shirt-mask.png`} />
            </mask>
            <rect
                width="500"
                height="500"
                mask={`url(#${maskId})`}
                style={{ fill: clothingColor, mixBlendMode: "multiply" }}
            />
        </svg>
    );
}
