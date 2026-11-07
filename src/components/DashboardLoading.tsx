"use client";

import React from "react";

interface DashboardLoadingProps {
    message?: string;
}

export function DashboardLoading({ message = "Loading..." }: DashboardLoadingProps) {
    return (
        <div className="flex h-full w-full items-center justify-center bg-dashboard-background-dark">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="size-12 rounded-full border-3 border-dashboard-border-dark border-t-dashboard-primary animate-spin"></div>
                    <div className="absolute inset-0 size-12 rounded-full border-3 border-transparent border-t-dashboard-primary/30 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="text-slate-400 text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}
