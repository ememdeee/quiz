import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { GenericStep } from '@/components/quiz/steps/GenericStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'question', label: 'Question', placeholder: 'What would you like to ask?' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Add a subtitle...' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    { type: 'divider' },
    { type: 'text', id: 'placeholder', label: 'Placeholder Text', placeholder: 'Type here...' },
    {
        type: 'select',
        id: 'inputType',
        label: 'Input Type',
        default: 'text',
        options: [
            { value: 'text', label: 'Text' },
            { value: 'email', label: 'Email' },
            { value: 'number', label: 'Number' },
        ],
    },
    { type: 'divider' },
    {
        type: 'range',
        id: 'validation',
        label: 'Validation Rules',
    },
];

const definition = {
    type: 'form-input',
    label: 'Text Input',
    icon: 'edit_note',
    category: 'form',
    description: 'Free text input field',

    component: GenericStep,
    schema,

    defaultContent: {
        question: 'Enter your answer',
        placeholder: 'Type here...',
        inputType: 'text',
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
