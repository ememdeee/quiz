import type { StepDefinition } from '../registry';
import { CheckboxStep } from './CheckboxStep';
import { optionsQuestionSchema } from '../multiple-choice';

const definition = {
    type: 'checkbox',
    label: 'Checkbox',
    icon: 'check_box',
    category: 'question',
    description: 'Multiple selection from options',

    component: CheckboxStep,
    schema: optionsQuestionSchema,

    defaultContent: {
        question: 'Select all that apply',
        options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
        ],
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: true,
    validate: (answer) => Array.isArray(answer) && answer.length > 0,
} satisfies StepDefinition;

export default definition;
