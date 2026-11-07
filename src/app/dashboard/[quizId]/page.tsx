"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuizBuilderStore } from "@/store/quizBuilderStore";
import { EditorHeader } from "../../editor/components/EditorHeader";
import { StepNavigator } from "../../editor/components/StepNavigator";
import { PropertyEditor } from "../../editor/components/PropertyEditor";
import { LivePreview } from "../../editor/components/LivePreview";
import { DashboardLoading } from "@/components/DashboardLoading";

export default function QuizEditorPage() {
    const params = useParams();
    const quizId = params.quizId as string;

    const { quiz, isLoading, error, loadQuiz } = useQuizBuilderStore();

    useEffect(() => {
        if (quizId) {
            loadQuiz(quizId);
        }
    }, [quizId, loadQuiz]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex h-screen w-full">
                <DashboardLoading message="Loading quiz..." />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-dashboard-background-dark">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <span className="material-symbols-outlined text-5xl text-red-400">
                        error
                    </span>
                    <h2 className="text-xl font-bold text-white">Failed to load quiz</h2>
                    <p className="text-slate-400">{error}</p>
                    <a
                        href="/dashboard"
                        className="px-4 py-2 bg-dashboard-primary text-white rounded-lg hover:bg-dashboard-primary/90 transition-colors"
                    >
                        Back to Dashboard
                    </a>
                </div>
            </div>
        );
    }

    // No quiz loaded yet
    if (!quiz) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-dashboard-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <span className="material-symbols-outlined text-5xl text-slate-600">
                        quiz
                    </span>
                    <p className="text-slate-400">No quiz selected</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-dashboard-background-dark">
            <EditorHeader />
            {/* Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
                <StepNavigator />
                <PropertyEditor />
                <LivePreview />
            </div>
        </div>
    );
}
