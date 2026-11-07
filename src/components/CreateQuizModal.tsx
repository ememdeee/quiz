"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_QUIZ_THEME } from "@/types/quiz";

interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateQuizModal({ isOpen, onClose }: CreateQuizModalProps) {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setSlug('');
            setError('');
        }
    }, [isOpen]);

    // Auto-generate slug from title
    useEffect(() => {
        if (title) {
            const generatedSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            setSlug(generatedSlug);
        }
    }, [title]);

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!title.trim()) {
            setError('Please enter a quiz title');
            return;
        }
        if (!slug.trim()) {
            setError('Please enter a quiz slug');
            return;
        }

        // Validate slug format
        if (!/^[a-z0-9-]+$/.test(slug)) {
            setError('Slug can only contain lowercase letters, numbers, and hyphens');
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            // Check if slug already exists
            const checkResponse = await fetch(`/data/quizzes/${slug}.json`);
            if (checkResponse.ok) {
                setError('A quiz with this slug already exists');
                setIsCreating(false);
                return;
            }
        } catch {
            // Quiz doesn't exist, we can proceed
        }

        // Create new quiz
        const newQuiz = {
            quizId: slug,
            meta: {
                title: title,
                description: '',
                theme: { ...DEFAULT_QUIZ_THEME },
                status: 'draft',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            settings: {
                showProgressBar: true,
                allowBack: true,
                autoAdvance: true,
                autoAdvanceDelay: 600,
                shuffleOptions: false,
            },
            steps: [
                {
                    id: 'landing',
                    type: 'quiz-landing',
                    layout: 'default',
                    required: true,
                    content: {
                        title: 'Welcome to the Quiz',
                        subtitle: 'Let\'s get started!',
                        options: [
                            { value: 'female', label: 'Women Start Here', icon: 'female' },
                            { value: 'male', label: 'Men Start Here', icon: 'male' },
                        ],
                    },
                    navigation: {
                        showBack: false,
                        showSkip: false,
                    },
                },
            ],
        };

        try {
            const response = await fetch('/api/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newQuiz),
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz');
            }

            // Navigate to editor (correct route is /dashboard/{quizId})
            router.push(`/dashboard/${slug}`);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create quiz');
            setIsCreating(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-dashboard-surface-dark border border-dashboard-border-dark rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-dashboard-border-dark">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-dashboard-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-dashboard-primary">add_circle</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Create New Quiz</h2>
                                <p className="text-xs text-slate-500">Set up your quiz details</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-lg hover:bg-dashboard-border-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-5">
                        {/* Quiz Title */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Quiz Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="My Awesome Quiz"
                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none"
                                autoFocus
                            />
                        </div>

                        {/* Quiz Slug */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Quiz Slug (URL) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">/quiz/</span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="my-awesome-quiz"
                                    className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 pl-14 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none font-mono text-sm"
                                />
                            </div>
                            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">warning</span>
                                The slug cannot be changed after creation.
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 rounded-lg p-3">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-dashboard-border-dark bg-dashboard-background-dark/50">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating || !title.trim() || !slug.trim()}
                            className="flex items-center gap-2 px-5 py-2.5 bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-dashboard-primary/20"
                        >
                            {isCreating ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Create Quiz
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
