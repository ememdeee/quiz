"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { getStepDef } from "@/steps/registry";
import type { Step, StepBranch } from "@/types/quiz";
import { stepDisplayLabel } from "./stepAnswerHelpers";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const MENU_WIDTH = 208; // w-52

// Three-dot row menu — currently one action, built so more can be added later
// without restructuring (same inline trigger+backdrop+panel pattern used
// elsewhere in the dashboard, e.g. EditorHeader.tsx). Rendered through a
// portal because the row it lives in uses overflow-hidden (for the active-row
// tint overlay), which would otherwise clip the dropdown.
function StepRowMenu({ onAddBranch }: { onAddBranch: () => void }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => {
        if (!open && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: Math.max(8, rect.right - MENU_WIDTH),
            });
        }
        setOpen((v) => !v);
    };

    return (
        <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
                ref={triggerRef}
                onClick={handleToggle}
                className="material-symbols-outlined text-slate-500 text-[16px] opacity-0 group-hover:opacity-100 hover:text-white cursor-pointer rounded p-0.5"
                title="Step options"
            >
                more_vert
            </button>
            {open && position && typeof document !== "undefined" && createPortal(
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
                    <div
                        style={{ top: position.top, left: position.left, width: MENU_WIDTH }}
                        className="fixed bg-dashboard-surface-dark border border-dashboard-border-dark rounded-lg shadow-xl z-40 overflow-hidden py-1"
                    >
                        <button
                            onClick={() => {
                                setOpen(false);
                                onAddBranch();
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-200 hover:bg-dashboard-primary/10 hover:text-white cursor-pointer text-left"
                        >
                            <span className="material-symbols-outlined text-[16px] text-amber-400">
                                alt_route
                            </span>
                            Add Conditional Branch
                        </button>
                    </div>
                </>,
                document.body
            )}
        </div>
    );
}

// Sortable Step item component
function SortableStepItem({
    step,
    index,
    isActive,
    onClick,
    onAddBranch,
}: {
    step: Step;
    index: number;
    isActive: boolean;
    onClick: () => void;
    onAddBranch: () => void;
}) {
    const meta = getStepDef(step.type);
    const content = step.content as Record<string, unknown>;
    const displayTitle = (content.title as string) || (content.question as string) || meta?.label || step.type;
    const isConditional = Boolean(step.visibility && step.visibility.rules.length > 0);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: step.id
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : 1,
    };

    if (isActive) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="group px-3 py-1 relative"
            >
                {/* Active Indicator */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-dashboard-primary rounded-r-full"></div>
                <div
                    className="flex items-center gap-3 p-2 rounded-lg bg-dashboard-surface-dark border border-dashboard-primary/30 cursor-pointer shadow-sm relative overflow-hidden"
                    onClick={onClick}
                >
                    <div className="absolute inset-0 bg-dashboard-primary/5 pointer-events-none"></div>
                    <span
                        {...attributes}
                        {...listeners}
                        className="material-symbols-outlined text-slate-500 text-[16px] cursor-grab active:cursor-grabbing hover:text-white"
                    >
                        drag_indicator
                    </span>
                    <div className="flex items-center justify-center rounded bg-dashboard-primary/20 shrink-0 size-8 text-dashboard-primary">
                        <span className="material-symbols-outlined text-[18px]">
                            {meta?.icon || 'help'}
                        </span>
                    </div>
                    <div className="flex flex-col min-w-0 relative z-10 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                            {index + 1}. {displayTitle}
                        </p>
                        <p className="text-[10px] text-dashboard-primary/80 truncate">
                            {meta?.label || step.type}
                        </p>
                    </div>
                    {isConditional && (
                        <span
                            className="material-symbols-outlined text-[14px] text-amber-400 shrink-0 relative z-10"
                            title="This step is conditional"
                        >
                            filter_alt
                        </span>
                    )}
                    <StepRowMenu onAddBranch={onAddBranch} />
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group px-3 py-1"
        >
            <div
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-dashboard-surface-dark transition-colors cursor-pointer border border-transparent hover:border-dashboard-border-dark/50"
                onClick={onClick}
            >
                <span
                    {...attributes}
                    {...listeners}
                    className="material-symbols-outlined text-slate-600 text-[16px] opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing hover:text-white"
                >
                    drag_indicator
                </span>
                <div className="flex items-center justify-center rounded bg-dashboard-surface-dark shrink-0 size-8 text-slate-400 group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">
                        {meta?.icon || 'help'}
                    </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-300 group-hover:text-white truncate">
                        {index + 1}. {displayTitle}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                        {meta?.label || step.type}
                    </p>
                </div>
                {isConditional && (
                    <span
                        className="material-symbols-outlined text-[14px] text-amber-400/70 shrink-0"
                        title="This step is conditional"
                    >
                        filter_alt
                    </span>
                )}
                <StepRowMenu onAddBranch={onAddBranch} />
            </div>
        </div>
    );
}

