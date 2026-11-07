"use client";

import React, { useState } from "react";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { getStepDef, getAllStepMeta } from "@/steps/registry";
import type { Step, StepBranch, StepType, VisibilityRules } from "@/types/quiz";
import { GenericEditor } from "./editors/GenericEditor";
import { SchemaEditor } from "./editors/SchemaEditor";
import { VisibilityEditor } from "./VisibilityEditor";
import { ConditionEditor } from "./ConditionEditor";

type ViewMode = 'visual' | 'json';

export function PropertyEditor() {
    const [viewMode, setViewMode] = useState<ViewMode>('visual');
    const {
        quiz,
        selectedStepId,
        selectedBranchId,
        selectBranch,
        updateStep,
        removeStep,
        updateBranch,
        removeBranch,
        saveQuiz,
        isSaving,
        isDirty,
        error,
    } = useQuizBuilderStore();

    const selectedStep = quiz?.steps.find((s) => s.id === selectedStepId);
    const selectedBranch = selectedBranchId
        ? selectedStep?.branches?.find((b) => b.id === selectedBranchId)
        : undefined;
    const isBranchMode = Boolean(selectedStep && selectedBranch);

    // Empty state
    if (!selectedStep) {
        return (
            <main className="flex-1 bg-dashboard-background-dark flex flex-col min-w-0 items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">
                    touch_app
                </span>
                <p className="text-slate-400">Select a step to edit</p>
            </main>
        );
    }

    // The type/content this panel actually edits: the branch's effective
    // values in branch mode, the step's own values otherwise.
    const effectiveType = isBranchMode ? (selectedBranch!.type ?? selectedStep.type) : selectedStep.type;
    const stepForEditing: Step = isBranchMode
        ? { ...selectedStep, type: effectiveType, content: selectedBranch!.content }
        : selectedStep;
    const meta = getStepDef(effectiveType);
    const content = stepForEditing.content as Record<string, unknown>;

    // Handle step type change - branches keep old content shaped for the old
    // type, so drop them rather than leave stale/mismatched content behind.
    const handleTypeChange = (newType: StepType) => {
        if (newType === selectedStep.type) return;
        updateStep(selectedStep.id, { type: newType, branches: [] });
    };

    const handleBranchTypeChange = (newType: StepType) => {
        if (!selectedBranch || newType === effectiveType) return;
        updateBranch(selectedStep.id, selectedBranch.id, { type: newType });
    };

    // Persist content/type changes back to either the step or the selected
    // branch, depending on mode. Both editor dispatch paths funnel through this.
    const handleUpdate = (updates: Partial<Step>) => {
        if (isBranchMode && selectedBranch) {
            const branchUpdates: Partial<StepBranch> = {};
            if ('content' in updates) branchUpdates.content = updates.content!;
            if ('type' in updates && updates.type) branchUpdates.type = updates.type;
            updateBranch(selectedStep.id, selectedBranch.id, branchUpdates);
        } else {
            updateStep(selectedStep.id, updates);
        }
    };

    // Render the appropriate step-specific editor from registry.
    // Preference order: schema → hand-coded editor → GenericEditor fallback.
    const renderStepEditor = () => {
        const editorProps = { step: stepForEditing, onUpdate: handleUpdate };

        const def = getStepDef(stepForEditing.type);
        if (!def) return <GenericEditor {...editorProps} />;

        if (def.schema) {
            return (
                <SchemaEditor
                    schema={def.schema}
                    content={stepForEditing.content as Record<string, unknown>}
                    onChange={(nextContent) => handleUpdate({ content: nextContent } as Partial<Step>)}
                />
            );
        }

        if (def.editor) {
            const EditorComponent = def.editor;
            return <EditorComponent {...editorProps} />;
        }

        return <GenericEditor {...editorProps} />;
    };

    // JSON View
    const jsonSubject = isBranchMode ? selectedBranch : selectedStep;
    const renderJsonView = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {isBranchMode ? "Branch JSON Data" : "Step JSON Data"}
                </label>
                <button
                    onClick={() => navigator.clipboard.writeText(JSON.stringify(jsonSubject, null, 2))}
                    className="text-xs text-dashboard-primary hover:text-dashboard-primary/80 flex items-center gap-1 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[14px]">content_copy</span>
                    Copy
                </button>
            </div>
            <pre className="bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg p-4 overflow-auto max-h-[60vh] text-xs text-slate-300 font-mono">
                {JSON.stringify(jsonSubject, null, 2)}
            </pre>
        </div>
    );

    return (
        <main className="flex-1 bg-dashboard-background-dark flex flex-col min-w-0">
            {/* Header */}
            <div className="h-14 border-b border-dashboard-border-dark flex items-center justify-between px-8 bg-dashboard-background-dark/95 backdrop-blur z-10 sticky top-0">
                <div className="flex items-center gap-3 min-w-0">
                    {isBranchMode ? (
                        <>
                            <button
                                onClick={() => selectBranch(null)}
                                className="text-slate-400 hover:text-white cursor-pointer flex items-center justify-center shrink-0"
                                title="Back to step"
                            >
                                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                            </button>
                            <span className="bg-amber-500/20 text-amber-400 p-1 rounded shrink-0">
                                <span className="material-symbols-outlined text-[20px] block">
                                    alt_route
                                </span>
                            </span>
                            <h1 className="text-white font-bold text-base truncate">
                                Branch of: {(selectedStep.content as Record<string, unknown>).title as string
                                    || (selectedStep.content as Record<string, unknown>).question as string
                                    || getStepDef(selectedStep.type)?.label
                                    || selectedStep.type}
                            </h1>
                        </>
                    ) : (
                        <>
                            <span className="bg-dashboard-primary/20 text-dashboard-primary p-1 rounded shrink-0">
                                <span className="material-symbols-outlined text-[20px] block">
                                    {meta?.icon || 'edit'}
                                </span>
                            </span>
                            <h1 className="text-white font-bold text-base truncate">
                                Edit Step: {(content.title as string) || (content.question as string) || meta?.label || selectedStep.type}
                            </h1>
                        </>
                    )}
                </div>
                <div className="flex bg-dashboard-surface-dark p-1 rounded-lg border border-dashboard-border-dark shrink-0">
                    <button
                        onClick={() => setViewMode('visual')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${viewMode === 'visual'
                            ? 'bg-dashboard-border-dark text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        Visual
                    </button>
                    <button
                        onClick={() => setViewMode('json')}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all cursor-pointer ${viewMode === 'json'
                            ? 'bg-dashboard-border-dark text-white shadow-sm'
                            : 'text-slate-400 hover:text-white'
                            }`}
                    >
                        JSON
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mx-8 mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-300 text-sm">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-custom">
                <div className="max-w-2xl mx-auto space-y-8">
                    {viewMode === 'json' ? renderJsonView() : (
                        <>
                            {isBranchMode && selectedBranch ? (
                                <>
                                    {/* Branch Conditions */}
                                    <ConditionEditor
                                        allSteps={quiz!.steps}
                                        currentStep={selectedStep}
                                        conditions={selectedBranch.conditions}
                                        onChange={(conditions) =>
                                            updateBranch(selectedStep.id, selectedBranch.id, { conditions })
                                        }
                                    />

                                    <div className="h-px bg-dashboard-border-dark w-full"></div>

                                    {/* Branch Basic Info */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Branch ID
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px]">
                                                        fingerprint
                                                    </span>
                                                    <input
                                                        className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:border-dashboard-primary placeholder-slate-600 font-mono focus:outline-none"
                                                        type="text"
                                                        value={selectedBranch.id}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Step Type
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px]">
                                                        category
                                                    </span>
                                                    <select
                                                        className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:border-dashboard-primary appearance-none cursor-pointer focus:outline-none"
                                                        value={effectiveType}
                                                        onChange={(e) => handleBranchTypeChange(e.target.value as StepType)}
                                                    >
                                                        {getAllStepMeta().map((m) => (
                                                            <option key={m.type} value={m.type}>
                                                                {m.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="absolute right-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px] pointer-events-none">
                                                        expand_more
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-dashboard-border-dark w-full"></div>

                                    {/* Branch Content Editor */}
                                    {renderStepEditor()}
                                </>
                            ) : (
                                <>
                                    {/* Basic Info Section */}
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Step ID
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px]">
                                                        fingerprint
                                                    </span>
                                                    <input
                                                        className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:border-dashboard-primary placeholder-slate-600 font-mono focus:outline-none"
                                                        type="text"
                                                        value={selectedStep.id}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                    Step Type
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px]">
                                                        category
                                                    </span>
                                                    <select
                                                        className="w-full bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:ring-1 focus:ring-dashboard-primary focus:border-dashboard-primary appearance-none cursor-pointer focus:outline-none"
                                                        value={selectedStep.type}
                                                        onChange={(e) => handleTypeChange(e.target.value as StepType)}
                                                    >
                                                        {getAllStepMeta().map((m) => (
                                                            <option key={m.type} value={m.type}>
                                                                {m.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <span className="absolute right-3 top-2.5 text-slate-500 material-symbols-outlined text-[16px] pointer-events-none">
                                                        expand_more
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-dashboard-border-dark w-full"></div>

                                    {/* Step-Specific Editor */}
                                    {renderStepEditor()}

                                    <div className="h-px bg-dashboard-border-dark w-full"></div>

                                    {/* Settings Section — hide for steps that don't need settings */}
                                    {selectedStep.type !== 'loading' && selectedStep.type !== 'timed-slide' && (
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                                                Step Settings
                                            </label>
                                            <div>
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-dashboard-surface-dark border border-dashboard-border-dark">
                                                    <span className="text-sm font-medium text-white">Show Back Button</span>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            checked={selectedStep.navigation?.showBack !== false}
                                                            onChange={(e) => updateStep(selectedStep.id, {
                                                                navigation: { ...selectedStep.navigation, showBack: e.target.checked }
                                                            })}
                                                            className="sr-only peer"
                                                            type="checkbox"
                                                        />
                                                        <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-dashboard-primary"></div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="h-px bg-dashboard-border-dark w-full"></div>

                                    {/* Visibility (conditional steps) */}
                                    {quiz && (
                                        <VisibilityEditor
                                            allSteps={quiz.steps}
                                            currentStep={selectedStep}
                                            onChange={(visibility: VisibilityRules | undefined) =>
                                                updateStep(selectedStep.id, { visibility } as Partial<Step>)
                                            }
                                        />
                                    )}
                                </>
                            )}

                            {/* Footer Spacing */}
                            <div className="h-10"></div>
                        </>
                    )}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="border-t border-dashboard-border-dark bg-dashboard-background-dark p-4 flex justify-between items-center z-10">
                {isBranchMode && selectedBranch ? (
                    <button
                        onClick={() => removeBranch(selectedStep.id, selectedBranch.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                        Delete Branch
                    </button>
                ) : (
                    <button
                        onClick={() => removeStep(selectedStep.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium px-4 py-2 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    >
                        Delete Step
                    </button>
                )}
                <div className="flex gap-3 items-center">
                    {isDirty && (
                        <span className="text-xs text-amber-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                            Unsaved changes
                        </span>
                    )}
                    <button
                        onClick={saveQuiz}
                        disabled={isSaving || !isDirty}
                        className="bg-dashboard-primary hover:bg-dashboard-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors shadow-lg shadow-dashboard-primary/20 cursor-pointer flex items-center gap-2"
                    >
                        {isSaving && (
                            <span className="material-symbols-outlined text-[16px] animate-spin">
                                progress_activity
                            </span>
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </main>
    );
}
