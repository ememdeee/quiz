import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { QuizConfig, Step, StepBranch, StepType, QuizListItem } from '@/types/quiz';
import { DEFAULT_QUIZ_THEME } from '@/types/quiz';

// =============================================================================
// STORE STATE INTERFACE
// =============================================================================

interface QuizBuilderState {
    // Current quiz being edited
    quiz: QuizConfig | null;

    // Selected step in editor
    selectedStepId: string | null;

    // Selected conditional branch within the selected step (null = editing the step itself)
    selectedBranchId: string | null;

    // Dirty state tracking
    isDirty: boolean;

    // Loading states
    isLoading: boolean;
    isSaving: boolean;

    // Error handling
    error: string | null;

    // Quiz list for dashboard
    quizList: QuizListItem[];
}

// =============================================================================
// STORE ACTIONS INTERFACE
// =============================================================================

interface QuizBuilderActions {
    // Quiz CRUD
    loadQuiz: (quizId: string) => Promise<void>;
    createQuiz: (title: string) => Promise<string>;
    saveQuiz: () => Promise<void>;
    deleteQuiz: (quizId: string) => Promise<void>;

    // Quiz list
    loadQuizList: () => Promise<void>;

    // Step selection
    selectStep: (stepId: string | null) => void;

    // Step CRUD
    addStep: (type: StepType, afterStepId?: string) => void;
    updateStep: (stepId: string, updates: Partial<Step>) => void;
    removeStep: (stepId: string) => void;

    // Step reordering
    reorderSteps: (fromIndex: number, toIndex: number) => void;

    // Conditional branch selection + CRUD
    selectBranch: (branchId: string | null) => void;
    addBranch: (stepId: string) => void;
    updateBranch: (stepId: string, branchId: string, updates: Partial<StepBranch>) => void;
    removeBranch: (stepId: string, branchId: string) => void;
    reorderBranches: (stepId: string, fromIndex: number, toIndex: number) => void;

    // Quiz meta/settings updates
    updateQuizMeta: (updates: Partial<QuizConfig['meta']>) => void;
    updateQuizSettings: (updates: Partial<QuizConfig['settings']>) => void;

