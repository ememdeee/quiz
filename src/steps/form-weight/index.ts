import type { StepDefinition } from '../registry';
import type { SchemaField } from '@/types/stepSchema';
import { lbsToKg } from '@/lib/units';
import { WEIGHT_MIN, WEIGHT_MAX } from './constants';
import { WeightStep } from './WeightStep';

const schema: SchemaField[] = [
    { type: 'text', id: 'question', label: 'Question', placeholder: 'What is your current weight?' },
    { type: 'text', id: 'subtitle', label: 'Subtitle (Optional)', placeholder: 'Enter your weight' },
    { type: 'alignment', id: 'textAlign', label: 'Text Alignment', default: 'center' },
    { type: 'divider' },
    {
        type: 'text',
        id: 'targetWeightQuestion',
        label: 'Target Weight Question',
        placeholder: 'And how much would you like to weigh?',
        info: 'This is the second question shown after the user enters their current weight.',
    },
];

const definition = {
    type: 'form-weight',
    label: 'Weight Input',
    icon: 'monitor_weight',
    category: 'form',
    description: 'Weight input with unit toggle',

    component: WeightStep,
    schema,

    defaultContent: {
        question: "What's your current weight?",
    },

    showNavigation: true,
    showCTA: true,
    requiresValidation: true,
    validate: (answer: unknown) => {
        const min = WEIGHT_MIN;
        const max = WEIGHT_MAX;
        if (typeof answer === 'object' && answer !== null && 'value' in answer) {
            const obj = answer as { value: number; targetWeight?: number };
            const val = obj.value;
            const isCurrentValid = typeof val === 'number' && !isNaN(val) && val >= min && val <= max;
            if (obj.targetWeight !== undefined && obj.targetWeight > 0) {
                const isTargetValid = obj.targetWeight < val && obj.targetWeight >= min;
                return isCurrentValid && isTargetValid;
            }
            return isCurrentValid;
        }
        return false;
    },

    syncToProfile: (value, setField) => {
        if (typeof value === 'object' && value !== null && 'value' in value) {
            const obj = value as { value: number; unit?: string; targetWeight?: number };
            const weightKg = obj.unit === 'lbs' ? lbsToKg(obj.value) : obj.value;
            setField('weightKg', weightKg);
            setField('weightUnit', (obj.unit as 'kg' | 'lbs') || 'kg');
            if (obj.targetWeight && obj.targetWeight > 0) {
                const targetKg = obj.unit === 'lbs' ? lbsToKg(obj.targetWeight) : obj.targetWeight;
                setField('targetWeightKg', targetKg);
            }
        }
    },
} satisfies StepDefinition;

export default definition;
