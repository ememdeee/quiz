import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { ResultPageStep } from './ResultPageStep';

const schema: SchemaField[] = [
    {
        type: 'text',
        id: 'ctaLink',
        label: 'CTA Link (Get My Plan URL)',
        placeholder: 'https://example.com/checkout',
        info: 'This URL will be used for all "GET MY PLAN" buttons on the page.',
    },
    {
        type: 'info',
        text: 'Most content on this page (pricing, testimonials, FAQ, etc.) is currently static. Only the CTA link is configurable. Additional customization will be added in future updates.',
    },
];

const definition = {
    type: 'result-page-body-reset-01',
    label: 'Result Page MBC V1',
    icon: 'summarize',
    category: 'confirmation',
    description: 'Full result / sales page with offer, FAQ, and testimonials',

    component: ResultPageStep,
    schema,

    defaultContent: {
        ctaLink: '#',
    },

    showNavigation: false,
    showCTA: false,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
