import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { LoadingStep } from './LoadingStep';

export const loadingSchema: SchemaField[] = [
    { type: 'text', id: 'message', label: 'Loading Message', placeholder: 'Processing your answers...' },
    {
        type: 'number',
        id: 'duration',
        label: 'Duration (seconds)',
        scale: 1000,
        min: 1,
        max: 30,
        info: 'How long to show this screen before auto-advancing',
    },
];

const definition = {
    type: 'loading',
    label: 'Loading',
    icon: 'hourglass_empty',
    category: 'info',
    description: 'Processing animation',

    component: LoadingStep,
    schema: loadingSchema,

    defaultContent: {
        message: 'Processing your answers...',
        duration: 3000,
        animation: 'spinner',
    },

    showNavigation: false,
    showCTA: false,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
