"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/Sidebar";
import { Header } from "../components/Header";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useRedirectionsStore } from "@/store/redirectionsStore";
import { useToast } from "@/contexts/ToastContext";

type SettingsTab = 'general' | 'redirections' | 'export-import';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const { quizList, loadQuizList } = useQuizBuilderStore();
    const { projectName, projectDescription, logoUrl, homePageQuiz, updateSettings, getExportData, importSettings } = useSettingsStore();
    const {
        forwardQueryParamsDefault,
        rules: redirectionRules,
        isLoaded: redirectionsLoaded,
        isSaving: redirectionsSaving,
        loadRedirections,
        setForwardDefault,
        addRule,
        updateRule,
        removeRule,
        saveRedirections,
    } = useRedirectionsStore();

    const [localProjectName, setLocalProjectName] = useState(projectName);
    const [localProjectDescription, setLocalProjectDescription] = useState(projectDescription);
    const [localLogoUrl, setLocalLogoUrl] = useState(logoUrl);
    const [localHomePageQuiz, setLocalHomePageQuiz] = useState(homePageQuiz);
    const [importText, setImportText] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        loadQuizList();
        loadRedirections();
    }, [loadQuizList, loadRedirections]);

    useEffect(() => {
        setLocalProjectName(projectName);
        setLocalProjectDescription(projectDescription);
        setLocalLogoUrl(logoUrl);
        setLocalHomePageQuiz(homePageQuiz);
    }, [projectName, projectDescription, logoUrl, homePageQuiz]);

    // Only show published quizzes for CTA
    const publishedQuizzes = quizList.filter(q => q.status === 'published');

    const handleSaveRedirections = async () => {
        const invalid = redirectionRules.find((r) => !r.from.trim() || !r.to.trim());
        if (invalid) {
            showToast('error', 'Each redirect rule needs both a "from" and "to" path.');
            return;
        }
        const fromPaths = redirectionRules.map((r) => r.from.trim().replace(/\/+$/, '') || '/');
        const dupe = fromPaths.find((p, i) => fromPaths.indexOf(p) !== i);
        if (dupe) {
            showToast('error', `Duplicate "from" path: ${dupe}`);
            return;
        }
        const result = await saveRedirections();
        if (result.ok) {
            showToast('success', 'Redirections saved! Changes apply within ~30s.');
        } else {
            showToast('error', result.error || 'Failed to save redirections.');
        }
    };

    const handleSaveGeneral = () => {
        updateSettings({
            projectName: localProjectName || 'LogicFlow',
            projectDescription: localProjectDescription,
            logoUrl: localLogoUrl,
            homePageQuiz: localHomePageQuiz,
        });
        showToast('success', 'Settings saved successfully!');
    };

    const handleExportAll = async () => {
        setIsExporting(true);
        try {
            // Fetch all quiz data
            const fullQuizzes = await Promise.all(
                quizList.map(async (quiz) => {
                    try {
                        const response = await fetch(`/data/quizzes/${quiz.quizId}.json`);
                        if (response.ok) {
                            return await response.json();
                        }
                        return null;
                    } catch {
                        return null;
                    }
                })
            );

            const exportData = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                settings: getExportData(),
                quizzes: fullQuizzes.filter(Boolean),
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${localProjectName.toLowerCase().replace(/\s+/g, '-')}-export-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('success', `Exported ${fullQuizzes.filter(Boolean).length} quizzes with settings!`);
        } catch (error) {
            showToast('error', 'Failed to export data.');
            console.error(error);
        }
        setIsExporting(false);
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const data = JSON.parse(importText);

            if (!data.quizzes || !Array.isArray(data.quizzes)) {
                throw new Error('Invalid export format - missing quizzes array');
            }

            // Import settings if present
            if (data.settings) {
                importSettings(data.settings);
                setLocalProjectName(data.settings.projectName || 'LogicFlow');
                setLocalProjectDescription(data.settings.projectDescription || '');
                setLocalLogoUrl(data.settings.logoUrl || '');
                setLocalHomePageQuiz(data.settings.homePageQuiz || '');
            }

            // Save each quiz via API
            let imported = 0;
            for (const quizData of data.quizzes) {
                if (quizData && quizData.quizId) {
                    try {
                        const response = await fetch('/api/quiz', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(quizData),
                        });
                        if (response.ok) imported++;
                    } catch (e) {
                        console.error('Failed to import quiz:', quizData.quizId, e);
                    }
                }
            }

            showToast('success', `Imported ${imported} quizzes${data.settings ? ' + settings' : ''}!`);
            setImportText('');
            loadQuizList();
        } catch (e) {
            showToast('error', 'Failed to import. Check JSON format.');
            console.error(e);
        }
        setIsImporting(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                <Header />
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

                        {/* Tabs */}
                        <div className="flex gap-4 mb-8 border-b border-dashboard-border-dark">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'general'
                                    ? 'text-dashboard-primary border-b-2 border-dashboard-primary'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                General
                            </button>
                            <button
                                onClick={() => setActiveTab('redirections')}
                                className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'redirections'
                                    ? 'text-dashboard-primary border-b-2 border-dashboard-primary'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Redirections
                            </button>
                            <button
                                onClick={() => setActiveTab('export-import')}
                                className={`pb-3 px-1 text-sm font-medium transition-colors cursor-pointer ${activeTab === 'export-import'
                                    ? 'text-dashboard-primary border-b-2 border-dashboard-primary'
                                    : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                Export / Import
                            </button>
                        </div>

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <div className="space-y-8">
                                {/* Project Branding */}
                                <div className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Project Branding</h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Customize your dashboard branding and appearance.
                                    </p>
                                    <div className="grid gap-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                Project Name
                                            </label>
                                            <input
                                                type="text"
                                                value={localProjectName}
                                                onChange={(e) => setLocalProjectName(e.target.value)}
                                                placeholder="Enter project name..."
                                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none"
                                            />
                                            <p className="text-xs text-slate-500 mt-1.5">
                                                This name appears in the sidebar and exports.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={localProjectDescription}
                                                onChange={(e) => setLocalProjectDescription(e.target.value)}
                                                placeholder="A brief description of your project..."
                                                rows={3}
                                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none resize-none"
                                            />
                                            <p className="text-xs text-slate-500 mt-1.5">
                                                Used as the default meta description on every page (home, dashboard, quiz). Individual pages can override.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                Logo URL
                                            </label>
                                            <input
                                                type="url"
                                                value={localLogoUrl}
                                                onChange={(e) => setLocalLogoUrl(e.target.value)}
                                                placeholder="https://example.com/logo.png"
                                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 px-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none"
                                            />
                                            {localLogoUrl && (
                                                <div className="mt-3 p-3 bg-dashboard-background-dark rounded-lg border border-dashboard-border-dark">
                                                    <p className="text-xs text-slate-500 mb-2">Preview:</p>
                                                    <img
                                                        src={localLogoUrl}
                                                        alt="Logo preview"
                                                        className="h-10 w-auto object-contain"
                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Home Page CTA */}
                                <div className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Home Page CTA</h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Select which published quiz will be used as the main CTA on your home page.
                                    </p>
                                    <div className="grid gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                Featured Quiz
                                            </label>
                                            <select
                                                value={localHomePageQuiz}
                                                onChange={(e) => setLocalHomePageQuiz(e.target.value)}
                                                className="w-full bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg py-3 px-4 text-white focus:ring-2 focus:ring-dashboard-primary focus:outline-none"
                                            >
                                                <option value="">Select a published quiz...</option>
                                                {publishedQuizzes.map((quiz) => (
                                                    <option key={quiz.quizId} value={quiz.quizId}>
                                                        {quiz.title}
                                                    </option>
                                                ))}
                                            </select>
                                            {publishedQuizzes.length === 0 && (
                                                <p className="text-xs text-amber-400 mt-2">
                                                    No published quizzes available. Publish a quiz first.
                                                </p>
                                            )}
                                        </div>
                                        {localHomePageQuiz && (
                                            <div className="p-4 bg-dashboard-background-dark rounded-lg border border-dashboard-border-dark">
                                                <p className="text-xs text-slate-500 mb-1">Preview URL</p>
                                                <code className="text-sm text-dashboard-primary">/quiz/{localHomePageQuiz}</code>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveGeneral}
                                    className="px-6 py-2.5 bg-dashboard-primary hover:bg-dashboard-primary/90 text-white font-medium rounded-lg transition-colors cursor-pointer"
                                >
                                    Save All Settings
                                </button>
                            </div>
                        )}

                        {/* Redirections Tab */}
                        {activeTab === 'redirections' && (
                            <div className="space-y-8">
                                <div className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">URL Redirections</h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Set up 301 redirects from one path to another. Both fields accept relative paths (e.g. <code className="text-dashboard-primary">/old</code> &rarr; <code className="text-dashboard-primary">/new</code>) so they work on any domain. The destination can also be an absolute URL (https://...).
                                    </p>

                                    <label className="flex items-start gap-3 p-4 bg-dashboard-background-dark rounded-lg border border-dashboard-border-dark mb-6 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={forwardQueryParamsDefault}
                                            onChange={(e) => setForwardDefault(e.target.checked)}
                                            className="mt-1 w-4 h-4 accent-dashboard-primary cursor-pointer"
                                        />
                                        <div>
                                            <p className="text-sm text-white font-medium">Forward query parameters by default</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                When enabled, query strings (e.g. <code className="text-dashboard-primary">?utm_source=fb</code>) on incoming requests are appended to the redirect target. New rules inherit this default; you can override per rule below.
                                            </p>
                                        </div>
                                    </label>

                                    <div className="space-y-3">
                                        {!redirectionsLoaded && (
                                            <p className="text-sm text-slate-500">Loading...</p>
                                        )}
                                        {redirectionsLoaded && redirectionRules.length === 0 && (
                                            <div className="p-6 bg-dashboard-background-dark rounded-lg border border-dashed border-dashboard-border-dark text-center">
                                                <p className="text-sm text-slate-500">No redirect rules yet. Click "Add Rule" to create one.</p>
                                            </div>
                                        )}
                                        {redirectionRules.map((rule) => (
                                            <div
                                                key={rule.id}
                                                className="p-4 bg-dashboard-background-dark rounded-lg border border-dashboard-border-dark space-y-3"
                                            >
                                                <div className="grid md:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                            From (path)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={rule.from}
                                                            onChange={(e) => updateRule(rule.id, { from: e.target.value })}
                                                            placeholder="/old-page"
                                                            className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none font-mono"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                            To (path or URL)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={rule.to}
                                                            onChange={(e) => updateRule(rule.id, { to: e.target.value })}
                                                            placeholder="/new-page or https://example.com/path"
                                                            className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2.5 px-3 text-white text-sm placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none font-mono"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={rule.forwardParams}
                                                            onChange={(e) => updateRule(rule.id, { forwardParams: e.target.checked })}
                                                            className="w-4 h-4 accent-dashboard-primary cursor-pointer"
                                                        />
                                                        <span className="text-xs text-slate-400">Forward query parameters</span>
                                                    </label>
                                                    <button
                                                        onClick={() => removeRule(rule.id)}
                                                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 cursor-pointer"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <button
                                            onClick={addRule}
                                            className="flex items-center gap-2 px-4 py-2.5 bg-dashboard-background-dark hover:bg-dashboard-border-dark border border-dashboard-border-dark text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">add</span>
                                            Add Rule
                                        </button>
                                        <button
                                            onClick={handleSaveRedirections}
                                            disabled={redirectionsSaving}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                                        >
                                            {redirectionsSaving ? (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Redirections'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Export/Import Tab */}
                        {activeTab === 'export-import' && (
                            <div className="space-y-8">
                                {/* Export */}
                                <div className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Export All Data</h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Download all quizzes (including all steps and settings) plus project settings as a single JSON file.
                                    </p>
                                    <div className="p-4 bg-dashboard-background-dark rounded-lg border border-dashboard-border-dark mb-4">
                                        <p className="text-sm text-slate-300 mb-2">Export will include:</p>
                                        <ul className="text-xs text-slate-500 space-y-1">
                                            <li className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-400 text-[14px]">check_circle</span>
                                                {quizList.length} quizzes with all steps and content
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-400 text-[14px]">check_circle</span>
                                                Project name: {localProjectName}
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-400 text-[14px]">check_circle</span>
                                                Logo and home page CTA settings
                                            </li>
                                        </ul>
                                    </div>
                                    <button
                                        onClick={handleExportAll}
                                        disabled={isExporting}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 text-white font-medium rounded-lg transition-colors cursor-pointer"
                                    >
                                        {isExporting ? (
                                            <>
                                                <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                                Exporting...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">download</span>
                                                Export All Data
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Import */}
                                <div className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-xl p-6">
                                    <h3 className="text-lg font-bold text-white mb-2">Import Data</h3>
                                    <p className="text-sm text-slate-400 mb-6">
                                        Paste exported JSON data to restore quizzes and settings.
                                    </p>
                                    <div className="space-y-4">
                                        <textarea
                                            value={importText}
                                            onChange={(e) => setImportText(e.target.value)}
                                            placeholder='Paste exported JSON here... (starts with {"version":"1.0",...})'
                                            className="w-full h-48 bg-dashboard-background-dark border border-dashboard-border-dark rounded-lg p-4 text-white text-sm font-mono placeholder-slate-600 focus:ring-2 focus:ring-dashboard-primary focus:outline-none resize-none"
                                        />
                                        <button
                                            onClick={handleImport}
                                            disabled={!importText.trim() || isImporting}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-dashboard-surface-dark hover:bg-dashboard-border-dark border border-dashboard-border-dark text-white font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isImporting ? (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                                                    Importing...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-[18px]">upload</span>
                                                    Import Data
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
