"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { useToast } from "@/contexts/ToastContext";
import type { QuizTheme } from "@/types/quiz";
import { DEFAULT_QUIZ_THEME } from "@/types/quiz";

interface QuizSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

// Theme presets
const THEME_PRESETS: { name: string; theme: QuizTheme }[] = [
    { name: 'Mint', theme: DEFAULT_QUIZ_THEME },
    { name: 'Coral', theme: { primary: '#f97066', primaryForeground: '#ffffff', background: '#fef7f4', foreground: '#1a1a2e', mutedForeground: '#6b7280', border: '#fde8e4' } },
    { name: 'Indigo', theme: { primary: '#6467f2', primaryForeground: '#ffffff', background: '#f5f5ff', foreground: '#1a1a2e', mutedForeground: '#6b7280', border: '#e0e0f0' } },
    { name: 'Gold', theme: { primary: '#f5a623', primaryForeground: '#1a1a2e', background: '#fffdf5', foreground: '#1a1a2e', mutedForeground: '#6b7280', border: '#e8dcc8' } },
    { name: 'Warm Sand', theme: { primary: '#B45A3C', primaryForeground: '#ffffff', background: '#fbf6f0', foreground: '#2a2420', mutedForeground: '#8c8076', border: '#ece0d2' } },
    { name: 'Forest', theme: { primary: '#0F4D3A', primaryForeground: '#ffffff', background: '#DFF3EC', foreground: '#0F4D3A', mutedForeground: '#3E8F7A', border: '#b8d9cf' } },
];

const THEME_FIELDS: { key: keyof QuizTheme; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'primaryForeground', label: 'Primary Text' },
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Text' },
    { key: 'mutedForeground', label: 'Muted Text' },
    { key: 'border', label: 'Border' },
];

// Thumbnail options
const THUMBNAIL_OPTIONS = [
    {
        value: '',
        label: 'Default Gradient',
        preview: 'linear-gradient(135deg, #6467f2 0%, #ec4899 100%)'
    },
    {
        value: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXk51eYEkhF49xf8HudSwKps9vv5gY5uPaB0asg7c4b6FxXwZzd0Lc9XkzXXwgT35PaY8wLlfi8Rlqds-MUyuUZaJm8yvBUMWjDfETMcAmT_P689lsuR3BKwK-hvM9oWVehtvSOBHAtJ2IIYREVLs20Aq8KaYe6RnCL4DNBHP-iKZCNFi0pVBXveE9-oPCZPPD7LfAVfsmU85xRn9ySovDXFGF1lpV5hKmtivg1R4cXNWK6YKWYxk9j0V9sVHaBPRawF_Di_twlxmw',
        label: 'Fitness Theme',
        preview: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuCXk51eYEkhF49xf8HudSwKps9vv5gY5uPaB0asg7c4b6FxXwZzd0Lc9XkzXXwgT35PaY8wLlfi8Rlqds-MUyuUZaJm8yvBUMWjDfETMcAmT_P689lsuR3BKwK-hvM9oWVehtvSOBHAtJ2IIYREVLs20Aq8KaYe6RnCL4DNBHP-iKZCNFi0pVBXveE9-oPCZPPD7LfAVfsmU85xRn9ySovDXFGF1lpV5hKmtivg1R4cXNWK6YKWYxk9j0V9sVHaBPRawF_Di_twlxmw)'
    },
];

