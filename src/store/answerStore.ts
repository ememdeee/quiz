import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// =============================================================================
// ANSWER TYPES
// =============================================================================

export interface Answer {
    stepId: string;
    value: unknown;
    timestamp: number;
}

// =============================================================================
// STORE STATE INTERFACE
// =============================================================================

interface AnswerState {
    // Quiz info
    quizId: string | null;
    totalSteps: number;

    // Navigation
    currentStepIndex: number;

    // User answers
    answers: Record<string, Answer>;

    // Session tracking
    startTime: number | null;
    completedAt: number | null;

    // State
    isComplete: boolean;
}

// =============================================================================
// STORE ACTIONS INTERFACE
// =============================================================================

interface AnswerActions {
    // Lifecycle
    startQuiz: (quizId: string, totalSteps: number) => void;
    resetQuiz: () => void;
    completeQuiz: () => void;

    // Navigation
    nextStep: () => void;
    prevStep: () => void;
    goToStep: (index: number) => void;

    // Answers
    setAnswer: (stepId: string, value: unknown) => void;
    getAnswer: (stepId: string) => unknown | undefined;
    hasAnswer: (stepId: string) => boolean;
    clearAnswers: (stepIds: string[]) => void;

    // Computed / Helpers
    getProgress: () => number;
    getTimeSpent: () => number;
    getAllAnswers: () => Record<string, unknown>;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: AnswerState = {
    quizId: null,
    totalSteps: 0,
    currentStepIndex: 0,
    answers: {},
    startTime: null,
    completedAt: null,
    isComplete: false,
};

// =============================================================================
// STORE CREATION
// =============================================================================

export const useAnswerStore = create<AnswerState & AnswerActions>()(
    immer((set, get) => ({
        ...initialState,

        // =========================================================================
        // LIFECYCLE
        // =========================================================================

        startQuiz: (quizId: string, totalSteps: number) => {
            set((state) => {
                state.quizId = quizId;
                state.totalSteps = totalSteps;
                state.currentStepIndex = 0;
                state.answers = {};
                state.startTime = Date.now();
                state.completedAt = null;
                state.isComplete = false;
            });
        },

        resetQuiz: () => {
            set(initialState);
        },

        completeQuiz: () => {
            set((state) => {
                state.isComplete = true;
                state.completedAt = Date.now();
            });
        },

        // =========================================================================
        // NAVIGATION
        // =========================================================================

        nextStep: () => {
            const { currentStepIndex, totalSteps } = get();
            if (currentStepIndex < totalSteps - 1) {
                set((state) => {
                    state.currentStepIndex = currentStepIndex + 1;
                });
            }
        },

        prevStep: () => {
            const { currentStepIndex } = get();
            if (currentStepIndex > 0) {
                set((state) => {
                    state.currentStepIndex = currentStepIndex - 1;
                });
            }
        },

        goToStep: (index: number) => {
            const { totalSteps } = get();
            if (index >= 0 && index < totalSteps) {
                set((state) => {
                    state.currentStepIndex = index;
                });
            }
        },

        // =========================================================================
        // ANSWERS
        // =========================================================================

        setAnswer: (stepId: string, value: unknown) => {
            set((state) => {
                state.answers[stepId] = {
                    stepId,
                    value,
                    timestamp: Date.now(),
                };
            });
        },

        getAnswer: (stepId: string) => {
            const { answers } = get();
            return answers[stepId]?.value;
        },

        hasAnswer: (stepId: string) => {
            const { answers } = get();
            return stepId in answers;
        },

        clearAnswers: (stepIds: string[]) => {
            if (stepIds.length === 0) return;
            set((state) => {
                for (const id of stepIds) {
                    delete state.answers[id];
                }
            });
        },

        // =========================================================================
        // COMPUTED / HELPERS
        // =========================================================================

        getProgress: () => {
            const { currentStepIndex, totalSteps } = get();
            if (totalSteps === 0) return 0;
            return ((currentStepIndex + 1) / totalSteps) * 100;
        },

        getTimeSpent: () => {
            const { startTime, completedAt } = get();
            if (!startTime) return 0;
            const endTime = completedAt || Date.now();
            return Math.floor((endTime - startTime) / 1000);
        },

        getAllAnswers: () => {
            const { answers } = get();
            const result: Record<string, unknown> = {};
            for (const [stepId, answer] of Object.entries(answers)) {
                result[stepId] = answer.value;
            }
            return result;
        },
    }))
);
