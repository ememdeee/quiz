// =============================================================================
// STEP REGISTRY — Single source of truth for ALL step types
//
// To add a new step type:
//   1. Create a folder in src/steps/<step-name>/
//   2. Add YourStep.tsx (renderer) and index.ts (definition with `satisfies StepDefinition`)
//   3. Import and register it in the ALL_STEPS array below
//
// `StepType` is auto-derived from the registry — no need to also edit a union.
// =============================================================================

import type { ComponentType } from 'react';
import type { Step, StepContent } from '@/types/quiz';
import type { UserProfile } from '@/store/userProfileStore';
import type { SchemaField } from '@/types/stepSchema';

// =============================================================================
// INTERFACES
// =============================================================================

/** Props passed to every step component in the quiz renderer */
export interface StepComponentProps {
    step: Step;
    selectedValue?: unknown;
    selectedValues?: string[];
    onAnswer?: (value: unknown) => void;
    // WeightStep-specific (passed through for now)
    phase?: 'current' | 'target';
    onPhaseBack?: () => void;
    /** True when rendered inside the dashboard LivePreview — steps should avoid breaking out of the parent container (no `fixed`, no `100svh`). */
    isPreview?: boolean;
    quizId?: string;
    totalSteps?: number;
}

/** Props passed to every editor component in the property panel */
export interface EditorComponentProps {
    step: Step;
    onUpdate: (updates: Partial<Step>) => void;
}

/** Full definition for a step type — everything in one place */
export interface StepDefinition {
    /**
     * The step type key. Use kebab-case matching the folder name (e.g. 'quiz-landing').
     * Each step file should declare its definition with `satisfies StepDefinition`
     * so the literal type is preserved and `StepType` (the union) auto-derives.
     */
    type: string;

    // ── Editor metadata ──
    label: string;
    icon: string;
    category: 'landing' | 'question' | 'form' | 'info' | 'confirmation';
    description: string;

    // ── Components ──
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: ComponentType<any>;
    /**
     * Declarative editor schema. Preferred over `editor` for new steps.
     * The PropertyEditor renders a generic form from the schema.
     */
    schema?: SchemaField[];
    /**
     * Hand-coded editor component. Used as a fallback when `schema` is not defined.
     * Reserve for steps with unusual UX (e.g. unit toggles, computed previews).
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    editor?: ComponentType<any>;

    // ── Default content (used when creating a new step in the editor) ──
    defaultContent: Record<string, unknown>;

    // ── Behavioral flags (drive QuizContent rendering decisions) ──
    /** Show back button + progress bar. Default: true */
    showNavigation?: boolean;
    /** Show CTA/Continue button. Default: true */
    showCTA?: boolean;
    /** Whether this step requires validation before Continue is enabled. Default: false */
    requiresValidation?: boolean;

    // ── Validation ──
    /** Validate the answer. Return true if valid. Only called if requiresValidation is true */
    validate?: (answer: unknown, content: StepContent) => boolean;

    // ── Profile sync ──
    /** Map answer data to user profile fields. Called after each answer. */
    syncToProfile?: (
        value: unknown,
        setField: <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => void,
    ) => void;
}

// =============================================================================
// STEP IMPORTS — one import per step type
// =============================================================================

import quizLanding from './quiz-landing';
import multipleChoice from './multiple-choice';
import checkbox from './checkbox';
import imageOptions from './image-options';
import formWeight from './form-weight';
import formHeight from './form-height';
import formAge from './form-age';
import formInput from './form-input';
import formTargetDate from './form-target-date';
import loading from './loading';
import timedSlide from './timed-slide';
import infoPage from './info-page';
import weightSummary from './weight-summary';
import summary from './summary';
import vslPage from './vsl-page';
import confirmation from './confirmation';
import resultPage from './result-page-01';

// =============================================================================
// REGISTRY — the single map everyone consumes
// =============================================================================

// Each entry is declared `satisfies StepDefinition` in its own file so the
// literal `type` is preserved here and we can derive the StepType union below.
const ALL_STEPS = [
    quizLanding,
    multipleChoice,
    checkbox,
    imageOptions,
    formWeight,
    formHeight,
    formAge,
    formInput,
    formTargetDate,
    loading,
    timedSlide,
    infoPage,
    weightSummary,
    summary,
    vslPage,
    confirmation,
    resultPage,
];

