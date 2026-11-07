import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { ftInToCm } from '@/lib/units';
import { HEIGHT_MIN_CM, HEIGHT_MAX_CM } from './constants';
import { HeightStep } from './HeightStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'question', label: 'Question', placeholder: 'What is your height?' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Enter your height' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
];

const definition = {
    type: 'form-height',
    label: 'Height Input',
    icon: 'height',
    category: 'form',
    description: 'Height input with unit toggle',

    component: HeightStep,
    schema,

    defaultContent: {
        question: "What's your height?",
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: true,
    validate: (answer: unknown) => {
        const min = HEIGHT_MIN_CM;
        const max = HEIGHT_MAX_CM;
        if (typeof answer === 'object' && answer !== null && 'value' in answer) {
            const obj = answer as { value: number; unit: string; inches?: number };
            let cmValue: number;
            if (obj.unit === 'ft') {
                cmValue = ftInToCm(obj.value || 0, obj.inches || 0);
            } else {
                cmValue = obj.value || 0;
            }
            return cmValue >= min && cmValue <= max;
        }
        return false;
    },

    syncToProfile: (value, setField) => {
        if (typeof value === 'object' && value !== null && 'value' in value) {
            const obj = value as { value: number; unit?: string; inches?: number };
            let heightCm: number;
            if (obj.unit === 'ft') {
                heightCm = ftInToCm(obj.value || 0, obj.inches || 0);
            } else {
                heightCm = obj.value;
            }
            setField('heightCm', heightCm);
        }
    },
} satisfies StepDefinition;

export default definition;
