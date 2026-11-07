import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { MultipleChoiceStep } from './MultipleChoiceStep';

export const optionItemFields: SchemaField[] = [
    { type: 'text', id: 'label', label: 'Label', placeholder: 'Option text...' },
    { type: 'text', id: 'subLabel', label: 'Sub Label (Optional)', placeholder: 'Sub label...' },
    { type: 'icon', id: 'icon', label: 'Icon (Optional)' },
];

/**
 * Schema for option-based question steps. Shared by MULTIPLE_CHOICE and CHECKBOX.
 * Includes header settings, sortable options repeater, and image settings.
 */
export const optionsQuestionSchema: SchemaField[] = [
    { type: 'text', id: 'question', label: 'Question', placeholder: 'Enter your question...' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Add context or instructions...' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    { type: 'divider' },
    {
        type: 'repeater',
        id: 'options',
        label: 'Answer Options',
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
    { type: 'divider' },
    { type: 'image', id: 'image', label: 'Image URL (Optional)', placeholder: 'https://example.com/image.jpg' },
    {
        type: 'select',
        id: 'imagePosition',
        label: 'Image Position',
        default: 'above',
        options: [
            { value: 'above', label: 'Above Options' },
            { value: 'below', label: 'Below Options' },
        ],
        visibleWhen: (c) => Boolean(c.image),
    },
    {
        type: 'select',
        id: 'imageFit',
        label: 'Image Fit',
        default: 'cover',
        options: [
            { value: 'cover', label: 'Cover (fill area, may crop)' },
            { value: 'contain', label: 'Contain (show full image) 1:1 Ratio' },
        ],
        visibleWhen: (c) => Boolean(c.image),
    },
];

const definition = {
    type: 'multiple-choice',
    label: 'Multiple Choice',
    icon: 'radio_button_checked',
    category: 'question',
    description: 'Single selection from options',

    component: MultipleChoiceStep,
    schema: optionsQuestionSchema,

    defaultContent: {
        question: 'New Question',
        subtitle: '',
        options: [
            { value: 'option1', label: 'Option 1' },
            { value: 'option2', label: 'Option 2' },
            { value: 'option3', label: 'Option 3' },
        ],
    },

    showNavigation: true,
    showCTA: false,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