/** Short, human-readable summary of a branch's first condition, for the sidebar row. */
function branchSummary(branch: StepBranch, allSteps: Step[]): string {
    if (branch.label) return branch.label;
    const rule = branch.conditions.rules[0];
    if (!rule) return "New branch";

    const opSymbol: Record<string, string> = {
        equals: "=",
        not_equals: "≠",
        greater_than: ">",
        less_than: "<",
        contains: "contains",
        is_empty: "is empty",
        is_not_empty: "is not empty",
    };
    const op = opSymbol[rule.operator] ?? rule.operator;
    const showValue = rule.operator !== "is_empty" && rule.operator !== "is_not_empty";

    if (rule.source === "queryParam") {
        const param = rule.param || "param";
        return showValue ? `${param} ${op} ${rule.value || "…"}` : `${param} ${op}`;
    }

    const sourceStep = allSteps.find((s) => s.id === rule.stepId);
    const label = sourceStep ? stepDisplayLabel(sourceStep, allSteps.indexOf(sourceStep)).replace(/^\d+\.\s*/, "") : "answer";
    return showValue ? `${label} ${op} ${rule.value || "…"}` : `${label} ${op}`;
}

function BranchStepItem({
    branch,
    allSteps,
    isActive,
    canMoveUp,
    canMoveDown,
    onClick,
    onMoveUp,
    onMoveDown,
    onRemove,
}: {
    branch: StepBranch;
    allSteps: Step[];
    isActive: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
    onClick: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="pl-8 pr-3 py-0.5">
            <div
                className={`group/branch flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg cursor-pointer border-l-2 border-dashed transition-colors ${isActive
                    ? "bg-amber-500/10 border-amber-400/60"
                    : "border-dashboard-primary/30 hover:bg-dashboard-surface-dark hover:border-amber-400/40"
                    }`}
                onClick={onClick}
            >
                <span className="material-symbols-outlined text-[15px] text-amber-400 shrink-0">
                    alt_route
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                    <p className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-slate-300 group-hover/branch:text-white"}`}>
                        {branchSummary(branch, allSteps)}
                    </p>
                    <p className="text-[9px] text-amber-400/70 truncate">Conditional Branch</p>
                </div>
                <div
                    className="flex items-center gap-0.5 opacity-0 group-hover/branch:opacity-100 transition-opacity shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        className="text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0.5"
                        title="Move up"
                    >
                        <span className="material-symbols-outlined text-[14px]">keyboard_arrow_up</span>
                    </button>
                    <button
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        className="text-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer p-0.5"
                        title="Move down"
                    >
                        <span className="material-symbols-outlined text-[14px]">keyboard_arrow_down</span>
                    </button>
                    <button
                        onClick={onRemove}
                        className="text-slate-500 hover:text-red-400 cursor-pointer p-0.5"
                        title="Delete branch"
                    >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export function StepNavigator() {
    const {
        quiz,
        selectedStepId,
        selectedBranchId,
        selectStep,
        selectBranch,
        addStep,
        reorderSteps,
        addBranch,
        removeBranch,
        reorderBranches,
    } = useQuizBuilderStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && quiz) {
            const oldIndex = quiz.steps.findIndex(s => s.id === active.id);
            const newIndex = quiz.steps.findIndex(s => s.id === over.id);

            reorderSteps(oldIndex, newIndex);
        }
    };

    const handleAddStep = () => {
        // Default to adding a multiple choice step
        addStep('multiple-choice', selectedStepId || undefined);
    };

    return (
        <aside className="w-64 bg-dashboard-background-dark border-r border-dashboard-border-dark flex flex-col shrink-0">
            <div className="p-4 border-b border-dashboard-border-dark flex justify-between items-center bg-dashboard-background-dark sticky top-0 z-10">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Quiz Flow
                </h3>
                <span className="text-[10px] text-slate-500">
                    {quiz?.steps.length || 0} steps
                </span>
            </div>
            <div className="flex-1 overflow-y-auto py-2 scrollbar-custom">
                {quiz && quiz.steps.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={quiz.steps.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {quiz.steps.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    <SortableStepItem
                                        step={step}
                                        index={index}
                                        isActive={step.id === selectedStepId && !selectedBranchId}
                                        onClick={() => selectStep(step.id)}
                                        onAddBranch={() => addBranch(step.id)}
                                    />
                                    {step.branches?.map((branch, branchIndex) => (
                                        <BranchStepItem
                                            key={branch.id}
                                            branch={branch}
                                            allSteps={quiz.steps}
                                            isActive={step.id === selectedStepId && branch.id === selectedBranchId}
                                            canMoveUp={branchIndex > 0}
                                            canMoveDown={branchIndex < (step.branches?.length ?? 0) - 1}
                                            onClick={() => {
                                                selectStep(step.id);
                                                selectBranch(branch.id);
                                            }}
                                            onMoveUp={() => reorderBranches(step.id, branchIndex, branchIndex - 1)}
                                            onMoveDown={() => reorderBranches(step.id, branchIndex, branchIndex + 1)}
                                            onRemove={() => removeBranch(step.id, branch.id)}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="px-4 py-8 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-600 mb-2 block">
                            quiz
                        </span>
                        <p className="text-sm text-slate-500">No steps yet</p>
                        <p className="text-xs text-slate-600">Add your first step below</p>
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-dashboard-border-dark mt-auto bg-dashboard-background-dark">
                <button
                    onClick={handleAddStep}
                    className="flex items-center justify-center w-full gap-2 rounded-lg bg-dashboard-surface-dark border border-dashboard-border-dark hover:border-slate-600 text-slate-300 hover:text-white py-2.5 transition-all text-sm font-medium group cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-90 transition-transform">
                        add
                    </span>
                    Add New Step
                </button>
            </div>
        </aside>
    );
}
