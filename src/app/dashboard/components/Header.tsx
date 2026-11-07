"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface HeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export function Header({ searchQuery = "", onSearchChange }: HeaderProps) {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <header className="h-16 flex items-center justify-between px-8 border-b border-dashboard-border-dark bg-dashboard-background-dark/95 backdrop-blur-sm z-10 sticky top-0">
            <h2 className="text-lg font-bold text-white">
                All Quizzes
            </h2>
            <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-500">
                            search
                        </span>
                    </div>
                    <input
                        className="block w-64 pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-dashboard-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-dashboard-primary sm:text-sm transition-all"
                        placeholder="Search quizzes..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                </div>
                {/* Divider */}
                <div className="h-8 w-[1px] bg-dashboard-border-dark mx-2"></div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowNotifDropdown(!showNotifDropdown);
                            setShowUserDropdown(false);
                        }}
                        className="p-2 rounded-lg text-slate-400 hover:bg-dashboard-surface-dark transition-colors relative cursor-pointer"
                    >
                        <span className="material-symbols-outlined">notifications</span>
                    </button>

                    {showNotifDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowNotifDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-72 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg shadow-xl z-20 overflow-hidden">
                                <div className="p-3 border-b border-dashboard-border-dark flex items-center justify-between">
                                    <p className="text-sm font-bold text-white">Notifications</p>
                                </div>
                                <div className="p-8 flex flex-col items-center justify-center text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-600 mb-3">
                                        notifications_off
                                    </span>
                                    <p className="text-sm font-medium text-slate-400">No notifications</p>
                                    <p className="text-xs text-slate-600 mt-1">You&apos;re all caught up!</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => {
                            setShowUserDropdown(!showUserDropdown);
                            setShowNotifDropdown(false);
                        }}
                        className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full hover:bg-dashboard-surface-dark border border-transparent hover:border-dashboard-border-dark transition-all cursor-pointer"
                    >
                        <div
                            className="h-8 w-8 rounded-full bg-dashboard-surface-dark flex items-center justify-center text-xs font-bold text-slate-300 bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBSZkpjRpzps_7xTbDAGtELMX73ViT6O6UzbFcvoUochcOvZI-ovSZ-1e_-sBNoeizq6Y0QOPES8blnC1qxr-GLV1XedaAWhfmSimxsE5-N-0ARusvqW-QKYGS0HHBzaYd_uEAm56iG2g4khOBpkrn8SBO7b39mtg5ARZbtPcleKVNwuoIALUL9X2SifGRL9QWY9SKxC8Cq0nSQ5UzXO6DWprqYOM3OgvJYMs6jWcfwxyguVkOIlKV9zSCDMyz3j4ZjbXEfY0ml6ShR')",
                            }}
                        ></div>
                        <span className="text-sm font-medium text-slate-200">
                            {user?.username || 'Admin'}
                        </span>
                        <span className="material-symbols-outlined text-slate-500 text-[16px]">
                            {showUserDropdown ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowUserDropdown(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg shadow-xl z-20 overflow-hidden">
                                <div className="p-3 border-b border-dashboard-border-dark">
                                    <p className="text-sm font-medium text-white">{user?.username || 'Admin'}</p>
                                    <p className="text-xs text-slate-500">Administrator</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                    <span className="material-symbols-outlined text-[18px]">logout</span>
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
