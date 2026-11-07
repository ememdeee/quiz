import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { ImageOptionsStep } from './ImageOptionsStep';
import { MASCOT_SELECT_OPTIONS } from './mascotRegistry';

const schema: SchemaField[] = [
    { type: 'text', id: 'question', label: 'Question', placeholder: 'Enter your question...' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Add context or instructions...' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    { type: 'divider' },
    {
        type: 'repeater',
        id: 'optionsImg',
        label: 'Image Options',
        addLabel: 'Add Option',
        sortable: false,
        itemKey: 'value',
        itemLabel: (item, idx) => (typeof item.label === 'string' && item.label) || `Option ${idx + 1}`,
        emptyMessage: 'No image options yet. Click "Add Option" to create one.',
        newItem: (count) => ({
            value: `option${count + 1}`,
            label: `Option ${count + 1}`,
            image: '',
        }),
        itemFields: [
            { type: 'text', id: 'label', label: 'Label', placeholder: 'e.g. Slim, Athletic...' },
            { type: 'text', id: 'value', label: 'Value', placeholder: 'e.g. slim, athletic...' },
            {
                type: 'select',
                id: 'mascot',
                label: 'Visual Type',
                options: MASCOT_SELECT_OPTIONS,
                default: '',
            },
            {
                type: 'image',
                id: 'image',
                label: 'Image URL',
                placeholder: 'https://example.com/image.jpg',
                visibleWhen: (item) => !item.mascot,
            },
        ],
    },
];

const definition = {
    type: 'image-options',
    label: 'Image Options',
    icon: 'image',
    category: 'question',
    description: 'Select from image options',

    component: ImageOptionsStep,
    schema,

    defaultContent: {
        question: 'Choose an option',
        optionsImg: [],
    },

    showNavigation: true,
    showCTA: false,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
