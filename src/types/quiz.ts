// Quiz System Types
// This is the source of truth for all quiz-related TypeScript types

// =============================================================================
// STEP TYPES
// =============================================================================

// `StepType` is auto-derived from the registry. Re-exported here for convenience
// so consumers can `import type { StepType } from '@/types/quiz'`.
export type { StepType } from '@/steps/registry';

export type LayoutType =
    | 'default'
    | 'cards'
    | 'grid-2'
    | 'grid-3'
    | 'grid-4'
    | 'animated'
    | 'health-card';

// =============================================================================
// OPTION TYPES
// =============================================================================

export interface Option {
    value: string;
    label: string;
    icon?: string;
    subLabel?: string;
}

export interface ImageOption {
    value: string;
    label: string;
    image: string;
    /** If set, renders a mascot SVG for this variant id instead of the image URL. Clothing color adapts to quiz theme. */
    mascot?: string;
}

// =============================================================================
// STEP CONTENT TYPES
// =============================================================================

export interface BaseStepContent {
    title?: string;
    question?: string;
    subtitle?: string;
    textAlign?: 'left' | 'center' | 'right';
}

export type OverlayTone = 'overlay' | 'none';

export interface LandingContent extends BaseStepContent {
    eyebrow?: string;
    backgroundImage?: string;
    overlayTone?: OverlayTone;
    options: Option[];
}

export interface MultipleChoiceContent extends BaseStepContent {
    image?: string | null;
    imagePosition?: 'above' | 'below';
    imageFit?: 'cover' | 'contain';
    options: Option[];
}

export interface CheckboxContent extends BaseStepContent {
    image?: string | null;
    imagePosition?: 'above' | 'below';
    imageFit?: 'cover' | 'contain';
    options: Option[];
    maxSelections?: number;
}

export interface ImageOptionsContent extends BaseStepContent {
    optionsImg: ImageOption[];
}

export interface FormInputContent extends BaseStepContent {
    placeholder?: string;
    inputType?: 'text' | 'email' | 'number';
    validation?: {
        required?: boolean;
        minLength?: number;
        maxLength?: number;
        pattern?: string;
    };
}

export interface FormWeightContent extends BaseStepContent {
    targetWeightQuestion?: string;
}

export interface FormHeightContent extends BaseStepContent {}

export interface FormAgeContent extends BaseStepContent {
    validation?: {
        min: number;
        max: number;
    };
}

export interface InfoPageContent extends BaseStepContent {
    icon?: string;
    description?: string;
    image?: string;
    imagePosition?: 'above' | 'below';
    imageFit?: 'cover' | 'contain';
}

export interface TimedSlideContent {
    message: string;
    duration: number;
    animation?: 'pulse' | 'fade' | 'slide';
}

export interface LoadingContent {
    message: string;
    duration: number;
    animation?: 'pulse' | 'spinner' | 'progress';
}

export interface SummaryContent extends BaseStepContent {
    calculations: ('bmi' | 'targetWeight' | 'timeToGoal')[];
}

export interface WeightSummaryContent extends BaseStepContent {
    // Mostly hardcoded — minimal editor fields
}

export interface VideoConfig {
    mediaId: string;
    aspectRatio: string;
}

export interface VSLContent extends BaseStepContent {
    paragraphs: string[];
    video: {
        desktop: VideoConfig;
        mobile: VideoConfig;
    };
    ctaDropTime: number;
    cta: {
        text: string;
        url: string;
    };
}

export interface ConfirmationContent extends BaseStepContent {
    message: string;
    ctaText: string;
    ctaUrl: string;
}

export interface ResultPageContent extends BaseStepContent {
    ctaLink: string;
}

export interface FormTargetDateContent extends BaseStepContent {
    minMonths?: number;
    maxMonths?: number;
}

// Union type for all step content
export type StepContent =
    | LandingContent
    | MultipleChoiceContent
    | CheckboxContent
    | ImageOptionsContent
    | FormInputContent
    | FormWeightContent
    | FormHeightContent
    | FormAgeContent
    | InfoPageContent
    | TimedSlideContent
    | LoadingContent
    | SummaryContent
    | WeightSummaryContent
    | VSLContent
    | ConfirmationContent
    | ResultPageContent
    | FormTargetDateContent;

