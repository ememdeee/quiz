import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { WeightSummaryStep } from './WeightSummaryStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'title', label: 'Title', placeholder: 'Your Weight Loss Projection' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Add a subtitle...' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    {
        type: 'info',
        text: 'The chart data and health insight cards are currently hardcoded. These will be made dynamic in a future update.',
    },
];

const definition = {
    type: 'weight-summary',
    label: 'Weight Summary',
    icon: 'monitoring',
    category: 'info',
    description: 'Weight loss projection chart with health insights',

    component: WeightSummaryStep,
    schema,

    defaultContent: {
        title: 'Your Weight Loss Projection',
        subtitle: '',
        textAlign: 'center',
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
