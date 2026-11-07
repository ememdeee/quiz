"use client";

import React, { useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { useAuthStore } from "@/store/authStore";
import { QuizSettings } from "./QuizSettings";

export function EditorHeader() {
    const router = useRouter();
    const { quiz, selectedStepId, saveQuiz, isSaving, isDirty } = useQuizBuilderStore();
    const { user, logout } = useAuthStore();
    const [showDropdown, setShowDropdown] = useState(false);
    const [showQuizSettings, setShowQuizSettings] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const quizStatus = (quiz?.meta as { status?: string })?.status || 'draft';

    const buildPreviewUrl = () => {
        if (!quiz) return '#';
        const params = new URLSearchParams();
        if (quizStatus === 'draft') params.set('preview', 'true');
        const stepIndex = quiz.steps.findIndex((s) => s.id === selectedStepId);
        if (stepIndex >= 0) params.set('step', String(stepIndex + 1));
        const qs = params.toString();
        return `/quiz/${quiz.quizId}${qs ? `?${qs}` : ''}`;
    };

    return (
        <>
            <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-dashboard-border-dark bg-dashboard-background-dark px-6 py-3 shrink-0 z-20">
                <div className="flex items-center gap-4 text-white">
                    <Link href="/dashboard" className="size-8 bg-dashboard-primary/20 rounded-lg flex items-center justify-center text-dashboard-primary hover:bg-dashboard-primary/30 transition-colors">
                        <span className="material-symbols-outlined">quiz</span>
                    </Link>
                    <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                        QuizBuilder
                    </h2>
                    <div className="h-6 w-px bg-dashboard-border-dark mx-2"></div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Link href="/dashboard" className="hover:text-white cursor-pointer transition-colors">
                            My Quizzes
                        </Link>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <button
                            onClick={() => setShowQuizSettings(true)}
                            className="flex items-center gap-2 hover:text-white cursor-pointer transition-colors group"
                        >
                            <span className="text-white font-medium group-hover:text-dashboard-primary transition-colors">
                                {quiz?.meta.title || 'Untitled Quiz'}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${quizStatus === 'published'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-slate-500/20 text-slate-400'
                                }`}>
                                {quizStatus === 'published' ? 'Published' : 'Draft'}
                            </span>
                            <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">
                                edit
                            </span>
                        </button>
                        {isDirty && (
                            <span className="text-amber-400 text-xs ml-2">• Unsaved</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3 items-center">
                    {/* Quiz Settings Button */}
                    <button
                        onClick={() => setShowQuizSettings(true)}
                        className="flex cursor-pointer items-center justify-center rounded-lg h-9 bg-dashboard-surface-dark hover:bg-dashboard-border-dark border border-dashboard-border-dark transition-colors text-slate-400 hover:text-white gap-2 text-sm font-medium px-3"
                    >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                        <span className="hidden sm:inline">Settings</span>
                    </button>

                    {quiz && (
                        <Link
                            href={buildPreviewUrl()}
                            target="_blank"
                            className="flex cursor-pointer items-center justify-center rounded-lg h-9 bg-dashboard-border-dark hover:bg-opacity-80 transition-colors text-white gap-2 text-sm font-semibold px-4"
                        >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                            <span>Preview</span>
                        </Link>
                    )}
                    <button
                        onClick={saveQuiz}
                        disabled={isSaving || !isDirty}
                        className="flex cursor-pointer items-center justify-center rounded-lg h-9 bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white gap-2 text-sm font-semibold px-4 shadow-[0_0_15px_rgba(100,103,242,0.3)]"
                    >
                        {isSaving ? (
                            <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                        ) : (
                            <span className="material-symbols-outlined text-[18px]">save</span>
                        )}
                        <span>{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>

                    {/* User Dropdown */}
                    <div className="relative ml-2">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-dashboard-primary flex items-center justify-center text-xs font-bold ring-2 ring-dashboard-background-dark cursor-pointer hover:ring-dashboard-primary/50 transition-all"
                        >
                            {(user?.username || 'AD').substring(0, 2).toUpperCase()}
                        </button>

                        {showDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDropdown(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg shadow-xl z-20 overflow-hidden">
                                    <div className="p-3 border-b border-dashboard-border-dark">
                                        <p className="text-sm font-medium text-white">{user?.username || 'Admin'}</p>
                                        <p className="text-xs text-slate-500">Administrator</p>
                                    </div>
                                    <Link
                                        href="/dashboard"
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-dashboard-background-dark transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/dashboard/settings"
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-slate-300 hover:bg-dashboard-background-dark transition-colors"
                                        onClick={() => setShowDropdown(false)}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">settings</span>
                                        Settings
                                    </Link>
                                    <div className="border-t border-dashboard-border-dark">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Quiz Settings Modal */}
            <QuizSettings isOpen={showQuizSettings} onClose={() => setShowQuizSettings(false)} />
        </>
    );
}
