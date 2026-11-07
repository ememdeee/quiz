import type { StepDefinition } from '../registry';
import { LoadingStep } from '../loading/LoadingStep';
import { loadingSchema } from '../loading';

const definition = {
    type: 'timed-slide',
    label: 'Timed Slide',
    icon: 'timer',
    category: 'info',
    description: 'Timed content slide',

    component: LoadingStep,
    schema: loadingSchema,

    defaultContent: {
        message: 'Please wait...',
        duration: 3000,
        animation: 'pulse',
    },

    showNavigation: false,
    showCTA: false,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