// =============================================================================
// NAVIGATION & TRACKING
// =============================================================================

export interface NavigationConfig {
    showBack?: boolean;
    showSkip?: boolean;
    autoAdvance?: boolean;
    autoAdvanceDelay?: number;
}

// =============================================================================
// VISIBILITY (CONDITIONAL STEPS)
// =============================================================================

export type VisibilityOperator =
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'is_empty'
    | 'is_not_empty';

export interface VisibilityRule {
    /** Step whose answer is being checked. Must reference a step that comes before this one. */
    stepId: string;
    operator: VisibilityOperator;
    /** Compared value. Ignored for is_empty / is_not_empty. */
    value?: string;
}

export interface VisibilityRules {
    /** "all" = every rule must pass (AND). "any" = at least one rule must pass (OR). */
    match: 'all' | 'any';
    rules: VisibilityRule[];
}

// =============================================================================
// CONDITIONAL BRANCHES (CONTENT VARIANTS)
// =============================================================================

export type ConditionSource = 'answer' | 'queryParam';

export type ConditionOperator =
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'is_empty'
    | 'is_not_empty';

export interface ConditionRule {
    source: ConditionSource;
    /** source === 'answer': id of a preceding step whose answer to check. */
    stepId?: string;
    /** source === 'queryParam': the URL query param name, e.g. "utm_content". */
    param?: string;
    operator: ConditionOperator;
    /** Compared value. Ignored for is_empty / is_not_empty. */
    value?: string;
}

export interface ConditionGroup {
    /** "all" = every rule must pass (AND). "any" = at least one rule must pass (OR). */
    match: 'all' | 'any';
    rules: ConditionRule[];
}

export interface StepBranch {
    id: string;
    /** Editor-only display label, auto-derived from the first rule if unset. */
    label?: string;
    conditions: ConditionGroup;
    /** Optional type override for this variant. Defaults to the parent step's type when unset. */
    type?: string;
    /** Full content clone, independently editable. Shape should match the effective type (type ?? parent step's type). */
    content: StepContent;
}

export interface TrackingConfig {
    eventName: string;
    properties?: Record<string, string | number | boolean>;
}

// =============================================================================
// STEP DEFINITION
// =============================================================================

export interface Step {
    id: string;
    type: string;
    layout: LayoutType;
    required: boolean;
    content: StepContent;
    navigation?: NavigationConfig;
    tracking?: TrackingConfig;
    /**
     * Conditional visibility. If undefined, the step is always shown.
     * Rules can only reference preceding steps.
     */
    visibility?: VisibilityRules;
    /**
     * Conditional content variants. Evaluated top-to-bottom at runtime; the
     * first branch whose conditions match overrides this step's content
     * (and optionally its type). Never changes step sequence or `id`.
     */
    branches?: StepBranch[];
}

// =============================================================================
// QUIZ THEMING
// =============================================================================

export interface QuizTheme {
    primary: string;
    primaryForeground: string;
    background: string;
    foreground: string;
    mutedForeground: string;
    border: string;
}

export const DEFAULT_QUIZ_THEME: QuizTheme = {
    primary: '#13ecc8',
    primaryForeground: '#10221f',
    background: '#f6f8f8',
    foreground: '#0f172a',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
};

// =============================================================================
// QUIZ META & SETTINGS
// =============================================================================

export interface QuizMeta {
    title: string;
    description: string;
    theme?: QuizTheme;
    status?: 'published' | 'draft';
    createdAt?: string;
    updatedAt?: string;
    thumbnailUrl?: string;
}

export interface QuizSettings {
    showProgressBar: boolean;
    allowBack: boolean;
    autoAdvance: boolean;
    autoAdvanceDelay?: number;
    shuffleOptions?: boolean;
}

// =============================================================================
// QUIZ CONFIG (MAIN TYPE)
// =============================================================================

export interface QuizConfig {
    quizId: string;
    meta: QuizMeta;
    settings: QuizSettings;
    steps: Step[];
}

// =============================================================================
// QUIZ LIST ITEM (for dashboard)
// =============================================================================

export interface QuizListItem {
    quizId: string;
    title: string;
    description: string;
    status: 'published' | 'draft';
    stepsCount: number;
    thumbnailUrl?: string;
    createdAt?: string;
    updatedAt: string;
}
