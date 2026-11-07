"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useSettingsStore } from "@/store/settingsStore";

export function Sidebar() {
    const pathname = usePathname();
    const { projectName, logoUrl } = useSettingsStore();

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard' || pathname?.startsWith('/dashboard/') && !pathname?.includes('/settings');
        }
        return pathname?.startsWith(path);
    };

    return (
        <aside className="w-64 flex-shrink-0 border-r border-dashboard-border-dark bg-[#111118] flex flex-col justify-between h-full">
            <div className="flex flex-col p-6 gap-8">
                {/* User/Brand Area */}
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={projectName}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                    ) : null}
                    <div
                        className={`h-10 w-10 rounded-full bg-gradient-to-br from-dashboard-primary to-purple-600 flex items-center justify-center text-white font-bold ${logoUrl ? 'hidden' : ''}`}
                    >
                        <span className="material-symbols-outlined text-xl">bolt</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-none text-white">
                            {projectName || 'LogicFlow'}
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Admin Dashboard
                        </p>
                    </div>
                </div>
                {/* Navigation */}
                <nav className="flex flex-col gap-2">
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard') && !isActive('/dashboard/settings')
                                ? 'bg-dashboard-primary/10 text-dashboard-primary'
                                : 'hover:bg-dashboard-surface-dark text-slate-400'
                            }`}
                        href="/dashboard"
                    >
                        <span className="material-symbols-outlined filled">view_list</span>
                        <span className="text-sm font-medium">Quiz List</span>
                    </Link>
                    <Link
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard/settings')
                                ? 'bg-dashboard-primary/10 text-dashboard-primary'
                                : 'hover:bg-dashboard-surface-dark text-slate-400'
                            }`}
                        href="/dashboard/settings"
                    >
                        <span className="material-symbols-outlined">settings</span>
                        <span className="text-sm font-medium">Settings</span>
                    </Link>
                </nav>
            </div>
            {/* Version Info */}
            <div className="p-6 border-t border-dashboard-border-dark">
                <p className="text-xs text-slate-600 text-center">
                    {projectName || 'LogicFlow'} v1.0.0
                </p>
            </div>
        </aside>
    );
}
