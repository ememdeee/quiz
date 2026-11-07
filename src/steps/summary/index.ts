import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { GenericStep } from '@/components/quiz/steps/GenericStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'title', label: 'Title', placeholder: 'Your Results' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Add a subtitle...' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
];

const definition = {
    type: 'summary',
    label: 'Summary',
    icon: 'assessment',
    category: 'info',
    description: 'Summary with calculations',

    component: GenericStep,
    schema,

    defaultContent: {
        title: 'Your Results',
        calculations: ['bmi'],
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
