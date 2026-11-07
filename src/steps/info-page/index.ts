import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { InfoStep } from './InfoStep';

const schema: SchemaField[] = [
    { type: 'icon', id: 'icon', label: 'Icon (Optional)' },
    { type: 'text', id: 'title', label: 'Title', placeholder: 'Enter title...' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Add a subtitle...' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    {
        type: 'textarea',
        id: 'description',
        label: 'Description',
        rows: 6,
        placeholder: 'Supports markdown formatting:\n- Bullet list item\n1. Numbered list\n**Bold text**\n\n{{card content}}',
        hints: [
            { syntax: '- item', description: 'bullet' },
            { syntax: '1. item', description: 'numbered' },
            { syntax: '**bold**', description: 'bold' },
            { syntax: '*italic*', description: 'italic' },
            { syntax: '{{ }}', description: 'card block' },
        ],
    },
    { type: 'divider' },
    { type: 'image', id: 'image', label: 'Image URL (Optional)', placeholder: 'https://example.com/image.jpg' },
    {
        type: 'select',
        id: 'imagePosition',
        label: 'Image Position',
        default: 'above',
        options: [
            { value: 'above', label: 'Above Content' },
            { value: 'below', label: 'Below Content' },
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
    type: 'info-page',
    label: 'Info Page',
    icon: 'info',
    category: 'info',
    description: 'Informational content page',

    component: InfoStep,
    schema,

    defaultContent: {
        title: 'Did You Know?',
        subtitle: '',
        icon: 'info',
        description: 'Add your content here.',
        image: undefined,
        imagePosition: 'above',
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
