"use client";

import React from "react";
import type { Step } from "@/types/quiz";

interface GenericEditorProps {
    step: Step;
    onUpdate: (updates: Partial<Step>) => void;
}

/**
 * Generic editor for step types that don't have a dedicated editor.
 * Auto-generates form fields from content keys.
 */
export function GenericEditor({ step, onUpdate }: GenericEditorProps) {
    const content = step.content as Record<string, unknown>;

    const handleChange = (field: string, value: unknown) => {
        onUpdate({ content: { ...content, [field]: value } });
    };

    return (
        <div className="space-y-6">
            {Object.entries(content).map(([key, value]) => {
                // Skip complex objects and arrays for now
                if (typeof value === 'object' && value !== null) return null;

                return (
                    <div key={key}>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        {typeof value === 'boolean' ? (
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) => handleChange(key, e.target.checked)}
                                    className="w-4 h-4 rounded border-dashboard-border-dark bg-dashboard-surface-dark text-dashboard-primary focus:ring-dashboard-primary"
                                />
                                <span className="text-sm text-slate-300">Enabled</span>
                            </label>
                        ) : typeof value === 'number' ? (
                            <input
                                className="w-32 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none"
                                type="number"
                                value={value}
                                onChange={(e) => handleChange(key, parseInt(e.target.value) || 0)}
                            />
                        ) : (
                            <input
                                className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:outline-none placeholder-slate-600"
                                type="text"
                                value={String(value ?? '')}
                                onChange={(e) => handleChange(key, e.target.value)}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
