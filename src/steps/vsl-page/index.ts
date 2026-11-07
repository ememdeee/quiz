import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { GenericStep } from '@/components/quiz/steps/GenericStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'title', label: 'Title', placeholder: 'Video headline...' },
    { type: 'divider' },
    { type: 'header', label: 'Video Configuration' },
    { type: 'header', label: 'Desktop Video' },
    {
        type: 'group',
        columns: 2,
        fields: [
            { type: 'text', id: 'video.desktop.mediaId', label: 'Media ID', placeholder: 'l2d9b35x1o' },
            {
                type: 'select',
                id: 'video.desktop.aspectRatio',
                label: 'Aspect Ratio',
                default: '16:9',
                options: [
                    { value: '16:9', label: '16:9' },
                    { value: '4:3', label: '4:3' },
                    { value: '1:1', label: '1:1' },
                ],
            },
        ],
    },
    { type: 'header', label: 'Mobile Video' },
    {
        type: 'group',
        columns: 2,
        fields: [
            { type: 'text', id: 'video.mobile.mediaId', label: 'Media ID', placeholder: 'hhhwirtpjt' },
            {
                type: 'select',
                id: 'video.mobile.aspectRatio',
                label: 'Aspect Ratio',
                default: '9:16',
                options: [
                    { value: '9:16', label: '9:16' },
                    { value: '1:1', label: '1:1' },
                    { value: '4:5', label: '4:5' },
                ],
            },
        ],
    },
    { type: 'divider' },
    {
        type: 'number',
        id: 'ctaDropTime',
        label: 'CTA Button Delay (seconds)',
        scale: 1000,
        min: 0,
        info: 'Seconds before CTA button appears',
    },
    { type: 'divider' },
    { type: 'header', label: 'Call to Action Button' },
    {
        type: 'group',
        columns: 2,
        fields: [
            { type: 'text', id: 'cta.text', label: 'Button Text', placeholder: 'Get Started' },
            { type: 'text', id: 'cta.url', label: 'Button URL', placeholder: '/checkout' },
        ],
    },
];

const definition = {
    type: 'vsl-page',
    label: 'VSL Page',
    icon: 'play_circle',
    category: 'confirmation',
    description: 'Video sales letter page',

    component: GenericStep,
    schema,

    defaultContent: {
        title: 'Watch This Video',
        paragraphs: [],
        video: {
            desktop: { mediaId: '', aspectRatio: '16:9' },
            mobile: { mediaId: '', aspectRatio: '9:16' },
        },
        ctaDropTime: 0,
        cta: { text: 'Get Started', url: '/checkout' },
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: false,
} satisfies StepDefinition;

export default definition;
