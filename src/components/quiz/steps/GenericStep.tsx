"use client";

import React from "react";
import type { Step } from "@/types/quiz";

interface GenericStepProps {
    step: Step;
}

export function GenericStep({ step }: GenericStepProps) {
    const content = step.content as Record<string, unknown>;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                {(content.title as string) || (content.question as string) || step.type}
            </h2>
            {content.subtitle && (
                <p className="text-slate-500">{String(content.subtitle)}</p>
            )}
            {content.message && (
                <p className="text-slate-600 mt-4">{String(content.message)}</p>
            )}
        </div>
    );
}
