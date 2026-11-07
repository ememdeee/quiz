"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAnswerStore } from "@/store/answerStore";
import { useAuthStore } from "@/store/authStore";
import { useUserProfileStore } from "@/store/userProfileStore";
import { validateStep, runSyncToProfile } from "@/steps/registry";
import { pushEvent } from "@/lib/gtm";
import { track } from "@/lib/tracking";
import type { QuizConfig, QuizListItem } from "@/types/quiz";
import {
    nextVisibleIndex,
    prevVisibleIndex,
    visibleSteps,
    findOrphanedAnswers,
} from "@/lib/visibility";
import { resolveEffectiveStep } from "@/lib/branching";

// Step types where quiz_answer_selected fires on Continue, not on each keystroke/tick.
const DEFERRED_ANSWER_TYPES = new Set([
    'form-weight', 'form-height', 'form-age', 'form-input', 'form-target-date', 'checkbox',
]);

// Quiz data resolved server-side by the page (fs read instead of the old
// two client fetches). quiz === null means the quiz JSON doesn't exist.
export interface ServerQuizData {
    quiz: QuizConfig | null;
    indexStatus: string;
}

// =============================================================================
// useQuizFlow — encapsulates ALL quiz runtime orchestration
// =============================================================================

export function useQuizFlow(serverData?: ServerQuizData) {
    const params = useParams();
    const searchParams = useSearchParams();
    const quizId = params.quizId as string;
    const isPreviewMode = searchParams.get('preview') === 'true';

    // A published quiz can never be blocked by the draft gates, so it renders
    // immediately (this is what puts step 1 in the SSR HTML). Drafts depend on
    // client-only auth state and keep the loading -> gate flow.
    const isServedPublished = !!serverData?.quiz
        && serverData.indexStatus !== 'draft'
        && (serverData.quiz.meta as { status?: string })?.status !== 'draft';

    const [quiz, setQuiz] = useState<QuizConfig | null>(isServedPublished ? serverData!.quiz : null);
    const [isLoading, setIsLoading] = useState(!isServedPublished);
    const [error, setError] = useState<string | null>(null);
    const [weightPhase, setWeightPhase] = useState<'current' | 'target'>('current');
    const quizStartedRef = useRef(false);

    const { isAuthenticated } = useAuthStore();
    const {
        currentStepIndex,
        startQuiz,
        goToStep,
        setAnswer,
        getAnswer,
        getAllAnswers,
        clearAnswers,
        completeQuiz,
    } = useAnswerStore();

    const { setField } = useUserProfileStore();

    // Visibility-aware navigation. Replaces dumb index +/- 1.
    // Reads getAllAnswers() at call time so the latest state is used.
    const advanceForward = useCallback(() => {
        if (!quiz) return;
        const next = nextVisibleIndex(quiz.steps, currentStepIndex, getAllAnswers());
        if (next === -1) {
            pushEvent('quiz_completed', { quiz_id: quizId, total_steps: quiz.steps.length });
            completeQuiz();
        } else {
            goToStep(next);
        }
    }, [quiz, currentStepIndex, getAllAnswers, goToStep, completeQuiz, quizId]);

    const advanceBack = useCallback(() => {
        if (!quiz) return;
        const prev = prevVisibleIndex(quiz.steps, currentStepIndex, getAllAnswers());
        if (prev !== -1) goToStep(prev);
    }, [quiz, currentStepIndex, getAllAnswers, goToStep]);

    // ─── Load quiz data ─────────────────────────────────────────────────
    useEffect(() => {
        // Server-provided data path: same gates, same order, same state
        // transitions and events as loadQuiz — just no fetches.
        function applyServerData(data: ServerQuizData) {
            if (data.indexStatus === 'draft' && !isAuthenticated && !isPreviewMode) {
                setError('This quiz is not published yet.');
                setIsLoading(false);
                return;
            }

            if (!data.quiz) {
                setError('Quiz not found');
                setIsLoading(false);
                return;
            }

            const metaStatus = (data.quiz.meta as { status?: string })?.status;
            if (metaStatus === 'draft' && !isAuthenticated && !isPreviewMode) {
                setError('This quiz is not published yet.');
                setIsLoading(false);
                return;
            }

            setQuiz(data.quiz);
            startQuiz(quizId, data.quiz.steps.length);
            setIsLoading(false);
            if (!quizStartedRef.current) {
                quizStartedRef.current = true;
                pushEvent('quiz_started', { quiz_id: quizId, quiz_name: data.quiz.meta?.title ?? quizId });
            }
        }

        async function loadQuiz() {
            try {
                let quizStatus: string = 'published';

                try {
                    const indexResponse = await fetch('/data/quizzes/index.json');
                    if (indexResponse.ok) {
                        const quizList: QuizListItem[] = await indexResponse.json();
                        const quizMeta = quizList.find(q => q.quizId === quizId);
                        if (quizMeta) {
                            quizStatus = quizMeta.status || 'draft';
                        }
                    }
                } catch {
                    // Index not available, continue with quiz load
                }

                if (quizStatus === 'draft' && !isAuthenticated && !isPreviewMode) {
                    setError('This quiz is not published yet.');
                    setIsLoading(false);
                    return;
                }

                const response = await fetch(`/data/quizzes/${quizId}.json`);
                if (!response.ok) throw new Error('Quiz not found');

                const data: QuizConfig = await response.json();

                const metaStatus = (data.meta as { status?: string })?.status;
                if (metaStatus === 'draft' && !isAuthenticated && !isPreviewMode) {
                    setError('This quiz is not published yet.');
                    setIsLoading(false);
                    return;
                }

                setQuiz(data);
                startQuiz(quizId, data.steps.length);
                setIsLoading(false);
                if (!quizStartedRef.current) {
                    quizStartedRef.current = true;
                    pushEvent('quiz_started', { quiz_id: quizId, quiz_name: data.meta?.title ?? quizId });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load quiz');
                setIsLoading(false);
            }
        }

        if (serverData !== undefined) {
            applyServerData(serverData);
        } else if (quizId) {
            loadQuiz();
        }
    }, [quizId, startQuiz, isAuthenticated, isPreviewMode, serverData]);

    // ─── Handle ?step=N query parameter for debugging ───────────────────
    useEffect(() => {
        if (!quiz) return;
        const stepParam = searchParams.get('step');
        if (stepParam) {
            const stepNum = parseInt(stepParam, 10);
            if (!isNaN(stepNum) && stepNum >= 1 && stepNum <= quiz.steps.length) {
                goToStep(stepNum - 1);
            }
        }
    }, [quiz, searchParams, goToStep]);

    // ─── Smooth scroll to top on step change ────────────────────────────
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentStepIndex]);

    // ─── Track step views ────────────────────────────────────────────────
    useEffect(() => {
        if (!quiz) return;
        const step = quiz.steps[currentStepIndex];
        if (!step) return;
        pushEvent('quiz_step_view', {
            quiz_id: quizId,
            step_index: currentStepIndex + 1,
            step_id: step.id,
            step_type: step.type,
        });
    }, [quiz, currentStepIndex, quizId]);

    // ─── Auto-advance for LOADING / TIMED_SLIDE steps ───────────────────
    useEffect(() => {
        if (!quiz) return;

        const currentStep = quiz.steps[currentStepIndex];
        if (currentStep?.type === 'loading' || currentStep?.type === 'timed-slide') {
            const duration = (currentStep.content as { duration?: number }).duration || 3000;
            const timer = setTimeout(() => {
                advanceForward();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, quiz, advanceForward]);

    // ─── Answer handling ────────────────────────────────────────────────
    const handleAnswer = useCallback((value: unknown) => {
        if (!quiz) return;

        const currentStep = quiz.steps[currentStepIndex];
        setAnswer(currentStep.id, value);

        if (currentStep.type === 'quiz-landing') {
            track.quizStart();
        }

        if (!DEFERRED_ANSWER_TYPES.has(currentStep.type)) {
            pushEvent('quiz_answer_selected', {
                quiz_id: quizId,
                step_index: currentStepIndex + 1,
                step_id: currentStep.id,
                step_type: currentStep.type,
                answer_value: typeof value === 'object' ? JSON.stringify(value) : String(value),
            });
        }

        // Sync to global user profile store
        runSyncToProfile(currentStep.type, currentStep.id, value, setField);

        // Cascade-clear: if this answer change hides downstream steps the user
        // had already answered, drop those orphaned answers so state stays consistent.
        const nextAnswers = { ...getAllAnswers(), [currentStep.id]: value };
        const orphans = findOrphanedAnswers(quiz.steps, nextAnswers);
        if (orphans.length > 0) clearAnswers(orphans);

        // Auto-advance for certain step types
        if (currentStep.type === 'quiz-landing' ||
            currentStep.type === 'multiple-choice' ||
            currentStep.type === 'image-options' ||
            currentStep.navigation?.autoAdvance) {

            setTimeout(() => {
                advanceForward();
            }, 300);
        }
    }, [quiz, currentStepIndex, setAnswer, setField, getAllAnswers, clearAnswers, advanceForward, quizId]);

    // ─── Continue button ────────────────────────────────────────────────
    const handleContinue = useCallback(() => {
        if (!quiz) return;

        const cs = quiz.steps[currentStepIndex];
        if (cs.type === 'form-weight') {
            const a = getAnswer(cs.id);
            if (typeof a === 'object' && a !== null && 'value' in a) {
                const obj = a as { value: number; targetWeight?: number };
                if (!obj.targetWeight || obj.targetWeight <= 0 || obj.targetWeight >= obj.value) {
                    setWeightPhase('target');
                    return;
                }
            }
        }

        if (DEFERRED_ANSWER_TYPES.has(cs.type)) {
            const a = getAnswer(cs.id);
            pushEvent('quiz_answer_selected', {
                quiz_id: quizId,
                step_index: currentStepIndex + 1,
                step_id: cs.id,
                step_type: cs.type,
                answer_value: typeof a === 'object' ? JSON.stringify(a) : String(a ?? ''),
            });
        }

        advanceForward();
    }, [quiz, currentStepIndex, getAnswer, advanceForward, quizId]);

    // ─── Back button ────────────────────────────────────────────────────
    const handleBack = useCallback(() => {
        if (!quiz) return;
        const cs = quiz.steps[currentStepIndex];
        if (cs.type === 'form-weight' && weightPhase === 'target') {
            setWeightPhase('current');
            return;
        }
        advanceBack();
    }, [quiz, currentStepIndex, weightPhase, advanceBack]);

    // ─── Weight phase edit badge ────────────────────────────────────────
    const handleWeightPhaseBack = useCallback(() => {
        setWeightPhase('current');
    }, []);

    // ─── Computed values ────────────────────────────────────────────────
    // Resolve content/type through any matching conditional branch. Never
    // changes step id, so answers/tracking stay keyed to the same step.
    const rawStep = quiz?.steps[currentStepIndex] ?? null;
    const currentStep = rawStep
        ? resolveEffectiveStep(rawStep, getAllAnswers(), searchParams)
        : null;
    const answer = currentStep ? getAnswer(currentStep.id) : undefined;

    // Visibility-aware progress: count only currently-visible steps, and find
    // the position of the current step within that filtered list.
    const visible = quiz ? visibleSteps(quiz.steps, getAllAnswers()) : [];
    const visibleTotal = visible.length;
    const currentVisiblePosition = currentStep
        ? visible.findIndex((s) => s.id === currentStep.id) + 1
        : 0;
    const progress = visibleTotal > 0 ? (currentVisiblePosition / visibleTotal) * 100 : 0;

    const isFormValid = currentStep
        ? (answer ? validateStep(currentStep.type, answer, currentStep.content) : false)
        : false;

    return {
        // State
        quiz,
        isLoading,
        error,
        currentStep,
        currentStepIndex,
        progress,
        answer,
        isFormValid,
        weightPhase,
        // Visibility-aware step counts (use these for the progress UI)
        visibleTotal,
        currentVisiblePosition,

        // Handlers
        handleAnswer,
        handleContinue,
        handleBack,
        handleWeightPhaseBack,
    };
}
