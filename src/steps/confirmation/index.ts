import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { GenericStep } from '@/components/quiz/steps/GenericStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'title', label: 'Title', placeholder: 'Thank You!' },
    { type: 'text', id: 'message', label: 'Message', placeholder: 'Your submission has been received.' },
    { type: 'divider' },
    { type: 'header', label: 'Call to Action' },
    {
        type: 'group',
        columns: 2,
        fields: [
            { type: 'text', id: 'ctaText', label: 'Button Text', placeholder: 'Continue' },
            { type: 'text', id: 'ctaUrl', label: 'Button URL', placeholder: '/' },
        ],
    },
];

const definition = {
    type: 'confirmation',
    label: 'Confirmation',
    icon: 'check_circle',
    category: 'confirmation',
    description: 'Confirmation page with CTA',

    component: GenericStep,
    schema,

    defaultContent: {
        title: 'Thank You!',
        message: 'Your submission has been received.',
        ctaText: 'Continue',
        ctaUrl: '/',
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