    // Utility
    resetEditor: () => void;
    setError: (error: string | null) => void;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: QuizBuilderState = {
    quiz: null,
    selectedStepId: null,
    selectedBranchId: null,
    isDirty: false,
    isLoading: false,
    isSaving: false,
    error: null,
    quizList: [],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateQuizId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultStep(type: StepType): Step {
    return {
        id: generateStepId(),
        type,
        layout: 'default',
        required: true,
        content: getDefaultContentForType(type),
        navigation: {
            showBack: true,
            showSkip: false,
        },
    };
}

import { getDefaultContent } from '@/steps/registry';

function getDefaultContentForType(type: StepType): Step['content'] {
    return getDefaultContent(type) as Step['content'];
}

// =============================================================================
// STORE CREATION
// =============================================================================

export const useQuizBuilderStore = create<QuizBuilderState & QuizBuilderActions>()(
    immer((set, get) => ({
        ...initialState,

        // =========================================================================
        // QUIZ CRUD
        // =========================================================================

        loadQuiz: async (quizId: string) => {
            set((state) => {
                state.isLoading = true;
                state.error = null;
            });

            try {
                // For now, load from static JSON files
                // In future, this would be an API call
                const response = await fetch(`/data/quizzes/${quizId}.json`);
                if (!response.ok) throw new Error('Quiz not found');

                const quiz: QuizConfig = await response.json();

                set((state) => {
                    state.quiz = quiz;
                    state.selectedStepId = quiz.steps[0]?.id || null;
                    state.isLoading = false;
                    state.isDirty = false;
                });
            } catch (error) {
                set((state) => {
                    state.error = error instanceof Error ? error.message : 'Failed to load quiz';
                    state.isLoading = false;
                });
            }
        },

        createQuiz: async (title: string) => {
            const quizId = generateQuizId();

            const newQuiz: QuizConfig = {
                quizId,
                meta: {
                    title,
                    description: '',
                    theme: { ...DEFAULT_QUIZ_THEME },
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                settings: {
                    showProgressBar: true,
                    allowBack: true,
                    autoAdvance: true,
                    autoAdvanceDelay: 600,
                },
                steps: [createDefaultStep('quiz-landing')],
            };

            set((state) => {
                state.quiz = newQuiz;
                state.selectedStepId = newQuiz.steps[0]?.id || null;
                state.isDirty = true;
            });

            return quizId;
        },

        saveQuiz: async () => {
            const { quiz } = get();
            if (!quiz) return;

            set((state) => {
                state.isSaving = true;
                state.error = null;
            });

            try {
                // Update the updatedAt timestamp
                const updatedQuiz = {
                    ...quiz,
                    meta: {
                        ...quiz.meta,
                        updatedAt: new Date().toISOString(),
                    },
                };

                // Save via API
                const response = await fetch('/api/quiz', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedQuiz),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to save quiz');
                }

                set((state) => {
                    state.quiz = updatedQuiz;
                    state.isSaving = false;
                    state.isDirty = false;
                });
            } catch (error) {
                set((state) => {
                    state.error = error instanceof Error ? error.message : 'Failed to save quiz';
                    state.isSaving = false;
                });
            }
        },

        deleteQuiz: async (quizId: string) => {
            // For now, just remove from local list
            // In future, this would be an API call
            set((state) => {
                state.quizList = state.quizList.filter((q) => q.quizId !== quizId);
            });
        },

        // =========================================================================
        // QUIZ LIST
        // =========================================================================

        loadQuizList: async () => {
            set((state) => {
                state.isLoading = true;
                state.error = null;
            });

            try {
                // For now, load from a static index file
                // In future, this would be an API call
                const response = await fetch('/data/quizzes/index.json');
                if (!response.ok) throw new Error('Failed to load quiz list');

                const list: QuizListItem[] = await response.json();

                set((state) => {
                    state.quizList = list;
                    state.isLoading = false;
                });
            } catch (error) {
                // If index doesn't exist, start with empty list
                set((state) => {
                    state.quizList = [];
                    state.isLoading = false;
                });
            }
        },

        // =========================================================================
        // STEP SELECTION
        // =========================================================================

        selectStep: (stepId: string | null) => {
            set((state) => {
                state.selectedStepId = stepId;
                state.selectedBranchId = null;
            });
        },

        // =========================================================================
        // STEP CRUD
        // =========================================================================

        addStep: (type: StepType, afterStepId?: string) => {
            set((state) => {
                if (!state.quiz) return;

                const newStep = createDefaultStep(type);

                if (afterStepId) {
                    const index = state.quiz.steps.findIndex((s) => s.id === afterStepId);
                    if (index !== -1) {
                        state.quiz.steps.splice(index + 1, 0, newStep);
                    } else {
                        state.quiz.steps.push(newStep);
                    }
                } else {
                    state.quiz.steps.push(newStep);
                }

                state.selectedStepId = newStep.id;
                state.isDirty = true;
            });
        },

        updateStep: (stepId: string, updates: Partial<Step>) => {
            set((state) => {
                if (!state.quiz) return;

                const stepIndex = state.quiz.steps.findIndex((s) => s.id === stepId);
                if (stepIndex === -1) return;

                state.quiz.steps[stepIndex] = {
                    ...state.quiz.steps[stepIndex],
                    ...updates,
                };
                state.isDirty = true;
            });
        },

        removeStep: (stepId: string) => {
            set((state) => {
                if (!state.quiz) return;

                const stepIndex = state.quiz.steps.findIndex((s) => s.id === stepId);
                if (stepIndex === -1) return;

                state.quiz.steps.splice(stepIndex, 1);

                // Select next step or previous if last
                if (state.selectedStepId === stepId) {
                    const nextStep = state.quiz.steps[stepIndex] || state.quiz.steps[stepIndex - 1];
                    state.selectedStepId = nextStep?.id || null;
                }

                state.isDirty = true;
            });
        },

        // =========================================================================
        // STEP REORDERING
        // =========================================================================

        reorderSteps: (fromIndex: number, toIndex: number) => {
            set((state) => {
                if (!state.quiz) return;

                const steps = state.quiz.steps;
                const [removed] = steps.splice(fromIndex, 1);
                steps.splice(toIndex, 0, removed);

                state.isDirty = true;
            });
        },

        // =========================================================================
        // CONDITIONAL BRANCH SELECTION + CRUD
        // =========================================================================

        selectBranch: (branchId: string | null) => {
            set((state) => {
                state.selectedBranchId = branchId;
            });
        },

        addBranch: (stepId: string) => {
            set((state) => {
                if (!state.quiz) return;

                const step = state.quiz.steps.find((s) => s.id === stepId);
                if (!step) return;

                const newBranch: StepBranch = {
                    id: generateStepId(),
                    conditions: {
                        match: 'any',
                        rules: [{ source: 'queryParam', param: '', operator: 'equals', value: '' }],
                    },
                    // step.content here is an Immer draft (Proxy) inside this producer —
                    // structuredClone can't handle Immer's internal draft state, so clone
                    // via JSON instead (content is always JSON-serializable; it's persisted
                    // to disk as JSON).
                    content: JSON.parse(JSON.stringify(step.content)),
                };

                if (!step.branches) step.branches = [];
                step.branches.push(newBranch);

                state.selectedStepId = stepId;
                state.selectedBranchId = newBranch.id;
                state.isDirty = true;
            });
        },

        updateBranch: (stepId: string, branchId: string, updates: Partial<StepBranch>) => {
            set((state) => {
                if (!state.quiz) return;

                const step = state.quiz.steps.find((s) => s.id === stepId);
                if (!step?.branches) return;

                const branchIndex = step.branches.findIndex((b) => b.id === branchId);
                if (branchIndex === -1) return;

                step.branches[branchIndex] = {
                    ...step.branches[branchIndex],
                    ...updates,
                };
                state.isDirty = true;
            });
        },

        removeBranch: (stepId: string, branchId: string) => {
            set((state) => {
                if (!state.quiz) return;

                const step = state.quiz.steps.find((s) => s.id === stepId);
                if (!step?.branches) return;

                step.branches = step.branches.filter((b) => b.id !== branchId);

                if (state.selectedBranchId === branchId) {
                    state.selectedBranchId = null;
                }
                state.isDirty = true;
            });
        },

        reorderBranches: (stepId: string, fromIndex: number, toIndex: number) => {
            set((state) => {
                if (!state.quiz) return;

                const step = state.quiz.steps.find((s) => s.id === stepId);
                if (!step?.branches) return;

                const [removed] = step.branches.splice(fromIndex, 1);
                step.branches.splice(toIndex, 0, removed);

                state.isDirty = true;
            });
        },

        // =========================================================================
        // QUIZ META/SETTINGS UPDATES
        // =========================================================================

        updateQuizMeta: (updates: Partial<QuizConfig['meta']>) => {
            set((state) => {
                if (!state.quiz) return;
                state.quiz.meta = { ...state.quiz.meta, ...updates };
                state.isDirty = true;
            });
        },

        updateQuizSettings: (updates: Partial<QuizConfig['settings']>) => {
            set((state) => {
                if (!state.quiz) return;
                state.quiz.settings = { ...state.quiz.settings, ...updates };
                state.isDirty = true;
            });
        },

        // =========================================================================
        // UTILITY
        // =========================================================================

        resetEditor: () => {
            set(initialState);
        },

        setError: (error: string | null) => {
            set((state) => {
                state.error = error;
            });
        },
    }))
);
