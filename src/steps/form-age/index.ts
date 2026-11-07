import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { AgeStep } from './AgeStep';
import { AGE_MIN_DEFAULT, AGE_MAX_DEFAULT } from './constants';
import type { StepContent, FormAgeContent } from '@/types/quiz';

const schema: SchemaField[] = [
    { type: 'text', id: 'question', label: 'Question', placeholder: 'How old are you?' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Enter your age' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    { type: 'divider' },
    {
        type: 'range',
        id: 'validation',
        label: 'Validation Rules',
        minPlaceholder: '13',
        maxPlaceholder: '120',
        unit: 'yrs',
    },
];

const definition = {
    type: 'form-age',
    label: 'Age Input',
    icon: 'cake',
    category: 'form',
    description: 'Age input field',

    component: AgeStep,
    schema,

    defaultContent: {
        question: 'How old are you?',
        validation: { min: 13, max: 100 },
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: true,
    validate: (answer: unknown, content: StepContent) => {
        const c = content as FormAgeContent;
        const min = c.validation?.min ?? AGE_MIN_DEFAULT;
        const max = c.validation?.max ?? AGE_MAX_DEFAULT;
        const val = typeof answer === 'number' ? answer : parseInt(String(answer));
        return !isNaN(val) && val >= min && val <= max;
    },

    syncToProfile: (value, setField) => {
        if (typeof value === 'number') {
            setField('age', value);
        } else if (typeof value === 'string') {
            const parsed = parseInt(value, 10);
            if (!isNaN(parsed)) setField('age', parsed);
        }
    },
} satisfies StepDefinition;

export default definition;
