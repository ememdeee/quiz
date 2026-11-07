"use client";

import React from "react";

interface QuizCardProps {
    type: "published" | "draft" | "create";
    title?: string;
    id?: string;
    steps?: number;
    time?: string;
    imageUrl?: string;
    onClick?: () => void;
    isLoading?: boolean;
}

export function QuizCard({
    type,
    title,
    id,
    steps,
    time,
    imageUrl,
    onClick,
    isLoading,
}: QuizCardProps) {
    if (type === "create") {
        return (
            <button
                onClick={onClick}
                disabled={isLoading}
                className="group relative flex flex-col items-center justify-center min-h-[280px] rounded-xl border-2 border-dashed border-dashboard-border-dark hover:border-dashboard-primary bg-transparent hover:bg-dashboard-surface-dark cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <div className="h-14 w-14 rounded-full bg-dashboard-surface-dark group-hover:bg-dashboard-primary/10 flex items-center justify-center text-slate-400 group-hover:text-dashboard-primary transition-colors mb-4">
                    {isLoading ? (
                        <span className="material-symbols-outlined text-3xl animate-spin">progress_activity</span>
                    ) : (
                        <span className="material-symbols-outlined text-3xl">add</span>
                    )}
                </div>
                <h3 className="text-base font-semibold text-slate-300 group-hover:text-dashboard-primary">
                    {isLoading ? 'Creating...' : 'Create New Quiz'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Start from scratch
                </p>
            </button>
        );
    }

    const isPublished = type === "published";

    return (
        <div className={`group relative flex flex-col min-h-[280px] rounded-xl border border-dashboard-border-dark bg-dashboard-surface-dark overflow-hidden hover:shadow-xl hover:shadow-dashboard-primary/5 hover:border-dashboard-primary/50 transition-all duration-300 cursor-pointer ${!imageUrl ? 'opacity-60 hover:opacity-100' : ''}`}>
            {/* Card Image Header */}
            <div
                className={`h-32 w-full bg-cover bg-center relative ${!imageUrl ? '' : ''}`}
                style={imageUrl ? { backgroundImage: `url('${imageUrl}')` } : { background: 'linear-gradient(135deg, #6467f2 0%, #ec4899 100%)' }}
            >
                {/* Gradient overlay for image cards */}
                {imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-dashboard-surface-dark to-transparent opacity-90"></div>}
                <div className="absolute top-3 right-3">
                    <span
                        className={`px-2 py-1 rounded text-xs font-bold ${isPublished
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                            } flex items-center gap-1`}
                    >
                        <span
                            className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-green-400" : "bg-slate-400"
                                }`}
                        ></span>{" "}
                        {isPublished ? "Published" : "Draft"}
                    </span>
                </div>
            </div>
            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-white leading-tight group-hover:text-dashboard-primary transition-colors">
                        {title}
                    </h3>
                </div>
                <p className="text-xs font-mono text-slate-500 mb-4">
                    ID: {id}
                </p>
                <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-dashboard-border-dark">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                            call_split
                        </span>
                        <span className="text-sm font-medium text-slate-400">
                            {steps} Steps
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400 text-lg">
                            schedule
                        </span>
                        <span className="text-sm font-medium text-slate-400">
                            {time}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
