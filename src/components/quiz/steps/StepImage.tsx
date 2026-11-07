"use client";

import React from "react";

interface StepImageProps {
    /** Image URL */
    src?: string | null;
    /** Image fit mode */
    imageFit?: 'cover' | 'contain';
    /** Max height class for cover mode, defaults to "max-h-48" */
    coverMaxHeight?: string;
    /** Additional wrapper className */
    wrapperClassName?: string;
}

/**
 * Shared step image renderer.
 * Used by MultipleChoiceStep, CheckboxStep, InfoStep, etc.
 */
export function StepImage({
    src,
    imageFit = 'cover',
    coverMaxHeight = 'max-h-48',
    wrapperClassName = 'w-full max-w-md mx-auto mb-4 rounded-2xl overflow-hidden',
}: StepImageProps) {
    if (!src) return null;

    return (
        <div className={wrapperClassName}>
            <img
                src={src}
                alt=""
                className={`w-full rounded-2xl ${imageFit === 'contain'
                        ? 'h-auto object-contain max-h-[38vh]'
                        : `h-auto object-cover ${coverMaxHeight}`
                    }`}
            />
        </div>
    );
}