/** Union of every registered step type. Add a step → add it to ALL_STEPS → it appears here. */
export type StepType = (typeof ALL_STEPS)[number]['type'];

/** Registry keyed by step type */
export const STEP_REGISTRY: Record<string, StepDefinition> = {};
for (const def of ALL_STEPS) {
    STEP_REGISTRY[def.type] = def;
}
// Backward compat: old quiz JSON may still reference 'gender-landing'
STEP_REGISTRY['gender-landing'] = STEP_REGISTRY['quiz-landing'];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Get full definition for a step type */
export function getStepDef(type: string): StepDefinition | undefined {
    return STEP_REGISTRY[type];
}

/** Get metadata for the editor step picker (label, icon, category, description) */
export function getAllStepMeta() {
    return ALL_STEPS.map(({ type, label, icon, category, description }) => ({
        type, label, icon, category, description,
    }));
}

/** Get step metadata by category */
export function getStepMetaByCategory(category: StepDefinition['category']) {
    return getAllStepMeta().filter(m => m.category === category);
}

/** Get default content for a step type */
export function getDefaultContent(type: string): Record<string, unknown> {
    return getStepDef(type)?.defaultContent ?? {};
}

/** Validate an answer for a step type. Returns true if valid or no validator exists. */
export function validateStep(type: string, answer: unknown, content: StepContent): boolean {
    const def = getStepDef(type);
    if (!def?.requiresValidation || !def.validate) return true;
    return def.validate(answer, content);
}

// =============================================================================
// PROFILE SYNC — maps quiz answers to user profile fields
// =============================================================================

/**
 * ID-based profile sync — maps specific quiz step IDs to UserProfile fields.
 * These are quiz-specific (not step-type-specific) lifestyle answers.
 */
const STEP_ID_PROFILE_MAP: Record<string, keyof UserProfile> = {
    'q-main-goal': 'mainGoal',
    'q-physical-activity': 'activity',
    'q-sleep': 'sleep',
    'q-water': 'water',
    'q-typical-day': 'typicalDay',
    'q-walk-frequency': 'walkFrequency',
    'q-physical-build': 'physicalBuild',
    'q-dream-body': 'dreamBody',
};

/**
 * Convert an age-bucket string ("18-24", "25-34", "45+") to a representative
 * numeric age using the bucket midpoint. Used when a quiz collects age as a
 * range instead of an exact number — gives BMR / metabolic-age math something
 * to work with. Result is approximate (±5 years within the bucket).
 */
function ageBucketToMidpoint(value: string): number | null {
    const trimmed = value.trim();
    // "45+" → 50 (open-ended bucket — add a small offset above the floor)
    const openEnded = /^(\d+)\+$/.exec(trimmed);
    if (openEnded) return parseInt(openEnded[1], 10) + 5;
    // "25-34" → 30
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(trimmed);
    if (range) {
        const lo = parseInt(range[1], 10);
        const hi = parseInt(range[2], 10);
        return Math.round((lo + hi) / 2);
    }
    return null;
}

/**
 * Sync a quiz answer to the user profile.
 * Combines type-based sync (from step definitions) with ID-based sync (lifestyle answers).
 */
export function runSyncToProfile(
    stepType: string,
    stepId: string,
    value: unknown,
    setField: <K extends keyof UserProfile>(key: K, val: UserProfile[K]) => void,
): void {
    // 1. Type-based sync (from step definition)
    const def = getStepDef(stepType);
    if (def?.syncToProfile) {
        def.syncToProfile(value, setField);
    }

    // 2. ID-based sync (lifestyle questions mapped by quiz step ID)
    const profileKey = STEP_ID_PROFILE_MAP[stepId];
    if (profileKey && typeof value === 'string') {
        setField(profileKey, value as UserProfile[typeof profileKey]);
    }

    // 3. Age-range fallback: when the quiz collects age as a bucket
    // (q-age-range) instead of an exact number, derive an approximate
    // age from the midpoint so downstream health calcs still work.
    if (stepId === 'q-age-range' && typeof value === 'string') {
        const approxAge = ageBucketToMidpoint(value);
        if (approxAge !== null) setField('age', approxAge);
    }
}
