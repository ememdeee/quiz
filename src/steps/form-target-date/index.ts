import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { TargetDateStep } from './TargetDateStep';

const schema: SchemaField[] = [
    { 
        type: 'text', 
        id: 'question', 
        label: 'Question', 
        placeholder: 'When would you like to reach your goal weight?' 
    },
    {
        type: 'text',
        id: 'subtitle',
        label: 'Subtitle (Optional)',
        placeholder: "We'll build your personalized BodyReset plan around this target date.",
    },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    {
        type: 'info',
        text: 'Users can choose from quick presets (1 month, 3 months, 6 months, 1 year) or pick a custom date from the calendar. Dates must be in the future.',
    },
];

const definition = {
    type: 'form-target-date',
    label: 'Goal Weight Target Date',
    icon: 'calendar_month',
    category: 'form',
    description: 'Date picker for when the user wants to reach their goal weight',

    component: TargetDateStep,
    schema,

    defaultContent: {
        question: 'When would you like to reach your goal weight?',
        subtitle: "We'll build your personalized BodyReset plan around this target date.",
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: true,
    validate: (answer) => typeof answer === 'string' && answer.length > 0,

    syncToProfile: (value, setField) => {
        if (typeof value === 'string') {
            setField('targetDate', value);
        }
    },
} satisfies StepDefinition;

export default definition;
