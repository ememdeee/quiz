import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { optionItemFields } from '../multiple-choice';
import { QuizLandingStep } from './QuizLandingStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'eyebrow', label: 'Eyebrow Text', placeholder: 'e.g. Trusted by 50,000+ Users' },
    { type: 'text', id: 'title', label: 'Title', placeholder: 'Welcome headline...' },
    { type: 'text', id: 'subtitle', label: 'Subtitle', placeholder: 'Supporting text...' },
    {
        type: 'image',
        id: 'backgroundImage',
        label: 'Background Image URL',
        placeholder: 'https://example.com/bg.jpg',
    },
    {
        type: 'select',
        id: 'overlayTone',
        label: 'Overlay',
        default: 'overlay',
        options: [
            { value: 'overlay', label: 'Overlay (matches theme)' },
            { value: 'none', label: 'None (no overlay)' },
        ],
    },
    { type: 'divider' },
    {
        type: 'repeater',
        id: 'options',
        label: 'Landing Options',
        addLabel: 'Add Option',
        sortable: true,
        itemKey: 'value',
        itemLabel: (item, idx) => (typeof item.label === 'string' && item.label) || `Option ${idx + 1}`,
        newItem: (count) => ({
            value: `option${count + 1}`,
            label: `Option ${count + 1}`,
        }),
        itemFields: optionItemFields,
    },
];

const definition = {
    type: 'quiz-landing',
    label: 'Quiz Landing',
    icon: 'person',
    category: 'landing',
    description: 'Full-screen hero landing page for quiz entry',

    component: QuizLandingStep,
    schema,

    defaultContent: {
        eyebrow: 'Trusted by 50,000+ Users',
        title: 'Welcome',
        subtitle: 'Select your gender to get started',
        options: [
            { value: 'female', label: 'Female', icon: 'female' },
            { value: 'male', label: 'Male', icon: 'male' },
        ],
    },

    showNavigation: false,
    showCTA: false,
    requiresValidation: false,

    syncToProfile: (value, setField) => {
        if (typeof value === 'string') {
            setField('gender', value as 'male' | 'female');
        }
    },
} satisfies StepDefinition;

export default definition;