export function QuizSettings({ isOpen, onClose }: QuizSettingsProps) {
    const router = useRouter();
    const { quiz, updateQuizMeta, saveQuiz } = useQuizBuilderStore();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [status, setStatus] = useState<'published' | 'draft'>('draft');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [theme, setTheme] = useState<QuizTheme>({ ...DEFAULT_QUIZ_THEME });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Initialize and track changes
    useEffect(() => {
        if (quiz && isOpen) {
            const currentStatus = (quiz.meta as { status?: string })?.status;
            const currentThumbnail = (quiz.meta as { thumbnailUrl?: string })?.thumbnailUrl || '';
            setTitle(quiz.meta.title || '');
            setSlug(quiz.quizId || '');
            setStatus(currentStatus === 'published' ? 'published' : 'draft');
            setThumbnailUrl(currentThumbnail);
            const currentTheme = (quiz.meta.theme && typeof quiz.meta.theme === 'object')
                ? quiz.meta.theme as QuizTheme
                : { ...DEFAULT_QUIZ_THEME };
            setTheme(currentTheme);
            setHasChanges(false);
            setShowDeleteConfirm(false);
        }
    }, [quiz, isOpen]);

    // Track changes
    useEffect(() => {
        if (!quiz) return;
        const currentStatus = (quiz.meta as { status?: string })?.status || 'draft';
        const currentThumbnail = (quiz.meta as { thumbnailUrl?: string })?.thumbnailUrl || '';
        const savedTheme = (quiz.meta.theme && typeof quiz.meta.theme === 'object')
            ? quiz.meta.theme as QuizTheme
            : DEFAULT_QUIZ_THEME;
        const themeChanged = JSON.stringify(theme) !== JSON.stringify(savedTheme);
        const changed =
            title !== quiz.meta.title ||
            status !== currentStatus ||
            thumbnailUrl !== currentThumbnail ||
            themeChanged;
        setHasChanges(changed);
    }, [title, status, thumbnailUrl, theme, quiz]);

    if (!isOpen || !quiz) return null;

    const handleSave = async () => {
        if (!hasChanges) return;

        setIsSaving(true);

        updateQuizMeta({
            title,
            status,
            thumbnailUrl,
            theme,
        } as Parameters<typeof updateQuizMeta>[0]);

        // Wait a tick for state to update, then save
        await new Promise(resolve => setTimeout(resolve, 50));
        await saveQuiz();

        setIsSaving(false);
        setHasChanges(false);
        showToast('success', 'Quiz settings saved successfully');
        onClose();
    };

    const handleDelete = async () => {
        if (!quiz) return;

        setIsDeleting(true);

        try {
            const response = await fetch(`/api/quiz/${quiz.quizId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete quiz');
            }

            showToast('success', 'Quiz deleted successfully');
            router.push('/dashboard');
        } catch (error) {
            console.error('Delete error:', error);
            showToast('error', 'Failed to delete quiz');
            setIsDeleting(false);
            setShowDeleteConfirm(false);
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
                <div className="w-full max-w-lg bg-dashboard-surface-dark border border-dashboard-border-dark rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-dashboard-border-dark shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg bg-dashboard-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-dashboard-primary">settings</span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">Quiz Settings</h2>
                                <p className="text-xs text-slate-500">Configure quiz metadata</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 rounded-lg hover:bg-dashboard-border-dark flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-5 space-y-5 overflow-y-auto flex-1">
                        {/* Quiz Title */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Quiz Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter quiz title..."
                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none"
                            />
                        </div>

                        {/* Quiz Slug */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Quiz Slug (URL)
                            </label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm">/quiz/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        disabled
                                        className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 pl-14 pr-4 text-slate-500 placeholder-slate-600 font-mono text-sm cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-slate-600 mt-1.5">
                                Slug cannot be changed after creation.
                            </p>
                        </div>

                        {/* Thumbnail */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Thumbnail
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {THUMBNAIL_OPTIONS.map((option) => (
                                    <button
                                        key={option.label}
                                        onClick={() => setThumbnailUrl(option.value)}
                                        className={`relative rounded-lg overflow-hidden aspect-[16/9] border-2 transition-all cursor-pointer group ${thumbnailUrl === option.value
                                                ? 'border-dashboard-primary ring-2 ring-dashboard-primary/30'
                                                : 'border-dashboard-border-dark hover:border-slate-500'
                                            }`}
                                    >
                                        <div
                                            className="absolute inset-0 bg-cover bg-center"
                                            style={{
                                                background: option.preview,
                                                backgroundSize: option.value ? 'cover' : undefined
                                            }}
                                        />
                                        {thumbnailUrl === option.value && (
                                            <div className="absolute inset-0 bg-dashboard-primary/20 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-white text-2xl">check_circle</span>
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                                            <span className="text-xs text-white font-medium">{option.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Theme
                            </label>

                            {/* Preset Swatches */}
                            <div className="flex gap-2 mb-4">
                                {THEME_PRESETS.map((preset) => {
                                    const isActive = JSON.stringify(theme) === JSON.stringify(preset.theme);
                                    return (
                                        <button
                                            key={preset.name}
                                            onClick={() => setTheme({ ...preset.theme })}
                                            className={`flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg border transition-all cursor-pointer ${isActive
                                                ? 'border-dashboard-primary bg-dashboard-primary/10'
                                                : 'border-dashboard-border-dark hover:border-slate-500'
                                            }`}
                                        >
                                            <div className="flex gap-0.5">
                                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.theme.primary }} />
                                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ background: preset.theme.background }} />
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400">{preset.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Manual Color Inputs */}
                            <div className="space-y-2.5">
                                {THEME_FIELDS.map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={theme[key]}
                                            onChange={(e) => setTheme(prev => ({ ...prev, [key]: e.target.value }))}
                                            className="w-8 h-8 rounded-lg border border-dashboard-border-dark cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
                                        />
                                        <div className="flex-1">
                                            <span className="text-xs font-medium text-slate-400">{label}</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={theme[key]}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (/^#[0-9a-fA-F]{0,6}$/.test(val)) {
                                                    setTheme(prev => ({ ...prev, [key]: val }));
                                                }
                                            }}
                                            className="w-24 bg-dashboard-background-dark border border-dashboard-border-dark rounded-md py-1.5 px-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-dashboard-primary focus:outline-none"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Reset to defaults */}
                            <button
                                onClick={() => setTheme({ ...DEFAULT_QUIZ_THEME })}
                                className="mt-3 text-[11px] text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                                Reset to defaults
                            </button>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Status
                            </label>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStatus('draft')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all cursor-pointer ${status === 'draft'
                                            ? 'bg-slate-500/20 border-slate-500/50 text-slate-300'
                                            : 'bg-dashboard-background-dark border-dashboard-border-dark text-slate-500 hover:border-slate-500/50'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${status === 'draft' ? 'bg-slate-400' : 'bg-slate-600'}`}></span>
                                    <span className="font-medium">Draft</span>
                                </button>
                                <button
                                    onClick={() => setStatus('published')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all cursor-pointer ${status === 'published'
                                            ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                            : 'bg-dashboard-background-dark border-dashboard-border-dark text-slate-500 hover:border-green-500/50'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${status === 'published' ? 'bg-green-400' : 'bg-slate-600'}`}></span>
                                    <span className="font-medium">Published</span>
                                </button>
                            </div>
                            {status === 'draft' && (
                                <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">info</span>
                                    Draft quizzes require ?preview=true to view.
                                </p>
                            )}
                        </div>

                        {/* Danger Zone */}
                        <div className="pt-4 border-t border-dashboard-border-dark">
                            <label className="block text-[11px] font-bold text-red-400 uppercase tracking-wider mb-3">
                                Danger Zone
                            </label>
                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors cursor-pointer text-sm"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete this quiz
                                </button>
                            ) : (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                    <p className="text-red-300 text-sm mb-3">
                                        Are you sure you want to delete this quiz? This action cannot be undone.
                                    </p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={isDeleting}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold rounded-lg transition-colors cursor-pointer"
                                        >
                                            {isDeleting ? (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                                                    Yes, delete permanently
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-5 border-t border-dashboard-border-dark bg-dashboard-background-dark/50 shrink-0">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !hasChanges}
                            className="flex items-center gap-2 px-5 py-2.5 bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all cursor-pointer shadow-lg shadow-dashboard-primary/20"
                        >
                            {isSaving ? (
                                <>
                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
